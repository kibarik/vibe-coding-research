<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Middleware\MethodOverrideMiddleware;
use Dotenv\Dotenv;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use App\Middleware\CorsMiddleware;
use App\Middleware\ValidationMiddleware;
use App\Middleware\IdempotencyMiddleware;
use App\Middleware\RequestLoggingMiddleware;
use App\Services\AmoCrmAuthService;
use App\Services\AmoCrmService;
use App\Services\AmoCrmThrottlingService;
use App\Services\PredisAdapter;
use App\Services\IdempotencyService;
use App\Services\LoggingService;
use App\Controllers\LeadController;
use Predis\Client as RedisClient;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// Load configuration
$config = require __DIR__ . '/../config/app.php';

// Create logging service
$loggingService = new LoggingService($config);
$logger = $loggingService->getLogger();

// Create Redis client
$redis = new RedisClient([
    'host' => $config['redis']['host'],
    'port' => $config['redis']['port'],
    'password' => $config['redis']['password'],
    'database' => $config['redis']['database'],
    'timeout' => $config['redis']['timeout'],
]);

// Create Redis adapter
$redisAdapter = new PredisAdapter($redis);

// Create idempotency service
$idempotencyService = new IdempotencyService($logger, $redisAdapter);

// Create Slim app
$app = AppFactory::create();

// Add CORS middleware
$app->add(new CorsMiddleware($config['cors']));

// Add request logging middleware (first to capture all requests)
$app->add(new RequestLoggingMiddleware($loggingService));

// Add validation middleware
$app->add(new ValidationMiddleware($logger));

// Add idempotency middleware
$app->add(new IdempotencyMiddleware($logger, $idempotencyService));

// Create amoCRM auth service
$amocrmConfig = [
    'client_id' => $config['amocrm']['client_id'],
    'client_secret' => $config['amocrm']['client_secret'],
    'subdomain' => $config['amocrm']['subdomain'],
    'redirect_uri' => $config['amocrm']['redirect_uri'],
    'token_file' => __DIR__ . '/../storage/amo_tokens.json'
];
$amocrmAuth = new AmoCrmAuthService($amocrmConfig, $logger);

// Create amoCRM throttling service
$amocrmThrottlingService = new AmoCrmThrottlingService(
    $logger, 
    $redisAdapter,
    $config['amocrm']['rate_limit_per_minute'] ?? 7,
    $config['amocrm']['rate_limit_per_hour'] ?? 1000
);

// Create amoCRM service
$amocrmService = new AmoCrmService($amocrmAuth, $logger, $config['amocrm'], $amocrmThrottlingService);

// Create lead controller
$leadController = new LeadController($logger, $amocrmAuth, $amocrmService);

// Add method override middleware
$app->add(new MethodOverrideMiddleware());

// Add error middleware with custom error handler
$errorMiddleware = $app->addErrorMiddleware(
    $config['app']['debug'], // displayErrorDetails
    true, // logErrors
    true, // logErrorDetails
    $logger
);

// Custom error handler
$errorHandler = $errorMiddleware->getDefaultErrorHandler();
$errorHandler->forceContentType('application/json');

// Health check endpoint
$app->get('/health', function ($request, $response) use ($logger, $config) {
    $logger->info('Health check requested', [
        'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $request->getHeaderLine('User-Agent')
    ]);
    
    $data = [
        'status' => 'ok',
        'timestamp' => date('c'),
        'version' => $config['app']['version'],
        'environment' => $config['app']['environment'],
        'name' => $config['app']['name']
    ];
    
    $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
});

// API endpoints
$app->post('/api/leads', function ($request, $response) use ($leadController) {
    return $leadController->createLead($request, $response);
});

$app->get('/api/leads/health', function ($request, $response) use ($leadController) {
    return $leadController->healthCheck($request, $response);
});

// Validation rules endpoint for documentation
$app->get('/api/validation-rules', function ($request, $response) {
    $rules = \App\Validation\LeadValidator::getValidationRules();
    
    $response->getBody()->write(json_encode($rules, JSON_PRETTY_PRINT));
    return $response
        ->withHeader('Content-Type', 'application/json');
});

// OAuth2 endpoints
$app->get('/oauth/authorize', function ($request, $response) use ($amocrmAuth, $logger) {
    try {
        $authUrl = $amocrmAuth->getAuthorizationUrl();
        
        $logger->info('OAuth authorization URL generated', [
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $data = [
            'authorization_url' => $authUrl,
            'message' => 'Visit this URL to authorize the application'
        ];
        
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $logger->error('OAuth authorization error', [
            'error' => $e->getMessage(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $response->getBody()->write(json_encode([
            'error' => 'Failed to generate authorization URL',
            'message' => $e->getMessage()
        ], JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }
});

$app->get('/oauth/callback', function ($request, $response) use ($amocrmAuth, $logger) {
    $code = $request->getQueryParams()['code'] ?? null;
    $state = $request->getQueryParams()['state'] ?? null;
    
    if (!$code) {
        $response->getBody()->write(json_encode([
            'error' => 'Authorization code is required'
        ], JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(400);
    }
    
    try {
        $result = $amocrmAuth->exchangeCodeForToken($code);
        
        $logger->info('OAuth callback successful', [
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $data = [
            'status' => 'success',
            'message' => 'Authorization successful',
            'expires_in' => $result['expires_in'] ?? 'unknown'
        ];
        
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $logger->error('OAuth callback error', [
            'error' => $e->getMessage(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $response->getBody()->write(json_encode([
            'error' => 'Authorization failed',
            'message' => $e->getMessage()
        ], JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }
});

$app->get('/oauth/status', function ($request, $response) use ($amocrmAuth, $logger) {
    try {
        $status = $amocrmAuth->getTokenStatus();
        
        $logger->info('OAuth status checked', [
            'status' => $status['status'],
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $response->getBody()->write(json_encode($status, JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $logger->error('OAuth status check error', [
            'error' => $e->getMessage(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $response->getBody()->write(json_encode([
            'error' => 'Failed to check token status',
            'message' => $e->getMessage()
        ], JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }
});

$app->post('/oauth/refresh', function ($request, $response) use ($amocrmAuth, $logger) {
    try {
        $result = $amocrmAuth->refreshToken();
        
        $logger->info('OAuth token refreshed', [
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $data = [
            'status' => 'success',
            'message' => 'Token refreshed successfully',
            'expires_in' => $result['expires_in'] ?? 'unknown'
        ];
        
        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $logger->error('OAuth token refresh error', [
            'error' => $e->getMessage(),
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        $response->getBody()->write(json_encode([
            'error' => 'Failed to refresh token',
            'message' => $e->getMessage()
        ], JSON_PRETTY_PRINT));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }
});

// OPTIONS handler for CORS preflight
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// Run app
$app->run();
