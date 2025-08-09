# Idempotency System Guide

This document describes the idempotency system implemented in the leads.aiworkplace service to prevent duplicate lead submissions and ensure reliable processing.

## Overview

The idempotency system ensures that identical requests (same idempotency key + same request data) return the same response, preventing duplicate processing of leads. This is crucial for:

- **Network reliability**: Handling retries due to timeouts or connection issues
- **Client reliability**: Preventing duplicate submissions from client-side retry logic
- **Data integrity**: Ensuring each lead is processed exactly once
- **amoCRM integration**: Preventing duplicate contacts and leads in amoCRM

## Architecture

### Components

1. **IdempotencyMiddleware**: Validates idempotency keys and handles request flow
2. **IdempotencyService**: Core business logic for deduplication and caching
3. **Redis**: Storage backend for caching responses and tracking hashes
4. **Hash Generation**: SHA-256 hashing of idempotency key + normalized request data

### Flow Diagram

```
Client Request
    ↓
IdempotencyMiddleware
    ↓
Validate X-Idempotency-Key (UUID v4)
    ↓
Generate Request Hash (key + normalized data)
    ↓
Check Redis for existing hash
    ↓
┌─────────────────┬─────────────────┐
│ Hash Found?     │ Hash Not Found? │
│ ↓               │ ↓               │
│ Return Cached   │ Process Request │
│ Response        │ ↓               │
│                 │ Cache Response  │
└─────────────────┴─────────────────┘
```

## Implementation Details

### 1. Idempotency Key Validation

**Format**: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)

**Validation Rules**:
- Must be present for all `POST /api/leads` requests
- Must match UUID v4 pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
- Case-insensitive validation

**Error Responses**:
- **400 Bad Request**: Missing or invalid format
- **Logging**: Masked keys for security (e.g., `550e****0000`)

### 2. Request Hash Generation

**Algorithm**: SHA-256

**Input**: `{idempotency_key}|{normalized_request_data}`

**Normalization Process**:
- **JSON**: Parse, sort keys recursively, re-encode with consistent formatting
- **Form Data**: Parse, sort keys, rebuild query string
- **Other**: Use raw body as-is

**Example**:
```php
// Input JSON: {"email":"test@example.com","name":"Test"}
// Normalized: {"email":"test@example.com","name":"Test"}
// Hash Input: "550e8400-e29b-41d4-a716-446655440000|{\"email\":\"test@example.com\",\"name\":\"Test\"}"
```

### 3. Redis Storage

**Key Structure**:
- Response cache: `idempotency:{hash}`
- Hash tracking: `hash:{hash}`

**TTL**: 300 seconds (5 minutes)

**Data Format**:
```json
{
  "status_code": 201,
  "headers": {"Content-Type": ["application/json"]},
  "body": "{\"status\":\"success\"}",
  "timestamp": 1691621234
}
```

### 4. Duplicate Detection

**Time Window**: 5 minutes from first request

**Detection Logic**:
1. Check for cached response using hash
2. If not found, check for existing hash within time window
3. If hash exists, return cached response for that hash
4. If no duplicate found, store hash and process request

## Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
REDIS_TIMEOUT=5.0
```

### Application Configuration

```php
// config/app.php
'redis' => [
    'host' => $_ENV['REDIS_HOST'] ?? 'localhost',
    'port' => (int)($_ENV['REDIS_PORT'] ?? 6379),
    'password' => $_ENV['REDIS_PASSWORD'] ?? null,
    'database' => (int)($_ENV['REDIS_DATABASE'] ?? 0),
    'timeout' => (float)($_ENV['REDIS_TIMEOUT'] ?? 5.0),
],
```

## Usage Examples

### Client Implementation

**JavaScript/Node.js**:
```javascript
const { v4: uuidv4 } = require('uuid');

async function submitLead(leadData) {
    const idempotencyKey = uuidv4();
    
    const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(leadData)
    });
    
    return response.json();
}

// Retry logic with same key
async function submitLeadWithRetry(leadData, maxRetries = 3) {
    const idempotencyKey = uuidv4();
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await submitLead(leadData, idempotencyKey);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

**PHP**:
```php
use Ramsey\Uuid\Uuid;

function submitLead(array $leadData): array {
    $idempotencyKey = Uuid::uuid4()->toString();
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://your-domain.com/api/leads',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($leadData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-Idempotency-Key: ' . $idempotencyKey
        ],
        CURLOPT_RETURNTRANSFER => true
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

**cURL**:
```bash
# Generate UUID (requires uuidgen on Unix systems)
IDEMPOTENCY_KEY=$(uuidgen)

curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+79001234567"
  }'
```

## Testing

### Unit Tests

The idempotency system includes comprehensive unit tests:

- **IdempotencyMiddlewareTest**: Tests header validation and UUID format validation
- **IdempotencyServiceTest**: Tests hash generation, duplicate detection, and response caching

### Manual Testing

**Test Duplicate Detection**:
```bash
# First request
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"name":"Test","email":"test@example.com"}'

# Second request with same key and data (should return cached response)
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"name":"Test","email":"test@example.com"}'
```

**Test Different Data**:
```bash
# Same key, different data (should be treated as new request)
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{"name":"Test2","email":"test@example.com"}'
```

## Monitoring and Logging

### Log Events

**Warning Level**:
- Missing idempotency key
- Invalid UUID format

**Info Level**:
- Duplicate request detected
- Response cached for idempotency
- Cached response returned

**Error Level**:
- Redis connection errors
- Hash generation errors

### Log Data

**Masked for Security**:
- Idempotency keys: `550e****0000`
- Request hashes: `a1b2****c3d4`

**Included for Debugging**:
- Request IP address
- User agent
- Response status codes
- Processing timestamps

## Error Handling

### Redis Failures

**Graceful Degradation**:
- If Redis is unavailable, requests proceed normally
- No idempotency protection during Redis downtime
- Errors logged for monitoring

**Recovery**:
- Automatic retry on Redis reconnection
- No manual intervention required

### Hash Collisions

**Extremely Unlikely**:
- SHA-256 provides 2^256 possible hashes
- UUID v4 + request data makes collisions virtually impossible
- System designed to handle collisions gracefully if they occur

## Performance Considerations

### Redis Performance

**Optimizations**:
- 5-minute TTL prevents unlimited growth
- Hash-based keys for efficient lookups
- Minimal data storage (compressed JSON)

**Monitoring**:
- Redis memory usage
- Response times for hash lookups
- Cache hit/miss ratios

### Request Processing

**Overhead**:
- UUID validation: ~0.1ms
- Hash generation: ~0.5ms
- Redis lookup: ~1-5ms (depending on network)

**Total overhead**: ~2-6ms per request

## Security Considerations

### Data Protection

**Logging**:
- Idempotency keys are masked in logs
- Request hashes are partially masked
- No sensitive data stored in Redis

**Access Control**:
- Redis should be secured with authentication
- Network access should be restricted
- Consider Redis encryption for sensitive environments

### Key Management

**Client Responsibility**:
- Clients must generate unique UUIDs
- Keys should not be predictable
- Keys should not be reused across different requests

**Server Validation**:
- UUID format validation
- No server-side key generation (client responsibility)

## Future Enhancements

### Potential Improvements

1. **Distributed Redis**: Redis Cluster for high availability
2. **Custom TTL**: Configurable time windows per endpoint
3. **Key Rotation**: Automatic key expiration and cleanup
4. **Metrics**: Prometheus/Grafana integration for monitoring
5. **Webhook Support**: Idempotency for webhook endpoints

### Backward Compatibility

**Current Implementation**:
- Idempotency is required for all POST requests
- No opt-out mechanism

**Future Considerations**:
- Optional idempotency per endpoint
- Legacy endpoint support without idempotency
- Migration tools for existing clients
