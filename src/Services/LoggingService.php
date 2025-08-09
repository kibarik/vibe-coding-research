<?php

namespace App\Services;

use Monolog\Logger;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use Monolog\Formatter\LineFormatter;
use Monolog\Processor\IntrospectionProcessor;
use Monolog\Processor\MemoryUsageProcessor;
use Monolog\Processor\ProcessIdProcessor;
use Monolog\Processor\UidProcessor;

class LoggingService
{
    private Logger $logger;
    private array $config;
    private string $environment;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->environment = $config['app']['environment'] ?? 'production';
        $this->logger = $this->createLogger();
    }

    public function getLogger(): Logger
    {
        return $this->logger;
    }

    private function createLogger(): Logger
    {
        $logger = new Logger('leads.aiworkplace');
        
        // Add processors
        $logger->pushProcessor(new ProcessIdProcessor());
        $logger->pushProcessor(new MemoryUsageProcessor());
        $logger->pushProcessor(new IntrospectionProcessor());
        $logger->pushProcessor(new UidProcessor(32)); // 32 character unique ID
        
        // Add PII protection processor
        $logger->pushProcessor(new PiiProtectionProcessor());
        
        // Configure handlers based on environment
        $this->configureHandlers($logger);
        
        return $logger;
    }

    private function configureHandlers(Logger $logger): void
    {
        $logLevel = $this->getLogLevel();
        $logFile = $this->config['logging']['file'] ?? 'storage/logs/app.log';
        $maxFiles = $this->config['logging']['max_files'] ?? 30;

        // Ensure log directory exists
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        // Main rotating file handler
        $rotatingHandler = new RotatingFileHandler(
            $logFile,
            $maxFiles,
            $logLevel,
            true, // file permission
            0664  // file permission
        );

        // Configure formatter based on environment
        if ($this->environment === 'production') {
            $formatter = new JsonFormatter(JsonFormatter::BATCH_MODE_JSON, false, true);
        } else {
            $formatter = new LineFormatter(
                "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n",
                'Y-m-d H:i:s'
            );
        }

        $rotatingHandler->setFormatter($formatter);
        $logger->pushHandler($rotatingHandler);

        // Add error handler for critical errors
        $errorHandler = new RotatingFileHandler(
            str_replace('.log', '_error.log', $logFile),
            $maxFiles,
            Logger::ERROR,
            true,
            0664
        );
        $errorHandler->setFormatter($formatter);
        $logger->pushHandler($errorHandler);

        // Add debug handler for development
        if ($this->environment === 'development' || $this->environment === 'local') {
            $debugHandler = new StreamHandler('php://stdout', Logger::DEBUG);
            $debugHandler->setFormatter(new LineFormatter(
                "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n",
                'Y-m-d H:i:s'
            ));
            $logger->pushHandler($debugHandler);
        }

        // Add emergency handler for critical issues
        $emergencyHandler = new StreamHandler(
            str_replace('.log', '_emergency.log', $logFile),
            Logger::EMERGENCY,
            true,
            0664
        );
        $emergencyHandler->setFormatter($formatter);
        $logger->pushHandler($emergencyHandler);
    }

    private function getLogLevel(): int
    {
        $level = strtoupper($this->config['logging']['level'] ?? 'info');
        
        return match ($level) {
            'DEBUG' => Logger::DEBUG,
            'INFO' => Logger::INFO,
            'NOTICE' => Logger::NOTICE,
            'WARNING' => Logger::WARNING,
            'ERROR' => Logger::ERROR,
            'CRITICAL' => Logger::CRITICAL,
            'ALERT' => Logger::ALERT,
            'EMERGENCY' => Logger::EMERGENCY,
            default => Logger::INFO,
        };
    }

    public function logRequest(string $method, string $uri, array $headers, ?string $body = null): void
    {
        $this->logger->info('HTTP Request', [
            'method' => $method,
            'uri' => $uri,
            'headers' => $this->sanitizeHeaders($headers),
            'body_size' => $body ? strlen($body) : 0,
            'body_preview' => $body ? substr($body, 0, 500) : null,
            'environment' => $this->environment,
            'timestamp' => date('c'),
        ]);
    }

    public function logResponse(int $statusCode, array $headers, ?string $body = null): void
    {
        $this->logger->info('HTTP Response', [
            'status_code' => $statusCode,
            'headers' => $this->sanitizeHeaders($headers),
            'body_size' => $body ? strlen($body) : 0,
            'body_preview' => $body ? substr($body, 0, 500) : null,
            'environment' => $this->environment,
            'timestamp' => date('c'),
        ]);
    }

    public function logError(\Throwable $exception, array $context = []): void
    {
        $this->logger->error('Exception occurred', [
            'exception' => [
                'class' => get_class($exception),
                'message' => $exception->getMessage(),
                'code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ],
            'context' => $context,
            'environment' => $this->environment,
            'timestamp' => date('c'),
        ]);
    }

    public function logAmoCrmOperation(string $operation, array $data, ?string $error = null): void
    {
        $logData = [
            'operation' => $operation,
            'data' => $this->sanitizeAmoCrmData($data),
            'environment' => $this->environment,
            'timestamp' => date('c'),
        ];

        if ($error) {
            $logData['error'] = $error;
            $this->logger->error('amoCRM Operation Failed', $logData);
        } else {
            $this->logger->info('amoCRM Operation Success', $logData);
        }
    }

    public function logLeadProcessing(array $leadData, ?string $leadId = null, ?string $error = null): void
    {
        $logData = [
            'lead_id' => $leadId,
            'lead_data' => $this->sanitizeLeadData($leadData),
            'environment' => $this->environment,
            'timestamp' => date('c'),
        ];

        if ($error) {
            $logData['error'] = $error;
            $this->logger->error('Lead Processing Failed', $logData);
        } else {
            $this->logger->info('Lead Processing Success', $logData);
        }
    }

    private function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-idempotency-key'];
        $sanitized = [];

        foreach ($headers as $name => $value) {
            $lowerName = strtolower($name);
            if (in_array($lowerName, $sensitiveHeaders)) {
                $sanitized[$name] = '[REDACTED]';
            } else {
                $sanitized[$name] = is_array($value) ? $value[0] ?? '' : $value;
            }
        }

        return $sanitized;
    }

    private function sanitizeAmoCrmData(array $data): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeAmoCrmData($value);
            } elseif (in_array($key, ['access_token', 'refresh_token', 'client_secret'])) {
                $sanitized[$key] = '[REDACTED]';
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    private function sanitizeLeadData(array $data): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['email', 'phone', 'name'])) {
                $sanitized[$key] = $this->maskPii($value, $key);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    private function maskPii(string $value, string $type): string
    {
        return match ($type) {
            'email' => $this->maskEmail($value),
            'phone' => $this->maskPhone($value),
            'name' => $this->maskName($value),
            default => $value,
        };
    }

    private function maskEmail(string $email): string
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return '[INVALID_EMAIL]';
        }

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
        // Remove all non-digit characters
        $digits = preg_replace('/[^0-9]/', '', $phone);
        
        if (strlen($digits) < 7) {
            return '[INVALID_PHONE]';
        }

        // Keep first 2 and last 2 digits visible
        $visibleStart = substr($digits, 0, 2);
        $visibleEnd = substr($digits, -2);
        $masked = str_repeat('*', strlen($digits) - 4);

        return $visibleStart . $masked . $visibleEnd;
    }

    private function maskName(string $name): string
    {
        $words = explode(' ', trim($name));
        $masked = [];

        foreach ($words as $word) {
            if (strlen($word) <= 2) {
                $masked[] = $word;
            } else {
                $masked[] = substr($word, 0, 1) . str_repeat('*', strlen($word) - 2) . substr($word, -1);
            }
        }

        return implode(' ', $masked);
    }
}
