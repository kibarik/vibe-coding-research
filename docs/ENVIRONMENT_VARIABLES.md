# Environment Variables Configuration

This document provides detailed information about all environment variables used in the amoCRM Leads Microservice, including their purpose, default values, and configuration requirements.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration values
3. Ensure the file is not committed to version control (already in `.gitignore`)

## Environment Variables Reference

### Application Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `APP_ENV` | string | `production` | Yes | Application environment (`development`, `staging`, `production`) |
| `APP_DEBUG` | boolean | `false` | Yes | Enable debug mode and detailed error reporting |
| `APP_NAME` | string | `leads.aiworkplace` | No | Application name for logging and identification |

**Example:**
```env
APP_ENV=production
APP_DEBUG=false
APP_NAME=amoCRM Leads Service
```

### amoCRM OAuth2 Configuration

These variables are required for amoCRM integration and must be configured before the service can process leads.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `AMOCRM_CLIENT_ID` | string | Yes | OAuth2 client ID from amoCRM application settings |
| `AMOCRM_CLIENT_SECRET` | string | Yes | OAuth2 client secret from amoCRM application settings |
| `AMOCRM_SUBDOMAIN` | string | Yes | Your amoCRM subdomain (e.g., `yourcompany` for `yourcompany.amocrm.ru`) |
| `AMOCRM_REDIRECT_URI` | string | Yes | OAuth2 redirect URI (must match amoCRM app configuration) |

**Example:**
```env
AMOCRM_CLIENT_ID=your_client_id_here
AMOCRM_CLIENT_SECRET=your_client_secret_here
AMOCRM_SUBDOMAIN=yourcompany
AMOCRM_REDIRECT_URI=https://your-domain.com/oauth/callback
```

**Setup Instructions:**
1. Create an application in amoCRM developer portal
2. Configure OAuth2 settings with your redirect URI
3. Copy client ID and secret to environment variables
4. Run OAuth2 setup: `php scripts/init-oauth.php setup`

### amoCRM Custom Field IDs

These variables map lead data to specific amoCRM custom fields. You must configure these based on your amoCRM setup.

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `AMOCRM_EMAIL_FIELD_ID` | integer | Yes | Custom field ID for email address |
| `AMOCRM_PHONE_FIELD_ID` | integer | Yes | Custom field ID for phone number |
| `AMOCRM_COMMENT_FIELD_ID` | integer | Yes | Custom field ID for lead comment |
| `AMOCRM_SOURCE_FIELD_ID` | integer | Yes | Custom field ID for lead source |
| `AMOCRM_UTM_SOURCE_FIELD_ID` | integer | No | Custom field ID for UTM source |
| `AMOCRM_UTM_MEDIUM_FIELD_ID` | integer | No | Custom field ID for UTM medium |
| `AMOCRM_UTM_CAMPAIGN_FIELD_ID` | integer | No | Custom field ID for UTM campaign |
| `AMOCRM_UTM_TERM_FIELD_ID` | integer | No | Custom field ID for UTM term |
| `AMOCRM_UTM_CONTENT_FIELD_ID` | integer | No | Custom field ID for UTM content |

**Example:**
```env
AMOCRM_EMAIL_FIELD_ID=123456
AMOCRM_PHONE_FIELD_ID=123457
AMOCRM_COMMENT_FIELD_ID=123458
AMOCRM_SOURCE_FIELD_ID=123459
AMOCRM_UTM_SOURCE_FIELD_ID=123460
AMOCRM_UTM_MEDIUM_FIELD_ID=123461
AMOCRM_UTM_CAMPAIGN_FIELD_ID=123462
AMOCRM_UTM_TERM_FIELD_ID=123463
AMOCRM_UTM_CONTENT_FIELD_ID=123464
```

**How to Find Field IDs:**
1. Go to amoCRM Settings → Custom Fields
2. Find the relevant custom fields
3. Copy the field ID from the URL or field settings
4. Configure in environment variables

### CORS Configuration

Cross-Origin Resource Sharing (CORS) settings for web browser compatibility.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CORS_ALLOW_ORIGINS` | string | `*` | Comma-separated list of allowed origins |

**Example:**
```env
# Allow all origins (development)
CORS_ALLOW_ORIGINS=*

# Allow specific origins (production)
CORS_ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Logging Configuration

Comprehensive logging configuration with PII protection and log rotation.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | string | `info` | Logging level (`debug`, `info`, `warning`, `error`) |
| `LOG_FILE` | string | `storage/logs/app.log` | Main application log file path |
| `LOG_MAX_FILES` | integer | `30` | Maximum number of log files to keep |
| `LOG_ROTATION` | string | `daily` | Log rotation frequency (`daily`, `weekly`, `monthly`) |
| `LOG_PII_PROTECTION` | boolean | `true` | Enable PII data masking in logs |
| `LOG_REQUEST_LOGGING` | boolean | `true` | Log HTTP requests and responses |
| `LOG_ERROR_LOGGING` | boolean | `true` | Log errors and exceptions |
| `LOG_PERFORMANCE_LOGGING` | boolean | `true` | Log performance metrics |

**Example:**
```env
LOG_LEVEL=info
LOG_FILE=storage/logs/app.log
LOG_MAX_FILES=30
LOG_ROTATION=daily
LOG_PII_PROTECTION=true
LOG_REQUEST_LOGGING=true
LOG_ERROR_LOGGING=true
LOG_PERFORMANCE_LOGGING=true
```

**Log Levels:**
- `debug`: Detailed debug information
- `info`: General information messages
- `warning`: Warning messages
- `error`: Error messages only

### Rate Limiting Configuration

API rate limiting and amoCRM API throttling settings.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_REQUESTS` | integer | `100` | Maximum API requests per time window |
| `RATE_LIMIT_WINDOW` | integer | `3600` | Rate limit time window in seconds (1 hour) |
| `AMOCRM_RATE_LIMIT_PER_MINUTE` | integer | `7` | Maximum amoCRM API requests per minute |
| `AMOCRM_RATE_LIMIT_PER_HOUR` | integer | `1000` | Maximum amoCRM API requests per hour |

**Example:**
```env
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
AMOCRM_RATE_LIMIT_PER_MINUTE=7
AMOCRM_RATE_LIMIT_PER_HOUR=1000
```

**Rate Limiting Behavior:**
- API requests are limited per client IP address
- amoCRM requests are limited globally across all clients
- Exceeded limits return HTTP 429 status with retry information

### Redis Configuration

Redis connection settings for idempotency, caching, and rate limiting.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_HOST` | string | `localhost` | Redis server hostname or IP address |
| `REDIS_PORT` | integer | `6379` | Redis server port |
| `REDIS_PASSWORD` | string | `` | Redis server password (if required) |
| `REDIS_DATABASE` | integer | `0` | Redis database number |
| `REDIS_TIMEOUT` | float | `5.0` | Redis connection timeout in seconds |

**Example:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
REDIS_TIMEOUT=5.0
```

**Redis Usage:**
- Idempotency key storage (5-minute TTL)
- Rate limiting counters
- Response caching for duplicate requests
- Session storage (if implemented)

### Security Configuration

Security-related settings and headers.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SECURITY_HEADERS` | boolean | `true` | Enable security headers in responses |

**Example:**
```env
SECURITY_HEADERS=true
```

**Security Headers Enabled:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Environment-Specific Configurations

### Development Environment

```env
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=debug
CORS_ALLOW_ORIGINS=*
LOG_REQUEST_LOGGING=true
LOG_PII_PROTECTION=false
```

### Staging Environment

```env
APP_ENV=staging
APP_DEBUG=false
LOG_LEVEL=info
CORS_ALLOW_ORIGINS=https://staging.yourdomain.com
LOG_REQUEST_LOGGING=true
LOG_PII_PROTECTION=true
```

### Production Environment

```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=warning
CORS_ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_REQUEST_LOGGING=false
LOG_PII_PROTECTION=true
SECURITY_HEADERS=true
```

## Validation and Testing

### Environment Variable Validation

The application validates required environment variables on startup:

```bash
# Check environment configuration
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();
echo 'Environment loaded successfully\n';
"
```

### Required Variables Checklist

Before starting the application, ensure these variables are set:

- [ ] `APP_ENV`
- [ ] `APP_DEBUG`
- [ ] `AMOCRM_CLIENT_ID`
- [ ] `AMOCRM_CLIENT_SECRET`
- [ ] `AMOCRM_SUBDOMAIN`
- [ ] `AMOCRM_REDIRECT_URI`
- [ ] `AMOCRM_EMAIL_FIELD_ID`
- [ ] `AMOCRM_PHONE_FIELD_ID`
- [ ] `AMOCRM_COMMENT_FIELD_ID`
- [ ] `AMOCRM_SOURCE_FIELD_ID`

### Testing Environment Variables

Test your configuration with the health check endpoint:

```bash
curl http://localhost:8000/api/leads/health
```

Expected response:
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

## Troubleshooting

### Common Issues

1. **Missing Required Variables**
   ```
   Error: Environment variable AMOCRM_CLIENT_ID is not set
   ```
   **Solution:** Add missing variable to `.env` file

2. **Invalid amoCRM Configuration**
   ```
   Error: amoCRM authentication failed
   ```
   **Solution:** Verify client ID, secret, and subdomain

3. **Redis Connection Failed**
   ```
   Error: Redis connection timeout
   ```
   **Solution:** Check Redis host, port, and password

4. **Invalid Field IDs**
   ```
   Error: amoCRM field not found
   ```
   **Solution:** Verify custom field IDs in amoCRM

### Environment Variable Debugging

Enable debug mode to see detailed environment information:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check application logs for environment-related errors:

```bash
tail -f storage/logs/app.log
```

### Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use strong, unique passwords for Redis**
3. **Limit CORS origins in production**
4. **Disable debug mode in production**
5. **Use HTTPS in production environments**
6. **Regularly rotate amoCRM credentials**

## Docker Environment Variables

When using Docker, you can pass environment variables in several ways:

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - APP_ENV=production
      - REDIS_HOST=redis
      - AMOCRM_CLIENT_ID=${AMOCRM_CLIENT_ID}
      - AMOCRM_CLIENT_SECRET=${AMOCRM_CLIENT_SECRET}
```

### Docker Run

```bash
docker run -e APP_ENV=production -e REDIS_HOST=redis your-app
```

### Environment File

```bash
docker run --env-file .env your-app
```

## Monitoring Environment Variables

Monitor environment variable usage and configuration:

```bash
# Check environment variable loading
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();
echo 'Loaded variables: ' . count(\$_ENV) . '\n';
"
```

## Support

For environment variable issues:

1. Check this documentation
2. Verify variable names and values
3. Test with health endpoint
4. Review application logs
5. Contact the development team
