<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\IdempotencyService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Predis\Client as RedisClient;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Psr7\Response;

class IdempotencyServiceTest extends TestCase
{
    private IdempotencyService $service;
    private Logger $logger;
    private TestHandler $logHandler;
    private RedisClient $redis;
    private ServerRequestFactory $requestFactory;
    private ResponseFactory $responseFactory;

    protected function setUp(): void
    {
        $this->logHandler = new TestHandler();
        $this->logger = new Logger('test');
        $this->logger->pushHandler($this->logHandler);

        $this->redis = $this->createMock(RedisClient::class);
        $this->service = new IdempotencyService($this->logger, $this->redis);
        
        $this->requestFactory = new ServerRequestFactory();
        $this->responseFactory = new ResponseFactory();
    }

    public function testCheckDuplicateReturnsNullForNewRequest(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $this->redis->method('get')->willReturn(null);
        $this->redis->method('keys')->willReturn([]);

        $result = $this->service->checkDuplicate($idempotencyKey, $request);
        
        $this->assertNull($result);
    }

    public function testCheckDuplicateReturnsCachedResponse(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $cachedData = json_encode([
            'status_code' => 201,
            'headers' => ['Content-Type' => ['application/json']],
            'body' => json_encode(['status' => 'success', 'lead_id' => 123]),
            'timestamp' => time()
        ]);

        $this->redis->method('get')->willReturn($cachedData);

        $result = $this->service->checkDuplicate($idempotencyKey, $request);
        
        $this->assertNotNull($result);
        $this->assertEquals(201, $result->getStatusCode());
        $this->assertEquals('application/json', $result->getHeaderLine('Content-Type'));
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
        $this->assertEquals(123, $body['lead_id']);
    }

    public function testCacheResponseStoresDataInRedis(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));
        
        $response = new Response(201);
        $response = $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode(['status' => 'success']));

        $this->redis->expects($this->once())
            ->method('setex')
            ->with(
                $this->stringContains('idempotency:'),
                300,
                $this->callback(function ($data) {
                    $decoded = json_decode($data, true);
                    return $decoded['status_code'] === 201 && 
                           $decoded['headers']['Content-Type'][0] === 'application/json';
                })
            );

        $this->service->cacheResponse($idempotencyKey, $request, $response);
        
        $this->assertTrue($this->logHandler->hasInfoThatContains('Cached response for idempotency'));
    }

    public function testHashGenerationIsConsistent(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request1 = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $request2 = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $hash1 = $this->invokeGenerateRequestHash($idempotencyKey, $request1);
        $hash2 = $this->invokeGenerateRequestHash($idempotencyKey, $request2);
        
        $this->assertEquals($hash1, $hash2);
    }

    public function testHashGenerationIsDifferentForDifferentData(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request1 = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $request2 = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test2","email":"test@example.com"}'));

        $hash1 = $this->invokeGenerateRequestHash($idempotencyKey, $request1);
        $hash2 = $this->invokeGenerateRequestHash($idempotencyKey, $request2);
        
        $this->assertNotEquals($hash1, $hash2);
    }

    public function testHashGenerationIsDifferentForDifferentKeys(): void
    {
        $idempotencyKey1 = '550e8400-e29b-41d4-a716-446655440000';
        $idempotencyKey2 = '550e8400-e29b-41d4-a716-446655440001';
        
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $hash1 = $this->invokeGenerateRequestHash($idempotencyKey1, $request);
        $hash2 = $this->invokeGenerateRequestHash($idempotencyKey2, $request);
        
        $this->assertNotEquals($hash1, $hash2);
    }

    public function testJsonNormalizationSortsKeys(): void
    {
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"email":"test@example.com","name":"Test"}'));

        $normalized1 = $this->invokeNormalizeRequestData($request);
        
        $request2 = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $normalized2 = $this->invokeNormalizeRequestData($request2);
        
        $this->assertEquals($normalized1, $normalized2);
    }

    public function testFormDataNormalization(): void
    {
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/x-www-form-urlencoded')
            ->withBody($this->createStream('email=test@example.com&name=Test'));

        $normalized = $this->invokeNormalizeRequestData($request);
        
        // Should be sorted alphabetically
        $this->assertEquals('email=test%40example.com&name=Test', $normalized);
    }

    public function testRedisErrorHandling(): void
    {
        $idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withBody($this->createStream('{"name":"Test","email":"test@example.com"}'));

        $this->redis->method('get')->willThrowException(new \Exception('Redis connection failed'));

        $result = $this->service->checkDuplicate($idempotencyKey, $request);
        
        $this->assertNull($result);
        $this->assertTrue($this->logHandler->hasErrorThatContains('Error checking for duplicate request'));
    }

    public function testResponseSerializationAndDeserialization(): void
    {
        $originalResponse = new Response(201);
        $originalResponse = $originalResponse->withHeader('Content-Type', 'application/json');
        $originalResponse->getBody()->write(json_encode(['status' => 'success']));

        $serialized = $this->invokeSerializeResponse($originalResponse);
        $deserialized = $this->invokeDeserializeResponse($serialized);
        
        $this->assertEquals(201, $deserialized->getStatusCode());
        $this->assertEquals('application/json', $deserialized->getHeaderLine('Content-Type'));
        
        $body = json_decode($deserialized->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
    }

    private function createStream(string $content): \Psr\Http\Message\StreamInterface
    {
        $stream = $this->responseFactory->createResponse()->getBody();
        $stream->write($content);
        $stream->rewind();
        return $stream;
    }

    private function invokeGenerateRequestHash(string $idempotencyKey, $request): string
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('generateRequestHash');
        $method->setAccessible(true);
        return $method->invoke($this->service, $idempotencyKey, $request);
    }

    private function invokeNormalizeRequestData($request): string
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('normalizeRequestData');
        $method->setAccessible(true);
        return $method->invoke($this->service, $request->getBody()->getContents(), $request);
    }

    private function invokeSerializeResponse($response): string
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('serializeResponse');
        $method->setAccessible(true);
        return $method->invoke($this->service, $response);
    }

    private function invokeDeserializeResponse(string $data): Response
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('deserializeResponse');
        $method->setAccessible(true);
        return $method->invoke($this->service, $data);
    }
}
