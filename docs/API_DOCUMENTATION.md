# API Documentation

This document provides detailed information about the amoCRM Leads Microservice API endpoints, request/response formats, error handling, and integration guidelines.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

The API uses OAuth2 authentication for amoCRM integration. All requests to amoCRM endpoints require valid OAuth2 tokens, which are managed automatically by the service.

## Common Headers

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Content-Type` | Request content type | `application/json` or `application/x-www-form-urlencoded` |
| `X-Idempotency-Key` | Unique request identifier (UUID v4) | `550e8400-e29b-41d4-a716-446655440000` |

### Optional Headers

| Header | Description | Example |
|--------|-------------|---------|
| `User-Agent` | Client identifier | `MyApp/1.0` |
| `Accept` | Response format preference | `application/json` |

## Endpoints

### 1. Submit Lead

**Endpoint:** `POST /api/leads`

**Description:** Submit a new lead for processing and creation in amoCRM.

**Headers:**
```
Content-Type: application/json
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Request Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "comment": "Interested in your services",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer2024",
  "utm_term": "php development",
  "utm_content": "banner_ad"
}
```

**Request Body (Form URL Encoded):**
```
name=John%20Doe&email=john@example.com&phone=%2B1234567890&comment=Interested%20in%20your%20services&utm_source=google&utm_medium=cpc&utm_campaign=summer2024
```

**Field Descriptions:**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | Yes | Contact name | 2-100 characters, alphanumeric and spaces |
| `email` | string | Yes | Contact email | Valid email format |
| `phone` | string | Yes | Contact phone | International format (+1234567890) |
| `comment` | string | No | Lead comment/description | Max 1000 characters |
| `utm_source` | string | No | UTM source parameter | Max 100 characters |
| `utm_medium` | string | No | UTM medium parameter | Max 100 characters |
| `utm_campaign` | string | No | UTM campaign parameter | Max 100 characters |
| `utm_term` | string | No | UTM term parameter | Max 100 characters |
| `utm_content` | string | No | UTM content parameter | Max 100 characters |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead processed successfully",
  "data": {
    "lead_id": "12345",
    "contact_id": "67890",
    "amo_crm_id": "98765",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid input data",
  "details": {
    "email": ["Invalid email format"],
    "phone": ["Phone number is required"]
  }
}
```

**409 Conflict - Duplicate Request:**
```json
{
  "success": false,
  "error": "duplicate_request",
  "message": "Request with this idempotency key already processed",
  "data": {
    "lead_id": "12345",
    "contact_id": "67890",
    "amo_crm_id": "98765",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again later.",
  "retry_after": 3600
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "internal_error",
  "message": "An internal error occurred. Please try again later."
}
```

### 2. Health Check

**Endpoint:** `GET /api/leads/health`

**Description:** Check service health and status.

**Headers:** None required

**Request:** No body required

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "redis": "connected",
    "amo_crm": "connected"
  }
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "redis": "disconnected",
    "amo_crm": "connected"
  },
  "errors": [
    "Redis connection failed"
  ]
}
```

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Endpoint not found |
| 409 | Conflict - Duplicate request |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Types

| Error Type | Description | HTTP Code |
|------------|-------------|-----------|
| `validation_error` | Input validation failed | 400 |
| `authentication_error` | OAuth2 authentication failed | 401 |
| `authorization_error` | Access denied | 403 |
| `not_found` | Resource not found | 404 |
| `duplicate_request` | Idempotency key already used | 409 |
| `rate_limit_exceeded` | API rate limit exceeded | 429 |
| `amo_crm_error` | amoCRM API error | 500 |
| `internal_error` | Internal server error | 500 |
| `service_unavailable` | Service temporarily unavailable | 503 |

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage:

- **API Rate Limit**: 100 requests per hour per client
- **amoCRM Rate Limit**: 7 requests per minute, 1000 per hour
- **Rate Limit Headers**: Included in all responses

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Idempotency

All POST requests support idempotency to prevent duplicate processing:

- **Header**: `X-Idempotency-Key` (required)
- **Format**: UUID v4
- **Window**: 5 minutes
- **Behavior**: Returns cached response for duplicate keys

**Example:**
```bash
curl -X POST /api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "+1234567890"}'
```

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS):

- **Allowed Origins**: Configurable via `CORS_ALLOW_ORIGINS`
- **Methods**: GET, POST, OPTIONS
- **Headers**: Content-Type, X-Idempotency-Key, Authorization
- **Credentials**: Not supported

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error_type",
  "message": "Human-readable error message",
  "details": {
    // Additional error details (optional)
  }
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function submitLead(leadData) {
  try {
    const response = await axios.post('https://api.example.com/api/leads', leadData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': uuidv4()
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// Usage
const lead = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  comment: 'Interested in services'
};

submitLead(lead)
  .then(result => console.log('Lead submitted:', result))
  .catch(error => console.error('Error:', error.message));
```

### PHP

```php
<?php

function submitLead($leadData) {
    $url = 'https://api.example.com/api/leads';
    $idempotencyKey = generateUuid();
    
    $headers = [
        'Content-Type: application/json',
        'X-Idempotency-Key: ' . $idempotencyKey
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode >= 400) {
        throw new Exception($result['message'] ?? 'API request failed');
    }
    
    return $result;
}

function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Usage
try {
    $lead = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890',
        'comment' => 'Interested in services'
    ];
    
    $result = submitLead($lead);
    echo "Lead submitted successfully: " . json_encode($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Python

```python
import requests
import uuid
import json

def submit_lead(lead_data):
    url = 'https://api.example.com/api/leads'
    idempotency_key = str(uuid.uuid4())
    
    headers = {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotency_key
    }
    
    try:
        response = requests.post(url, json=lead_data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        if hasattr(e, 'response') and e.response is not None:
            error_data = e.response.json()
            raise Exception(error_data.get('message', 'API request failed'))
        raise e

# Usage
lead = {
    'name': 'John Doe',
    'email': 'john@example.com',
    'phone': '+1234567890',
    'comment': 'Interested in services'
}

try:
    result = submit_lead(lead)
    print(f"Lead submitted successfully: {result}")
except Exception as e:
    print(f"Error: {e}")
```

## Testing

### Test Endpoints

For testing purposes, you can use the following test data:

**Valid Lead Data:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "comment": "Test lead submission",
  "utm_source": "test",
  "utm_medium": "manual",
  "utm_campaign": "testing"
}
```

**Invalid Lead Data (for testing validation):**
```json
{
  "name": "",
  "email": "invalid-email",
  "phone": "123"
}
```

### Testing Tools

- **Postman**: Import the API endpoints for testing
- **cURL**: Use command-line examples above
- **Unit Tests**: Run `composer test` for automated testing

## Monitoring

### Health Check Monitoring

Monitor the health endpoint to ensure service availability:

```bash
# Check service health
curl https://api.example.com/api/leads/health

# Monitor with cron job
*/5 * * * * curl -f https://api.example.com/api/leads/health || echo "Service down"
```

### Log Monitoring

Monitor application logs for errors and performance:

- **Application Logs**: `storage/logs/app.log`
- **Error Logs**: `storage/logs/error.log`
- **Request Logs**: `storage/logs/request.log`

### Metrics to Monitor

- API response times
- Error rates
- Rate limit usage
- amoCRM API success/failure rates
- Redis connection status

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Rate Limiting**: Implement client-side rate limiting
3. **Idempotency**: Always use unique idempotency keys
4. **Input Validation**: Validate all input data
5. **Error Handling**: Don't expose sensitive information in errors
6. **Monitoring**: Monitor for suspicious activity

## Support

For API support and questions:

1. Check this documentation
2. Review error logs
3. Test with health endpoint
4. Contact the development team
