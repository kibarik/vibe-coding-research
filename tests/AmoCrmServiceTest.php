<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\AmoCrmService;
use App\Services\AmoCrmAuthService;
use App\Services\AmoCrmThrottlingService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;

class AmoCrmServiceTest extends TestCase
{
    private AmoCrmService $service;
    private TestHandler $logHandler;
    private AmoCrmAuthService $mockAuthService;
    private AmoCrmThrottlingService $mockThrottlingService;

    protected function setUp(): void
    {
        $logger = new Logger('test');
        $this->logHandler = new TestHandler();
        $logger->pushHandler($this->logHandler);

        $this->mockAuthService = $this->createMock(AmoCrmAuthService::class);
        
        $config = [
            'subdomain' => 'test',
            'field_ids' => [
                'email' => 123456,
                'phone' => 123457,
                'comment' => 123458,
                'source' => 123459,
                'utm_source' => 123460,
                'utm_medium' => 123461,
                'utm_campaign' => 123462,
                'utm_term' => 123463,
                'utm_content' => 123464,
            ]
        ];

        $this->mockThrottlingService = $this->createMock(AmoCrmThrottlingService::class);
        $this->service = new AmoCrmService($this->mockAuthService, $logger, $config, $this->mockThrottlingService);
    }

    public function testCreateLeadSuccess()
    {
        // Mock auth service to return valid token
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        // Mock API responses using reflection to override makeApiRequest
        $serviceReflection = new \ReflectionClass($this->service);
        $method = $serviceReflection->getMethod('makeApiRequest');
        $method->setAccessible(true);

        // Create a mock service that returns predefined responses
        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willReturnMap([
                // Contact search (no existing contact)
                [
                    'https://test.amocrm.ru/api/v4/contacts?query=john@example.com&limit=1',
                    'GET',
                    'valid_token',
                    ['query' => 'john@example.com', 'limit' => 1],
                    null,
                    ['_embedded' => ['contacts' => []]]
                ],
                // Create contact
                [
                    'https://test.amocrm.ru/api/v4/contacts',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['contacts' => [['id' => 123, 'name' => 'John Doe']]]]
                ],
                // Create lead
                [
                    'https://test.amocrm.ru/api/v4/leads',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['leads' => [['id' => 456]]]]
                ]
            ]);

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567',
            'comment' => 'Test comment',
            'utm_params' => [
                'utm_source' => 'google',
                'utm_medium' => 'cpc'
            ]
        ];

        $result = $mockService->createLead($leadData);

        $this->assertEquals('success', $result['status']);
        $this->assertEquals(456, $result['amocrm_lead_id']);
        $this->assertEquals(123, $result['amocrm_contact_id']);
        $this->assertArrayHasKey('processing_time_ms', $result);
        $this->assertArrayHasKey('timestamp', $result);
    }

    public function testCreateLeadWithExistingContact()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $existingContact = [
            'id' => 123,
            'name' => 'John Doe',
            'custom_fields_values' => [
                [
                    'field_id' => 123456,
                    'values' => [['value' => 'john@example.com']]
                ],
                [
                    'field_id' => 123457,
                    'values' => [['value' => '79001234567']]
                ]
            ]
        ];

        $mockService->method('makeApiRequest')
            ->willReturnMap([
                // Contact search (existing contact found)
                [
                    'https://test.amocrm.ru/api/v4/contacts?query=john@example.com&limit=1',
                    'GET',
                    'valid_token',
                    ['query' => 'john@example.com', 'limit' => 1],
                    null,
                    ['_embedded' => ['contacts' => [$existingContact]]]
                ],
                // Create lead
                [
                    'https://test.amocrm.ru/api/v4/leads',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['leads' => [['id' => 456]]]]
                ]
            ]);

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567',
            'comment' => 'Test comment'
        ];

        $result = $mockService->createLead($leadData);

        $this->assertEquals('success', $result['status']);
        $this->assertEquals(456, $result['amocrm_lead_id']);
        $this->assertEquals(123, $result['amocrm_contact_id']);
    }

    public function testCreateLeadWithUtmParameters()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willReturnMap([
                // Contact search (no existing contact)
                [
                    'https://test.amocrm.ru/api/v4/contacts?query=john@example.com&limit=1',
                    'GET',
                    'valid_token',
                    ['query' => 'john@example.com', 'limit' => 1],
                    null,
                    ['_embedded' => ['contacts' => []]]
                ],
                // Create contact
                [
                    'https://test.amocrm.ru/api/v4/contacts',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['contacts' => [['id' => 123, 'name' => 'John Doe']]]]
                ],
                // Create lead
                [
                    'https://test.amocrm.ru/api/v4/leads',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['leads' => [['id' => 456]]]]
                ],
                // Add UTM parameters
                [
                    'https://test.amocrm.ru/api/v4/leads/456',
                    'PATCH',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['status' => 'success']
                ]
            ]);

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567',
            'utm_params' => [
                'utm_source' => 'google',
                'utm_medium' => 'cpc',
                'utm_campaign' => 'summer_sale'
            ]
        ];

        $result = $mockService->createLead($leadData);

        $this->assertEquals('success', $result['status']);
        $this->assertEquals(456, $result['amocrm_lead_id']);
    }

    public function testCreateLeadWithAuthFailure()
    {
        $this->mockAuthService->method('getValidAccessToken')
            ->willThrowException(new \Exception('Authentication failed'));

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567'
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Authentication failed');

        $this->service->createLead($leadData);
    }

    public function testCreateLeadWithApiError()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willThrowException(new \Exception('API request failed with HTTP 400: Bad Request'));

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567'
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('API request failed with HTTP 400: Bad Request');

        $mockService->createLead($leadData);
    }

    public function testCreateLeadWith401Error()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');
        $this->mockAuthService->method('refreshToken')->willReturn(['access_token' => 'new_token']);

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willThrowException(new \Exception('amoCRM API request failed with HTTP 401: Unauthorized'));

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567'
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Authentication failed, token refreshed. Please retry.');

        $mockService->createLead($leadData);
    }

    public function testLoggingOnLeadCreation()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willReturnMap([
                [
                    'https://test.amocrm.ru/api/v4/contacts?query=john@example.com&limit=1',
                    'GET',
                    'valid_token',
                    ['query' => 'john@example.com', 'limit' => 1],
                    null,
                    ['_embedded' => ['contacts' => []]]
                ],
                [
                    'https://test.amocrm.ru/api/v4/contacts',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['contacts' => [['id' => 123, 'name' => 'John Doe']]]]
                ],
                [
                    'https://test.amocrm.ru/api/v4/leads',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['leads' => [['id' => 456]]]]
                ]
            ]);

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '79001234567'
        ];

        $mockService->createLead($leadData);

        // Check that logging occurred
        $this->assertTrue($this->logHandler->hasInfoRecords());
        
        $records = $this->logHandler->getRecords();
        $this->assertStringContainsString('Starting amoCRM lead creation', $records[0]['message']);
        $this->assertStringContainsString('amoCRM lead creation successful', $records[1]['message']);
    }

    public function testDataSanitizationInLogs()
    {
        $this->mockAuthService->method('getValidAccessToken')->willReturn('valid_token');

        $mockService = $this->getMockBuilder(AmoCrmService::class)
            ->setConstructorArgs([$this->mockAuthService, new Logger('test'), ['subdomain' => 'test', 'field_ids' => []], $this->mockThrottlingService])
            ->onlyMethods(['makeApiRequest'])
            ->getMock();

        $mockService->method('makeApiRequest')
            ->willReturnMap([
                [
                    'https://test.amocrm.ru/api/v4/contacts?query=john.doe@example.com&limit=1',
                    'GET',
                    'valid_token',
                    ['query' => 'john.doe@example.com', 'limit' => 1],
                    null,
                    ['_embedded' => ['contacts' => []]]
                ],
                [
                    'https://test.amocrm.ru/api/v4/contacts',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['contacts' => [['id' => 123, 'name' => 'John Doe']]]]
                ],
                [
                    'https://test.amocrm.ru/api/v4/leads',
                    'POST',
                    'valid_token',
                    null,
                    $this->anything(),
                    ['_embedded' => ['leads' => [['id' => 456]]]]
                ]
            ]);

        $leadData = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '79001234567'
        ];

        $mockService->createLead($leadData);

        $records = $this->logHandler->getRecords();
        $logData = $records[0]['context']['lead_data'];
        
        // Check that email is partially masked
        $this->assertStringContainsString('jo***e@example.com', $logData['email']);
        
        // Check that phone is partially masked
        $this->assertStringContainsString('790***4567', $logData['phone']);
    }
}
