# amoCRM OAuth2 Setup Guide

This guide explains how to set up OAuth2 authentication for amoCRM integration.

## Prerequisites

1. amoCRM account with API access
2. Application registered in amoCRM developer portal
3. PHP environment with cURL extension

## Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# amoCRM OAuth2 Configuration
AMOCRM_CLIENT_ID=your_client_id_here
AMOCRM_CLIENT_SECRET=your_client_secret_here
AMOCRM_SUBDOMAIN=your_subdomain
AMOCRM_REDIRECT_URI=https://your-domain.com/oauth/callback
```

### 2. amoCRM Application Setup

1. Go to [amoCRM Developer Portal](https://www.amocrm.ru/developers/)
2. Create a new application
3. Set the redirect URI to match your `AMOCRM_REDIRECT_URI`
4. Note down the Client ID and Client Secret

## OAuth2 Flow

### Step 1: Generate Authorization URL

```bash
# Using the CLI script
php scripts/init-oauth.php authorize

# Or via API endpoint
GET /oauth/authorize
```

This will return an authorization URL that you need to visit in your browser.

### Step 2: Authorize Application

1. Visit the authorization URL in your browser
2. Log in to your amoCRM account
3. Grant permissions to your application
4. You'll be redirected with an authorization code

### Step 3: Exchange Code for Token

```bash
# Using the CLI script
php scripts/init-oauth.php callback YOUR_AUTHORIZATION_CODE

# Or via API endpoint
GET /oauth/callback?code=YOUR_AUTHORIZATION_CODE
```

This will exchange the authorization code for access and refresh tokens.

## API Endpoints

### OAuth2 Management

- `GET /oauth/authorize` - Generate authorization URL
- `GET /oauth/callback` - Exchange authorization code for tokens
- `GET /oauth/status` - Check token status
- `POST /oauth/refresh` - Refresh access token

### Response Examples

#### Authorization URL Response
```json
{
  "authorization_url": "https://your-subdomain.amocrm.ru/oauth/authorize?client_id=...",
  "message": "Visit this URL to authorize the application"
}
```

#### Token Status Response
```json
{
  "status": "valid",
  "expires_at": 1640995200,
  "token_type": "Bearer",
  "updated_at": "2023-12-31T12:00:00+00:00"
}
```

## Token Management

### Automatic Token Refresh

The system automatically refreshes tokens when they're about to expire (within 5 minutes). You don't need to manually refresh tokens.

### Manual Token Management

```bash
# Check token status
php scripts/init-oauth.php status

# Refresh tokens manually
php scripts/init-oauth.php refresh

# Clear stored tokens
php scripts/init-oauth.php clear
```

## Security Considerations

### Token Storage

- Tokens are stored in `storage/amo_tokens.json`
- File permissions are set to 0600 (owner read/write only)
- Tokens are stored in JSON format with expiration tracking

### Token Security

- Access tokens expire after 24 hours
- Refresh tokens are used to obtain new access tokens
- Failed refresh attempts are logged
- Tokens are automatically cleared on errors

## Error Handling

### Common Errors

1. **Invalid Client ID/Secret**
   - Verify your environment variables
   - Check amoCRM application settings

2. **Invalid Redirect URI**
   - Ensure redirect URI matches exactly
   - Check for trailing slashes

3. **Expired Authorization Code**
   - Authorization codes expire quickly
   - Generate a new authorization URL

4. **Network Errors**
   - Check internet connectivity
   - Verify amoCRM API availability

### Error Response Format

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Testing

### Run Tests

```bash
# Run OAuth2 tests
vendor/bin/phpunit tests/AmoCrmAuthTest.php

# Run all tests
vendor/bin/phpunit
```

### Test Coverage

The test suite covers:
- Authorization URL generation
- Token storage and retrieval
- Token expiration handling
- Error scenarios
- File permissions
- Logging functionality

## Integration with Lead Processing

Once OAuth2 is set up, the system will automatically:

1. Use valid access tokens for API calls
2. Refresh tokens when needed
3. Handle authentication errors gracefully
4. Log all authentication events

## Troubleshooting

### Token Issues

1. **Tokens not found**
   - Run `php scripts/init-oauth.php status`
   - Re-authorize if needed

2. **Token refresh failures**
   - Check network connectivity
   - Verify client credentials
   - Clear tokens and re-authorize

3. **Permission denied errors**
   - Check file permissions on token file
   - Ensure storage directory is writable

### Logging

Check the following log files for debugging:
- `storage/logs/app.log` - General application logs
- `storage/logs/oauth.log` - OAuth-specific logs

### Common Commands

```bash
# Complete OAuth2 setup
php scripts/init-oauth.php authorize
# Visit URL, then:
php scripts/init-oauth.php callback YOUR_CODE

# Check status
php scripts/init-oauth.php status

# Reset if needed
php scripts/init-oauth.php clear
php scripts/init-oauth.php authorize
```
