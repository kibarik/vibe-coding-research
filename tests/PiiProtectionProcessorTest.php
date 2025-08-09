<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Logging\PiiProtectionProcessor;
use Monolog\LogRecord;

class PiiProtectionProcessorTest extends TestCase
{
    private PiiProtectionProcessor $processor;

    protected function setUp(): void
    {
        $this->processor = new PiiProtectionProcessor();
    }

    public function testInvokeReturnsLogRecord(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['email' => 'test@example.com'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertInstanceOf(LogRecord::class, $result);
    }

    public function testEmailMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['email' => 'john.doe@example.com'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('j***e@example.com', $result->context['email']);
    }

    public function testPhoneMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['phone' => '+79001234567'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('79****67', $result->context['phone']);
    }

    public function testCreditCardMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['card' => '1234-5678-9012-3456'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('************3456', $result->context['card']);
    }

    public function testSSNMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['ssn' => '123-45-6789'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('***-**-6789', $result->context['ssn']);
    }

    public function testIPAddressMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['ip' => '192.168.1.100'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('192.168.*.*', $result->context['ip']);
    }

    public function testSensitiveFieldMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['access_token' => 'secret-token-123'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('se****23', $result->context['access_token']);
    }

    public function testNestedArraySanitization(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            [
                'user' => [
                    'email' => 'john@example.com',
                    'phone' => '+79001234567',
                    'name' => 'John Doe'
                ]
            ],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('j***n@example.com', $result->context['user']['email']);
        $this->assertEquals('79****67', $result->context['user']['phone']);
        $this->assertEquals('John Doe', $result->context['user']['name']); // Name not in PII patterns
    }

    public function testExtraDataSanitization(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            [],
            ['api_key' => 'secret-api-key-456']
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('se****56', $result->extra['api_key']);
    }

    public function testInvalidEmailHandling(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['email' => 'invalid-email'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('[INVALID_EMAIL]', $result->context['email']);
    }

    public function testInvalidPhoneHandling(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['phone' => '123'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('[INVALID_PHONE]', $result->context['phone']);
    }

    public function testInvalidCreditCardHandling(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['card' => '123'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('[INVALID_CARD]', $result->context['card']);
    }

    public function testInvalidSSNHandling(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['ssn' => '123'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('[INVALID_SSN]', $result->context['ssn']);
    }

    public function testInvalidIPHandling(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['ip' => 'invalid-ip'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('[INVALID_IP]', $result->context['ip']);
    }

    public function testNonStringValuesArePreserved(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            [
                'number' => 123,
                'boolean' => true,
                'null' => null,
                'array' => ['test']
            ],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals(123, $result->context['number']);
        $this->assertTrue($result->context['boolean']);
        $this->assertNull($result->context['null']);
        $this->assertEquals(['test'], $result->context['array']);
    }

    public function testShortSensitiveValueMasking(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            ['token' => 'abc'],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('***', $result->context['token']);
    }

    public function testCaseInsensitiveSensitiveFieldDetection(): void
    {
        $record = new LogRecord(
            new \DateTimeImmutable(),
            'test',
            \Monolog\Logger::INFO,
            'Test message',
            [
                'ACCESS_TOKEN' => 'secret-token',
                'ApiKey' => 'secret-key',
                'ClientSecret' => 'secret-secret'
            ],
            []
        );

        $result = $this->processor->__invoke($record);
        
        $this->assertEquals('se****en', $result->context['ACCESS_TOKEN']);
        $this->assertEquals('se****ey', $result->context['ApiKey']);
        $this->assertEquals('se****et', $result->context['ClientSecret']);
    }
}
