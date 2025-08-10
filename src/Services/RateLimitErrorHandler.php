<?php

namespace App\Services;

use Psr\Log\LoggerInterface;

class RateLimitErrorHandler
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function createRateLimitResponse(string $message = 'Rate limit exceeded'): array
    {
        $this->logger->warning('Rate limit exceeded', [
            'message' => $message,
            'timestamp' => time()
        ]);

        return [
            'error' => $message,
            'status' => 'error',
            'code' => 429
        ];
    }

    public function createAmoCrmRateLimitResponse(string $endpoint = 'contacts'): array
    {
        $this->logger->info('AmoCRM rate limit hit', [
            'endpoint' => $endpoint,
            'timestamp' => time()
        ]);

        return [
            'error' => 'AmoCRM rate limit exceeded',
            'endpoint' => $endpoint,
            'status' => 'error',
            'code' => 429
        ];
    }

    public function createApiRateLimitResponse(string $type = 'api_rate_limit'): array
    {
        $this->logger->warning('API rate limit exceeded', [
            'type' => $type,
            'timestamp' => time()
        ]);

        return [
            'error' => 'API rate limit exceeded',
            'type' => $type,
            'status' => 'error',
            'code' => 429
        ];
    }

    public function addRateLimitHeaders(array $response, int $retryAfter = 60): array
    {
        $response['headers'] = [
            'Retry-After' => $retryAfter,
            'X-RateLimit-RetryAfter' => $retryAfter
        ];

        return $response;
    }

    public function maskApiKey(string $apiKey): string
    {
        if (strlen($apiKey) <= 8) {
            return str_repeat('*', strlen($apiKey));
        }

        $prefix = substr($apiKey, 0, 4);
        $suffix = substr($apiKey, -4);
        $masked = str_repeat('*', strlen($apiKey) - 8);

        return $prefix . $masked . $suffix;
    }

    public function prettyPrintResponse(array $response): string
    {
        return json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}
