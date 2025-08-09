<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Validation\Validator;
use App\Validation\LeadValidator;

class ValidationTest extends TestCase
{
    public function testEmailValidation()
    {
        $this->assertTrue(Validator::validateEmail('test@example.com'));
        $this->assertTrue(Validator::validateEmail('user.name+tag@domain.co.uk'));
        $this->assertFalse(Validator::validateEmail('invalid-email'));
        $this->assertFalse(Validator::validateEmail('test@'));
        $this->assertFalse(Validator::validateEmail('@example.com'));
    }

    public function testPhoneValidation()
    {
        // Valid Russian phone numbers
        $this->assertEquals('79001234567', Validator::validatePhone('+7 (900) 123-45-67'));
        $this->assertEquals('79001234567', Validator::validatePhone('8 (900) 123-45-67'));
        $this->assertEquals('79001234567', Validator::validatePhone('9001234567'));
        $this->assertEquals('79001234567', Validator::validatePhone('+79001234567'));
        
        // Invalid phone numbers
        $this->assertFalse(Validator::validatePhone('123'));
        $this->assertFalse(Validator::validatePhone('+1234567890'));
        $this->assertFalse(Validator::validatePhone('invalid'));
    }

    public function testUtmParamsValidation()
    {
        $input = [
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'summer_sale',
            'utm_term' => 'buy now',
            'utm_content' => 'banner1',
            'invalid_param' => 'should_be_ignored'
        ];

        $expected = [
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'utm_campaign' => 'summer_sale',
            'utm_term' => 'buy now',
            'utm_content' => 'banner1'
        ];

        $this->assertEquals($expected, Validator::validateUtmParams($input));
    }

    public function testRequiredFieldsValidation()
    {
        $data = ['name' => 'John', 'email' => 'john@example.com'];
        $required = ['name', 'email', 'phone'];
        
        $errors = Validator::validateRequired($data, $required);
        
        $this->assertArrayHasKey('phone', $errors);
        $this->assertEquals("Field 'phone' is required", $errors['phone']);
    }

    public function testStringSanitization()
    {
        $this->assertEquals('clean text', Validator::sanitizeString('  <script>alert("xss")</script>clean text  '));
        $this->assertEquals('', Validator::sanitizeString('   '));
    }

    public function testStringLengthValidation()
    {
        $this->assertTrue(Validator::validateLength('test', 1, 10));
        $this->assertFalse(Validator::validateLength('', 1, 10));
        $this->assertFalse(Validator::validateLength('very long string that exceeds limit', 1, 10));
    }

    public function testLeadValidationSuccess()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+7 (900) 123-45-67',
            'comment' => 'Test comment',
            'utm_source' => 'google',
            'utm_medium' => 'cpc'
        ];

        $result = LeadValidator::validate($data);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
        $this->assertEquals('John Doe', $result['normalized']['name']);
        $this->assertEquals('john@example.com', $result['normalized']['email']);
        $this->assertEquals('79001234567', $result['normalized']['phone']);
        $this->assertEquals('Test comment', $result['normalized']['comment']);
        $this->assertArrayHasKey('utm_params', $result['normalized']);
    }

    public function testLeadValidationFailure()
    {
        $data = [
            'name' => '', // Empty required field
            'email' => 'invalid-email',
            'phone' => 'invalid-phone'
        ];

        $result = LeadValidator::validate($data);

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('name', $result['errors']);
        $this->assertArrayHasKey('email', $result['errors']);
        $this->assertArrayHasKey('phone', $result['errors']);
    }

    public function testLeadValidationRules()
    {
        $rules = LeadValidator::getValidationRules();
        
        $this->assertArrayHasKey('required_fields', $rules);
        $this->assertArrayHasKey('field_rules', $rules);
        $this->assertContains('name', $rules['required_fields']);
        $this->assertContains('email', $rules['required_fields']);
        $this->assertContains('phone', $rules['required_fields']);
    }

    public function testPhoneNumberNormalization()
    {
        $testCases = [
            '+7 (900) 123-45-67' => '79001234567',
            '8 (900) 123-45-67' => '79001234567',
            '9001234567' => '79001234567',
            '+79001234567' => '79001234567',
            '8-900-123-45-67' => '79001234567'
        ];

        foreach ($testCases as $input => $expected) {
            $this->assertEquals($expected, Validator::validatePhone($input), "Failed for input: {$input}");
        }
    }

    public function testUtmParamsFiltering()
    {
        $input = [
            'utm_source' => '  google  ', // Should be trimmed
            'utm_medium' => '', // Should be ignored
            'utm_campaign' => 'test',
            'other_field' => 'should_be_ignored'
        ];

        $expected = [
            'utm_source' => 'google',
            'utm_campaign' => 'test'
        ];

        $this->assertEquals($expected, Validator::validateUtmParams($input));
    }
}
