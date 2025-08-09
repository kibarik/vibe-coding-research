# Logging System Guide

This document describes the comprehensive logging system implemented in the leads.aiworkplace service, including PII protection, log rotation, and environment-specific configurations.

## Overview

The logging system provides comprehensive logging capabilities with built-in PII (Personally Identifiable Information) protection, automatic log rotation, and environment-specific configurations. It ensures compliance with data protection regulations while maintaining detailed logs for debugging and monitoring.

## Architecture

### Components

1. **LoggingService**: Main service for configuring and managing loggers
2. **PiiProtectionProcessor**: Monolog processor for automatic PII detection and masking
3. **RequestLoggingMiddleware**: Slim middleware for HTTP request/response logging
4. **RotatingFileHandler**: Automatic log rotation with compression
5. **Environment-specific formatters**: JSON for production, human-readable for development

### Log Levels

- **DEBUG**: Detailed debug information (development only)
- **INFO**: General information about application flow
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error conditions that don't stop the application
- **CRITICAL**: Critical errors that may affect functionality
- **ALERT**: Immediate action required
- **EMERGENCY**: System is unusable

## Configuration

### Environment Variables

```bash
# Logging Configuration
LOG_LEVEL=info                    # Log level (debug, info, warning, error, critical, alert, emergency)
LOG_FILE=storage/logs/app.log     # Main log file path
LOG_MAX_FILES=30                  # Maximum number of rotated log files to keep
LOG_ROTATION=daily                # Rotation frequency (daily, weekly, monthly)
LOG_PII_PROTECTION=true           # Enable PII protection
LOG_REQUEST_LOGGING=true          # Enable HTTP request/response logging
LOG_ERROR_LOGGING=true            # Enable error logging
LOG_PERFORMANCE_LOGGING=true      # Enable performance logging
```

### Application Configuration

```php
// config/app.php
'logging' => [
    'level' => $_ENV['LOG_LEVEL'] ?? 'info',
    'file' => $_ENV['LOG_FILE'] ?? 'storage/logs/app.log',
    'max_files' => (int)($_ENV['LOG_MAX_FILES'] ?? 30),
    'rotation' => $_ENV['LOG_ROTATION'] ?? 'daily',
    'pii_protection' => (bool)($_ENV['LOG_PII_PROTECTION'] ?? true),
    'request_logging' => (bool)($_ENV['LOG_REQUEST_LOGGING'] ?? true),
    'error_logging' => (bool)($_ENV['LOG_ERROR_LOGGING'] ?? true),
    'performance_logging' => (bool)($_ENV['LOG_PERFORMANCE_LOGGING'] ?? true),
],
```

## PII Protection

### Automatic Detection

The system automatically detects and masks the following types of PII:

1. **Email Addresses**: `john.doe@example.com` → `j***e@example.com`
2. **Phone Numbers**: `+79001234567` → `79****67`
3. **Credit Cards**: `1234-5678-9012-3456` → `************3456`
4. **Social Security Numbers**: `123-45-6789` → `***-**-6789`
5. **IP Addresses**: `192.168.1.100` → `192.168.*.*`

### Sensitive Fields

The following field names are automatically masked regardless of content:

- `password`, `token`, `secret`, `key`, `auth`, `authorization`
- `cookie`, `session`, `api_key`, `private_key`, `client_secret`
- `access_token`, `refresh_token`, `idempotency_key`

### Customization

You can extend PII protection by modifying the `PiiProtectionProcessor`:

```php
// Add custom patterns
$this->piiPatterns['custom'] = '/your-regex-pattern/';

// Add custom sensitive fields
$this->sensitiveFields[] = 'custom_sensitive_field';
```

## Log Files

### File Structure

```
storage/logs/
├── app.log                    # Main application logs
├── app_error.log             # Error-level logs only
├── app_emergency.log         # Emergency-level logs only
├── app-2024-01-01.log        # Rotated daily logs
├── app-2024-01-01.log.gz     # Compressed old logs
└── app-2024-01-02.log        # Current day logs
```

### Log Formats

**Production (JSON)**:
```json
{
  "message": "HTTP Request",
  "context": {
    "request_id": "req_64f8a1b2c3d4e5f6_1691621234_abc12345",
    "method": "POST",
    "uri": "/api/leads",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "[REDACTED]"
    },
    "body_size": 156,
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T12:00:00+00:00"
  },
  "level": 200,
  "level_name": "INFO",
  "channel": "leads.aiworkplace",
  "datetime": "2024-01-01T12:00:00.123456+00:00",
  "extra": {
    "process_id": 12345,
    "memory_usage": "2.5MB",
    "uid": "abc123def456ghi789"
  }
}
```

**Development (Human-readable)**:
```
[2024-01-01 12:00:00] leads.aiworkplace.INFO: HTTP Request {
  "request_id": "req_64f8a1b2c3d4e5f6_1691621234_abc12345",
  "method": "POST",
  "uri": "/api/leads",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "[REDACTED]"
  },
  "body_size": 156,
  "ip": "192.168.1.100"
}
```

## Request/Response Logging

### Request Logging

The `RequestLoggingMiddleware` logs all HTTP requests with:

- **Request ID**: Unique identifier for request tracking
- **Method & URI**: HTTP method and endpoint
- **Headers**: Sanitized headers (sensitive data masked)
- **Body Size**: Size of request body
- **Body Preview**: First 500 characters of request body
- **Client IP**: Real IP address (handles proxies)
- **User Agent**: Browser/client information
- **Timestamp**: ISO 8601 formatted timestamp

### Response Logging

Response logging includes:

- **Status Code**: HTTP response status
- **Headers**: Sanitized response headers
- **Body Size**: Size of response body
- **Body Preview**: First 500 characters of response body
- **Duration**: Request processing time in milliseconds
- **Request ID**: Links response to original request

### Error Logging

Error logging captures:

- **Exception Details**: Class, message, code, file, line
- **Stack Trace**: Full exception stack trace
- **Request Context**: Original request information
- **Processing Duration**: Time until error occurred
- **Request ID**: Links error to original request

## Usage Examples

### Basic Logging

```php
use App\Services\LoggingService;

$loggingService = new LoggingService($config);
$logger = $loggingService->getLogger();

// Log different levels
$logger->debug('Debug information');
$logger->info('General information');
$logger->warning('Warning message');
$logger->error('Error message');
$logger->critical('Critical error');
```

### Specialized Logging Methods

```php
// Log HTTP requests
$loggingService->logRequest('POST', '/api/leads', $headers, $body);

// Log HTTP responses
$loggingService->logResponse(201, $headers, $body);

// Log exceptions
$loggingService->logError($exception, ['context' => 'additional info']);

// Log amoCRM operations
$loggingService->logAmoCrmOperation('create_contact', $data, $error);

// Log lead processing
$loggingService->logLeadProcessing($leadData, $leadId, $error);
```

### PII Protection Examples

```php
// These will be automatically masked in logs
$logger->info('User data', [
    'email' => 'john.doe@example.com',        // → j***e@example.com
    'phone' => '+79001234567',                // → 79****67
    'access_token' => 'secret-token-123',     // → se****23
    'credit_card' => '1234-5678-9012-3456',   // → ************3456
    'ssn' => '123-45-6789',                   // → ***-**-6789
    'ip' => '192.168.1.100'                   // → 192.168.*.*
]);
```

## Environment-Specific Configuration

### Development Environment

```bash
APP_ENV=development
LOG_LEVEL=debug
LOG_REQUEST_LOGGING=true
LOG_PII_PROTECTION=true
```

**Features**:
- Debug-level logging
- Human-readable log format
- Console output for immediate feedback
- Full request/response logging
- PII protection enabled

### Production Environment

```bash
APP_ENV=production
LOG_LEVEL=warning
LOG_REQUEST_LOGGING=true
LOG_PII_PROTECTION=true
```

**Features**:
- Warning-level and above only
- JSON format for log aggregation
- File-based logging only
- Automatic log rotation
- PII protection enabled

### Staging Environment

```bash
APP_ENV=staging
LOG_LEVEL=info
LOG_REQUEST_LOGGING=true
LOG_PII_PROTECTION=true
```

**Features**:
- Info-level and above
- JSON format
- File-based logging
- PII protection enabled

## Monitoring and Alerting

### Log Analysis

**Key Metrics to Monitor**:
- Error rate (4xx, 5xx responses)
- Response times (performance)
- Request volume
- PII detection events
- Exception frequency

**Sample Queries** (for log aggregation tools):

```bash
# Error rate
grep '"level_name":"ERROR"' app.log | wc -l

# Response time > 1 second
grep '"duration_ms":[1-9][0-9][0-9][0-9]' app.log

# PII detection
grep '\[REDACTED\]\|\[INVALID_' app.log

# Request volume by endpoint
grep '"uri":"/api/leads"' app.log | wc -l
```

### Alerting Rules

**High Priority**:
- Emergency-level logs
- Response time > 5 seconds
- Error rate > 10%

**Medium Priority**:
- Warning-level logs
- Response time > 1 second
- PII detection events

**Low Priority**:
- Info-level logs
- Performance metrics

## Performance Considerations

### Log Rotation

- **Daily rotation**: Prevents single large log files
- **Compression**: Reduces disk space usage
- **Retention**: Configurable file retention (default: 30 days)
- **Permissions**: Secure file permissions (0664)

### Memory Usage

- **Stream handlers**: Low memory footprint
- **JSON formatting**: Efficient serialization
- **PII processing**: Minimal overhead (~1-2ms per log entry)

### Disk I/O

- **Buffered writing**: Reduces I/O operations
- **Asynchronous processing**: Non-blocking log writes
- **Compression**: Reduces storage requirements

## Security Considerations

### Data Protection

- **PII masking**: Automatic detection and masking
- **Sensitive field protection**: Configurable field masking
- **Log file permissions**: Secure file access
- **Network security**: Log files not exposed via web

### Access Control

- **File permissions**: 0664 (owner/group read/write, others read)
- **Directory permissions**: 0755 (owner read/write/execute, others read/execute)
- **Log rotation**: Automatic cleanup of old logs

### Compliance

- **GDPR compliance**: PII protection in logs
- **Data retention**: Configurable log retention periods
- **Audit trails**: Complete request/response logging
- **Error tracking**: Comprehensive exception logging

## Troubleshooting

### Common Issues

**Log files not created**:
```bash
# Check directory permissions
ls -la storage/logs/

# Check PHP write permissions
php -r "var_dump(is_writable('storage/logs/'));"
```

**High disk usage**:
```bash
# Check log file sizes
du -sh storage/logs/*

# Check rotation configuration
grep "LOG_MAX_FILES" .env
```

**PII not masked**:
```bash
# Check PII protection setting
grep "LOG_PII_PROTECTION" .env

# Check log entries for unmasked data
grep -i "email\|phone\|token" storage/logs/app.log
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
LOG_LEVEL=debug
APP_DEBUG=true
```

### Log Analysis Tools

**Real-time monitoring**:
```bash
# Follow logs in real-time
tail -f storage/logs/app.log

# Monitor errors only
tail -f storage/logs/app_error.log

# Search for specific patterns
grep "ERROR" storage/logs/app.log
```

**Log aggregation** (recommended for production):
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Graylog
- Splunk
- CloudWatch (AWS)

## Best Practices

### Logging Guidelines

1. **Use appropriate log levels**:
   - DEBUG: Detailed debugging information
   - INFO: General application flow
   - WARNING: Potential issues
   - ERROR: Error conditions
   - CRITICAL: Critical errors

2. **Include context**:
   ```php
   $logger->info('Lead processed', [
       'lead_id' => $leadId,
       'processing_time' => $duration,
       'source' => $source
   ]);
   ```

3. **Avoid sensitive data**:
   ```php
   // Good
   $logger->info('User authenticated', ['user_id' => $userId]);
   
   // Bad
   $logger->info('User authenticated', ['password' => $password]);
   ```

4. **Use structured logging**:
   ```php
   // Good
   $logger->info('API call made', [
       'endpoint' => '/api/leads',
       'method' => 'POST',
       'status_code' => 201
   ]);
   
   // Bad
   $logger->info("API call to /api/leads with POST returned 201");
   ```

### Performance Guidelines

1. **Avoid expensive operations in logging**:
   ```php
   // Good
   $logger->info('Data processed', ['count' => count($data)]);
   
   // Bad
   $logger->info('Data processed', ['data' => json_encode($data)]);
   ```

2. **Use lazy evaluation**:
   ```php
   // Good
   if ($logger->isDebugEnabled()) {
       $logger->debug('Expensive operation', ['result' => expensiveOperation()]);
   }
   ```

3. **Batch log operations** when possible

### Security Guidelines

1. **Never log passwords or tokens**
2. **Use PII protection for all user data**
3. **Secure log file access**
4. **Regular log rotation and cleanup**
5. **Monitor for sensitive data leaks**

## Future Enhancements

### Planned Features

1. **Log aggregation integration**: Direct integration with ELK, Graylog, etc.
2. **Custom PII patterns**: User-configurable PII detection rules
3. **Log encryption**: Encrypted log files for sensitive environments
4. **Performance metrics**: Built-in performance monitoring
5. **Alert integration**: Direct alerting for critical events

### Extensibility

The logging system is designed to be easily extensible:

- **Custom processors**: Add new Monolog processors
- **Custom handlers**: Implement custom log handlers
- **Custom formatters**: Create environment-specific formatters
- **Custom PII patterns**: Extend PII detection capabilities
