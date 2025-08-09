<?php

return [
    'app' => [
        'name' => 'leads.aiworkplace',
        'version' => '1.0.0',
        'environment' => $_ENV['APP_ENV'] ?? 'production',
        'debug' => (bool)($_ENV['APP_DEBUG'] ?? false),
    ],
    
    'amocrm' => [
        'client_id' => $_ENV['AMOCRM_CLIENT_ID'] ?? '',
        'client_secret' => $_ENV['AMOCRM_CLIENT_SECRET'] ?? '',
        'redirect_uri' => $_ENV['AMOCRM_REDIRECT_URI'] ?? '',
        'subdomain' => $_ENV['AMOCRM_SUBDOMAIN'] ?? '',
        'access_token' => $_ENV['AMOCRM_ACCESS_TOKEN'] ?? '',
        'refresh_token' => $_ENV['AMOCRM_REFRESH_TOKEN'] ?? '',
    ],
    
    'cors' => [
        'allowed_origins' => explode(',', $_ENV['CORS_ALLOW_ORIGINS'] ?? '*'),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Idempotency-Key'],
        'expose_headers' => [],
        'max_age' => 86400,
        'credentials' => false,
    ],
    
    'logging' => [
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',
        'file' => $_ENV['LOG_FILE'] ?? 'storage/logs/app.log',
        'max_files' => 30,
    ],
    
    'security' => [
        'rate_limit' => [
            'requests' => (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 100),
            'window' => (int)($_ENV['RATE_LIMIT_WINDOW'] ?? 3600),
        ],
    ],
];
