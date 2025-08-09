<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Middleware\RateLimitingMiddleware;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Client as RedisClient;
use Slim\Psr7\ServerRequest;
use Slim\Psr7\Response;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;

class RateLimitingMiddlewareTest extends TestCase
{
    private RateLimitingMiddleware $middleware;
    private TestHandler $logHandler;
    private RedisClient $redis;
    private ServerRequestFactory $requestFactory;
    private ResponseFactory $responseFactory;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $logger = new Logger('test');
        $logger->pushHandler($this->logHandler);

        $this->redis = new RedisClient([
            'host' => $_ENV['REDIS_HOST'] ?? 'localhost',
            'port' => $_ENV['REDIS_PORT'] ?? 6379,
            'database' => 15 // Use separate database for testing
        ]);

        $this->middleware = new RateLimitingMiddleware(
            $logger,
            $this->redis,
            5, // 5 requests per window
            60, // 60 second window
            'test_rate_limit:'
        );

        $this->requestFactory = new ServerRequestFactory();
        $this->responseFactory = new ResponseFactory();
    }

    protected function tearDown(): void
    {
        // Clean up test data
        $this->redis->flushdb();
    }

    public function testAllowsRequestsWithinLimit(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        
        for ($i = 0; $i < 5; $i++) {
            $response = $this->middleware->__invoke($request, $this->createHandler());
            
            $this->assertEquals(200, $response->getStatusCode());
            $this->assertTrue($response->hasHeader('X-RateLimit-Limit'));
            $this->assertTrue($response->hasHeader('X-RateLimit-Remaining'));
            $this->assertTrue($response->hasHeader('X-RateLimit-Reset'));
            
            $remaining = (int)$response->getHeaderLine('X-RateLimit-Remaining');
            $this->assertEquals(4 - $i, $remaining);
        }
    }

    public function testBlocksRequestsExceedingLimit(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        
        // Make 5 requests (within limit)
        for ($i = 0; $i < 5; $i++) {
            $this->middleware->__invoke($request, $this->createHandler());
        }
        
        // 6th request should be blocked
        $response = $this->middleware->__invoke($request, $this->createHandler());
        
        $this->assertEquals(429, $response->getStatusCode());
        $this->assertTrue($response->hasHeader('Retry-After'));
        $this->assertTrue($response->hasHeader('X-RateLimit-Limit'));
        $this->assertTrue($response->hasHeader('X-RateLimit-Remaining'));
        $this->assertEquals('0', $response->getHeaderLine('X-RateLimit-Remaining'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('Rate limit exceeded', $body['error']);
        $this->assertEquals(5, $body['limit']);
    }

    public function testUsesApiKeyWhenProvided(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        $request = $request->withHeader('X-API-Key', 'test-api-key-123');
        
        $response = $this->middleware->__invoke($request, $this->createHandler());
        
        $this->assertEquals(200, $response->getStatusCode());
        
        // Check that the rate limit is tracked separately for API key
        $key = 'test_rate_limit:api_key:test-api-key-123';
        $count = $this->redis->get($key);
        $this->assertEquals('1', $count);
    }

    public function testFallsBackToIpWhenNoApiKey(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        
        $response = $this->middleware->__invoke($request, $this->createHandler());
        
        $this->assertEquals(200, $response->getStatusCode());
        
        // Check that the rate limit is tracked by IP
        $key = 'test_rate_limit:ip:192.168.1.1';
        $count = $this->redis->get($key);
        $this->assertEquals('1', $count);
    }

    public function testLogsRateLimitExceeded(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        
        // Make 6 requests to exceed limit
        for ($i = 0; $i < 6; $i++) {
            $this->middleware->__invoke($request, $this->createHandler());
        }
        
        $this->assertTrue($this->logHandler->hasWarning('Rate limit exceeded'));
        
        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('Rate limit exceeded', $lastRecord['message']);
        $this->assertEquals('192.168.1.1', $lastRecord['context']['ip']);
        $this->assertEquals('/api/leads', $lastRecord['context']['path']);
    }

    public function testMasksClientIdInLogs(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        $request = $request->withHeader('X-API-Key', 'secret-api-key-12345');
        
        // Make 6 requests to exceed limit
        for ($i = 0; $i < 6; $i++) {
            $this->middleware->__invoke($request, $this->createHandler());
        }
        
        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('api_key:secr*****2345', $lastRecord['context']['client_id']);
    }

    public function testMasksIpAddressInLogs(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.100');
        
        // Make 6 requests to exceed limit
        for ($i = 0; $i < 6; $i++) {
            $this->middleware->__invoke($request, $this->createHandler());
        }
        
        $records = $this->logHandler->getRecords();
        $lastRecord = end($records);
        
        $this->assertEquals('ip:192.168.*.*', $lastRecord['context']['client_id']);
    }

    public function testRetryAfterHeaderIsSet(): void
    {
        $request = $this->createRequest('POST', '/api/leads', '192.168.1.1');
        
        // Make 6 requests to exceed limit
        for ($i = 0; $i < 6; $i++) {
            $this->middleware->__invoke($request, $this->createHandler());
        }
        
        $response = $this->middleware->__invoke($request, $this->createHandler());
        
        $retryAfter = (int)$response->getHeaderLine('Retry-After');
        $this->assertGreaterThan(0, $retryAfter);
        $this->assertLessThanOrEqual(60, $retryAfter);
    }

    private function createRequest(string $method, string $path, string $ip): ServerRequest
    {
        $request = $this->requestFactory->createServerRequest($method, $path);
        return $request->withServerParams(['REMOTE_ADDR' => $ip]);
    }

    private function createHandler(): callable
    {
        return function ($request) {
            $response = $this->responseFactory->createResponse(200);
            $response->getBody()->write(json_encode(['status' => 'success']));
            return $response->withHeader('Content-Type', 'application/json');
        };
    }
}
