<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Controllers\LeadController;
use App\Services\AmoCrmAuthService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;

class LeadControllerTest extends TestCase
{
    private LeadController $controller;
    private TestHandler $logHandler;
    private AmoCrmAuthService $mockAuthService;
    private ServerRequestFactory $requestFactory;
    private ResponseFactory $responseFactory;

    protected function setUp(): void
    {
        $logger = new Logger('test');
        $this->logHandler = new TestHandler();
        $logger->pushHandler($this->logHandler);

        // Create mock amoCRM auth service
        $this->mockAuthService = $this->createMock(AmoCrmAuthService::class);
        
        $this->controller = new LeadController($logger, $this->mockAuthService);
        
        $this->requestFactory = new ServerRequestFactory();
        $this->responseFactory = new ResponseFactory();
    }

    public function testCreateLeadSuccess()
    {
        // Mock auth service to return true for hasTokens
        $this->mockAuthService->method('hasTokens')->willReturn(true);

        // Create request with validated data
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '79001234567',
                'comment' => 'Test comment',
                'utm_params' => [
                    'utm_source' => 'google',
                    'utm_medium' => 'cpc'
                ]
            ]);

        $response = $this->responseFactory->createResponse();

        $result = $this->controller->createLead($request, $response);

        $this->assertEquals(201, $result->getStatusCode());
        $this->assertEquals('application/json', $result->getHeaderLine('Content-Type'));
        $this->assertNotEmpty($result->getHeaderLine('X-Request-ID'));
        $this->assertNotEmpty($result->getHeaderLine('X-Processing-Time'));

        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
        $this->assertArrayHasKey('lead_id', $body);
        $this->assertArrayHasKey('request_id', $body);
        $this->assertArrayHasKey('data_received', $body);
        $this->assertTrue($body['data_received']['has_comment']);
        $this->assertEquals(2, $body['data_received']['utm_params_count']);
    }

    public function testCreateLeadWithoutValidatedData()
    {
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json');

        $response = $this->responseFactory->createResponse();

        $result = $this->controller->createLead($request, $response);

        $this->assertEquals(500, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('error', $body['status']);
        $this->assertEquals('No validated data available', $body['message']);
    }

    public function testCreateLeadWithoutAmocrmAuth()
    {
        // Mock auth service to return false for hasTokens
        $this->mockAuthService->method('hasTokens')->willReturn(false);

        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '79001234567'
            ]);

        $response = $this->responseFactory->createResponse();

        $result = $this->controller->createLead($request, $response);

        $this->assertEquals(500, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('error', $body['status']);
        $this->assertStringContainsString('amoCRM not authenticated', $body['message']);
    }

    public function testCreateLeadWithMinimalData()
    {
        $this->mockAuthService->method('hasTokens')->willReturn(true);

        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'Jane Doe',
                'email' => 'jane@example.com',
                'phone' => '79001234567'
            ]);

        $response = $this->responseFactory->createResponse();

        $result = $this->controller->createLead($request, $response);

        $this->assertEquals(201, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
        $this->assertFalse($body['data_received']['has_comment']);
        $this->assertEquals(0, $body['data_received']['utm_params_count']);
    }

    public function testHealthCheckSuccess()
    {
        // Mock auth service for health check
        $this->mockAuthService->method('hasTokens')->willReturn(true);
        $this->mockAuthService->method('getTokenStatus')->willReturn(['status' => 'valid']);

        $request = $this->requestFactory->createServerRequest('GET', '/api/leads/health');
        $response = $this->responseFactory->createResponse();

        $result = $this->controller->healthCheck($request, $response);

        $this->assertEquals(200, $result->getStatusCode());
        $this->assertEquals('application/json', $result->getHeaderLine('Content-Type'));

        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('ok', $body['status']);
        $this->assertEquals('lead-api', $body['service']);
        $this->assertEquals('1.0.0', $body['version']);
        $this->assertArrayHasKey('checks', $body);
        $this->assertEquals('ok', $body['checks']['amocrm_auth']);
        $this->assertEquals('ok', $body['checks']['validation_system']);
    }

    public function testHealthCheckWithAmocrmNotConfigured()
    {
        // Mock auth service to return false for hasTokens
        $this->mockAuthService->method('hasTokens')->willReturn(false);

        $request = $this->requestFactory->createServerRequest('GET', '/api/leads/health');
        $response = $this->responseFactory->createResponse();

        $result = $this->controller->healthCheck($request, $response);

        $this->assertEquals(503, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('degraded', $body['overall_status']);
        $this->assertEquals('not_configured', $body['checks']['amocrm_auth']);
    }

    public function testHealthCheckWithExpiredTokens()
    {
        // Mock auth service to return true for hasTokens but expired status
        $this->mockAuthService->method('hasTokens')->willReturn(true);
        $this->mockAuthService->method('getTokenStatus')->willReturn(['status' => 'expired']);

        $request = $this->requestFactory->createServerRequest('GET', '/api/leads/health');
        $response = $this->responseFactory->createResponse();

        $result = $this->controller->healthCheck($request, $response);

        $this->assertEquals(503, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('degraded', $body['overall_status']);
        $this->assertEquals('expired', $body['checks']['amocrm_auth']);
    }

    public function testLoggingOnLeadCreation()
    {
        $this->mockAuthService->method('hasTokens')->willReturn(true);

        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('User-Agent', 'TestAgent/1.0')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '79001234567'
            ]);

        $response = $this->responseFactory->createResponse();

        $this->controller->createLead($request, $response);

        // Check that logging occurred
        $this->assertTrue($this->logHandler->hasInfoRecords());
        
        $records = $this->logHandler->getRecords();
        $this->assertStringContainsString('Lead creation request received', $records[0]['message']);
        $this->assertStringContainsString('Lead processed successfully', $records[1]['message']);
    }

    public function testLoggingOnError()
    {
        // Mock auth service to throw exception
        $this->mockAuthService->method('hasTokens')->willThrowException(new \Exception('Test error'));

        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '79001234567'
            ]);

        $response = $this->responseFactory->createResponse();

        $this->controller->createLead($request, $response);

        // Check that error logging occurred
        $this->assertTrue($this->logHandler->hasErrorRecords());
        
        $records = $this->logHandler->getRecords();
        $this->assertStringContainsString('Lead creation failed', $records[0]['message']);
    }

    public function testDataSanitizationInLogs()
    {
        $this->mockAuthService->method('hasTokens')->willReturn(true);

        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '79001234567'
            ]);

        $response = $this->responseFactory->createResponse();

        $this->controller->createLead($request, $response);

        $records = $this->logHandler->getRecords();
        $logData = $records[0]['context']['lead_data'];
        
        // Check that email is partially masked
        $this->assertStringContainsString('jo***e@example.com', $logData['email']);
        
        // Check that phone is partially masked
        $this->assertStringContainsString('790***4567', $logData['phone']);
    }
}
