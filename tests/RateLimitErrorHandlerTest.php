<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\RateLimitErrorHandler;
use Monolog\Logger;
use Monolog\Handler\TestHandler;

class RateLimitErrorHandlerTest extends TestCase
{
    private RateLimitErrorHandler $errorHandler;
    private TestHandler $logHandler;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $logger = new Logger('test');
        $logger->pushHandler($this->logHandler);

        $this->errorHandler = new RateLimitErrorHandler($logger);
    }

    public function testCreateRateLimitResponse(): void
    {
        $response = $this->errorHandler->createRateLimitResponse(
            60, // retry after 60 seconds
            100, // limit
            3600, // window
            'ip:192.168.1.1',
            ['type' => 'api_rate_limit']
        );

        $this->assertEquals(429, $response->getStatusCode());
        $this->assertEquals('application/json', $response->getHeaderLine('Content-Type'));
        $this->assertEquals('60', $response->getHeaderLine('Retry-After'));
        $this->assertEquals('100', $response->getHeaderLine('X-RateLimit-Limit'));
        $this->assertEquals('0', $response->getHeaderLine('X-RateLimit-Remaining'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('Rate limit exceeded', $body['error']);
        $this->assertEquals('Too many requests. Please try again later.', $body['message']);
        $this->assertEquals(60, $body['retry_after']);
        $this->assertEquals(100, $body['limit']);
        $this->assertEquals(3600, $body['window']);
        $this->assertNotEmpty($body['timestamp']);
        $this->assertNotEmpty($body['request_id']);
        $this->assertEquals('api_rate_limit', $body['context']['type']);
    }

    public function testCreateAmoCrmRateLimitResponse(): void
    {
        $rateLimitStatus = [
            'minute' => ['current' => 7, 'limit' => 7, 'remaining' => 0],
            'hour' => ['current' => 50, 'limit' => 1000, 'remaining' => 950]
        ];

        $response = $this->errorHandler->createAmoCrmRateLimitResponse(
            30, // retry after 30 seconds
            'contacts',
            $rateLimitStatus
        );

        $this->assertEquals(429, $response->getStatusCode());
        $this->assertEquals('30', $response->getHeaderLine('Retry-After'));
        $this->assertEquals('7', $response->getHeaderLine('X-RateLimit-Limit'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('contacts', $body['context']['endpoint']);
        $this->assertEquals($rateLimitStatus, $body['context']['rate_limit_status']);
    }

    public function testCreateApiRateLimitResponse(): void
    {
        $response = $this->errorHandler->createApiRateLimitResponse(
            120, // retry after 120 seconds
            50, // limit
            1800, // window
            'api_key:test-key-123'
        );

        $this->assertEquals(429, $response->getStatusCode());
        $this->assertEquals('120', $response->getHeaderLine('Retry-After'));
        $this->assertEquals('50', $response->getHeaderLine('X-RateLimit-Limit'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('api_rate_limit', $body['context']['type']);
    }

    public function testAddRateLimitHeaders(): void
    {
        $originalResponse = new \Slim\Psr7\Response();
        $originalResponse->getBody()->write('{"status": "success"}');

        $response = $this->errorHandler->addRateLimitHeaders(
            $originalResponse,
            100, // limit
            25, // remaining
            time() + 300 // reset time
        );

        $this->assertEquals('100', $response->getHeaderLine('X-RateLimit-Limit'));
        $this->assertEquals('25', $response->getHeaderLine('X-RateLimit-Remaining'));
        $this->assertNotEmpty($response->getHeaderLine('X-RateLimit-Reset'));
        $this->assertNotEmpty($response->getHeaderLine('X-RateLimit-Reset-Time'));
        
        // Original response body should be preserved
        $this->assertEquals('{"status": "success"}', $response->getBody()->getContents());
    }

    public function testLogsRateLimitError(): void
    {
        $this->errorHandler->createRateLimitResponse(
            60,
            100,
            3600,
            'ip:192.168.1.1'
        );

        $this->assertTrue($this->logHandler->hasWarning('Rate limit exceeded'));
        
        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('Rate limit exceeded', $lastRecord['message']);
        $this->assertEquals('ip:192.168.*.*', $lastRecord['context']['client_id']);
        $this->assertEquals(60, $lastRecord['context']['retry_after']);
        $this->assertEquals(100, $lastRecord['context']['limit']);
    }

    public function testLogsAmoCrmRateLimitAsInfo(): void
    {
        $this->errorHandler->createAmoCrmRateLimitResponse(
            30,
            'contacts'
        );

        $this->assertTrue($this->logHandler->hasInfo('Rate limit exceeded'));
        
        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('Rate limit exceeded', $lastRecord['message']);
        $this->assertEquals('amocrm:contacts', $lastRecord['context']['client_id']);
    }

    public function testMasksApiKeyInLogs(): void
    {
        $this->errorHandler->createApiRateLimitResponse(
            60,
            100,
            3600,
            'api_key:secret-api-key-12345'
        );

        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('api_key:secr*****2345', $lastRecord['context']['client_id']);
    }

    public function testMasksIpAddressInLogs(): void
    {
        $this->errorHandler->createApiRateLimitResponse(
            60,
            100,
            3600,
            'ip:192.168.1.100'
        );

        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('ip:192.168.*.*', $lastRecord['context']['client_id']);
    }

    public function testMasksIpv6AddressInLogs(): void
    {
        $this->errorHandler->createApiRateLimitResponse(
            60,
            100,
            3600,
            'ip:2001:db8::1'
        );

        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('ip:2001:db8:*:*:*:*:*:*', $lastRecord['context']['client_id']);
    }

    public function testGetErrorTemplate(): void
    {
        $template = $this->errorHandler->getErrorTemplate();
        
        $this->assertEquals('Rate limit exceeded', $template['error']);
        $this->assertEquals('Too many requests. Please try again later.', $template['message']);
        $this->assertEquals(0, $template['retry_after']);
        $this->assertEquals(0, $template['limit']);
        $this->assertEquals(0, $template['window']);
        $this->assertEquals('', $template['timestamp']);
        $this->assertEquals('', $template['request_id']);
    }

    public function testResponseHeadersIncludeResetTime(): void
    {
        $response = $this->errorHandler->createRateLimitResponse(
            60,
            100,
            3600
        );

        $resetTime = $response->getHeaderLine('X-RateLimit-Reset');
        $resetTimeFormatted = $response->getHeaderLine('X-RateLimit-Reset-Time');
        
        $this->assertNotEmpty($resetTime);
        $this->assertNotEmpty($resetTimeFormatted);
        
        // Verify reset time is in the future
        $this->assertGreaterThan(time(), (int)$resetTime);
        
        // Verify formatted time is valid ISO 8601
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/', $resetTimeFormatted);
    }

    public function testResponseBodyIsPrettyPrinted(): void
    {
        $response = $this->errorHandler->createRateLimitResponse(
            60,
            100,
            3600
        );

        $body = $response->getBody()->getContents();
        
        // Check that JSON is pretty printed (contains newlines and spaces)
        $this->assertStringContainsString("\n", $body);
        $this->assertStringContainsString("  ", $body);
        
        // Verify JSON is valid
        $decoded = json_decode($body, true);
        $this->assertNotNull($decoded);
        $this->assertEquals('Rate limit exceeded', $decoded['error']);
    }
}
