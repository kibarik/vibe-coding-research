<?php

namespace App\Services;

use Monolog\Logger;

class AmoCrmService
{
    private AmoCrmAuthService $authService;
    private Logger $logger;
    private string $subdomain;
    private array $config;
    private AmoCrmThrottlingService $throttlingService;

    public function __construct(AmoCrmAuthService $authService, Logger $logger, array $config, AmoCrmThrottlingService $throttlingService)
    {
        $this->authService = $authService;
        $this->logger = $logger;
        $this->subdomain = $config['subdomain'];
        $this->config = $config;
        $this->throttlingService = $throttlingService;
    }

    /**
     * Create lead and contact in amoCRM
     */
    public function createLead(array $leadData): array
    {
        $startTime = microtime(true);
        $requestId = uniqid('amocrm_');

        try {
            $this->logger->info('Starting amoCRM lead creation', [
                'request_id' => $requestId,
                'lead_data' => $this->sanitizeLogData($leadData)
            ]);

            // Get valid access token
            $accessToken = $this->authService->getValidAccessToken();

            // Create or find contact
            $contact = $this->createOrFindContact($leadData, $accessToken);

            // Create lead
            $lead = $this->createLeadInAmoCrm($leadData, $contact['id'], $accessToken);

            // Add UTM parameters to lead
            if (!empty($leadData['utm_params'])) {
                $this->addUtmParameters($lead['id'], $leadData['utm_params'], $accessToken);
            }

            $processingTime = (microtime(true) - $startTime) * 1000;

            $result = [
                'status' => 'success',
                'request_id' => $requestId,
                'amocrm_lead_id' => $lead['id'],
                'amocrm_contact_id' => $contact['id'],
                'processing_time_ms' => round($processingTime, 2),
                'timestamp' => date('c')
            ];

            $this->logger->info('amoCRM lead creation successful', [
                'request_id' => $requestId,
                'amocrm_lead_id' => $lead['id'],
                'amocrm_contact_id' => $contact['id'],
                'processing_time_ms' => round($processingTime, 2)
            ]);

            return $result;

        } catch (\Exception $e) {
            $processingTime = (microtime(true) - $startTime) * 1000;

            $this->logger->error('amoCRM lead creation failed', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'processing_time_ms' => round($processingTime, 2)
            ]);

            throw $e;
        }
    }

    /**
     * Create or find contact in amoCRM
     */
    private function createOrFindContact(array $leadData, string $accessToken): array
    {
        // Try to find existing contact by email
        $existingContact = $this->findContactByEmail($leadData['email'], $accessToken);

        if ($existingContact) {
            // Update existing contact with new phone if different
            if ($existingContact['phone'] !== $leadData['phone']) {
                $this->updateContactPhone($existingContact['id'], $leadData['phone'], $accessToken);
            }
            return $existingContact;
        }

        // Create new contact
        return $this->createContactInAmoCrm($leadData, $accessToken);
    }

    /**
     * Find contact by email
     */
    private function findContactByEmail(string $email, string $accessToken): ?array
    {
        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/contacts";
        $params = [
            'query' => $email,
            'limit' => 1
        ];

        $response = $this->makeApiRequest($url, 'GET', $accessToken, $params);

        if (empty($response['_embedded']['contacts'])) {
            return null;
        }

        $contact = $response['_embedded']['contacts'][0];
        
        return [
            'id' => $contact['id'],
            'name' => $contact['name'],
            'email' => $this->getContactEmail($contact),
            'phone' => $this->getContactPhone($contact)
        ];
    }

    /**
     * Create contact in amoCRM
     */
    private function createContactInAmoCrm(array $leadData, string $accessToken): array
    {
        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/contacts";

        $contactData = [
            [
                'name' => $leadData['name'],
                'custom_fields_values' => [
                    [
                        'field_id' => $this->getEmailFieldId(),
                        'values' => [
                            [
                                'value' => $leadData['email'],
                                'enum_code' => 'WORK'
                            ]
                        ]
                    ],
                    [
                        'field_id' => $this->getPhoneFieldId(),
                        'values' => [
                            [
                                'value' => $leadData['phone'],
                                'enum_code' => 'WORK'
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->makeApiRequest($url, 'POST', $accessToken, null, $contactData);

        $contact = $response['_embedded']['contacts'][0];

        return [
            'id' => $contact['id'],
            'name' => $contact['name'],
            'email' => $leadData['email'],
            'phone' => $leadData['phone']
        ];
    }

    /**
     * Update contact phone number
     */
    private function updateContactPhone(int $contactId, string $phone, string $accessToken): void
    {
        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/contacts/{$contactId}";

        $updateData = [
            'custom_fields_values' => [
                [
                    'field_id' => $this->getPhoneFieldId(),
                    'values' => [
                        [
                            'value' => $phone,
                            'enum_code' => 'WORK'
                        ]
                    ]
                ]
            ]
        ];

        $this->makeApiRequest($url, 'PATCH', $accessToken, null, $updateData);
    }

    /**
     * Create lead in amoCRM
     */
    private function createLeadInAmoCrm(array $leadData, int $contactId, string $accessToken): array
    {
        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/leads";

        $leadApiData = [
            [
                'name' => "Lead: {$leadData['name']}",
                'price' => 0,
                'contacts_id' => [$contactId],
                'custom_fields_values' => []
            ]
        ];

        // Add comment if provided
        if (!empty($leadData['comment'])) {
            $leadApiData[0]['custom_fields_values'][] = [
                'field_id' => $this->getCommentFieldId(),
                'values' => [
                    [
                        'value' => $leadData['comment']
                    ]
                ]
            ];
        }

        // Add source fields if provided
        if (!empty($leadData['source'])) {
            $leadApiData[0]['custom_fields_values'][] = [
                'field_id' => $this->getSourceFieldId(),
                'values' => [
                    [
                        'value' => $leadData['source']
                    ]
                ]
            ];
        }

        $response = $this->makeApiRequest($url, 'POST', $accessToken, null, $leadApiData);

        return $response['_embedded']['leads'][0];
    }

    /**
     * Add UTM parameters to lead
     */
    private function addUtmParameters(int $leadId, array $utmParams, string $accessToken): void
    {
        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/leads/{$leadId}";

        $utmFields = [
            'utm_source' => $this->getUtmSourceFieldId(),
            'utm_medium' => $this->getUtmMediumFieldId(),
            'utm_campaign' => $this->getUtmCampaignFieldId(),
            'utm_term' => $this->getUtmTermFieldId(),
            'utm_content' => $this->getUtmContentFieldId()
        ];

        $customFields = [];

        foreach ($utmParams as $key => $value) {
            if (isset($utmFields[$key])) {
                $customFields[] = [
                    'field_id' => $utmFields[$key],
                    'values' => [
                        [
                            'value' => $value
                        ]
                    ]
                ];
            }
        }

        if (!empty($customFields)) {
            $updateData = [
                'custom_fields_values' => $customFields
            ];

            $this->makeApiRequest($url, 'PATCH', $accessToken, null, $updateData);
        }
    }

    /**
     * Make API request to amoCRM
     */
    private function makeApiRequest(string $url, string $method, string $accessToken, ?array $params = null, ?array $data = null): array
    {
        // Throttle API call before making request
        $endpoint = $this->extractEndpointFromUrl($url);
        $this->throttlingService->throttleApiCall($endpoint);

        $ch = curl_init();

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        if ($params) {
            $url .= '?' . http_build_query($params);
        }

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PATCH') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("cURL error: {$error}");
        }

        $responseData = json_decode($response, true);

        if ($httpCode >= 400) {
            $this->logger->error('amoCRM API request failed', [
                'url' => $url,
                'method' => $method,
                'http_code' => $httpCode,
                'response' => $responseData
            ]);

            if ($httpCode === 401) {
                // Token might be expired, try to refresh
                $this->authService->refreshToken();
                throw new \Exception('Authentication failed, token refreshed. Please retry.');
            }

            throw new \Exception("amoCRM API request failed with HTTP {$httpCode}: " . ($responseData['detail'] ?? 'Unknown error'));
        }

        return $responseData;
    }

    /**
     * Get contact email from custom fields
     */
    private function getContactEmail(array $contact): ?string
    {
        foreach ($contact['custom_fields_values'] ?? [] as $field) {
            if ($field['field_id'] == $this->getEmailFieldId()) {
                return $field['values'][0]['value'] ?? null;
            }
        }
        return null;
    }

    /**
     * Get contact phone from custom fields
     */
    private function getContactPhone(array $contact): ?string
    {
        foreach ($contact['custom_fields_values'] ?? [] as $field) {
            if ($field['field_id'] == $this->getPhoneFieldId()) {
                return $field['values'][0]['value'] ?? null;
            }
        }
        return null;
    }

    /**
     * Sanitize data for logging
     */
    private function sanitizeLogData(array $data): array
    {
        $sanitized = $data;
        
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

        if (isset($sanitized['phone'])) {
            $phone = $sanitized['phone'];
            if (strlen($phone) >= 7) {
                $sanitized['phone'] = substr($phone, 0, 3) . '***' . substr($phone, -4);
            }
        }

        return $sanitized;
    }

    // Field ID getters - these should be configured based on your amoCRM setup
    private function getEmailFieldId(): int
    {
        return $this->config['field_ids']['email'] ?? 123456;
    }

    private function getPhoneFieldId(): int
    {
        return $this->config['field_ids']['phone'] ?? 123457;
    }

    private function getCommentFieldId(): int
    {
        return $this->config['field_ids']['comment'] ?? 123458;
    }

    private function getSourceFieldId(): int
    {
        return $this->config['field_ids']['source'] ?? 123459;
    }

    private function getUtmSourceFieldId(): int
    {
        return $this->config['field_ids']['utm_source'] ?? 123460;
    }

    private function getUtmMediumFieldId(): int
    {
        return $this->config['field_ids']['utm_medium'] ?? 123461;
    }

    private function getUtmCampaignFieldId(): int
    {
        return $this->config['field_ids']['utm_campaign'] ?? 123462;
    }

    private function getUtmTermFieldId(): int
    {
        return $this->config['field_ids']['utm_term'] ?? 123463;
    }

    private function getUtmContentFieldId(): int
    {
        return $this->config['field_ids']['utm_content'] ?? 123464;
    }

    /**
     * Extract endpoint name from amoCRM API URL for throttling
     */
    private function extractEndpointFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return 'default';
        }

        // Extract endpoint from path
        $parts = explode('/', trim($path, '/'));
        if (count($parts) >= 2) {
            return $parts[1]; // e.g., 'contacts', 'leads', 'custom_fields'
        }

        return 'default';
    }
}
