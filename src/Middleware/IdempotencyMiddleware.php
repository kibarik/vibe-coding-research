<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Monolog\Logger;
use Predis\Client as RedisClient;
use App\Services\IdempotencyService;

class IdempotencyMiddleware
{
    private Logger $logger;
    private IdempotencyService $idempotencyService;

    public function __construct(Logger $logger, IdempotencyService $idempotencyService)
    {
        $this->logger = $logger;
        $this->idempotencyService = $idempotencyService;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // Only apply idempotency to POST /api/leads
        if ($request->getMethod() !== 'POST' || $request->getUri()->getPath() !== '/api/leads') {
            return $handler->handle($request);
        }

        $idempotencyKey = $request->getHeaderLine('X-Idempotency-Key');
        
        // Validate idempotency key
        if (empty($idempotencyKey)) {
            $this->logger->warning('Missing X-Idempotency-Key header', [
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $request->getHeaderLine('User-Agent')
            ]);
            
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode([
                'error' => 'Missing X-Idempotency-Key header',
                'message' => 'X-Idempotency-Key header is required for lead submission'
            ]));
            
            return $response
                ->withStatus(400)
                ->withHeader('Content-Type', 'application/json');
        }

        // Validate UUID format
        if (!$this->isValidUuid($idempotencyKey)) {
            $this->logger->warning('Invalid X-Idempotency-Key format', [
                'key' => $this->maskIdempotencyKey($idempotencyKey),
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
            ]);
            
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode([
                'error' => 'Invalid X-Idempotency-Key format',
                'message' => 'X-Idempotency-Key must be a valid UUID v4'
            ]));
            
            return $response
                ->withStatus(400)
                ->withHeader('Content-Type', 'application/json');
        }

        // Check for duplicate request
        $duplicateResponse = $this->idempotencyService->checkDuplicate($idempotencyKey, $request);
        if ($duplicateResponse !== null) {
            $this->logger->info('Duplicate request detected, returning cached response', [
                'key' => $this->maskIdempotencyKey($idempotencyKey)
            ]);
            return $duplicateResponse;
        }

        // Process the request and cache the response
        $response = $handler->handle($request);
        
        // Cache successful responses (2xx status codes)
        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            $this->idempotencyService->cacheResponse($idempotencyKey, $request, $response);
        }

        return $response;
    }

    public function isValidUuid(string $uuid): bool
    {
        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';
        return preg_match($pattern, $uuid) === 1;
    }

    public function maskIdempotencyKey(string $key): string
    {
        if (strlen($key) <= 8) {
            return str_repeat('*', strlen($key));
        }
        return substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
    }
}
