<?php

namespace App\Services;

use Psr\Http\Message\ResponseInterface as Response;
use Monolog\Logger;
use Slim\Psr7\Response as SlimResponse;

class RateLimitErrorHandler
{
    private Logger $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Create a standardized 429 rate limit exceeded response
     */
    public function createRateLimitResponse(
        int $retryAfter,
        int $limit,
        int $window,
        string $clientId = null,
        array $context = []
    ): Response {
        $response = new SlimResponse();
        
        $errorData = [
            'error' => 'Rate limit exceeded',
            'message' => 'Too many requests. Please try again later.',
            'retry_after' => $retryAfter,
            'limit' => $limit,
            'window' => $window,
            'timestamp' => date('c'),
            'request_id' => uniqid('rate_limit_')
        ];

        // Add additional context if provided
        if (!empty($context)) {
            $errorData['context'] = $context;
        }

        $response->getBody()->write(json_encode($errorData, JSON_PRETTY_PRINT));

        $response = $response
            ->withStatus(429)
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Retry-After', (string)$retryAfter)
            ->withHeader('X-RateLimit-Limit', (string)$limit)
            ->withHeader('X-RateLimit-Remaining', '0')
            ->withHeader('X-RateLimit-Reset', (string)(time() + $retryAfter))
            ->withHeader('X-RateLimit-Reset-Time', date('c', time() + $retryAfter));

        // Log the rate limit error
        $this->logRateLimitError($clientId, $context, $errorData);

        return $response;
    }

    /**
     * Create a rate limit response for amoCRM API throttling
     */
    public function createAmoCrmRateLimitResponse(
        int $retryAfter,
        string $endpoint,
        array $rateLimitStatus = []
    ): Response {
        $context = [
            'endpoint' => $endpoint,
            'rate_limit_status' => $rateLimitStatus
        ];

        return $this->createRateLimitResponse(
            $retryAfter,
            7, // amoCRM default limit
            60, // 1 minute window
            "amocrm:{$endpoint}",
            $context
        );
    }

    /**
     * Create a rate limit response for API endpoints
     */
    public function createApiRateLimitResponse(
        int $retryAfter,
        int $limit,
        int $window,
        string $clientId
    ): Response {
        return $this->createRateLimitResponse(
            $retryAfter,
            $limit,
            $window,
            $clientId,
            ['type' => 'api_rate_limit']
        );
    }

    /**
     * Add rate limit headers to an existing response
     */
    public function addRateLimitHeaders(
        Response $response,
        int $limit,
        int $remaining,
        int $resetTime
    ): Response {
        return $response
            ->withHeader('X-RateLimit-Limit', (string)$limit)
            ->withHeader('X-RateLimit-Remaining', (string)$remaining)
            ->withHeader('X-RateLimit-Reset', (string)$resetTime)
            ->withHeader('X-RateLimit-Reset-Time', date('c', $resetTime));
    }

    /**
     * Log rate limit error with appropriate level and context
     */
    private function logRateLimitError(string $clientId = null, array $context = [], array $errorData = []): void
    {
        $logContext = [
            'client_id' => $this->maskClientId($clientId),
            'retry_after' => $errorData['retry_after'] ?? 0,
            'limit' => $errorData['limit'] ?? 0,
            'window' => $errorData['window'] ?? 0,
            'request_id' => $errorData['request_id'] ?? null
        ];

        // Add additional context
        if (!empty($context)) {
            $logContext = array_merge($logContext, $context);
        }

        // Determine log level based on context
        $logLevel = $this->determineLogLevel($context);
        
        $this->logger->log($logLevel, 'Rate limit exceeded', $logContext);
    }

    /**
     * Determine appropriate log level based on context
     */
    private function determineLogLevel(array $context): int
    {
        // If it's a repeated rate limit violation, use warning
        if (isset($context['repeated_violation']) && $context['repeated_violation']) {
            return Logger::WARNING;
        }

        // If it's amoCRM throttling, use info (expected behavior)
        if (isset($context['endpoint']) && strpos($context['endpoint'], 'amocrm') !== false) {
            return Logger::INFO;
        }

        // Default to warning for API rate limits
        return Logger::WARNING;
    }

    /**
     * Mask client ID for logging privacy
     */
    private function maskClientId(?string $clientId): string
    {
        if (!$clientId) {
            return 'unknown';
        }

        if (strpos($clientId, 'api_key:') === 0) {
            $key = substr($clientId, 8);
            if (strlen($key) <= 8) {
                return 'api_key:' . str_repeat('*', strlen($key));
            }
            return 'api_key:' . substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
        }

        if (strpos($clientId, 'ip:') === 0) {
            $ip = substr($clientId, 3);
            return 'ip:' . $this->maskIpAddress($ip);
        }

        if (strpos($clientId, 'amocrm:') === 0) {
            $endpoint = substr($clientId, 7);
            return 'amocrm:' . $endpoint;
        }

        return str_repeat('*', strlen($clientId));
    }

    /**
     * Mask IP address for logging privacy
     */
    private function maskIpAddress(string $ip): string
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            return $parts[0] . '.' . $parts[1] . '.*.*';
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            return $parts[0] . ':' . $parts[1] . ':*:*:*:*:*:*';
        }

        return 'unknown';
    }

    /**
     * Get rate limit error template
     */
    public function getErrorTemplate(): array
    {
        return [
            'error' => 'Rate limit exceeded',
            'message' => 'Too many requests. Please try again later.',
            'retry_after' => 0,
            'limit' => 0,
            'window' => 0,
            'timestamp' => '',
            'request_id' => ''
        ];
    }
}
