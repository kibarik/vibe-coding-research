# Deployment Checklist

This checklist provides a step-by-step guide for deploying the amoCRM Leads Microservice to production, staging, or development environments.

## Pre-Deployment Checklist

### 1. Environment Preparation

- [ ] **Server Requirements Verified**
  - [ ] PHP 8.1 or higher installed
  - [ ] Composer installed
  - [ ] Redis server available
  - [ ] Web server (Apache/Nginx) configured
  - [ ] SSL certificate installed (production)

- [ ] **Domain and DNS**
  - [ ] Domain name configured
  - [ ] DNS records pointing to server
  - [ ] SSL certificate valid and installed
  - [ ] HTTPS redirect configured

- [ ] **Infrastructure Setup**
  - [ ] Server firewall configured
  - [ ] Database/Redis backup strategy in place
  - [ ] Monitoring and alerting configured
  - [ ] Log rotation configured

### 2. Code Preparation

- [ ] **Repository Ready**
  - [ ] Code reviewed and approved
  - [ ] All tests passing (`composer test`)
  - [ ] No sensitive data in repository
  - [ ] `.env` file excluded from version control

- [ ] **Dependencies Updated**
  - [ ] `composer.lock` committed
  - [ ] Security vulnerabilities checked
  - [ ] Dependencies compatible with target PHP version

### 3. Configuration Files

- [ ] **Environment Variables**
  - [ ] `.env` file created from `env.example`
  - [ ] All required variables configured
  - [ ] Production values set (not development defaults)
  - [ ] Sensitive data secured

- [ ] **amoCRM Configuration**
  - [ ] OAuth2 application created in amoCRM
  - [ ] Client ID and secret obtained
  - [ ] Redirect URI configured
  - [ ] Custom field IDs identified and configured

## Deployment Process

### 4. Code Deployment

#### Option A: Manual Deployment

- [ ] **Code Transfer**
  ```bash
  # Clone repository
  git clone <repository-url> /var/www/leads-service
  cd /var/www/leads-service
  
  # Checkout production branch
  git checkout main
  git pull origin main
  ```

- [ ] **Dependencies Installation**
  ```bash
  # Install production dependencies
  composer install --no-dev --optimize-autoloader
  
  # Verify installation
  composer dump-autoload --optimize
  ```

- [ ] **File Permissions**
  ```bash
  # Set proper permissions
  chmod -R 755 storage
  chown -R www-data:www-data storage
  chmod 644 .env
  ```

#### Option B: Docker Deployment

- [ ] **Docker Setup**
  ```bash
  # Build and start services
  docker-compose up -d --build
  
  # Verify containers running
  docker-compose ps
  ```

- [ ] **Docker Health Check**
  ```bash
  # Check container logs
  docker-compose logs app
  
  # Test health endpoint
  curl http://localhost:8000/api/leads/health
  ```

### 5. Configuration Setup

- [ ] **Environment Configuration**
  ```bash
  # Copy and configure environment file
  cp env.example .env
  nano .env  # Edit with production values
  ```

- [ ] **amoCRM OAuth2 Setup**
  ```bash
  # Run OAuth2 setup script
  php scripts/init-oauth.php setup
  
  # Verify authentication
  php scripts/init-oauth.php status
  ```

- [ ] **Redis Configuration**
  ```bash
  # Test Redis connection
  redis-cli ping
  
  # Verify Redis configuration in .env
  grep REDIS .env
  ```

### 6. Web Server Configuration

#### Apache Configuration

- [ ] **Virtual Host Setup**
  ```apache
  <VirtualHost *:80>
      ServerName api.yourdomain.com
      DocumentRoot /var/www/leads-service/public
      
      <Directory /var/www/leads-service/public>
          AllowOverride All
          Require all granted
      </Directory>
      
      # Redirect to HTTPS
      RewriteEngine On
      RewriteCond %{HTTPS} off
      RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  </VirtualHost>
  ```

- [ ] **HTTPS Configuration**
  ```apache
  <VirtualHost *:443>
      ServerName api.yourdomain.com
      DocumentRoot /var/www/leads-service/public
      
      SSLEngine on
      SSLCertificateFile /path/to/certificate.crt
      SSLCertificateKeyFile /path/to/private.key
      
      <Directory /var/www/leads-service/public>
          AllowOverride All
          Require all granted
      </Directory>
  </VirtualHost>
  ```

#### Nginx Configuration

- [ ] **Server Block Setup**
  ```nginx
  server {
      listen 80;
      server_name api.yourdomain.com;
      return 301 https://$server_name$request_uri;
  }
  
  server {
      listen 443 ssl http2;
      server_name api.yourdomain.com;
      
      ssl_certificate /path/to/certificate.crt;
      ssl_certificate_key /path/to/private.key;
      
      root /var/www/leads-service/public;
      index index.php;
      
      location / {
          try_files $uri $uri/ /index.php?$query_string;
      }
      
      location ~ \.php$ {
          fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
          fastcgi_index index.php;
          fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
          include fastcgi_params;
      }
  }
  ```

### 7. Security Configuration

- [ ] **File Permissions**
  ```bash
  # Secure sensitive files
  chmod 600 .env
  chmod 600 storage/logs/*
  chmod 755 storage/logs
  ```

- [ ] **Security Headers**
  - [ ] HTTPS enforced
  - [ ] Security headers enabled in `.env`
  - [ ] CORS origins limited to production domains

- [ ] **Firewall Configuration**
  ```bash
  # Allow only necessary ports
  ufw allow 22    # SSH
  ufw allow 80    # HTTP (redirect)
  ufw allow 443   # HTTPS
  ufw enable
  ```

### 8. Service Configuration

- [ ] **Systemd Service (Optional)**
  ```ini
  [Unit]
  Description=amoCRM Leads Service
  After=network.target
  
  [Service]
  Type=simple
  User=www-data
  WorkingDirectory=/var/www/leads-service
  ExecStart=/usr/bin/php -S 0.0.0.0:8000 -t public
  Restart=always
  
  [Install]
  WantedBy=multi-user.target
  ```

- [ ] **Supervisor Configuration (Alternative)**
  ```ini
  [program:leads-service]
  command=php -S 0.0.0.0:8000 -t public
  directory=/var/www/leads-service
  user=www-data
  autostart=true
  autorestart=true
  stderr_logfile=/var/log/leads-service.err.log
  stdout_logfile=/var/log/leads-service.out.log
  ```

## Post-Deployment Verification

### 9. Health Checks

- [ ] **Service Health**
  ```bash
  # Test health endpoint
  curl -f https://api.yourdomain.com/api/leads/health
  
  # Expected response:
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

- [ ] **Component Verification**
  - [ ] Redis connection working
  - [ ] amoCRM authentication valid
  - [ ] Log files writable
  - [ ] Storage directories accessible

### 10. Functionality Testing

- [ ] **API Endpoint Testing**
  ```bash
  # Test lead submission
  curl -X POST https://api.yourdomain.com/api/leads \
    -H "Content-Type: application/json" \
    -H "X-Idempotency-Key: $(uuidgen)" \
    -d '{
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+1234567890",
      "comment": "Deployment test"
    }'
  ```

- [ ] **Error Handling**
  - [ ] Invalid requests return proper error codes
  - [ ] Validation errors provide clear messages
  - [ ] Rate limiting works correctly
  - [ ] Idempotency prevents duplicates

### 11. Performance Testing

- [ ] **Load Testing**
  ```bash
  # Basic load test
  ab -n 100 -c 10 https://api.yourdomain.com/api/leads/health
  ```

- [ ] **Response Time Verification**
  - [ ] Health endpoint responds < 200ms
  - [ ] Lead submission responds < 2s
  - [ ] Error responses are fast

### 12. Monitoring Setup

- [ ] **Log Monitoring**
  ```bash
  # Monitor application logs
  tail -f storage/logs/app.log
  
  # Monitor error logs
  tail -f storage/logs/error.log
  ```

- [ ] **System Monitoring**
  - [ ] CPU and memory usage
  - [ ] Disk space monitoring
  - [ ] Network connectivity
  - [ ] Redis memory usage

- [ ] **Application Monitoring**
  - [ ] Response time tracking
  - [ ] Error rate monitoring
  - [ ] amoCRM API success rate
  - [ ] Rate limit usage

## Rollback Plan

### 13. Rollback Preparation

- [ ] **Backup Strategy**
  ```bash
  # Backup current deployment
  cp -r /var/www/leads-service /var/www/leads-service-backup-$(date +%Y%m%d)
  
  # Backup environment
  cp .env .env-backup-$(date +%Y%m%d)
  ```

- [ ] **Database Backup**
  ```bash
  # Backup Redis data (if persistent)
  redis-cli BGSAVE
  ```

- [ ] **Rollback Script**
  ```bash
  #!/bin/bash
  # Rollback to previous version
  cd /var/www/leads-service
  git checkout HEAD~1
  composer install --no-dev --optimize-autoloader
  systemctl restart leads-service
  ```

## Production Checklist

### 14. Production-Specific Items

- [ ] **SSL/TLS Configuration**
  - [ ] Valid SSL certificate installed
  - [ ] HTTPS redirect configured
  - [ ] HSTS headers enabled
  - [ ] SSL configuration secure (A+ rating)

- [ ] **Security Hardening**
  - [ ] Debug mode disabled (`APP_DEBUG=false`)
  - [ ] Error reporting disabled
  - [ ] File permissions restricted
  - [ ] Unnecessary services disabled

- [ ] **Backup and Recovery**
  - [ ] Automated backups configured
  - [ ] Backup retention policy set
  - [ ] Recovery procedures documented
  - [ ] Disaster recovery plan tested

- [ ] **Monitoring and Alerting**
  - [ ] Uptime monitoring configured
  - [ ] Error alerting set up
  - [ ] Performance monitoring active
  - [ ] Log aggregation configured

### 15. Documentation

- [ ] **Deployment Documentation**
  - [ ] Deployment procedures documented
  - [ ] Configuration files documented
  - [ ] Troubleshooting guide available
  - [ ] Contact information for support

- [ ] **Operational Documentation**
  - [ ] Monitoring procedures documented
  - [ ] Backup and recovery procedures
  - [ ] Incident response procedures
  - [ ] Maintenance schedules

## Maintenance Checklist

### 16. Ongoing Maintenance

- [ ] **Regular Checks**
  - [ ] Monitor application logs daily
  - [ ] Check system resources weekly
  - [ ] Review error rates monthly
  - [ ] Update dependencies quarterly

- [ ] **Security Updates**
  - [ ] Monitor security advisories
  - [ ] Update dependencies promptly
  - [ ] Review access logs regularly
  - [ ] Test backup and recovery procedures

- [ ] **Performance Optimization**
  - [ ] Monitor response times
  - [ ] Optimize database queries
  - [ ] Review caching strategies
  - [ ] Scale infrastructure as needed

## Troubleshooting

### 17. Common Issues

- [ ] **Service Won't Start**
  - [ ] Check PHP version compatibility
  - [ ] Verify file permissions
  - [ ] Check environment variables
  - [ ] Review error logs

- [ ] **amoCRM Integration Fails**
  - [ ] Verify OAuth2 credentials
  - [ ] Check custom field IDs
  - [ ] Test API connectivity
  - [ ] Review amoCRM logs

- [ ] **Redis Connection Issues**
  - [ ] Verify Redis server running
  - [ ] Check connection parameters
  - [ ] Test network connectivity
  - [ ] Review Redis logs

- [ ] **Performance Issues**
  - [ ] Check system resources
  - [ ] Review application logs
  - [ ] Monitor external API calls
  - [ ] Optimize configuration

## Support Information

### 18. Support Contacts

- [ ] **Technical Support**
  - [ ] Development team contact
  - [ ] Infrastructure team contact
  - [ ] amoCRM support contact
  - [ ] Emergency contact procedures

- [ ] **Documentation**
  - [ ] API documentation available
  - [ ] Troubleshooting guide accessible
  - [ ] Configuration reference available
  - [ ] Change log maintained

---

**Deployment Status:** □ Not Started □ In Progress □ Completed □ Verified

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Notes:** _______________
