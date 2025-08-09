<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\LoggingService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;

class LoggingServiceTest extends TestCase
{
    private LoggingService $loggingService;
    private array $config;

    protected function setUp(): void
    {
        $this->config = [
            'app' => [
                'environment' => 'testing',
                'name' => 'leads.aiworkplace',
                'version' => '1.0.0',
            ],
            'logging' => [
                'level' => 'debug',
                'file' => 'storage/logs/test.log',
                'max_files' => 5,
                'pii_protection' => true,
                'request_logging' => true,
                'error_logging' => true,
                'performance_logging' => true,
            ],
        ];

        $this->loggingService = new LoggingService($this->config);
    }

    public function testGetLoggerReturnsLoggerInstance(): void
    {
        $logger = $this->loggingService->getLogger();
        
        $this->assertInstanceOf(Logger::class, $logger);
        $this->assertEquals('leads.aiworkplace', $logger->getName());
    }

    public function testLogRequestLogsCorrectly(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logRequest(
            'POST',
            '/api/leads',
            ['Content-Type' => 'application/json'],
            '{"name":"John Doe","email":"john@example.com"}'
        );

        $this->assertTrue($testHandler->hasInfo('HTTP Request'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals('POST', $record['context']['method']);
        $this->assertEquals('/api/leads', $record['context']['uri']);
        $this->assertEquals(47, $record['context']['body_size']);
    }

    public function testLogResponseLogsCorrectly(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logResponse(
            201,
            ['Content-Type' => 'application/json'],
            '{"status":"success"}'
        );

        $this->assertTrue($testHandler->hasInfo('HTTP Response'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals(201, $record['context']['status_code']);
        $this->assertEquals(18, $record['context']['body_size']);
    }

    public function testLogErrorLogsExceptionCorrectly(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $exception = new \Exception('Test error message', 500);
        
        $this->loggingService->logError($exception, ['context' => 'test']);

        $this->assertTrue($testHandler->hasError('Exception occurred'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals('Exception', $record['context']['exception']['class']);
        $this->assertEquals('Test error message', $record['context']['exception']['message']);
        $this->assertEquals(500, $record['context']['exception']['code']);
        $this->assertEquals('test', $record['context']['context']);
    }

    public function testLogAmoCrmOperationLogsSuccess(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logAmoCrmOperation(
            'create_contact',
            ['name' => 'John Doe', 'email' => 'john@example.com'],
            null
        );

        $this->assertTrue($testHandler->hasInfo('amoCRM Operation Success'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals('create_contact', $record['context']['operation']);
    }

    public function testLogAmoCrmOperationLogsError(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logAmoCrmOperation(
            'create_contact',
            ['name' => 'John Doe'],
            'API rate limit exceeded'
        );

        $this->assertTrue($testHandler->hasError('amoCRM Operation Failed'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals('create_contact', $record['context']['operation']);
        $this->assertEquals('API rate limit exceeded', $record['context']['error']);
    }

    public function testLogLeadProcessingLogsSuccess(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'email' => 'john@example.com'],
            'lead_123',
            null
        );

        $this->assertTrue($testHandler->hasInfo('Lead Processing Success'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertEquals('lead_123', $record['context']['lead_id']);
    }

    public function testLogLeadProcessingLogsError(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe'],
            null,
            'Validation failed'
        );

        $this->assertTrue($testHandler->hasError('Lead Processing Failed'));
        
        $record = $testHandler->getRecords()[0];
        $this->assertNull($record['context']['lead_id']);
        $this->assertEquals('Validation failed', $record['context']['error']);
    }

    public function testPiiProtectionMasksEmail(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'email' => 'john.doe@example.com'],
            'lead_123'
        );

        $record = $testHandler->getRecords()[0];
        $leadData = $record['context']['lead_data'];
        
        $this->assertEquals('j***e@example.com', $leadData['email']);
    }

    public function testPiiProtectionMasksPhone(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'phone' => '+79001234567'],
            'lead_123'
        );

        $record = $testHandler->getRecords()[0];
        $leadData = $record['context']['lead_data'];
        
        $this->assertEquals('79****67', $leadData['phone']);
    }

    public function testPiiProtectionMasksName(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'email' => 'john@example.com'],
            'lead_123'
        );

        $record = $testHandler->getRecords()[0];
        $leadData = $record['context']['lead_data'];
        
        $this->assertEquals('J***e', $leadData['name']);
    }

    public function testSanitizeHeadersRemovesSensitiveData(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logRequest(
            'POST',
            '/api/leads',
            [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer secret-token',
                'X-Idempotency-Key' => '550e8400-e29b-41d4-a716-446655440000'
            ]
        );

        $record = $testHandler->getRecords()[0];
        $headers = $record['context']['headers'];
        
        $this->assertEquals('application/json', $headers['Content-Type']);
        $this->assertEquals('[REDACTED]', $headers['Authorization']);
        $this->assertEquals('[REDACTED]', $headers['X-Idempotency-Key']);
    }

    public function testEnvironmentSpecificConfiguration(): void
    {
        // Test production environment
        $prodConfig = $this->config;
        $prodConfig['app']['environment'] = 'production';
        $prodConfig['logging']['level'] = 'warning';
        
        $prodLoggingService = new LoggingService($prodConfig);
        $prodLogger = $prodLoggingService->getLogger();
        
        $this->assertEquals('leads.aiworkplace', $prodLogger->getName());
        
        // Test development environment
        $devConfig = $this->config;
        $devConfig['app']['environment'] = 'development';
        $devConfig['logging']['level'] = 'debug';
        
        $devLoggingService = new LoggingService($devConfig);
        $devLogger = $devLoggingService->getLogger();
        
        $this->assertEquals('leads.aiworkplace', $devLogger->getName());
    }

    public function testInvalidEmailMasking(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'email' => 'invalid-email'],
            'lead_123'
        );

        $record = $testHandler->getRecords()[0];
        $leadData = $record['context']['lead_data'];
        
        $this->assertEquals('[INVALID_EMAIL]', $leadData['email']);
    }

    public function testInvalidPhoneMasking(): void
    {
        $logger = $this->loggingService->getLogger();
        $testHandler = new TestHandler();
        $logger->pushHandler($testHandler);

        $this->loggingService->logLeadProcessing(
            ['name' => 'John Doe', 'phone' => '123'],
            'lead_123'
        );

        $record = $testHandler->getRecords()[0];
        $leadData = $record['context']['lead_data'];
        
        $this->assertEquals('[INVALID_PHONE]', $leadData['phone']);
    }
}
