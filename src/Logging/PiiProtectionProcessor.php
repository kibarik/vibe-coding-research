<?php

namespace App\Logging;

use Monolog\LogRecord;

class PiiProtectionProcessor
{
    private array $piiPatterns;
    private array $sensitiveFields;

    public function __construct()
    {
        $this->piiPatterns = [
            'email' => '/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/',
            'phone' => '/\b(?:\+?[1-9]\d{1,14}|[1-9]\d{1,14})\b/',
            'credit_card' => '/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/',
            'ssn' => '/\b\d{3}-\d{2}-\d{4}\b/',
            'ip_address' => '/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/',
        ];

        $this->sensitiveFields = [
            'password', 'token', 'secret', 'key', 'auth', 'authorization',
            'cookie', 'session', 'api_key', 'private_key', 'client_secret',
            'access_token', 'refresh_token', 'idempotency_key'
        ];
    }

    public function __invoke(LogRecord $record): LogRecord
    {
        $sanitizedExtra = $this->sanitizeData($record->extra);
        $sanitizedContext = $this->sanitizeData($record->context);
        
        return $record->with(extra: $sanitizedExtra, context: $sanitizedContext);
    }

    private function sanitizeData(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeData($value);
            } elseif (is_string($value)) {
                $sanitized[$key] = $this->sanitizeString($key, $value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    private function sanitizeString(string $key, string $value): string
    {
        // Check if the key itself indicates sensitive data
        $lowerKey = strtolower($key);
        foreach ($this->sensitiveFields as $sensitiveField) {
            if (str_contains($lowerKey, $sensitiveField)) {
                return $this->maskSensitiveValue($value);
            }
        }

        // Check for PII patterns in the value
        foreach ($this->piiPatterns as $type => $pattern) {
            if (preg_match($pattern, $value)) {
                return $this->maskPiiValue($value, $type);
            }
        }

        return $value;
    }

    private function maskSensitiveValue(string $value): string
    {
        if (strlen($value) <= 4) {
            return str_repeat('*', strlen($value));
        }

        return substr($value, 0, 2) . str_repeat('*', strlen($value) - 4) . substr($value, -2);
    }

    private function maskPiiValue(string $value, string $type): string
    {
        return match ($type) {
            'email' => $this->maskEmail($value),
            'phone' => $this->maskPhone($value),
            'credit_card' => $this->maskCreditCard($value),
            'ssn' => $this->maskSSN($value),
            'ip_address' => $this->maskIPAddress($value),
            default => $this->maskSensitiveValue($value),
        };
    }

    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return '[INVALID_EMAIL]';
        }

        $local = $parts[0];
        $domain = $parts[1];

        if (strlen($local) <= 2) {
            $maskedLocal = $local;
        } else {
            $maskedLocal = substr($local, 0, 1) . str_repeat('*', strlen($local) - 2) . substr($local, -1);
        }

        return $maskedLocal . '@' . $domain;
    }

    private function maskPhone(string $phone): string
    {
        $digits = preg_replace('/[^0-9]/', '', $phone);
        
        if (strlen($digits) < 7) {
            return '[INVALID_PHONE]';
        }

        $visibleStart = substr($digits, 0, 2);
        $visibleEnd = substr($digits, -2);
        $masked = str_repeat('*', strlen($digits) - 4);

        return $visibleStart . $masked . $visibleEnd;
    }

    private function maskCreditCard(string $card): string
    {
        $digits = preg_replace('/[^0-9]/', '', $card);
        
        if (strlen($digits) < 13 || strlen($digits) > 19) {
            return '[INVALID_CARD]';
        }

        return str_repeat('*', strlen($digits) - 4) . substr($digits, -4);
    }

    private function maskSSN(string $ssn): string
    {
        $digits = preg_replace('/[^0-9]/', '', $ssn);
        
        if (strlen($digits) !== 9) {
            return '[INVALID_SSN]';
        }

        return '***-**-' . substr($digits, -4);
    }

    private function maskIPAddress(string $ip): string
    {
        $parts = explode('.', $ip);
        if (count($parts) !== 4) {
            return '[INVALID_IP]';
        }

        return $parts[0] . '.' . $parts[1] . '.*.*';
    }
}
