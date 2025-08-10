# Troubleshooting Guide

This guide provides solutions for common issues encountered when setting up, deploying, and operating the amoCRM Leads Microservice.

## Quick Diagnostic Commands

Before diving into specific issues, run these diagnostic commands:

```bash
# Check service health
curl -f http://localhost:8000/api/leads/health

# Check PHP version
php --version

# Check Composer dependencies
composer install --dry-run

# Check Redis connection
redis-cli ping

# Check environment variables
php -r "require 'vendor/autoload.php'; \$dotenv = Dotenv\Dotenv::createImmutable(__DIR__); \$dotenv->load(); echo 'Environment loaded successfully\n';"

# Check file permissions
ls -la storage/
ls -la .env
```

## Common Issues and Solutions

### 1. Service Won't Start

#### Issue: PHP Version Incompatibility

**Symptoms:**
- Service fails to start
- Error messages about PHP version
- Composer install fails

**Diagnosis:**
```bash
php --version
```

**Solution:**
- Ensure PHP 8.1 or higher is installed
- Update PHP if necessary:
  ```bash
  # Ubuntu/Debian
  sudo apt update
  sudo apt install php8.2 php8.2-cli php8.2-common
  
  # CentOS/RHEL
  sudo yum install php82 php82-cli php82-common
  ```

#### Issue: Missing Dependencies

**Symptoms:**
- Service fails to start
- "Class not found" errors
- Composer autoload issues

**Diagnosis:**
```bash
composer install --dry-run
```

**Solution:**
```bash
# Install dependencies
composer install

# Regenerate autoloader
composer dump-autoload --optimize

# Clear any cached files
rm -rf storage/cache/*
```

#### Issue: File Permission Problems

**Symptoms:**
- "Permission denied" errors
- Cannot write to storage directory
- Log files not created

**Diagnosis:**
```bash
ls -la storage/
ls -la .env
```

**Solution:**
```bash
# Set proper permissions
chmod -R 755 storage
chown -R www-data:www-data storage
chmod 644 .env

# For Docker environments
chmod -R 777 storage
```

### 2. Environment Configuration Issues

#### Issue: Missing Environment Variables

**Symptoms:**
- "Environment variable not set" errors
- Service fails to start
- Configuration errors

**Diagnosis:**
```bash
# Check if .env file exists
ls -la .env

# Check environment loading
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();
echo 'Environment loaded successfully\n';
"
```

**Solution:**
```bash
# Create .env file from example
cp env.example .env

# Edit with your values
nano .env

# Verify required variables
grep -E "^(APP_ENV|AMOCRM_|REDIS_)" .env
```

#### Issue: Invalid amoCRM Configuration

**Symptoms:**
- OAuth2 authentication fails
- "Invalid client credentials" errors
- amoCRM API calls fail

**Diagnosis:**
```bash
# Check OAuth2 status
php scripts/init-oauth.php status

# Test amoCRM connection
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();
echo 'AMOCRM_CLIENT_ID: ' . (\$_ENV['AMOCRM_CLIENT_ID'] ?? 'NOT SET') . '\n';
echo 'AMOCRM_SUBDOMAIN: ' . (\$_ENV['AMOCRM_SUBDOMAIN'] ?? 'NOT SET') . '\n';
"
```

**Solution:**
1. Verify amoCRM application settings
2. Check client ID and secret
3. Ensure redirect URI matches
4. Run OAuth2 setup:
   ```bash
   php scripts/init-oauth.php setup
   ```

#### Issue: Redis Connection Problems

**Symptoms:**
- "Redis connection failed" errors
- Idempotency not working
- Rate limiting issues

**Diagnosis:**
```bash
# Test Redis connection
redis-cli ping

# Check Redis configuration
grep REDIS .env
```

**Solution:**
```bash
# Start Redis service
sudo systemctl start redis
sudo systemctl enable redis

# Check Redis status
sudo systemctl status redis

# Test connection with parameters
redis-cli -h localhost -p 6379 ping
```

### 3. API Endpoint Issues

#### Issue: Health Endpoint Not Responding

**Symptoms:**
- `GET /api/leads/health` returns error
- Service appears down
- Monitoring alerts

**Diagnosis:**
```bash
# Test health endpoint
curl -v http://localhost:8000/api/leads/health

# Check service logs
tail -f storage/logs/app.log
```

**Solution:**
1. Check if service is running
2. Verify web server configuration
3. Check for PHP errors in logs
4. Restart service if necessary

#### Issue: Lead Submission Fails

**Symptoms:**
- `POST /api/leads` returns errors
- Validation errors
- amoCRM integration fails

**Diagnosis:**
```bash
# Test with valid data
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $(uuidgen)" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'

# Check response and logs
tail -f storage/logs/app.log
```

**Solution:**
1. Verify request format
2. Check validation rules
3. Ensure amoCRM integration is configured
4. Review error logs for details

#### Issue: Validation Errors

**Symptoms:**
- HTTP 400 responses
- "Invalid input data" errors
- Field validation failures

**Common Validation Issues:**

**Email Format:**
```json
{
  "error": "validation_error",
  "details": {
    "email": ["Invalid email format"]
  }
}
```
**Solution:** Ensure email is in valid format (e.g., `user@domain.com`)

**Phone Format:**
```json
{
  "error": "validation_error",
  "details": {
    "phone": ["Invalid phone format"]
  }
}
```
**Solution:** Use international format (e.g., `+1234567890`)

**Missing Required Fields:**
```json
{
  "error": "validation_error",
  "details": {
    "name": ["Name is required"],
    "email": ["Email is required"]
  }
}
```
**Solution:** Include all required fields in request

### 4. amoCRM Integration Issues

#### Issue: OAuth2 Token Expired

**Symptoms:**
- "Unauthorized" errors from amoCRM
- Token refresh failures
- Authentication errors

**Diagnosis:**
```bash
# Check token status
php scripts/init-oauth.php status

# Check token file
ls -la storage/oauth/
```

**Solution:**
```bash
# Refresh OAuth2 tokens
php scripts/init-oauth.php refresh

# Or re-authenticate
php scripts/init-oauth.php setup
```

#### Issue: Custom Field Mapping Errors

**Symptoms:**
- "Field not found" errors
- Lead data not saved correctly
- amoCRM API errors

**Diagnosis:**
```bash
# Check field IDs in configuration
grep AMOCRM_.*_FIELD_ID .env

# Verify fields exist in amoCRM
# (Manual check in amoCRM interface)
```

**Solution:**
1. Verify custom field IDs in amoCRM
2. Update field IDs in `.env` file
3. Test with known valid field IDs
4. Check amoCRM field permissions

#### Issue: amoCRM Rate Limiting

**Symptoms:**
- HTTP 429 responses from amoCRM
- "Rate limit exceeded" errors
- Slow response times

**Diagnosis:**
```bash
# Check rate limit configuration
grep AMOCRM_RATE_LIMIT .env

# Monitor API calls
tail -f storage/logs/app.log | grep amoCRM
```

**Solution:**
1. Reduce request frequency
2. Implement exponential backoff
3. Monitor rate limit usage
4. Contact amoCRM support if needed

### 5. Performance Issues

#### Issue: Slow Response Times

**Symptoms:**
- API responses take > 2 seconds
- Timeout errors
- Poor user experience

**Diagnosis:**
```bash
# Test response time
time curl http://localhost:8000/api/leads/health

# Check system resources
top
free -h
df -h
```

**Solution:**
1. Check system resources (CPU, memory, disk)
2. Optimize Redis configuration
3. Review external API calls
4. Consider caching strategies

#### Issue: High Memory Usage

**Symptoms:**
- Out of memory errors
- Service crashes
- Slow performance

**Diagnosis:**
```bash
# Check memory usage
free -h
ps aux | grep php

# Check PHP memory limit
php -r "echo ini_get('memory_limit');"
```

**Solution:**
1. Increase PHP memory limit in `php.ini`
2. Optimize code for memory usage
3. Monitor memory leaks
4. Consider process management (Supervisor)

### 6. Logging and Monitoring Issues

#### Issue: Log Files Not Created

**Symptoms:**
- No log files in storage/logs/
- Missing error information
- Debugging difficult

**Diagnosis:**
```bash
# Check log directory
ls -la storage/logs/

# Check permissions
ls -la storage/
```

**Solution:**
```bash
# Create log directory
mkdir -p storage/logs

# Set permissions
chmod -R 755 storage
chown -R www-data:www-data storage

# Test logging
php -r "
require 'vendor/autoload.php';
\$logger = new Monolog\Logger('test');
\$logger->pushHandler(new Monolog\Handler\StreamHandler('storage/logs/test.log'));
\$logger->info('Test log entry');
"
```

#### Issue: PII Data in Logs

**Symptoms:**
- Sensitive data visible in logs
- Privacy concerns
- Compliance issues

**Diagnosis:**
```bash
# Check PII protection setting
grep LOG_PII_PROTECTION .env

# Search for sensitive data in logs
grep -i "email\|phone\|password" storage/logs/*.log
```

**Solution:**
1. Enable PII protection: `LOG_PII_PROTECTION=true`
2. Review log content for sensitive data
3. Implement additional masking if needed
4. Rotate logs regularly

### 7. Docker-Specific Issues

#### Issue: Container Won't Start

**Symptoms:**
- Docker container exits immediately
- Port binding errors
- Volume mount issues

**Diagnosis:**
```bash
# Check container logs
docker-compose logs app

# Check container status
docker-compose ps

# Check port availability
netstat -tulpn | grep 8000
```

**Solution:**
```bash
# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check for port conflicts
# Change port in docker-compose.yml if needed
```

#### Issue: Volume Mount Problems

**Symptoms:**
- File changes not reflected in container
- Permission errors
- Missing files

**Diagnosis:**
```bash
# Check volume mounts
docker-compose exec app ls -la /app

# Check file permissions
docker-compose exec app ls -la /app/storage
```

**Solution:**
1. Verify volume paths in `docker-compose.yml`
2. Check file permissions on host
3. Restart containers after permission changes
4. Use named volumes for persistence

### 8. Security Issues

#### Issue: SSL/TLS Problems

**Symptoms:**
- HTTPS not working
- Certificate errors
- Mixed content warnings

**Diagnosis:**
```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test HTTPS redirect
curl -I http://yourdomain.com
```

**Solution:**
1. Install valid SSL certificate
2. Configure HTTPS redirect
3. Update CORS origins to use HTTPS
4. Enable HSTS headers

#### Issue: CORS Errors

**Symptoms:**
- Browser CORS errors
- API calls blocked
- Cross-origin request failures

**Diagnosis:**
```bash
# Check CORS configuration
grep CORS_ALLOW_ORIGINS .env

# Test CORS headers
curl -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://api.yourdomain.com/api/leads
```

**Solution:**
1. Configure proper CORS origins
2. Ensure HTTPS for production
3. Test with actual domain names
4. Review browser console for errors

## Debugging Techniques

### 1. Enable Debug Mode

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### 2. Check Application Logs

```bash
# Monitor all logs
tail -f storage/logs/*.log

# Filter by error level
tail -f storage/logs/app.log | grep ERROR

# Search for specific errors
grep -i "exception\|error\|fatal" storage/logs/*.log
```

### 3. Test Individual Components

```bash
# Test Redis
redis-cli ping

# Test amoCRM connection
php scripts/init-oauth.php status

# Test environment loading
php -r "require 'vendor/autoload.php'; echo 'Environment OK\n';"

# Test validation
php -r "
require 'vendor/autoload.php';
\$validator = new App\Validation\LeadValidator();
\$result = \$validator->validate(['name' => 'Test', 'email' => 'test@example.com', 'phone' => '+1234567890']);
var_dump(\$result);
"
```

### 4. Network Diagnostics

```bash
# Test external connectivity
curl -I https://www.amocrm.ru

# Test DNS resolution
nslookup yourdomain.com

# Check firewall rules
sudo ufw status
```

## Emergency Procedures

### 1. Service Recovery

```bash
# Restart service
sudo systemctl restart leads-service

# Or for Docker
docker-compose restart app

# Check status
sudo systemctl status leads-service
```

### 2. Rollback Deployment

```bash
# Revert to previous version
cd /var/www/leads-service
git checkout HEAD~1
composer install --no-dev --optimize-autoloader
sudo systemctl restart leads-service
```

### 3. Emergency Configuration

```bash
# Disable problematic features temporarily
# Edit .env file
APP_DEBUG=false
LOG_LEVEL=error
RATE_LIMIT_REQUESTS=1000  # Increase limits
```

## Getting Help

### 1. Collect Diagnostic Information

```bash
# Create diagnostic report
{
  echo "=== System Information ==="
  uname -a
  php --version
  composer --version
  
  echo "=== Environment ==="
  grep -v "^#" .env | grep -v "^$"
  
  echo "=== Service Status ==="
  sudo systemctl status leads-service
  
  echo "=== Recent Logs ==="
  tail -50 storage/logs/app.log
  
  echo "=== Disk Space ==="
  df -h
  
  echo "=== Memory Usage ==="
  free -h
} > diagnostic_report.txt
```

### 2. Contact Support

When contacting support, include:
- Diagnostic report
- Error messages
- Steps to reproduce
- Environment details
- Recent changes made

### 3. Useful Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Environment Variables Guide](ENVIRONMENT_VARIABLES.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [amoCRM API Documentation](https://www.amocrm.ru/developers)
- [Slim Framework Documentation](https://www.slimframework.com/docs/)

## Prevention

### 1. Regular Maintenance

- Monitor logs daily
- Check system resources weekly
- Update dependencies monthly
- Review security quarterly

### 2. Monitoring Setup

- Configure health check monitoring
- Set up error alerting
- Monitor performance metrics
- Track API usage

### 3. Backup Strategy

- Regular code backups
- Environment configuration backups
- Database/Redis backups
- Disaster recovery testing

---

**Last Updated:** 2024-01-01

**Version:** 1.0.0

**Maintainer:** Development Team
