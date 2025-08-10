<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use App\Validation\LeadValidator;
use Monolog\Logger;

class ValidationMiddleware
{
    private Logger $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // Only validate POST requests to /api/leads
        if ($request->getMethod() === 'POST' && $request->getUri()->getPath() === '/api/leads') {
            return $this->validateLeadRequest($request, $handler);
        }
        
        return $handler->handle($request);
    }

    private function validateLeadRequest(Request $request, RequestHandler $handler): Response
    {
        $contentType = $request->getHeaderLine('Content-Type');
        $data = [];

        // Parse request body based on content type
        if (str_contains($contentType, 'application/json')) {
            $body = $request->getBody()->getContents();
            $data = json_decode($body, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $response = new \Slim\Psr7\Response();
                return $this->createErrorResponse($response, 'Invalid JSON format', 400);
            }
        } elseif (str_contains($contentType, 'application/x-www-form-urlencoded')) {
            $data = $request->getParsedBody() ?? [];
        } else {
            $response = new \Slim\Psr7\Response();
            return $this->createErrorResponse($response, 'Unsupported content type. Use application/json or application/x-www-form-urlencoded', 400);
        }

        // Validate lead data
        $validation = LeadValidator::validate($data);
        
        if (!$validation['valid']) {
            $this->logger->warning('Lead validation failed', [
                'errors' => $validation['errors'],
                'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $request->getHeaderLine('User-Agent')
            ]);
            
            $response = new \Slim\Psr7\Response();
            return $this->createErrorResponse($response, 'Validation failed', 422, $validation['errors']);
        }

        // Add normalized data to request attributes for use in route handlers
        $request = $request->withAttribute('validated_data', $validation['normalized']);
        
        $this->logger->info('Lead validation successful', [
            'ip' => $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $request->getHeaderLine('User-Agent')
        ]);

        return $handler->handle($request);
    }

    private function createErrorResponse(Response $response, string $message, int $status, array $errors = []): Response
    {
        $data = [
            'error' => $message,
            'status' => $status
        ];

        if (!empty($errors)) {
            $data['validation_errors'] = $errors;
        }

        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        
        return $response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/json');
    }
}
