<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Middleware\MethodOverrideMiddleware;
use Dotenv\Dotenv;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use App\Middleware\CorsMiddleware;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// Load configuration
$config = require __DIR__ . '/../config/app.php';

// Create logger
$logger = new Logger('app');
$logHandler = new StreamHandler(__DIR__ . '/../storage/logs/app.log', Logger::INFO);
$logHandler->setFormatter(new JsonFormatter());
$logger->pushHandler($logHandler);

// Create Slim app
$app = AppFactory::create();

// Add CORS middleware
$app->add(new CorsMiddleware($config['cors']));

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

// OPTIONS handler for CORS preflight
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// Run app
$app->run();
