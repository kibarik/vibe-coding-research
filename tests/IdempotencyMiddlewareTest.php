<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Middleware\IdempotencyMiddleware;
use App\Services\IdempotencyService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Client as RedisClient;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Response;

class IdempotencyMiddlewareTest extends TestCase
{
    private IdempotencyMiddleware $middleware;
    private Logger $logger;
    private TestHandler $logHandler;
    private IdempotencyService $idempotencyService;
    private RedisClient $redis;
    private ServerRequestFactory $requestFactory;
    private ResponseFactory $responseFactory;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $this->logger = new Logger('test');
        $this->logger->pushHandler($this->logHandler);

        // Mock Redis client
        $this->redis = $this->createMock(RedisClient::class);
        
        $this->idempotencyService = new IdempotencyService($this->logger, $this->redis);
        $this->middleware = new IdempotencyMiddleware($this->logger, $this->idempotencyService);
        
        $this->requestFactory = new ServerRequestFactory();
        $this->responseFactory = new ResponseFactory();
    }

    public function testMiddlewareIgnoresNonLeadRequests(): void
    {
        $request = $this->requestFactory->createServerRequest('GET', '/health');
        $handler = $this->createMock(\Psr\Http\Server\RequestHandlerInterface::class);
        
        $expectedResponse = new Response();
        $handler->expects($this->once())
            ->method('handle')
            ->willReturn($expectedResponse);

        $response = $this->middleware->__invoke($request, $handler);
        
        $this->assertSame($expectedResponse, $response);
    }

    public function testMiddlewareRejectsMissingIdempotencyKey(): void
    {
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads');
        $handler = $this->createMock(\Psr\Http\Server\RequestHandlerInterface::class);
        
        // Handler should not be called
        $handler->expects($this->never())->method('handle');

        $response = $this->middleware->__invoke($request, $handler);
        
        $this->assertEquals(400, $response->getStatusCode());
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('Missing X-Idempotency-Key header', $body['error']);
        
        // Check that warning was logged
        $this->assertTrue($this->logHandler->hasWarningThatContains('Missing X-Idempotency-Key header'));
    }

    public function testMiddlewareRejectsInvalidUuidFormat(): void
    {
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('X-Idempotency-Key', 'invalid-uuid');
        
        $handler = $this->createMock(\Psr\Http\Server\RequestHandlerInterface::class);
        
        // Handler should not be called
        $handler->expects($this->never())->method('handle');

        $response = $this->middleware->__invoke($request, $handler);
        
        $this->assertEquals(400, $response->getStatusCode());
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('Invalid X-Idempotency-Key format', $body['error']);
        
        // Check that warning was logged
        $this->assertTrue($this->logHandler->hasWarningThatContains('Invalid X-Idempotency-Key format'));
    }

    public function testMiddlewareAcceptsValidUuid(): void
    {
        $validUuid = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('X-Idempotency-Key', $validUuid);
        
        $handler = $this->createMock(\Psr\Http\Server\RequestHandlerInterface::class);
        
        $expectedResponse = new Response();
        $handler->expects($this->once())
            ->method('handle')
            ->willReturn($expectedResponse);

        // Mock idempotency service to return null (no duplicate)
        $this->redis->method('get')->willReturn(null);
        $this->redis->method('keys')->willReturn([]);

        $response = $this->middleware->__invoke($request, $handler);
        
        $this->assertSame($expectedResponse, $response);
    }

    public function testMiddlewareReturnsCachedResponseForDuplicate(): void
    {
        $validUuid = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('X-Idempotency-Key', $validUuid);
        
        $handler = $this->createMock(\Psr\Http\Server\RequestHandlerInterface::class);
        
        // Handler should not be called for duplicates
        $handler->expects($this->never())->method('handle');

        // Mock cached response data
        $cachedData = json_encode([
            'status_code' => 201,
            'headers' => ['Content-Type' => ['application/json']],
            'body' => json_encode(['status' => 'success']),
            'timestamp' => time()
        ]);
        
        $this->redis->method('get')->willReturn($cachedData);

        $response = $this->middleware->__invoke($request, $handler);
        
        $this->assertEquals(201, $response->getStatusCode());
        $this->assertEquals('application/json', $response->getHeaderLine('Content-Type'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
        
        // Check that info was logged
        $this->assertTrue($this->logHandler->hasInfoThatContains('Duplicate request detected'));
    }

    public function testUuidValidationAcceptsValidUuids(): void
    {
        $validUuids = [
            '550e8400-e29b-41d4-a716-446655440000',
            '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
            '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
        ];

        foreach ($validUuids as $uuid) {
            $this->assertTrue($this->middleware->isValidUuid($uuid), "UUID $uuid should be valid");
        }
    }

    public function testUuidValidationRejectsInvalidUuids(): void
    {
        $invalidUuids = [
            'not-a-uuid',
            '550e8400-e29b-41d4-a716-44665544000', // too short
            '550e8400-e29b-41d4-a716-4466554400000', // too long
            '550e8400-e29b-41d4-a716-44665544000g', // invalid character
            '550e8400-e29b-11d4-a716-446655440000', // wrong version
            '550e8400-e29b-41d4-816-446655440000', // missing character
        ];

        foreach ($invalidUuids as $uuid) {
            $this->assertFalse($this->middleware->isValidUuid($uuid), "UUID $uuid should be invalid");
        }
    }

    public function testIdempotencyKeyMasking(): void
    {
        $this->assertEquals('****', $this->middleware->maskIdempotencyKey('test'));
        $this->assertEquals('****', $this->middleware->maskIdempotencyKey('1234'));
        $this->assertEquals('550e****0000', $this->middleware->maskIdempotencyKey('550e8400-e29b-41d4-a716-446655440000'));
    }
}
