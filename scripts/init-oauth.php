<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\JsonFormatter;
use App\Services\AmoCrmAuthService;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// Create logger
$logger = new Logger('oauth-init');
$logHandler = new StreamHandler(__DIR__ . '/../storage/logs/oauth.log', Logger::INFO);
$logHandler->setFormatter(new JsonFormatter());
$logger->pushHandler($logHandler);

// Check required environment variables
$requiredVars = ['AMOCRM_CLIENT_ID', 'AMOCRM_CLIENT_SECRET', 'AMOCRM_SUBDOMAIN', 'AMOCRM_REDIRECT_URI'];
foreach ($requiredVars as $var) {
    if (!isset($_ENV[$var])) {
        echo "Error: Missing required environment variable: {$var}\n";
        echo "Please set it in your .env file\n";
        exit(1);
    }
}

// Create amoCRM auth service
$config = [
    'client_id' => $_ENV['AMOCRM_CLIENT_ID'],
    'client_secret' => $_ENV['AMOCRM_CLIENT_SECRET'],
    'subdomain' => $_ENV['AMOCRM_SUBDOMAIN'],
    'redirect_uri' => $_ENV['AMOCRM_REDIRECT_URI'],
    'token_file' => __DIR__ . '/../storage/amo_tokens.json'
];

$authService = new AmoCrmAuthService($config, $logger);

// Check command line arguments
if ($argc < 2) {
    echo "Usage: php init-oauth.php <command>\n";
    echo "Commands:\n";
    echo "  authorize - Generate authorization URL\n";
    echo "  callback <code> - Exchange authorization code for token\n";
    echo "  status - Check token status\n";
    echo "  refresh - Refresh access token\n";
    echo "  clear - Clear stored tokens\n";
    exit(1);
}

$command = $argv[1];

try {
    switch ($command) {
        case 'authorize':
            $authUrl = $authService->getAuthorizationUrl();
            echo "Authorization URL:\n";
            echo $authUrl . "\n\n";
            echo "Please visit this URL in your browser to authorize the application.\n";
            echo "After authorization, you'll receive a code. Use it with the 'callback' command.\n";
            break;

        case 'callback':
            if (!isset($argv[2])) {
                echo "Error: Authorization code required\n";
                echo "Usage: php init-oauth.php callback <authorization_code>\n";
                exit(1);
            }
            
            $code = $argv[2];
            $result = $authService->exchangeCodeForToken($code);
            
            echo "Successfully obtained access token!\n";
            echo "Token expires in: " . ($result['expires_in'] ?? 'unknown') . " seconds\n";
            echo "Token type: " . ($result['token_type'] ?? 'Bearer') . "\n";
            break;

        case 'status':
            $status = $authService->getTokenStatus();
            echo "Token Status:\n";
            echo "Status: " . $status['status'] . "\n";
            
            if (isset($status['expires_at'])) {
                $expiresAt = date('Y-m-d H:i:s', $status['expires_at']);
                echo "Expires at: {$expiresAt}\n";
            }
            
            if (isset($status['updated_at'])) {
                echo "Last updated: {$status['updated_at']}\n";
            }
            
            if (isset($status['message'])) {
                echo "Message: {$status['message']}\n";
            }
            break;

        case 'refresh':
            $result = $authService->refreshToken();
            echo "Successfully refreshed access token!\n";
            echo "New token expires in: " . ($result['expires_in'] ?? 'unknown') . " seconds\n";
            break;

        case 'clear':
            $authService->clearTokens();
            echo "Stored tokens cleared successfully.\n";
            break;

        default:
            echo "Unknown command: {$command}\n";
            echo "Use 'php init-oauth.php' to see available commands.\n";
            exit(1);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    $logger->error('OAuth initialization error', [
        'command' => $command,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit(1);
}
