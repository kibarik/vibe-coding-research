<?php

namespace App\Validation;

class Validator
{
    /**
     * Validate email format
     */
    public static function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate and normalize phone number
     */
    public static function validatePhone(string $phone): string|false
    {
        // Remove all non-digit characters
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        
        // Check if it's a valid Russian phone number (10 or 11 digits)
        if (strlen($cleaned) === 11 && $cleaned[0] === '8') {
            // Convert 8 to 7 for consistency
            $cleaned = '7' . substr($cleaned, 1);
        }
        
        if (strlen($cleaned) === 10) {
            // Add 7 prefix for Russian numbers
            $cleaned = '7' . $cleaned;
        }
        
        // Final validation: should be 11 digits starting with 7
        if (strlen($cleaned) === 11 && $cleaned[0] === '7') {
            return $cleaned;
        }
        
        return false;
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    public static function validateDate(string $date): bool
    {
        $dateTime = \DateTime::createFromFormat('Y-m-d', $date);
        return $dateTime !== false && $dateTime->format('Y-m-d') === $date;
    }

    /**
     * Validate time format (HH:MM)
     */
    public static function validateTime(string $time): bool
    {
        $dateTime = \DateTime::createFromFormat('H:i', $time);
        return $dateTime !== false && $dateTime->format('H:i') === $time;
    }

    /**
     * Validate UTM parameters
     */
    public static function validateUtmParams(array $utmParams): array
    {
        $validParams = [];
        $allowedUtmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        
        foreach ($utmParams as $key => $value) {
            if (in_array($key, $allowedUtmParams) && !empty($value)) {
                $validParams[$key] = trim($value);
            }
        }
        
        return $validParams;
    }

    /**
     * Validate required fields
     */
    public static function validateRequired(array $data, array $requiredFields): array
    {
        $errors = [];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $errors[$field] = "Field '{$field}' is required";
            }
        }
        
        return $errors;
    }

    /**
     * Sanitize string input
     */
    public static function sanitizeString(string $input): string
    {
        return trim(strip_tags($input));
    }

    /**
     * Validate string length
     */
    public static function validateLength(string $input, int $min = 1, int $max = 255): bool
    {
        $length = mb_strlen($input);
        return $length >= $min && $length <= $max;
    }
}
