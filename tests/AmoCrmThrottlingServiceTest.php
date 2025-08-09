<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\AmoCrmThrottlingService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Client as RedisClient;

class AmoCrmThrottlingServiceTest extends TestCase
{
    private AmoCrmThrottlingService $throttlingService;
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
            'database' => 14 // Use separate database for testing
        ]);

        $this->throttlingService = new AmoCrmThrottlingService(
            $logger,
            $this->redis,
            3, // 3 requests per minute for testing
            10, // 10 requests per hour for testing
            'test_amocrm_throttle:'
        );
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $this->redis->flushdb();
    }

    public function testAllowsRequestsWithinMinuteLimit(): void
    {
        $endpoint = 'contacts';
        
        // Make 3 requests (within limit)
        for ($i = 0; $i < 3; $i++) {
            $startTime = microtime(true);
            $this->throttlingService->throttleApiCall($endpoint);
            $endTime = microtime(true);
            
            // Should not wait
            $this->assertLessThan(0.1, $endTime - $startTime);
        }
    }

    public function testThrottlesRequestsExceedingMinuteLimit(): void
    {
        $endpoint = 'leads';
        
        // Make 3 requests (within limit)
        for ($i = 0; $i < 3; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        // 4th request should be throttled
        $startTime = microtime(true);
        $this->throttlingService->throttleApiCall($endpoint);
        $endTime = microtime(true);
        
        // Should wait at least 1 second
        $this->assertGreaterThan(0.9, $endTime - $startTime);
    }

    public function testThrottlesRequestsExceedingHourLimit(): void
    {
        $endpoint = 'custom_fields';
        
        // Make 10 requests (within hourly limit)
        for ($i = 0; $i < 10; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        // 11th request should be throttled
        $startTime = microtime(true);
        $this->throttlingService->throttleApiCall($endpoint);
        $endTime = microtime(true);
        
        // Should wait at least 1 second
        $this->assertGreaterThan(0.9, $endTime - $startTime);
    }

    public function testLogsRateLimitWarnings(): void
    {
        $endpoint = 'contacts';
        
        // Make 4 requests to exceed minute limit
        for ($i = 0; $i < 4; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        $this->assertTrue($this->logHandler->hasWarning('amoCRM minute rate limit reached'));
        
        $records = $this->logHandler->getRecords();
        $warningRecord = null;
        
        foreach ($records as $record) {
            if ($record['message'] === 'amoCRM minute rate limit reached') {
                $warningRecord = $record;
                break;
            }
        }
        
        $this->assertNotNull($warningRecord);
        $this->assertEquals('contacts', $warningRecord['context']['endpoint']);
        $this->assertEquals(3, $warningRecord['context']['current_count']);
        $this->assertEquals(3, $warningRecord['context']['limit']);
    }

    public function testLogsWaitTimeInfo(): void
    {
        $endpoint = 'leads';
        
        // Make 4 requests to exceed minute limit
        for ($i = 0; $i < 4; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        $this->assertTrue($this->logHandler->hasInfo('Waiting for amoCRM rate limit reset'));
        
        $records = $this->logHandler->getRecords();
        $infoRecord = null;
        
        foreach ($records as $record) {
            if ($record['message'] === 'Waiting for amoCRM rate limit reset') {
                $infoRecord = $record;
                break;
            }
        }
        
        $this->assertNotNull($infoRecord);
        $this->assertEquals('leads', $infoRecord['context']['endpoint']);
        $this->assertGreaterThan(0, $infoRecord['context']['wait_time_seconds']);
    }

    public function testGetRateLimitStatus(): void
    {
        $endpoint = 'contacts';
        
        // Make 2 requests
        for ($i = 0; $i < 2; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        $status = $this->throttlingService->getRateLimitStatus($endpoint);
        
        $this->assertEquals(2, $status['minute']['current']);
        $this->assertEquals(3, $status['minute']['limit']);
        $this->assertEquals(1, $status['minute']['remaining']);
        $this->assertGreaterThan(time(), $status['minute']['reset_time']);
        
        $this->assertEquals(2, $status['hour']['current']);
        $this->assertEquals(10, $status['hour']['limit']);
        $this->assertEquals(8, $status['hour']['remaining']);
        $this->assertGreaterThan(time(), $status['hour']['reset_time']);
    }

    public function testResetCounters(): void
    {
        $endpoint = 'leads';
        
        // Make some requests
        for ($i = 0; $i < 2; $i++) {
            $this->throttlingService->throttleApiCall($endpoint);
        }
        
        // Verify counters exist
        $status = $this->throttlingService->getRateLimitStatus($endpoint);
        $this->assertEquals(2, $status['minute']['current']);
        
        // Reset counters
        $this->throttlingService->resetCounters($endpoint);
        
        // Verify counters are reset
        $status = $this->throttlingService->getRateLimitStatus($endpoint);
        $this->assertEquals(0, $status['minute']['current']);
        $this->assertEquals(0, $status['hour']['current']);
        
        $this->assertTrue($this->logHandler->hasInfo('amoCRM rate limit counters reset'));
    }

    public function testDifferentEndpointsTrackedSeparately(): void
    {
        // Make requests to different endpoints
        $this->throttlingService->throttleApiCall('contacts');
        $this->throttlingService->throttleApiCall('leads');
        $this->throttlingService->throttleApiCall('custom_fields');
        
        // Check status for each endpoint
        $contactsStatus = $this->throttlingService->getRateLimitStatus('contacts');
        $leadsStatus = $this->throttlingService->getRateLimitStatus('leads');
        $customFieldsStatus = $this->throttlingService->getRateLimitStatus('custom_fields');
        
        $this->assertEquals(1, $contactsStatus['minute']['current']);
        $this->assertEquals(1, $leadsStatus['minute']['current']);
        $this->assertEquals(1, $customFieldsStatus['minute']['current']);
    }

    public function testDefaultEndpointUsedWhenNotSpecified(): void
    {
        // Make request without specifying endpoint
        $this->throttlingService->throttleApiCall();
        
        $status = $this->throttlingService->getRateLimitStatus();
        $this->assertEquals(1, $status['minute']['current']);
    }
}
