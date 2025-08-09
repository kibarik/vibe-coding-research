<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\RateLimitMonitoringService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Client as RedisClient;

class RateLimitMonitoringServiceTest extends TestCase
{
    private RateLimitMonitoringService $monitoringService;
    private TestHandler $logHandler;
    private RedisClient $redis;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $logger = new Logger('test');
        $logger->pushHandler($this->logHandler);

        $this->redis = new RedisClient([
            'host' => $_ENV['REDIS_HOST'] ?? 'localhost',
            'port' => $_ENV['REDIS_PORT'] ?? 6379,
            'database' => 12 // Use separate database for testing
        ]);

        $this->monitoringService = new RateLimitMonitoringService(
            $logger,
            $this->redis,
            'test_rate_limit:',
            'test_amocrm_throttle:'
        );
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $this->redis->flushdb();
    }

    public function testGetRateLimitMetricsWithNoData(): void
    {
        $metrics = $this->monitoringService->getRateLimitMetrics();

        $this->assertEquals(0, $metrics['summary']['total_rate_limit_keys']);
        $this->assertEquals(0, $metrics['summary']['total_throttle_keys']);
        $this->assertEquals(0, $metrics['summary']['total_active_limits']);
        $this->assertEquals('healthy', $metrics['health_status']['status']);
        $this->assertEmpty($metrics['top_violators']);
    }

    public function testGetRateLimitMetricsWithData(): void
    {
        // Set up test data
        $this->redis->setex('test_rate_limit:ip:192.168.1.1', 3600, '85');
        $this->redis->setex('test_rate_limit:ip:192.168.1.2', 3600, '120');
        $this->redis->setex('test_rate_limit:api_key:test-key', 3600, '50');
        $this->redis->setex('test_amocrm_throttle:minute:contacts:2024-01-01-12-00', 60, '5');
        $this->redis->setex('test_amocrm_throttle:hour:leads:2024-01-01-12', 3600, '50');

        $metrics = $this->monitoringService->getRateLimitMetrics();

        $this->assertEquals(3, $metrics['summary']['total_rate_limit_keys']);
        $this->assertEquals(2, $metrics['summary']['total_throttle_keys']);
        $this->assertEquals(5, $metrics['summary']['total_active_limits']);

        // Check rate limit analysis
        $this->assertEquals(3, $metrics['rate_limits']['total_keys']);
        $this->assertEquals(2, $metrics['rate_limits']['by_type']['ip_based']);
        $this->assertEquals(1, $metrics['rate_limits']['by_type']['api_key_based']);
        $this->assertEquals(1, $metrics['rate_limits']['usage_distribution']['high']);
        $this->assertEquals(1, $metrics['rate_limits']['usage_distribution']['exceeded']);

        // Check throttle analysis
        $this->assertEquals(2, $metrics['throttles']['total_keys']);
        $this->assertEquals(1, $metrics['throttles']['by_time_window']['minute']);
        $this->assertEquals(1, $metrics['throttles']['by_time_window']['hour']);
        $this->assertEquals(1, $metrics['throttles']['by_endpoint']['contacts']);
        $this->assertEquals(1, $metrics['throttles']['by_endpoint']['leads']);

        // Check top violators
        $this->assertCount(2, $metrics['top_violators']);
        $this->assertEquals(120, $metrics['top_violators'][0]['request_count']);
        $this->assertEquals('critical', $metrics['top_violators'][0]['severity']);
    }

    public function testGetClientStatus(): void
    {
        $clientId = 'ip:192.168.1.1';
        $this->redis->setex('test_rate_limit:' . $clientId, 3600, '85');

        $status = $this->monitoringService->getClientStatus($clientId);

        $this->assertEquals('ip:192.168.*.*', $status['client_id']);
        $this->assertTrue($status['rate_limit']['active']);
        $this->assertEquals(85, $status['rate_limit']['current_count']);
        $this->assertGreaterThan(0, $status['rate_limit']['ttl']);
        $this->assertFalse($status['throttle']['active']);
        $this->assertContains('Consider implementing request queuing', $status['recommendations']);
    }

    public function testGetBackoffSuggestions(): void
    {
        $clientId = 'ip:192.168.1.1';
        $this->redis->setex('test_rate_limit:' . $clientId, 3600, '120');

        $suggestions = $this->monitoringService->getBackoffSuggestions($clientId);

        $this->assertEquals('ip:192.168.*.*', $suggestions['client_id']);
        $this->assertEquals(120, $suggestions['current_status']['requests_made']);
        $this->assertTrue($suggestions['current_status']['is_limited']);
        $this->assertGreaterThan(0, $suggestions['current_status']['time_until_reset']);

        // Check recommendations
        $this->assertCount(2, $suggestions['recommendations']);
        $this->assertEquals('critical', $suggestions['recommendations'][1]['type']);
        $this->assertStringContainsString('exponential backoff', $suggestions['recommendations'][1]['message']);
        $this->assertArrayHasKey('backoff_strategy', $suggestions['recommendations'][1]);
    }

    public function testGetBackoffSuggestionsForLowUsage(): void
    {
        $clientId = 'ip:192.168.1.1';
        $this->redis->setex('test_rate_limit:' . $clientId, 3600, '25');

        $suggestions = $this->monitoringService->getBackoffSuggestions($clientId);

        $this->assertEquals(25, $suggestions['current_status']['requests_made']);
        $this->assertFalse($suggestions['current_status']['is_limited']);
        $this->assertEmpty($suggestions['recommendations']);
    }

    public function testGetHealthCheckData(): void
    {
        // Set up test data with critical violations
        $this->redis->setex('test_rate_limit:ip:192.168.1.1', 3600, '120');
        $this->redis->setex('test_rate_limit:ip:192.168.1.2', 3600, '150');
        $this->redis->setex('test_rate_limit:ip:192.168.1.3', 3600, '200');

        $health = $this->monitoringService->getHealthCheckData();

        $this->assertEquals('critical', $health['status']);
        $this->assertEquals(3, $health['metrics']['total_active_limits']);
        $this->assertEquals(3, $health['metrics']['critical_violations']);
        $this->assertEquals(3, $health['metrics']['rate_limit_keys']);
        $this->assertEquals(0, $health['metrics']['throttle_keys']);

        // Check alerts
        $this->assertCount(1, $health['alerts']);
        $this->assertEquals('critical', $health['alerts'][0]['level']);
        $this->assertStringContainsString('critical rate limit violations', $health['alerts'][0]['message']);
    }

    public function testGetHealthCheckDataHealthy(): void
    {
        // Set up test data with low usage
        $this->redis->setex('test_rate_limit:ip:192.168.1.1', 3600, '25');
        $this->redis->setex('test_rate_limit:ip:192.168.1.2', 3600, '50');

        $health = $this->monitoringService->getHealthCheckData();

        $this->assertEquals('healthy', $health['status']);
        $this->assertEquals(2, $health['metrics']['total_active_limits']);
        $this->assertEquals(0, $health['metrics']['critical_violations']);
        $this->assertEmpty($health['alerts']);
    }

    public function testClearMonitoringData(): void
    {
        // Set up test data
        $this->redis->setex('test_rate_limit:ip:192.168.1.1', 3600, '100');
        $this->redis->setex('test_amocrm_throttle:minute:contacts:2024-01-01-12-00', 60, '5');
        $this->redis->setex('other:key', 3600, 'value'); // Should not be deleted

        $cleared = $this->monitoringService->clearMonitoringData();

        $this->assertEquals(1, $cleared['rate_limit_keys']);
        $this->assertEquals(1, $cleared['throttle_keys']);

        // Check that rate limit keys are deleted
        $this->assertFalse($this->redis->exists('test_rate_limit:ip:192.168.1.1'));
        $this->assertFalse($this->redis->exists('test_amocrm_throttle:minute:contacts:2024-01-01-12-00'));

        // Check that other keys are preserved
        $this->assertTrue($this->redis->exists('other:key'));

        $this->assertTrue($this->logHandler->hasInfo('Rate limit monitoring data cleared'));
    }

    public function testAnalyzeRateLimitKeysByType(): void
    {
        // Set up test data with different types
        $this->redis->setex('test_rate_limit:ip:192.168.1.1', 3600, '50');
        $this->redis->setex('test_rate_limit:ip:192.168.1.2', 3600, '75');
        $this->redis->setex('test_rate_limit:api_key:key1', 3600, '100');
        $this->redis->setex('test_rate_limit:api_key:key2', 3600, '120');
        $this->redis->setex('test_rate_limit:unknown:client', 3600, '25');

        $metrics = $this->monitoringService->getRateLimitMetrics();
        $analysis = $metrics['rate_limits'];

        $this->assertEquals(2, $analysis['by_type']['ip_based']);
        $this->assertEquals(2, $analysis['by_type']['api_key_based']);
        $this->assertEquals(1, $analysis['by_type']['unknown']);
    }

    public function testAnalyzeRateLimitKeysByUsage(): void
    {
        // Set up test data with different usage levels
        $this->redis->setex('test_rate_limit:client1', 3600, '20');  // low
        $this->redis->setex('test_rate_limit:client2', 3600, '50');  // medium
        $this->redis->setex('test_rate_limit:client3', 3600, '80');  // high
        $this->redis->setex('test_rate_limit:client4', 3600, '110'); // exceeded

        $metrics = $this->monitoringService->getRateLimitMetrics();
        $analysis = $metrics['rate_limits'];

        $this->assertEquals(1, $analysis['usage_distribution']['low']);
        $this->assertEquals(1, $analysis['usage_distribution']['medium']);
        $this->assertEquals(1, $analysis['usage_distribution']['high']);
        $this->assertEquals(1, $analysis['usage_distribution']['exceeded']);
    }

    public function testGetTopViolators(): void
    {
        // Set up test data
        $this->redis->setex('test_rate_limit:client1', 3600, '90');   // Should be included
        $this->redis->setex('test_rate_limit:client2', 3600, '120');  // Should be included
        $this->redis->setex('test_rate_limit:client3', 3600, '50');   // Should not be included
        $this->redis->setex('test_rate_limit:client4', 3600, '150');  // Should be included

        $metrics = $this->monitoringService->getRateLimitMetrics();
        $violators = $metrics['top_violators'];

        $this->assertCount(3, $violators);
        $this->assertEquals(150, $violators[0]['request_count']); // Highest first
        $this->assertEquals(120, $violators[1]['request_count']);
        $this->assertEquals(90, $violators[2]['request_count']);
        $this->assertEquals('critical', $violators[0]['severity']);
        $this->assertEquals('critical', $violators[1]['severity']);
        $this->assertEquals('warning', $violators[2]['severity']);
    }

    public function testMasksClientIdsInLogs(): void
    {
        $clientId = 'api_key:secret-api-key-12345';
        $this->redis->setex('test_rate_limit:' . $clientId, 3600, '100');

        $status = $this->monitoringService->getClientStatus($clientId);

        $this->assertEquals('api_key:secr*****2345', $status['client_id']);
    }

    public function testMasksIpAddressesInLogs(): void
    {
        $clientId = 'ip:192.168.1.100';
        $this->redis->setex('test_rate_limit:' . $clientId, 3600, '100');

        $status = $this->monitoringService->getClientStatus($clientId);

        $this->assertEquals('ip:192.168.*.*', $status['client_id']);
    }

    public function testHealthStatusDetermination(): void
    {
        // Test healthy status
        $this->redis->setex('test_rate_limit:client1', 3600, '25');
        $health = $this->monitoringService->getHealthCheckData();
        $this->assertEquals('healthy', $health['status']);

        // Clear and test warning status
        $this->redis->flushdb();
        for ($i = 1; $i <= 6; $i++) {
            $this->redis->setex("test_rate_limit:client{$i}", 3600, '110');
        }
        $health = $this->monitoringService->getHealthCheckData();
        $this->assertEquals('warning', $health['status']);

        // Clear and test critical status
        $this->redis->flushdb();
        for ($i = 1; $i <= 11; $i++) {
            $this->redis->setex("test_rate_limit:client{$i}", 3600, '110');
        }
        $health = $this->monitoringService->getHealthCheckData();
        $this->assertEquals('critical', $health['status']);
    }
}
