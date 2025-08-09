# API Documentation

This document describes the available API endpoints for the leads.aiworkplace service.

## Base URL

```
https://your-domain.com
```

## Authentication

Currently, the API does not require authentication for lead submission. However, amoCRM OAuth2 authentication must be configured for the service to function properly.

## Idempotency

The API supports idempotent requests to prevent duplicate lead submissions. This ensures that if a client retries a request due to network issues or timeouts, the same lead won't be processed multiple times.

### Idempotency Key

**Header:** `X-Idempotency-Key`

**Format:** UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**Required:** Yes, for all `POST /api/leads` requests

**Behavior:**
- The same idempotency key with identical request data will return the same response
- Idempotency keys are valid for 5 minutes from the first request
- After 5 minutes, the same key can be reused for a new request
- Different request data with the same key will be treated as a new request

**Example:**
```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"+79001234567"}'
```

**Error Responses:**

Missing Idempotency Key (400):
```json
{
  "error": "Missing X-Idempotency-Key header",
  "message": "X-Idempotency-Key header is required for lead submission"
}
```

Invalid Idempotency Key Format (400):
```json
{
  "error": "Invalid X-Idempotency-Key format",
  "message": "X-Idempotency-Key must be a valid UUID v4"
}
```

## Endpoints

### 1. Create Lead

**Endpoint:** `POST /api/leads`

**Description:** Submit a new lead for processing and integration with amoCRM.

**Content Types Supported:**
- `application/json`
- `application/x-www-form-urlencoded`

**Request Headers:**
```
Content-Type: application/json
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Request Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+7 (900) 123-45-67",
  "comment": "Interested in your services",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer_sale",
  "utm_term": "web development",
  "utm_content": "banner1",
  "source": "website",
  "medium": "organic",
  "campaign": "brand_awareness"
}
```

**Request Body (Form Data):**
```
name=John Doe&email=john@example.com&phone=+7 (900) 123-45-67&comment=Interested in your services&utm_source=google&utm_medium=cpc
```

**Required Fields:**
- `name` (string, max 100 characters)
- `email` (valid email format)
- `phone` (Russian phone number, will be normalized to +7XXXXXXXXXX format)

**Optional Fields:**
- `comment` (string, max 1000 characters)
- `utm_source` (string, max 100 characters)
- `utm_medium` (string, max 100 characters)
- `utm_campaign` (string, max 100 characters)
- `utm_term` (string, max 100 characters)
- `utm_content` (string, max 100 characters)
- `source` (string, max 100 characters)
- `medium` (string, max 100 characters)
- `campaign` (string, max 100 characters)

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Lead received successfully",
  "request_id": "lead_64f8a1b2c3d4e5f6_1691621234",
  "lead_id": "lead_64f8a1b2c3d4e5f6_1691621234",
  "timestamp": "2023-08-09T23:27:14+00:00",
  "data_received": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "79001234567",
    "has_comment": true,
    "utm_params_count": 5,
    "additional_fields": ["source", "medium", "campaign"]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "status": 422,
  "validation_errors": {
    "email": "Invalid email format",
    "phone": "Invalid phone number format"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "amoCRM not authenticated. Please complete OAuth2 setup first.",
  "request_id": "lead_64f8a1b2c3d4e5f6_1691621234",
  "timestamp": "2023-08-09T23:27:14+00:00"
}
```

**Response Headers:**
```
Content-Type: application/json
X-Request-ID: lead_64f8a1b2c3d4e5f6_1691621234
X-Processing-Time: 45.23ms
```

### 2. Lead API Health Check

**Endpoint:** `GET /api/leads/health`

**Description:** Check the health status of the lead processing service.

**Request Headers:**
```
Accept: application/json
```

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2023-08-09T23:27:14+00:00",
  "service": "lead-api",
  "version": "1.0.0",
  "checks": {
    "amocrm_auth": "ok",
    "storage_writable": "ok",
    "validation_system": "ok"
  },
  "overall_status": "ok"
}
```

**Degraded Response (503 Service Unavailable):**
```json
{
  "status": "ok",
  "timestamp": "2023-08-09T23:27:14+00:00",
  "service": "lead-api",
  "version": "1.0.0",
  "checks": {
    "amocrm_auth": "not_configured",
    "storage_writable": "ok",
    "validation_system": "ok"
  },
  "overall_status": "degraded"
}
```

### 3. Validation Rules

**Endpoint:** `GET /api/validation-rules`

**Description:** Get the current validation rules for lead submission.

**Success Response (200 OK):**
```json
{
  "required_fields": ["name", "email", "phone"],
  "field_rules": {
    "name": {
      "type": "string",
      "required": true,
      "max_length": 100,
      "description": "Lead name"
    },
    "email": {
      "type": "email",
      "required": true,
      "description": "Valid email address"
    },
    "phone": {
      "type": "phone",
      "required": true,
      "description": "Russian phone number (will be normalized to +7XXXXXXXXXX format)"
    },
    "comment": {
      "type": "string",
      "required": false,
      "max_length": 1000,
      "description": "Optional comment"
    }
  }
}
```

### 4. Application Health Check

**Endpoint:** `GET /health`

**Description:** Check the overall health of the application.

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2023-08-09T23:27:14+00:00",
  "version": "1.0.0",
  "environment": "production",
  "name": "leads.aiworkplace"
}
```

## Data Validation

### Phone Number Format

The API accepts Russian phone numbers in various formats and normalizes them to the `+7XXXXXXXXXX` format:

**Accepted Formats:**
- `+7 (900) 123-45-67`
- `8 (900) 123-45-67`
- `9001234567`
- `+79001234567`

**Normalized Output:**
- `79001234567`

### Email Validation

Emails are validated using PHP's `filter_var` function and are converted to lowercase for consistency.

### UTM Parameters

The following UTM parameters are supported and will be automatically extracted:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created (lead submitted successfully)
- `400` - Bad Request (invalid request format)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error
- `503` - Service Unavailable (health check degraded)

### Error Response Format

All error responses follow this format:
```json
{
  "error": "Error description",
  "status": 400,
  "message": "Detailed error message"
}
```

## Rate Limiting

Rate limiting is configured but not currently enforced. Future versions may implement rate limiting based on:
- IP address
- API key (if implemented)
- amoCRM API limits

## Logging

All API requests are logged with the following information:
- Request ID
- IP address
- User agent
- Processing time
- Request data (sanitized for privacy)
- Response status

### Privacy Protection

Sensitive data in logs is partially masked:
- Email: `jo***e@example.com`
- Phone: `790***4567`

## CORS Support

The API supports CORS with the following configuration:
- Allowed origins: Configurable (default: all)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Requested-With, X-Idempotency-Key

## Examples

### cURL Example (JSON)

```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+7 (900) 123-45-67",
    "comment": "Interested in your services",
    "utm_source": "google",
    "utm_medium": "cpc"
  }'
```

### cURL Example (Form Data)

```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=John Doe&email=john@example.com&phone=+7 (900) 123-45-67&comment=Interested in your services"
```

### JavaScript Example

```javascript
const response = await fetch('https://your-domain.com/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+7 (900) 123-45-67',
    comment: 'Interested in your services',
    utm_source: 'google',
    utm_medium: 'cpc'
  })
});

const result = await response.json();
console.log(result);
```

## Integration Notes

1. **amoCRM Authentication**: The service requires amoCRM OAuth2 authentication to be configured before lead processing can occur.

2. **Validation**: All lead data is validated before processing. Invalid data will result in a 422 error response.

3. **Idempotency**: Future versions will support idempotent requests using the `X-Idempotency-Key` header.

4. **Webhooks**: Future versions may support webhook notifications for lead status updates.

5. **Batch Processing**: Future versions may support batch lead submission for multiple leads.
