<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Controllers\LeadController;
use App\Services\AmoCrmAuthService;
use App\Services\AmoCrmService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;

class LeadControllerTest extends TestCase
{
    private LeadController $controller;
    private TestHandler $logHandler;
    private AmoCrmAuthService $mockAuthService;
    private AmoCrmService $mockAmoCrmService;
    private ServerRequestFactory $requestFactory;
    private ResponseFactory $responseFactory;

    protected function setUp(): void
    {
        $logger = new Logger('test');
        $this->logHandler = new TestHandler();
        $logger->pushHandler($this->logHandler);

        // Create mock amoCRM auth service
        $this->mockAuthService = $this->createMock(AmoCrmAuthService::class);
        
        // Create mock amoCRM service
        $this->mockAmoCrmService = $this->createMock(AmoCrmService::class);
        
        $this->controller = new LeadController($logger, $this->mockAuthService, $this->mockAmoCrmService);
        
        $this->requestFactory = new ServerRequestFactory();
        $this->responseFactory = new ResponseFactory();
    }

    public function testCreateLeadSuccess()
    {
        // Mock auth service to return true for hasTokens
        $this->mockAuthService->method('hasTokens')->willReturn(true);
        
        // Mock amoCRM service to return success response
        $this->mockAmoCrmService->method('createLead')->willReturn([
            'amocrm_lead_id' => 12345,
            'amocrm_contact_id' => 67890,
            'processing_time_ms' => 150
        ]);

        // Create request with validated data
        $request = $this->requestFactory->createServerRequest('POST', '/api/leads')
            ->withHeader('Content-Type', 'application/json')
            ->withAttribute('validated_data', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'company' => 'Test Company',
                'phone' => '79001234567',
                'contact_channel' => 'email',
                'telegram' => '@johndoe',
                'whatsapp' => '79001234567',
                'meeting_date' => '2024-01-15',
                'meeting_time' => '14:30',
                'company_size' => '10-50',
                'role' => 'Manager',
                'main_task' => 'Website development',
                'additional_info' => 'Test additional information',
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
        
        // Check new field structure
        $dataReceived = $body['data_received'];
        $this->assertEquals('John Doe', $dataReceived['name']);
        $this->assertEquals('john@example.com', $dataReceived['email']);
        $this->assertEquals('Test Company', $dataReceived['company']);
        $this->assertEquals('email', $dataReceived['contact_channel']);
        $this->assertEquals('@johndoe', $dataReceived['telegram']);
        $this->assertEquals('79001234567', $dataReceived['whatsapp']);
        $this->assertEquals('79001234567', $dataReceived['phone']);
        $this->assertEquals('2024-01-15', $dataReceived['meeting_date']);
        $this->assertEquals('14:30', $dataReceived['meeting_time']);
        $this->assertEquals('10-50', $dataReceived['company_size']);
        $this->assertEquals('Manager', $dataReceived['role']);
        $this->assertEquals('Website development', $dataReceived['main_task']);
        $this->assertEquals('Test additional information', $dataReceived['additional_info']);
        $this->assertEquals(2, $dataReceived['utm_params_count']);
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
                'company' => 'Test Company',
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
                'company' => 'Test Company'
            ]);

        $response = $this->responseFactory->createResponse();

        $result = $this->controller->createLead($request, $response);

        $this->assertEquals(201, $result->getStatusCode());
        
        $body = json_decode($result->getBody()->getContents(), true);
        $this->assertEquals('success', $body['status']);
        
        // Check that optional fields are null when not provided
        $dataReceived = $body['data_received'];
        $this->assertNull($dataReceived['contact_channel']);
        $this->assertNull($dataReceived['telegram']);
        $this->assertNull($dataReceived['whatsapp']);
        $this->assertNull($dataReceived['phone']);
        $this->assertNull($dataReceived['meeting_date']);
        $this->assertNull($dataReceived['meeting_time']);
        $this->assertNull($dataReceived['company_size']);
        $this->assertNull($dataReceived['role']);
        $this->assertNull($dataReceived['main_task']);
        $this->assertNull($dataReceived['additional_info']);
        $this->assertEquals(0, $dataReceived['utm_params_count']);
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
                'company' => 'Test Company',
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
                'company' => 'Test Company',
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
                'company' => 'Test Company',
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
