<?php

namespace App\Validation;

class LeadValidator
{
    private const REQUIRED_FIELDS = ['email', 'name', 'company'];
    private const MAX_NAME_LENGTH = 100;
    private const MAX_COMPANY_LENGTH = 200;
    private const MAX_COMMENT_LENGTH = 1000;
    private const MAX_CHANNEL_LENGTH = 50;
    private const MAX_TELEGRAM_LENGTH = 50;
    private const MAX_WHATSAPP_LENGTH = 20;
    private const MAX_PHONE_LENGTH = 20;
    private const MAX_COMPANY_SIZE_LENGTH = 100;
    private const MAX_ROLE_LENGTH = 100;
    private const MAX_TASK_LENGTH = 500;

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

        // Validate and normalize email (required)
        if (isset($data['email'])) {
            $email = Validator::sanitizeString($data['email']);
            if (!Validator::validateEmail($email)) {
                $errors['email'] = "Invalid email format";
            } else {
                $normalized['email'] = strtolower($email);
            }
        }

        // Validate and normalize name (required)
        if (isset($data['name'])) {
            $name = Validator::sanitizeString($data['name']);
            if (!Validator::validateLength($name, 1, self::MAX_NAME_LENGTH)) {
                $errors['name'] = "Name must be between 1 and " . self::MAX_NAME_LENGTH . " characters";
            } else {
                $normalized['name'] = $name;
            }
        }

        // Validate and normalize company (required)
        if (isset($data['company'])) {
            $company = Validator::sanitizeString($data['company']);
            if (!Validator::validateLength($company, 1, self::MAX_COMPANY_LENGTH)) {
                $errors['company'] = "Company must be between 1 and " . self::MAX_COMPANY_LENGTH . " characters";
            } else {
                $normalized['company'] = $company;
            }
        }

        // Validate contact channel (optional)
        if (isset($data['contact_channel']) && !empty($data['contact_channel'])) {
            $channel = Validator::sanitizeString($data['contact_channel']);
            if (!Validator::validateLength($channel, 1, self::MAX_CHANNEL_LENGTH)) {
                $errors['contact_channel'] = "Contact channel must be between 1 and " . self::MAX_CHANNEL_LENGTH . " characters";
            } else {
                $normalized['contact_channel'] = $channel;
            }
        }

        // Validate telegram username (optional)
        if (isset($data['telegram']) && !empty($data['telegram'])) {
            $telegram = Validator::sanitizeString($data['telegram']);
            if (!Validator::validateLength($telegram, 1, self::MAX_TELEGRAM_LENGTH)) {
                $errors['telegram'] = "Telegram username must be between 1 and " . self::MAX_TELEGRAM_LENGTH . " characters";
            } else {
                $normalized['telegram'] = $telegram;
            }
        }

        // Validate WhatsApp number (optional)
        if (isset($data['whatsapp']) && !empty($data['whatsapp'])) {
            $whatsapp = Validator::sanitizeString($data['whatsapp']);
            $normalizedWhatsapp = Validator::validatePhone($whatsapp);
            if ($normalizedWhatsapp === false) {
                $errors['whatsapp'] = "Invalid WhatsApp number format";
            } else {
                $normalized['whatsapp'] = $normalizedWhatsapp;
            }
        }

        // Validate phone number (optional)
        if (isset($data['phone']) && !empty($data['phone'])) {
            $phone = Validator::sanitizeString($data['phone']);
            $normalizedPhone = Validator::validatePhone($phone);
            if ($normalizedPhone === false) {
                $errors['phone'] = "Invalid phone number format";
            } else {
                $normalized['phone'] = $normalizedPhone;
            }
        }

        // Validate meeting date (optional)
        if (isset($data['meeting_date']) && !empty($data['meeting_date'])) {
            $meetingDate = Validator::sanitizeString($data['meeting_date']);
            if (!Validator::validateDate($meetingDate)) {
                $errors['meeting_date'] = "Invalid date format. Use YYYY-MM-DD";
            } else {
                $normalized['meeting_date'] = $meetingDate;
            }
        }

        // Validate meeting time (optional)
        if (isset($data['meeting_time']) && !empty($data['meeting_time'])) {
            $meetingTime = Validator::sanitizeString($data['meeting_time']);
            if (!Validator::validateTime($meetingTime)) {
                $errors['meeting_time'] = "Invalid time format. Use HH:MM";
            } else {
                $normalized['meeting_time'] = $meetingTime;
            }
        }

        // Validate company size (optional)
        if (isset($data['company_size']) && !empty($data['company_size'])) {
            $companySize = Validator::sanitizeString($data['company_size']);
            if (!Validator::validateLength($companySize, 1, self::MAX_COMPANY_SIZE_LENGTH)) {
                $errors['company_size'] = "Company size must be between 1 and " . self::MAX_COMPANY_SIZE_LENGTH . " characters";
            } else {
                $normalized['company_size'] = $companySize;
            }
        }

        // Validate role in company (optional)
        if (isset($data['role']) && !empty($data['role'])) {
            $role = Validator::sanitizeString($data['role']);
            if (!Validator::validateLength($role, 1, self::MAX_ROLE_LENGTH)) {
                $errors['role'] = "Role must be between 1 and " . self::MAX_ROLE_LENGTH . " characters";
            } else {
                $normalized['role'] = $role;
            }
        }

        // Validate main task (optional)
        if (isset($data['main_task']) && !empty($data['main_task'])) {
            $mainTask = Validator::sanitizeString($data['main_task']);
            if (!Validator::validateLength($mainTask, 1, self::MAX_TASK_LENGTH)) {
                $errors['main_task'] = "Main task must be between 1 and " . self::MAX_TASK_LENGTH . " characters";
            } else {
                $normalized['main_task'] = $mainTask;
            }
        }

        // Validate additional information (optional)
        if (isset($data['additional_info']) && !empty($data['additional_info'])) {
            $additionalInfo = Validator::sanitizeString($data['additional_info']);
            if (!Validator::validateLength($additionalInfo, 1, self::MAX_COMMENT_LENGTH)) {
                $errors['additional_info'] = "Additional information must be between 1 and " . self::MAX_COMMENT_LENGTH . " characters";
            } else {
                $normalized['additional_info'] = $additionalInfo;
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
                'email' => [
                    'type' => 'email',
                    'required' => true,
                    'description' => 'Work email address'
                ],
                'name' => [
                    'type' => 'string',
                    'required' => true,
                    'max_length' => self::MAX_NAME_LENGTH,
                    'description' => 'Lead name'
                ],
                'company' => [
                    'type' => 'string',
                    'required' => true,
                    'max_length' => self::MAX_COMPANY_LENGTH,
                    'description' => 'Company name'
                ],
                'contact_channel' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_CHANNEL_LENGTH,
                    'description' => 'Preferred contact channel'
                ],
                'telegram' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_TELEGRAM_LENGTH,
                    'description' => 'Telegram username'
                ],
                'whatsapp' => [
                    'type' => 'phone',
                    'required' => false,
                    'description' => 'WhatsApp phone number'
                ],
                'phone' => [
                    'type' => 'phone',
                    'required' => false,
                    'description' => 'Phone number'
                ],
                'meeting_date' => [
                    'type' => 'date',
                    'required' => false,
                    'format' => 'YYYY-MM-DD',
                    'description' => 'Meeting date'
                ],
                'meeting_time' => [
                    'type' => 'time',
                    'required' => false,
                    'format' => 'HH:MM',
                    'description' => 'Meeting time'
                ],
                'company_size' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_COMPANY_SIZE_LENGTH,
                    'description' => 'Company size'
                ],
                'role' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_ROLE_LENGTH,
                    'description' => 'Role in company'
                ],
                'main_task' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_TASK_LENGTH,
                    'description' => 'Main task description'
                ],
                'additional_info' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => self::MAX_COMMENT_LENGTH,
                    'description' => 'Additional information'
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
