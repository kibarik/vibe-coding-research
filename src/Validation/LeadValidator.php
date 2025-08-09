<?php

namespace App\Validation;

class LeadValidator
{
    private const REQUIRED_FIELDS = ['name', 'email', 'phone'];
    private const MAX_NAME_LENGTH = 100;
    private const MAX_COMMENT_LENGTH = 1000;

    /**
     * Validate lead data
     */
    public static function validate(array $data): array
    {
        $errors = [];
        $normalized = [];

        // Check required fields
        $requiredErrors = Validator::validateRequired($data, self::REQUIRED_FIELDS);
        $errors = array_merge($errors, $requiredErrors);

        // Validate and normalize name
        if (isset($data['name'])) {
            $name = Validator::sanitizeString($data['name']);
            if (!Validator::validateLength($name, 1, self::MAX_NAME_LENGTH)) {
                $errors['name'] = "Name must be between 1 and " . self::MAX_NAME_LENGTH . " characters";
            } else {
                $normalized['name'] = $name;
            }
        }

        // Validate and normalize email
        if (isset($data['email'])) {
            $email = Validator::sanitizeString($data['email']);
            if (!Validator::validateEmail($email)) {
                $errors['email'] = "Invalid email format";
            } else {
                $normalized['email'] = strtolower($email);
            }
        }

        // Validate and normalize phone
        if (isset($data['phone'])) {
            $phone = Validator::sanitizeString($data['phone']);
            $normalizedPhone = Validator::validatePhone($phone);
            if ($normalizedPhone === false) {
                $errors['phone'] = "Invalid phone number format";
            } else {
                $normalized['phone'] = $normalizedPhone;
            }
        }

        // Validate comment (optional)
        if (isset($data['comment']) && !empty($data['comment'])) {
            $comment = Validator::sanitizeString($data['comment']);
            if (!Validator::validateLength($comment, 1, self::MAX_COMMENT_LENGTH)) {
                $errors['comment'] = "Comment must be between 1 and " . self::MAX_COMMENT_LENGTH . " characters";
            } else {
                $normalized['comment'] = $comment;
            }
        }

        // Validate UTM parameters
        $utmParams = [];
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'utm_')) {
                $utmParams[$key] = $value;
            }
        }
        $normalized['utm_params'] = Validator::validateUtmParams($utmParams);

        // Validate additional fields (optional)
        $additionalFields = ['source', 'medium', 'campaign'];
        foreach ($additionalFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $value = Validator::sanitizeString($data[$field]);
                if (Validator::validateLength($value, 1, 100)) {
                    $normalized[$field] = $value;
                }
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'normalized' => $normalized
        ];
    }

    /**
     * Get validation rules for documentation
     */
    public static function getValidationRules(): array
    {
        return [
            'required_fields' => self::REQUIRED_FIELDS,
            'field_rules' => [
                'name' => [
                    'type' => 'string',
                    'required' => true,
                    'max_length' => self::MAX_NAME_LENGTH,
                    'description' => 'Lead name'
                ],
                'email' => [
                    'type' => 'email',
                    'required' => true,
                    'description' => 'Valid email address'
                ],
                'phone' => [
                    'type' => 'phone',
                    'required' => true,
                    'description' => 'Russian phone number (will be normalized to +7XXXXXXXXXX format)'
                ],
                'comment' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_COMMENT_LENGTH,
                    'description' => 'Optional comment'
                ],
                'utm_source' => [
                    'type' => 'string',
                    'required' => false,
                    'description' => 'UTM source parameter'
                ],
                'utm_medium' => [
                    'type' => 'string',
                    'required' => false,
                    'description' => 'UTM medium parameter'
                ],
                'utm_campaign' => [
                    'type' => 'string',
                    'required' => false,
                    'description' => 'UTM campaign parameter'
                ],
                'utm_term' => [
                    'type' => 'string',
                    'required' => false,
                    'description' => 'UTM term parameter'
                ],
                'utm_content' => [
                    'type' => 'string',
                    'required' => false,
                    'description' => 'UTM content parameter'
                ],
                'source' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 100,
                    'description' => 'Lead source'
                ],
                'medium' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 100,
                    'description' => 'Lead medium'
                ],
                'campaign' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 100,
                    'description' => 'Lead campaign'
                ]
            ]
        ];
    }
}
