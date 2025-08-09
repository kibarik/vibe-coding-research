<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware implements MiddlewareInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $response = $handler->handle($request);

        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = $this->config['allowed_origins'];

        // Check if origin is allowed
        if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        $response = $response
            ->withHeader('Access-Control-Allow-Methods', implode(', ', $this->config['allowed_methods']))
            ->withHeader('Access-Control-Allow-Headers', implode(', ', $this->config['allowed_headers']))
            ->withHeader('Access-Control-Max-Age', (string)$this->config['max_age']);

        if ($this->config['credentials']) {
            $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (!empty($this->config['expose_headers'])) {
            $response = $response->withHeader('Access-Control-Expose-Headers', implode(', ', $this->config['expose_headers']));
        }

        return $response;
    }
}
