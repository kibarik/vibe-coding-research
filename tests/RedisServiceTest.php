<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\RedisService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Connection\ConnectionException;

class RedisServiceTest extends TestCase
{
    private RedisService $redisService;
    private TestHandler $logHandler;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $logger = new Logger('test');
        $logger->pushHandler($this->logHandler);

        $config = [
            'host' => $_ENV['REDIS_HOST'] ?? 'localhost',
            'port' => $_ENV['REDIS_PORT'] ?? 6379,
            'database' => 13, // Use separate database for testing
            'timeout' => 5.0
        ];

        $this->redisService = new RedisService($logger, $config);
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $client = $this->redisService->getClient();
        $client->flushdb();
    }

    public function testConnectionEstablished(): void
    {
        $this->assertTrue($this->redisService->testConnection());
        $this->assertTrue($this->logHandler->hasInfo('Redis connection established'));
    }

    public function testGetConnectionInfo(): void
    {
        $info = $this->redisService->getConnectionInfo();
        
        $this->assertTrue($info['connected']);
        $this->assertNotEmpty($info['version']);
        $this->assertGreaterThan(0, $info['uptime']);
        $this->assertGreaterThanOrEqual(0, $info['connected_clients']);
    }

    public function testSetWithExpiration(): void
    {
        $key = 'test:expiration:key';
        $value = 'test_value';
        $expiration = 5; // 5 seconds

        $this->redisService->setWithExpiration($key, $value, $expiration);
        
        $result = $this->redisService->getWithTtl($key);
        $this->assertEquals($value, $result['value']);
        $this->assertGreaterThan(0, $result['ttl']);
        $this->assertLessThanOrEqual($expiration, $result['ttl']);
    }

    public function testIncrementWithExpiration(): void
    {
        $key = 'test:increment:key';
        $expiration = 10; // 10 seconds

        // First increment
        $result1 = $this->redisService->incrementWithExpiration($key, $expiration);
        $this->assertEquals(1, $result1);

        // Second increment
        $result2 = $this->redisService->incrementWithExpiration($key, $expiration);
        $this->assertEquals(2, $result2);

        // Check TTL
        $ttlResult = $this->redisService->getWithTtl($key);
        $this->assertEquals('2', $ttlResult['value']);
        $this->assertGreaterThan(0, $ttlResult['ttl']);
    }

    public function testKeyExists(): void
    {
        $key = 'test:exists:key';
        
        // Key should not exist initially
        $this->assertFalse($this->redisService->exists($key));
        
        // Set key
        $this->redisService->setWithExpiration($key, 'value', 60);
        
        // Key should exist now
        $this->assertTrue($this->redisService->exists($key));
    }

    public function testDeleteKey(): void
    {
        $key = 'test:delete:key';
        
        // Set key
        $this->redisService->setWithExpiration($key, 'value', 60);
        $this->assertTrue($this->redisService->exists($key));
        
        // Delete key
        $this->assertTrue($this->redisService->delete($key));
        $this->assertFalse($this->redisService->exists($key));
    }

    public function testMgetAndMset(): void
    {
        $keyValuePairs = [
            'test:multi:key1' => 'value1',
            'test:multi:key2' => 'value2',
            'test:multi:key3' => 'value3'
        ];
        
        // Set multiple keys
        $this->redisService->mset($keyValuePairs);
        
        // Get multiple keys
        $keys = array_keys($keyValuePairs);
        $values = $this->redisService->mget($keys);
        
        $this->assertEquals(['value1', 'value2', 'value3'], $values);
    }

    public function testClearRateLimitData(): void
    {
        $client = $this->redisService->getClient();
        
        // Set some rate limit keys
        $client->set('rate_limit:test1', '1');
        $client->set('rate_limit:test2', '2');
        $client->set('amocrm_throttle:test1', '1');
        $client->set('amocrm_throttle:test2', '2');
        $client->set('other:key', 'value'); // Should not be deleted
        
        // Clear rate limit data
        $this->redisService->clearRateLimitData();
        
        // Check that rate limit keys are deleted
        $this->assertFalse($client->exists('rate_limit:test1'));
        $this->assertFalse($client->exists('rate_limit:test2'));
        $this->assertFalse($client->exists('amocrm_throttle:test1'));
        $this->assertFalse($client->exists('amocrm_throttle:test2'));
        
        // Check that other keys are preserved
        $this->assertTrue($client->exists('other:key'));
        
        $this->assertTrue($this->logHandler->hasInfo('Cleared rate limit data'));
        $this->assertTrue($this->logHandler->hasInfo('Cleared amoCRM throttle data'));
    }

    public function testGetRateLimitStats(): void
    {
        $client = $this->redisService->getClient();
        
        // Set some rate limit keys
        $client->set('rate_limit:ip:192.168.1.1', '5');
        $client->set('rate_limit:ip:192.168.1.2', '3');
        $client->set('amocrm_throttle:contacts', '2');
        $client->set('amocrm_throttle:leads', '1');
        
        $stats = $this->redisService->getRateLimitStats();
        
        $this->assertEquals(2, $stats['rate_limit_keys']);
        $this->assertEquals(2, $stats['throttle_keys']);
        $this->assertEquals(4, $stats['total_keys']);
        $this->assertCount(2, $stats['sample_rate_limit_keys']);
        $this->assertCount(2, $stats['sample_throttle_keys']);
    }

    public function testGetRateLimitStatsWithNoKeys(): void
    {
        $stats = $this->redisService->getRateLimitStats();
        
        $this->assertEquals(0, $stats['rate_limit_keys']);
        $this->assertEquals(0, $stats['throttle_keys']);
        $this->assertEquals(0, $stats['total_keys']);
        $this->assertArrayNotHasKey('sample_rate_limit_keys', $stats);
        $this->assertArrayNotHasKey('sample_throttle_keys', $stats);
    }

    public function testTtlExpiration(): void
    {
        $key = 'test:ttl:key';
        $value = 'test_value';
        $expiration = 2; // 2 seconds

        $this->redisService->setWithExpiration($key, $value, $expiration);
        
        // Key should exist immediately
        $this->assertTrue($this->redisService->exists($key));
        
        // Wait for expiration
        sleep(3);
        
        // Key should be expired
        $this->assertFalse($this->redisService->exists($key));
    }

    public function testConnectionFailureHandling(): void
    {
        // Create service with invalid configuration
        $logger = new Logger('test');
        $logger->pushHandler($this->logHandler);
        
        $invalidConfig = [
            'host' => 'invalid-host',
            'port' => 9999,
            'timeout' => 1.0
        ];

        $this->expectException(ConnectionException::class);
        new RedisService($logger, $invalidConfig);
    }
}
