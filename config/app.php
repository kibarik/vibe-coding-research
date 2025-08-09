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
        'field_ids' => [
            'email' => (int)($_ENV['AMOCRM_EMAIL_FIELD_ID'] ?? 123456),
            'phone' => (int)($_ENV['AMOCRM_PHONE_FIELD_ID'] ?? 123457),
            'comment' => (int)($_ENV['AMOCRM_COMMENT_FIELD_ID'] ?? 123458),
            'source' => (int)($_ENV['AMOCRM_SOURCE_FIELD_ID'] ?? 123459),
            'utm_source' => (int)($_ENV['AMOCRM_UTM_SOURCE_FIELD_ID'] ?? 123460),
            'utm_medium' => (int)($_ENV['AMOCRM_UTM_MEDIUM_FIELD_ID'] ?? 123461),
            'utm_campaign' => (int)($_ENV['AMOCRM_UTM_CAMPAIGN_FIELD_ID'] ?? 123462),
            'utm_term' => (int)($_ENV['AMOCRM_UTM_TERM_FIELD_ID'] ?? 123463),
            'utm_content' => (int)($_ENV['AMOCRM_UTM_CONTENT_FIELD_ID'] ?? 123464),
        ],
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
        'max_files' => (int)($_ENV['LOG_MAX_FILES'] ?? 30),
        'rotation' => $_ENV['LOG_ROTATION'] ?? 'daily',
        'pii_protection' => (bool)($_ENV['LOG_PII_PROTECTION'] ?? true),
        'request_logging' => (bool)($_ENV['LOG_REQUEST_LOGGING'] ?? true),
        'error_logging' => (bool)($_ENV['LOG_ERROR_LOGGING'] ?? true),
        'performance_logging' => (bool)($_ENV['LOG_PERFORMANCE_LOGGING'] ?? true),
    ],
    
    'security' => [
        'rate_limit' => [
            'requests' => (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 100),
            'window' => (int)($_ENV['RATE_LIMIT_WINDOW'] ?? 3600),
        ],
    ],
    
    'redis' => [
        'host' => $_ENV['REDIS_HOST'] ?? 'localhost',
        'port' => (int)($_ENV['REDIS_PORT'] ?? 6379),
        'password' => $_ENV['REDIS_PASSWORD'] ?? null,
        'database' => (int)($_ENV['REDIS_DATABASE'] ?? 0),
        'timeout' => (float)($_ENV['REDIS_TIMEOUT'] ?? 5.0),
    ],
];
