# amoCRM Integration Guide

This guide explains how to configure and use the amoCRM integration for lead processing.

## Overview

The amoCRM integration automatically:
1. Creates or finds contacts in amoCRM
2. Creates leads and links them to contacts
3. Adds UTM parameters and custom fields
4. Handles authentication and token refresh
5. Provides comprehensive logging and error handling

## Prerequisites

1. amoCRM account with API access
2. OAuth2 authentication configured (see AMOCRM_OAUTH_SETUP.md)
3. Custom fields configured in amoCRM
4. Field IDs identified and configured

## Configuration

### 1. Environment Variables

Add the following variables to your `.env` file:

```env
# amoCRM Field IDs (configure these based on your amoCRM setup)
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

### 2. Finding Field IDs in amoCRM

To find the correct field IDs:

1. **For Contact Fields:**
   - Go to Settings → Contacts → Custom Fields
   - Note the ID of Email and Phone fields

2. **For Lead Fields:**
   - Go to Settings → Leads → Custom Fields
   - Note the ID of Comment, Source, and UTM fields

3. **Using amoCRM API:**
   ```bash
   # Get contact custom fields
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "https://your-subdomain.amocrm.ru/api/v4/contacts/custom_fields"
   
   # Get lead custom fields
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "https://your-subdomain.amocrm.ru/api/v4/leads/custom_fields"
   ```

## Integration Flow

### 1. Contact Management

The system follows this logic for contacts:

1. **Search for existing contact** by email address
2. **If found:** Update phone number if different, reuse contact
3. **If not found:** Create new contact with name, email, and phone

### 2. Lead Creation

For each lead submission:

1. **Create or find contact** (see above)
2. **Create lead** with:
   - Name: "Lead: {contact_name}"
   - Linked to the contact
   - Comment field (if provided)
   - Source field (if provided)
3. **Add UTM parameters** as custom fields (if provided)

### 3. UTM Parameter Handling

UTM parameters are automatically mapped to custom fields:

- `utm_source` → UTM Source field
- `utm_medium` → UTM Medium field
- `utm_campaign` → UTM Campaign field
- `utm_term` → UTM Term field
- `utm_content` → UTM Content field

## API Integration

### Lead Creation Response

When a lead is successfully created, the API returns:

```json
{
  "status": "success",
  "message": "Lead created successfully in amoCRM",
  "request_id": "lead_64f8a1b2c3d4e5f6_1691621234",
  "lead_id": 456,
  "contact_id": 123,
  "timestamp": "2023-08-09T23:27:14+00:00",
  "data_received": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "79001234567",
    "has_comment": true,
    "utm_params_count": 2,
    "additional_fields": ["source"]
  },
  "amocrm_processing_time_ms": 1250.45
}
```

### Error Handling

The system handles various error scenarios:

1. **Authentication Errors (401):**
   - Automatically refreshes tokens
   - Retries the request
   - Returns error if refresh fails

2. **API Errors (4xx/5xx):**
   - Logs detailed error information
   - Returns structured error response
   - Includes request ID for tracking

3. **Network Errors:**
   - Timeout handling (30 seconds)
   - Connection error logging
   - Retry logic for transient failures

## Custom Field Configuration

### Required Fields

1. **Contact Fields:**
   - Email field (custom field)
   - Phone field (custom field)

2. **Lead Fields:**
   - Comment field (optional)
   - Source field (optional)
   - UTM fields (optional)

### Field Configuration Example

```php
// Example field configuration
$fieldIds = [
    'email' => 123456,        // Contact email field
    'phone' => 123457,        // Contact phone field
    'comment' => 123458,      // Lead comment field
    'source' => 123459,       // Lead source field
    'utm_source' => 123460,   // UTM source field
    'utm_medium' => 123461,   // UTM medium field
    'utm_campaign' => 123462, // UTM campaign field
    'utm_term' => 123463,     // UTM term field
    'utm_content' => 123464,  // UTM content field
];
```

## Testing the Integration

### 1. Health Check

Check if amoCRM integration is working:

```bash
curl -X GET https://your-domain.com/api/leads/health
```

Response should show:
```json
{
  "status": "ok",
  "checks": {
    "amocrm_auth": "ok",
    "storage_writable": "ok",
    "validation_system": "ok"
  }
}
```

### 2. Test Lead Creation

Create a test lead:

```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+7 (900) 123-45-67",
    "comment": "Test lead from API",
    "utm_source": "test",
    "utm_medium": "api"
  }'
```

### 3. Verify in amoCRM

1. Check that a new contact was created
2. Verify the lead was created and linked to the contact
3. Confirm UTM parameters were added correctly

## Monitoring and Logging

### Log Files

- `storage/logs/app.log` - General application logs
- `storage/logs/oauth.log` - OAuth authentication logs

### Key Log Events

1. **Lead Creation Start:**
   ```
   Starting amoCRM lead creation
   ```

2. **Successful Creation:**
   ```
   amoCRM lead creation successful
   ```

3. **API Errors:**
   ```
   amoCRM API request failed
   ```

4. **Authentication Issues:**
   ```
   Authentication failed, token refreshed
   ```

### Log Data Privacy

Sensitive data in logs is automatically sanitized:
- Email: `jo***e@example.com`
- Phone: `790***4567`

## Troubleshooting

### Common Issues

1. **Field ID Errors:**
   - Verify field IDs in amoCRM settings
   - Check that fields exist and are accessible
   - Ensure field types match expected values

2. **Authentication Failures:**
   - Check OAuth2 setup
   - Verify tokens are valid
   - Check network connectivity

3. **API Rate Limits:**
   - amoCRM has rate limits (typically 7 requests per second)
   - System includes automatic retry logic
   - Monitor logs for rate limit errors

4. **Contact Duplication:**
   - System searches by email address
   - Ensure email field is properly configured
   - Check contact search functionality

### Debug Mode

Enable debug mode for detailed logging:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### API Testing

Test amoCRM API directly:

```bash
# Test contact creation
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Contact"}' \
     "https://your-subdomain.amocrm.ru/api/v4/contacts"

# Test lead creation
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Lead","price":0}' \
     "https://your-subdomain.amocrm.ru/api/v4/leads"
```

## Performance Considerations

### Processing Time

Typical processing times:
- Contact search: 200-500ms
- Contact creation: 300-800ms
- Lead creation: 400-1000ms
- UTM parameter addition: 200-400ms
- **Total: 1.1-2.7 seconds**

### Optimization Tips

1. **Batch Processing:** Future versions may support batch lead creation
2. **Caching:** Contact search results could be cached
3. **Async Processing:** Consider async processing for high-volume scenarios

## Security Considerations

1. **Token Security:**
   - Tokens stored with 0600 permissions
   - Automatic token refresh
   - Secure token file location

2. **Data Privacy:**
   - Sensitive data masked in logs
   - No PII stored in application logs
   - Secure API communication (HTTPS)

3. **Access Control:**
   - OAuth2 authentication required
   - API rate limiting
   - Request validation and sanitization

## Future Enhancements

1. **Webhook Support:** Real-time notifications for lead status changes
2. **Batch Processing:** Multiple lead creation in single request
3. **Advanced Filtering:** Contact search by multiple criteria
4. **Pipeline Integration:** Automatic lead pipeline assignment
5. **Task Creation:** Automatic task creation for follow-up
6. **Note Addition:** Add notes to leads and contacts
