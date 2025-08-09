<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\AmoCrmAuthService;
use Monolog\Logger;
use Monolog\Handler\TestHandler;

class AmoCrmAuthTest extends TestCase
{
    private AmoCrmAuthService $authService;
    private TestHandler $logHandler;
    private string $tempTokenFile;

    protected function setUp(): void
    {
        $this->tempTokenFile = sys_get_temp_dir() . '/test_amo_tokens.json';
        
        $config = [
            'client_id' => 'test_client_id',
            'client_secret' => 'test_client_secret',
            'subdomain' => 'test',
            'redirect_uri' => 'https://test.com/oauth/callback',
            'token_file' => $this->tempTokenFile
        ];

        $logger = new Logger('test');
        $this->logHandler = new TestHandler();
        $logger->pushHandler($this->logHandler);

        $this->authService = new AmoCrmAuthService($config, $logger);
    }

    protected function tearDown(): void
    {
        if (file_exists($this->tempTokenFile)) {
            unlink($this->tempTokenFile);
        }
    }

    public function testGetAuthorizationUrl()
    {
        $authUrl = $this->authService->getAuthorizationUrl();
        
        $this->assertStringContainsString('https://test.amocrm.ru/oauth/authorize', $authUrl);
        $this->assertStringContainsString('client_id=test_client_id', $authUrl);
        $this->assertStringContainsString('redirect_uri=https%3A//test.com/oauth/callback', $authUrl);
        $this->assertStringContainsString('response_type=code', $authUrl);
        $this->assertStringContainsString('state=', $authUrl);
    }

    public function testHasTokensWhenNoTokensExist()
    {
        $this->assertFalse($this->authService->hasTokens());
    }

    public function testGetTokenStatusWhenNoTokensExist()
    {
        $status = $this->authService->getTokenStatus();
        
        $this->assertEquals('not_authorized', $status['status']);
        $this->assertEquals('No tokens available', $status['message']);
    }

    public function testClearTokensWhenNoTokensExist()
    {
        // Should not throw an exception
        $this->authService->clearTokens();
        $this->assertTrue(true);
    }

    public function testGetValidAccessTokenWhenNoTokensExist()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No access token available. Please authorize first.');
        
        $this->authService->getValidAccessToken();
    }

    public function testRefreshTokenWhenNoTokensExist()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No refresh token available');
        
        $this->authService->refreshToken();
    }

    public function testTokenFilePermissions()
    {
        // Create a test token file
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() + 3600,
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        
        // Check if file has correct permissions (0600)
        $permissions = fileperms($this->tempTokenFile) & 0777;
        $this->assertEquals(0600, $permissions);
    }

    public function testTokenStatusWithValidTokens()
    {
        // Create test tokens that are valid
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() + 3600,
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        chmod($this->tempTokenFile, 0600);

        $status = $this->authService->getTokenStatus();
        
        $this->assertEquals('valid', $status['status']);
        $this->assertEquals('Bearer', $status['token_type']);
        $this->assertArrayHasKey('expires_at', $status);
        $this->assertArrayHasKey('updated_at', $status);
    }

    public function testTokenStatusWithExpiredTokens()
    {
        // Create test tokens that are expired
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() - 3600, // Expired
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        chmod($this->tempTokenFile, 0600);

        $status = $this->authService->getTokenStatus();
        
        $this->assertEquals('expired', $status['status']);
    }

    public function testTokenStatusWithExpiringSoonTokens()
    {
        // Create test tokens that will expire soon (within 5 minutes)
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() + 180, // Expires in 3 minutes
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        chmod($this->tempTokenFile, 0600);

        $status = $this->authService->getTokenStatus();
        
        $this->assertEquals('expiring_soon', $status['status']);
    }

    public function testHasTokensWithValidTokens()
    {
        // Create test tokens
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() + 3600,
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        chmod($this->tempTokenFile, 0600);

        $this->assertTrue($this->authService->hasTokens());
    }

    public function testClearTokensWithExistingTokens()
    {
        // Create test tokens
        $testTokens = [
            'access_token' => 'test_access_token',
            'refresh_token' => 'test_refresh_token',
            'expires_in' => 3600,
            'expires_at' => time() + 3600,
            'token_type' => 'Bearer',
            'updated_at' => date('c')
        ];

        file_put_contents($this->tempTokenFile, json_encode($testTokens));
        chmod($this->tempTokenFile, 0600);

        $this->assertTrue($this->authService->hasTokens());
        
        $this->authService->clearTokens();
        
        $this->assertFalse($this->authService->hasTokens());
        $this->assertFalse(file_exists($this->tempTokenFile));
    }

    public function testInvalidTokenFile()
    {
        // Create invalid JSON file
        file_put_contents($this->tempTokenFile, 'invalid json content');
        chmod($this->tempTokenFile, 0600);

        $status = $this->authService->getTokenStatus();
        
        $this->assertEquals('not_authorized', $status['status']);
        $this->assertEquals('No tokens available', $status['message']);
    }

    public function testLoggingOnTokenOperations()
    {
        // Test that logging occurs during token operations
        $this->authService->clearTokens();
        
        $this->assertTrue($this->logHandler->hasInfoRecords());
        $this->assertStringContainsString('Tokens cleared', $this->logHandler->getRecords()[0]['message']);
    }
}
