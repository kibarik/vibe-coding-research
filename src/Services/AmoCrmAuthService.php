<?php

namespace App\Services;

use Monolog\Logger;

class AmoCrmAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $subdomain;
    private string $tokenFile;
    private Logger $logger;

    public function __construct(array $config, Logger $logger)
    {
        $this->clientId = $config['client_id'];
        $this->clientSecret = $config['client_secret'];
        $this->redirectUri = $config['redirect_uri'];
        $this->subdomain = $config['subdomain'];
        $this->tokenFile = $config['token_file'] ?? __DIR__ . '/../../storage/amo_tokens.json';
        $this->logger = $logger;
    }

    /**
     * Generate OAuth2 authorization URL
     */
    public function getAuthorizationUrl(): string
    {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'state' => $this->generateState()
        ];

        return "https://{$this->subdomain}.amocrm.ru/oauth/authorize?" . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken(string $code): array
    {
        $data = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $this->redirectUri
        ];

        $response = $this->makeTokenRequest($data);
        
        if (isset($response['access_token'])) {
            $this->saveTokens($response);
            $this->logger->info('Successfully obtained access token', [
                'expires_in' => $response['expires_in'] ?? 'unknown'
            ]);
        }

        return $response;
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshToken(): array
    {
        $tokens = $this->loadTokens();
        
        if (!isset($tokens['refresh_token'])) {
            throw new \Exception('No refresh token available');
        }

        $data = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type' => 'refresh_token',
            'refresh_token' => $tokens['refresh_token']
        ];

        $response = $this->makeTokenRequest($data);
        
        if (isset($response['access_token'])) {
            $this->saveTokens($response);
            $this->logger->info('Successfully refreshed access token');
        }

        return $response;
    }

    /**
     * Get valid access token (refresh if needed)
     */
    public function getValidAccessToken(): string
    {
        $tokens = $this->loadTokens();
        
        if (!isset($tokens['access_token'])) {
            throw new \Exception('No access token available. Please authorize first.');
        }

        // Check if token is expired (with 5 minute buffer)
        if (isset($tokens['expires_at']) && time() > ($tokens['expires_at'] - 300)) {
            $this->logger->info('Access token expired, refreshing...');
            $this->refreshToken();
            $tokens = $this->loadTokens();
        }

        return $tokens['access_token'];
    }

    /**
     * Make HTTP request to amoCRM token endpoint
     */
    private function makeTokenRequest(array $data): array
    {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://{$this->subdomain}.amocrm.ru/oauth2/access_token",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("cURL error: {$error}");
        }

        $responseData = json_decode($response, true);
        
        if ($httpCode !== 200) {
            $this->logger->error('Token request failed', [
                'http_code' => $httpCode,
                'response' => $responseData
            ]);
            throw new \Exception("Token request failed with HTTP {$httpCode}: " . ($responseData['detail'] ?? 'Unknown error'));
        }

        return $responseData;
    }

    /**
     * Save tokens to file
     */
    private function saveTokens(array $tokens): void
    {
        $tokenData = [
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_in' => $tokens['expires_in'],
            'expires_at' => time() + $tokens['expires_in'],
            'token_type' => $tokens['token_type'] ?? 'Bearer',
            'updated_at' => date('c')
        ];

        $directory = dirname($this->tokenFile);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        file_put_contents($this->tokenFile, json_encode($tokenData, JSON_PRETTY_PRINT));
        
        // Set secure file permissions
        chmod($this->tokenFile, 0600);
    }

    /**
     * Load tokens from file
     */
    private function loadTokens(): array
    {
        if (!file_exists($this->tokenFile)) {
            return [];
        }

        $content = file_get_contents($this->tokenFile);
        $tokens = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->logger->error('Failed to parse token file', [
                'error' => json_last_error_msg()
            ]);
            return [];
        }

        return $tokens;
    }

    /**
     * Generate random state parameter for OAuth2
     */
    private function generateState(): string
    {
        return bin2hex(random_bytes(16));
    }

    /**
     * Check if tokens are available
     */
    public function hasTokens(): bool
    {
        $tokens = $this->loadTokens();
        return isset($tokens['access_token']) && isset($tokens['refresh_token']);
    }

    /**
     * Clear stored tokens
     */
    public function clearTokens(): void
    {
        if (file_exists($this->tokenFile)) {
            unlink($this->tokenFile);
            $this->logger->info('Tokens cleared');
        }
    }

    /**
     * Get token status information
     */
    public function getTokenStatus(): array
    {
        $tokens = $this->loadTokens();
        
        if (empty($tokens)) {
            return [
                'status' => 'not_authorized',
                'message' => 'No tokens available'
            ];
        }

        $isExpired = isset($tokens['expires_at']) && time() > $tokens['expires_at'];
        $willExpireSoon = isset($tokens['expires_at']) && time() > ($tokens['expires_at'] - 300);

        return [
            'status' => $isExpired ? 'expired' : ($willExpireSoon ? 'expiring_soon' : 'valid'),
            'expires_at' => $tokens['expires_at'] ?? null,
            'token_type' => $tokens['token_type'] ?? 'Bearer',
            'updated_at' => $tokens['updated_at'] ?? null
        ];
    }
}
