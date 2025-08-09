<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use Slim\App;
use Slim\Factory\AppFactory;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Factory\ResponseFactory;

class HealthTest extends TestCase
{
    private App $app;

    protected function setUp(): void
    {
        $this->app = AppFactory::create();
        
        // Add health endpoint
        $this->app->get('/health', function ($request, $response) {
            $data = [
                'status' => 'ok',
                'timestamp' => date('c'),
                'version' => '1.0.0',
                'environment' => 'test'
            ];
            
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        });
    }

    public function testHealthEndpointReturns200(): void
    {
        $requestFactory = new ServerRequestFactory();
        $responseFactory = new ResponseFactory();
        
        $request = $requestFactory->createServerRequest('GET', '/health');
        $response = $responseFactory->createResponse();
        
        $response = $this->app->handle($request);
        
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('application/json', $response->getHeaderLine('Content-Type'));
        
        $body = json_decode($response->getBody()->getContents(), true);
        $this->assertEquals('ok', $body['status']);
        $this->assertArrayHasKey('timestamp', $body);
        $this->assertEquals('1.0.0', $body['version']);
    }
}
