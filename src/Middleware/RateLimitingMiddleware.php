<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Monolog\Logger;
use Predis\Client as RedisClient;

class RateLimitingMiddleware
{
    private Logger $logger;
    private RedisClient $redis;
    private int $maxRequests;
    private int $windowSeconds;
    private string $redisPrefix;
    private RateLimitErrorHandler $errorHandler;

    public function __construct(
        Logger $logger, 
        RedisClient $redis, 
        int $maxRequests = 100, 
        int $windowSeconds = 3600,
        string $redisPrefix = 'rate_limit:',
        RateLimitErrorHandler $errorHandler = null
    ) {
        $this->logger = $logger;
        $this->redis = $redis;
        $this->maxRequests = $maxRequests;
        $this->windowSeconds = $windowSeconds;
        $this->redisPrefix = $redisPrefix;
        $this->errorHandler = $errorHandler ?? new RateLimitErrorHandler($logger);
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $clientId = $this->getClientIdentifier($request);
        $key = $this->redisPrefix . $clientId;

        // Check if client is rate limited
        if (!$this->isAllowed($key)) {
            $this->logger->warning('Rate limit exceeded', [
                'client_id' => $this->maskClientId($clientId),
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $request->getHeaderLine('User-Agent'),
                'path' => $request->getUri()->getPath()
            ]);

            return $this->createRateLimitResponse($key);
        }

        // Increment request count
        $this->incrementRequestCount($key);

        // Add rate limit headers to response
        $response = $handler->handle($request);
        return $this->addRateLimitHeaders($response, $key);
    }

    private function getClientIdentifier(Request $request): string
    {
        // Try to get API key first, fallback to IP
        $apiKey = $request->getHeaderLine('X-API-Key');
        if (!empty($apiKey)) {
            return 'api_key:' . $apiKey;
        }

        // Use IP address as fallback
        $ip = $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown';
        return 'ip:' . $ip;
    }

    private function isAllowed(string $key): bool
    {
        $currentCount = $this->redis->get($key);
        return $currentCount === null || (int)$currentCount < $this->maxRequests;
    }

    private function incrementRequestCount(string $key): void
    {
        $this->redis->multi();
        $this->redis->incr($key);
        $this->redis->expire($key, $this->windowSeconds);
        $this->redis->exec();
    }

    private function createRateLimitResponse(string $key): Response
    {
        $resetTime = $this->redis->ttl($key);
        $retryAfter = max(1, $resetTime);
        $clientId = str_replace($this->redisPrefix, '', $key);

        return $this->errorHandler->createApiRateLimitResponse(
            $retryAfter,
            $this->maxRequests,
            $this->windowSeconds,
            $clientId
        );
    }

    private function addRateLimitHeaders(Response $response, string $key): Response
    {
        $currentCount = (int)$this->redis->get($key);
        $remaining = max(0, $this->maxRequests - $currentCount);
        $resetTime = $this->redis->ttl($key);

        return $this->errorHandler->addRateLimitHeaders(
            $response,
            $this->maxRequests,
            $remaining,
            time() + $resetTime
        );
    }

    private function maskClientId(string $clientId): string
    {
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

        return str_repeat('*', strlen($clientId));
    }

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
}
