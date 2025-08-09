<?php

namespace App\Services;

use Predis\Client as RedisClient;
use Predis\Connection\ConnectionException;
use Monolog\Logger;

class RedisService
{
    private RedisClient $client;
    private Logger $logger;
    private array $config;

    public function __construct(Logger $logger, array $config)
    {
        $this->logger = $logger;
        $this->config = $config;
        $this->client = $this->createClient();
    }

    /**
     * Get Redis client instance
     */
    public function getClient(): RedisClient
    {
        return $this->client;
    }

    /**
     * Test Redis connection
     */
    public function testConnection(): bool
    {
        try {
            $this->client->ping();
            return true;
        } catch (ConnectionException $e) {
            $this->logger->error('Redis connection failed', [
                'error' => $e->getMessage(),
                'host' => $this->config['host'],
                'port' => $this->config['port']
            ]);
            return false;
        }
    }

    /**
     * Get Redis connection info
     */
    public function getConnectionInfo(): array
    {
        try {
            $info = $this->client->info();
            return [
                'connected' => true,
                'version' => $info['redis_version'] ?? 'unknown',
                'uptime' => $info['uptime_in_seconds'] ?? 0,
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory' => $info['used_memory_human'] ?? 'unknown',
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0
            ];
        } catch (ConnectionException $e) {
            return [
                'connected' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Clear all rate limiting data
     */
    public function clearRateLimitData(): void
    {
        $keys = $this->client->keys('rate_limit:*');
        if (!empty($keys)) {
            $this->client->del($keys);
            $this->logger->info('Cleared rate limit data', ['count' => count($keys)]);
        }

        $keys = $this->client->keys('amocrm_throttle:*');
        if (!empty($keys)) {
            $this->client->del($keys);
            $this->logger->info('Cleared amoCRM throttle data', ['count' => count($keys)]);
        }
    }

    /**
     * Get rate limiting statistics
     */
    public function getRateLimitStats(): array
    {
        $rateLimitKeys = $this->client->keys('rate_limit:*');
        $throttleKeys = $this->client->keys('amocrm_throttle:*');

        $stats = [
            'rate_limit_keys' => count($rateLimitKeys),
            'throttle_keys' => count($throttleKeys),
            'total_keys' => count($rateLimitKeys) + count($throttleKeys)
        ];

        // Get some sample keys for analysis
        if (!empty($rateLimitKeys)) {
            $sampleKeys = array_slice($rateLimitKeys, 0, 5);
            $stats['sample_rate_limit_keys'] = $sampleKeys;
        }

        if (!empty($throttleKeys)) {
            $sampleKeys = array_slice($throttleKeys, 0, 5);
            $stats['sample_throttle_keys'] = $sampleKeys;
        }

        return $stats;
    }

    /**
     * Set key with expiration
     */
    public function setWithExpiration(string $key, string $value, int $expiration): void
    {
        $this->client->setex($key, $expiration, $value);
    }

    /**
     * Increment key with expiration
     */
    public function incrementWithExpiration(string $key, int $expiration): int
    {
        $this->client->multi();
        $this->client->incr($key);
        $this->client->expire($key, $expiration);
        $result = $this->client->exec();
        return $result[0];
    }

    /**
     * Get key with TTL
     */
    public function getWithTtl(string $key): array
    {
        $value = $this->client->get($key);
        $ttl = $this->client->ttl($key);
        
        return [
            'value' => $value,
            'ttl' => $ttl
        ];
    }

    /**
     * Check if key exists
     */
    public function exists(string $key): bool
    {
        return (bool)$this->client->exists($key);
    }

    /**
     * Delete key
     */
    public function delete(string $key): bool
    {
        return (bool)$this->client->del($key);
    }

    /**
     * Get multiple keys
     */
    public function mget(array $keys): array
    {
        return $this->client->mget($keys);
    }

    /**
     * Set multiple keys
     */
    public function mset(array $keyValuePairs): void
    {
        $this->client->mset($keyValuePairs);
    }

    private function createClient(): RedisClient
    {
        $connectionParams = [
            'host' => $this->config['host'] ?? 'localhost',
            'port' => $this->config['port'] ?? 6379,
            'timeout' => $this->config['timeout'] ?? 5.0
        ];

        // Add password if configured
        if (!empty($this->config['password'])) {
            $connectionParams['password'] = $this->config['password'];
        }

        // Add database if configured
        if (isset($this->config['database'])) {
            $connectionParams['database'] = $this->config['database'];
        }

        $client = new RedisClient($connectionParams);

        // Test connection on creation
        try {
            $client->ping();
            $this->logger->info('Redis connection established', [
                'host' => $connectionParams['host'],
                'port' => $connectionParams['port'],
                'database' => $connectionParams['database'] ?? 0
            ]);
        } catch (ConnectionException $e) {
            $this->logger->error('Failed to establish Redis connection', [
                'error' => $e->getMessage(),
                'host' => $connectionParams['host'],
                'port' => $connectionParams['port']
            ]);
            throw $e;
        }

        return $client;
    }
}
