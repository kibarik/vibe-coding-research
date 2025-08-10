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
        $this->assertFalse(Validator::validatePhone('123456789')); // Too short
        $this->assertFalse(Validator::validatePhone('invalid'));
        $this->assertFalse(Validator::validatePhone('123456789012')); // Too long
    }

    public function testDateValidation()
    {
        // Valid dates
        $this->assertTrue(Validator::validateDate('2024-01-15'));
        $this->assertTrue(Validator::validateDate('2024-12-31'));
        $this->assertTrue(Validator::validateDate('2023-02-28'));
        
        // Invalid dates
        $this->assertFalse(Validator::validateDate('2024-13-01')); // Invalid month
        $this->assertFalse(Validator::validateDate('2024-01-32')); // Invalid day
        $this->assertFalse(Validator::validateDate('2024/01/15')); // Wrong format
        $this->assertFalse(Validator::validateDate('15-01-2024')); // Wrong format
        $this->assertFalse(Validator::validateDate('invalid'));
    }

    public function testTimeValidation()
    {
        // Valid times
        $this->assertTrue(Validator::validateTime('14:30'));
        $this->assertTrue(Validator::validateTime('09:00'));
        $this->assertTrue(Validator::validateTime('23:59'));
        $this->assertTrue(Validator::validateTime('00:00'));
        
        // Invalid times
        $this->assertFalse(Validator::validateTime('25:00')); // Invalid hour
        $this->assertFalse(Validator::validateTime('14:60')); // Invalid minute
        $this->assertFalse(Validator::validateTime('14:30:00')); // Wrong format
        $this->assertFalse(Validator::validateTime('2:30')); // Wrong format
        $this->assertFalse(Validator::validateTime('invalid'));
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
        $data = ['name' => 'John', 'email' => 'john@example.com', 'company' => 'Test Company'];
        $required = ['name', 'email', 'company', 'phone'];
        
        $errors = Validator::validateRequired($data, $required);
        
        $this->assertArrayHasKey('phone', $errors);
        $this->assertEquals("Field 'phone' is required", $errors['phone']);
    }

    public function testStringSanitization()
    {
        $this->assertEquals('alert("xss")clean text', Validator::sanitizeString('  <script>alert("xss")</script>clean text  '));
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
            'company' => 'Test Company',
            'phone' => '+7 (900) 123-45-67',
            'contact_channel' => 'email',
            'telegram' => '@johndoe',
            'whatsapp' => '+7 (900) 123-45-67',
            'meeting_date' => '2024-01-15',
            'meeting_time' => '14:30',
            'company_size' => '10-50',
            'role' => 'Manager',
            'main_task' => 'Website development',
            'additional_info' => 'Test additional information',
            'utm_source' => 'google',
            'utm_medium' => 'cpc'
        ];

        $result = LeadValidator::validate($data);

        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['errors']);
        $this->assertEquals('John Doe', $result['normalized']['name']);
        $this->assertEquals('john@example.com', $result['normalized']['email']);
        $this->assertEquals('Test Company', $result['normalized']['company']);
        $this->assertEquals('79001234567', $result['normalized']['phone']);
        $this->assertEquals('email', $result['normalized']['contact_channel']);
        $this->assertEquals('@johndoe', $result['normalized']['telegram']);
        $this->assertEquals('79001234567', $result['normalized']['whatsapp']);
        $this->assertEquals('2024-01-15', $result['normalized']['meeting_date']);
        $this->assertEquals('14:30', $result['normalized']['meeting_time']);
        $this->assertEquals('10-50', $result['normalized']['company_size']);
        $this->assertEquals('Manager', $result['normalized']['role']);
        $this->assertEquals('Website development', $result['normalized']['main_task']);
        $this->assertEquals('Test additional information', $result['normalized']['additional_info']);
        $this->assertArrayHasKey('utm_params', $result['normalized']);
    }

    public function testLeadValidationFailure()
    {
        $data = [
            'name' => '', // Empty required field
            'email' => 'invalid-email',
            'company' => '', // Empty required field
            'phone' => 'invalid-phone'
        ];

        $result = LeadValidator::validate($data);

        $this->assertFalse($result['valid']);
        $this->assertArrayHasKey('name', $result['errors']);
        $this->assertArrayHasKey('email', $result['errors']);
        $this->assertArrayHasKey('company', $result['errors']);
        $this->assertArrayHasKey('phone', $result['errors']);
    }

    public function testLeadValidationRules()
    {
        $rules = LeadValidator::getValidationRules();
        
        $this->assertArrayHasKey('required_fields', $rules);
        $this->assertArrayHasKey('field_rules', $rules);
        $this->assertContains('name', $rules['required_fields']);
        $this->assertContains('email', $rules['required_fields']);
        $this->assertContains('company', $rules['required_fields']);
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
