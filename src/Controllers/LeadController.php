<?php

namespace App\Controllers;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Monolog\Logger;
use App\Services\AmoCrmAuthService;
use App\Services\AmoCrmService;

class LeadController
{
    private Logger $logger;
    private AmoCrmAuthService $amocrmAuth;
    private AmoCrmService $amocrmService;

    public function __construct(Logger $logger, AmoCrmAuthService $amocrmAuth, AmoCrmService $amocrmService)
    {
        $this->logger = $logger;
        $this->amocrmAuth = $amocrmAuth;
        $this->amocrmService = $amocrmService;
    }

    /**
     * Handle POST /api/leads endpoint
     */
    public function createLead(Request $request, Response $response): Response
    {
        $startTime = microtime(true);
        $requestId = uniqid('lead_');
        
        try {
            // Get validated data from middleware
            $validatedData = $request->getAttribute('validated_data');
            
            if (!$validatedData) {
                throw new \Exception('No validated data available');
            }

            // Log the incoming request
            $this->logger->info('Lead creation request received', [
                'request_id' => $requestId,
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $request->getHeaderLine('User-Agent'),
                'content_type' => $request->getHeaderLine('Content-Type'),
                'lead_data' => $this->sanitizeLogData($validatedData)
            ]);

            // Check amoCRM authentication
            if (!$this->amocrmAuth->hasTokens()) {
                throw new \Exception('amoCRM not authenticated. Please complete OAuth2 setup first.');
            }

            // Create lead in amoCRM
            $amocrmResult = $this->amocrmService->createLead($validatedData);
            
            $result = [
                'status' => 'success',
                'message' => 'Lead created successfully in amoCRM',
                'request_id' => $requestId,
                'lead_id' => $amocrmResult['amocrm_lead_id'],
                'contact_id' => $amocrmResult['amocrm_contact_id'],
                'timestamp' => date('c'),
                'data_received' => [
                    'name' => $validatedData['name'],
                    'email' => $validatedData['email'],
                    'company' => $validatedData['company'],
                    'contact_channel' => $validatedData['contact_channel'] ?? null,
                    'telegram' => $validatedData['telegram'] ?? null,
                    'whatsapp' => $validatedData['whatsapp'] ?? null,
                    'phone' => $validatedData['phone'] ?? null,
                    'meeting_date' => $validatedData['meeting_date'] ?? null,
                    'meeting_time' => $validatedData['meeting_time'] ?? null,
                    'company_size' => $validatedData['company_size'] ?? null,
                    'role' => $validatedData['role'] ?? null,
                    'main_task' => $validatedData['main_task'] ?? null,
                    'additional_info' => $validatedData['additional_info'] ?? null,
                    'utm_params_count' => count($validatedData['utm_params'] ?? []),
                    'additional_fields' => array_keys(array_diff_key($validatedData, array_flip([
                        'name', 'email', 'company', 'contact_channel', 'telegram', 'whatsapp', 
                        'phone', 'meeting_date', 'meeting_time', 'company_size', 'role', 
                        'main_task', 'additional_info', 'utm_params'
                    ])))
                ],
                'amocrm_processing_time_ms' => $amocrmResult['processing_time_ms']
            ];

            // Log successful processing
            $processingTime = (microtime(true) - $startTime) * 1000;
            $this->logger->info('Lead processed successfully', [
                'request_id' => $requestId,
                'lead_id' => $amocrmResult['amocrm_lead_id'],
                'processing_time_ms' => round($processingTime, 2),
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
            ]);

            $response->getBody()->write(json_encode($result, JSON_PRETTY_PRINT));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('X-Request-ID', $requestId)
                ->withHeader('X-Processing-Time', round($processingTime, 2) . 'ms')
                ->withStatus(201);

        } catch (\Exception $e) {
            $processingTime = (microtime(true) - $startTime) * 1000;
            
            $this->logger->error('Lead creation failed', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'processing_time_ms' => round($processingTime, 2),
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $request->getHeaderLine('User-Agent')
            ]);

            $errorResponse = [
                'status' => 'error',
                'message' => $e->getMessage(),
                'request_id' => $requestId,
                'timestamp' => date('c')
            ];

            $response->getBody()->write(json_encode($errorResponse, JSON_PRETTY_PRINT));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('X-Request-ID', $requestId)
                ->withHeader('X-Processing-Time', round($processingTime, 2) . 'ms')
                ->withStatus(500);
        }
    }

    /**
     * Handle GET /api/leads/health endpoint
     */
    public function healthCheck(Request $request, Response $response): Response
    {
        $health = [
            'status' => 'ok',
            'timestamp' => date('c'),
            'service' => 'lead-api',
            'version' => '1.0.0',
            'checks' => [
                'amocrm_auth' => $this->checkAmoCrmAuth(),
                'storage_writable' => $this->checkStorageWritable(),
                'validation_system' => 'ok'
            ]
        ];

        $overallStatus = 'ok';
        foreach ($health['checks'] as $check) {
            if ($check !== 'ok') {
                $overallStatus = 'degraded';
                break;
            }
        }

        $health['overall_status'] = $overallStatus;

        $response->getBody()->write(json_encode($health, JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($overallStatus === 'ok' ? 200 : 503);
    }

    /**
     * Generate unique lead ID
     */
    private function generateLeadId(): string
    {
        return 'lead_' . uniqid() . '_' . time();
    }

    /**
     * Sanitize data for logging (remove sensitive information)
     */
    private function sanitizeLogData(array $data): array
    {
        $sanitized = $data;
        
        // Mask email partially
        if (isset($sanitized['email'])) {
            $email = $sanitized['email'];
            $parts = explode('@', $email);
            if (count($parts) === 2) {
                $username = $parts[0];
                $domain = $parts[1];
                $maskedUsername = substr($username, 0, 2) . '***' . substr($username, -1);
                $sanitized['email'] = $maskedUsername . '@' . $domain;
            }
        }

        // Mask phone number partially
        if (isset($sanitized['phone'])) {
            $phone = $sanitized['phone'];
            if (strlen($phone) >= 7) {
                $sanitized['phone'] = substr($phone, 0, 3) . '***' . substr($phone, -4);
            }
        }

        return $sanitized;
    }

    /**
     * Check amoCRM authentication status
     */
    private function checkAmoCrmAuth(): string
    {
        try {
            if (!$this->amocrmAuth->hasTokens()) {
                return 'not_configured';
            }

            $status = $this->amocrmAuth->getTokenStatus();
            return $status['status'] === 'valid' ? 'ok' : 'expired';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    /**
     * Check if storage directory is writable
     */
    private function checkStorageWritable(): string
    {
        $storageDir = __DIR__ . '/../../storage';
        return is_dir($storageDir) && is_writable($storageDir) ? 'ok' : 'error';
    }
}
