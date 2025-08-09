<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use App\Services\LoggingService;
use Monolog\Logger;

class RequestLoggingMiddleware
{
    private LoggingService $loggingService;
    private Logger $logger;

    public function __construct(LoggingService $loggingService)
    {
        $this->loggingService = $loggingService;
        $this->logger = $loggingService->getLogger();
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $startTime = microtime(true);
        $requestId = $this->generateRequestId();
        
        // Add request ID to request attributes
        $request = $request->withAttribute('request_id', $requestId);
        
        // Log request
        $this->logRequest($request, $requestId);
        
        try {
            // Process the request
            $response = $handler->handle($request);
            
            // Log response
            $this->logResponse($response, $request, $requestId, $startTime);
            
            // Add request ID to response headers
            $response = $response->withHeader('X-Request-ID', $requestId);
            
            return $response;
        } catch (\Throwable $exception) {
            // Log error
            $this->logError($exception, $request, $requestId, $startTime);
            
            // Re-throw the exception
            throw $exception;
        }
    }

    private function logRequest(Request $request, string $requestId): void
    {
        $method = $request->getMethod();
        $uri = (string) $request->getUri();
        $headers = $request->getHeaders();
        $body = $request->getBody()->getContents();
        
        // Reset body stream position
        $request->getBody()->rewind();

        $this->logger->info('HTTP Request', [
            'request_id' => $requestId,
            'method' => $method,
            'uri' => $uri,
            'headers' => $this->sanitizeHeaders($headers),
            'body_size' => strlen($body),
            'body_preview' => $this->getBodyPreview($body, $method),
            'ip' => $this->getClientIp($request),
            'user_agent' => $request->getHeaderLine('User-Agent'),
            'timestamp' => date('c'),
        ]);
    }

    private function logResponse(Response $response, Request $request, string $requestId, float $startTime): void
    {
        $duration = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
        $statusCode = $response->getStatusCode();
        $headers = $response->getHeaders();
        $body = $response->getBody()->getContents();
        
        // Reset body stream position
        $response->getBody()->rewind();

        $logLevel = $this->getLogLevelForStatusCode($statusCode);
        
        $this->logger->log($logLevel, 'HTTP Response', [
            'request_id' => $requestId,
            'status_code' => $statusCode,
            'headers' => $this->sanitizeHeaders($headers),
            'body_size' => strlen($body),
            'body_preview' => $this->getBodyPreview($body, $request->getMethod()),
            'duration_ms' => round($duration, 2),
            'ip' => $this->getClientIp($request),
            'timestamp' => date('c'),
        ]);
    }

    private function logError(\Throwable $exception, Request $request, string $requestId, float $startTime): void
    {
        $duration = (microtime(true) - $startTime) * 1000;
        
        $this->logger->error('HTTP Request Error', [
            'request_id' => $requestId,
            'exception' => [
                'class' => get_class($exception),
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ],
            'request' => [
                'method' => $request->getMethod(),
                'uri' => (string) $request->getUri(),
                'ip' => $this->getClientIp($request),
                'user_agent' => $request->getHeaderLine('User-Agent'),
            ],
            'duration_ms' => round($duration, 2),
            'timestamp' => date('c'),
        ]);
    }

    private function generateRequestId(): string
    {
        return uniqid('req_', true) . '_' . substr(md5(microtime()), 0, 8);
    }

    private function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = [
            'authorization', 'cookie', 'x-api-key', 'x-idempotency-key',
            'x-auth-token', 'x-access-token', 'x-refresh-token'
        ];
        
        $sanitized = [];
        
        foreach ($headers as $name => $values) {
            $lowerName = strtolower($name);
            if (in_array($lowerName, $sensitiveHeaders)) {
                $sanitized[$name] = '[REDACTED]';
            } else {
                $sanitized[$name] = is_array($values) ? $values[0] ?? '' : $values;
            }
        }
        
        return $sanitized;
    }

    private function getBodyPreview(string $body, string $method): ?string
    {
        // Don't log body for GET requests
        if ($method === 'GET') {
            return null;
        }
        
        // Limit body preview to 500 characters
        if (strlen($body) > 500) {
            return substr($body, 0, 500) . '...';
        }
        
        return $body ?: null;
    }

    private function getClientIp(Request $request): string
    {
        $serverParams = $request->getServerParams();
        
        // Check for forwarded IP headers
        $forwardedHeaders = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'HTTP_X_CLUSTER_CLIENT_IP'
        ];
        
        foreach ($forwardedHeaders as $header) {
            if (isset($serverParams[$header])) {
                $ip = trim(explode(',', $serverParams[$header])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $serverParams['REMOTE_ADDR'] ?? 'unknown';
    }

    private function getLogLevelForStatusCode(int $statusCode): int
    {
        if ($statusCode >= 500) {
            return Logger::ERROR;
        } elseif ($statusCode >= 400) {
            return Logger::WARNING;
        } else {
            return Logger::INFO;
        }
    }
}
