<?php

namespace App\Services;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Monolog\Logger;
use Predis\Client as RedisClient;

class IdempotencyService
{
    private Logger $logger;
    private RedisClient $redis;
    private const TTL_SECONDS = 300; // 5 minutes
    private const KEY_PREFIX = 'idempotency:';

    public function __construct(Logger $logger, RedisClient $redis)
    {
        $this->logger = $logger;
        $this->redis = $redis;
    }

    public function checkDuplicate(string $idempotencyKey, Request $request): ?Response
    {
        $hash = $this->generateRequestHash($idempotencyKey, $request);
        $cacheKey = self::KEY_PREFIX . $hash;

        try {
            // Check if we have a cached response
            $cachedData = $this->redis->get($cacheKey);
            if ($cachedData !== null) {
                $this->logger->info('Found cached response for duplicate request', [
                    'key' => $this->maskIdempotencyKey($idempotencyKey),
                    'hash' => $this->maskHash($hash)
                ]);
                
                return $this->deserializeResponse($cachedData);
            }

            // Check if this is a duplicate hash within the time window
            $existingKey = $this->findExistingKey($hash);
            if ($existingKey !== null) {
                $this->logger->info('Duplicate hash detected within time window', [
                    'key' => $this->maskIdempotencyKey($idempotencyKey),
                    'hash' => $this->maskHash($hash),
                    'existing_key' => $this->maskIdempotencyKey($existingKey)
                ]);
                
                // Return the cached response for the existing key
                $cachedData = $this->redis->get(self::KEY_PREFIX . $existingKey);
                if ($cachedData !== null) {
                    return $this->deserializeResponse($cachedData);
                }
            }

            // Store the hash with timestamp for future duplicate detection
            $this->storeHash($hash, $idempotencyKey);

            return null; // No duplicate found
        } catch (\Exception $e) {
            $this->logger->error('Error checking for duplicate request', [
                'key' => $this->maskIdempotencyKey($idempotencyKey),
                'error' => $e->getMessage()
            ]);
            
            // On Redis error, allow the request to proceed
            return null;
        }
    }

    public function cacheResponse(string $idempotencyKey, Request $request, Response $response): void
    {
        $hash = $this->generateRequestHash($idempotencyKey, $request);
        $cacheKey = self::KEY_PREFIX . $hash;

        try {
            $responseData = $this->serializeResponse($response);
            $this->redis->setex($cacheKey, self::TTL_SECONDS, $responseData);
            
            $this->logger->info('Cached response for idempotency', [
                'key' => $this->maskIdempotencyKey($idempotencyKey),
                'hash' => $this->maskHash($hash),
                'status_code' => $response->getStatusCode(),
                'ttl' => self::TTL_SECONDS
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Error caching response', [
                'key' => $this->maskIdempotencyKey($idempotencyKey),
                'error' => $e->getMessage()
            ]);
        }
    }

    private function generateRequestHash(string $idempotencyKey, Request $request): string
    {
        // Get request body
        $body = $request->getBody()->getContents();
        
        // Normalize the request data
        $normalizedData = $this->normalizeRequestData($body, $request);
        
        // Create hash from idempotency key + normalized data
        $hashData = $idempotencyKey . '|' . $normalizedData;
        
        return hash('sha256', $hashData);
    }

    private function normalizeRequestData(string $body, Request $request): string
    {
        $contentType = $request->getHeaderLine('Content-Type');
        
        if (strpos($contentType, 'application/json') !== false) {
            // For JSON requests, normalize the JSON structure
            $data = json_decode($body, true);
            if ($data === null) {
                return $body; // Return as-is if invalid JSON
            }
            
            // Sort keys recursively to ensure consistent ordering
            $this->sortArrayKeys($data);
            return json_encode($data, JSON_UNESCAPED_SLASHES);
        }
        
        if (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
            // For form data, parse and sort
            parse_str($body, $data);
            $this->sortArrayKeys($data);
            return http_build_query($data);
        }
        
        // For other content types, return as-is
        return $body;
    }

    private function sortArrayKeys(array &$array): void
    {
        ksort($array);
        foreach ($array as &$value) {
            if (is_array($value)) {
                $this->sortArrayKeys($value);
            }
        }
    }

    private function findExistingKey(string $hash): ?string
    {
        try {
            // Get all keys with our prefix
            $keys = $this->redis->keys(self::KEY_PREFIX . '*');
            
            foreach ($keys as $key) {
                // Extract the hash from the key
                $keyHash = str_replace(self::KEY_PREFIX, '', $key);
                
                if ($keyHash === $hash) {
                    // Found matching hash, get the associated idempotency key
                    $data = $this->redis->get($key);
                    if ($data !== null) {
                        $responseData = json_decode($data, true);
                        return $responseData['idempotency_key'] ?? null;
                    }
                }
            }
            
            return null;
        } catch (\Exception $e) {
            $this->logger->error('Error finding existing key', [
                'hash' => $this->maskHash($hash),
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    private function storeHash(string $hash, string $idempotencyKey): void
    {
        try {
            $hashKey = 'hash:' . $hash;
            $this->redis->setex($hashKey, self::TTL_SECONDS, $idempotencyKey);
        } catch (\Exception $e) {
            $this->logger->error('Error storing hash', [
                'hash' => $this->maskHash($hash),
                'error' => $e->getMessage()
            ]);
        }
    }

    private function serializeResponse(Response $response): string
    {
        $responseData = [
            'status_code' => $response->getStatusCode(),
            'headers' => $response->getHeaders(),
            'body' => $response->getBody()->getContents(),
            'timestamp' => time()
        ];
        
        return json_encode($responseData);
    }

    private function deserializeResponse(string $cachedData): Response
    {
        $data = json_decode($cachedData, true);
        
        $response = new \Slim\Psr7\Response($data['status_code']);
        
        // Restore headers
        foreach ($data['headers'] as $name => $values) {
            foreach ($values as $value) {
                $response = $response->withHeader($name, $value);
            }
        }
        
        // Restore body
        $response->getBody()->write($data['body']);
        
        return $response;
    }

    private function maskIdempotencyKey(string $key): string
    {
        if (strlen($key) <= 8) {
            return str_repeat('*', strlen($key));
        }
        return substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
    }

    private function maskHash(string $hash): string
    {
        if (strlen($hash) <= 8) {
            return str_repeat('*', strlen($hash));
        }
        return substr($hash, 0, 4) . str_repeat('*', strlen($hash) - 8) . substr($hash, -4);
    }
}
