# Tech-021 SMTP Configuration

## Your SMTP Settings (from your email provider)

Based on your email configuration, here are the correct settings:

### SMTP Configuration for tech-021.com

```env
# SMTP Configuration for tech-021.com
SMTP_HOST=tech-021.com
SMTP_PORT=465
SMTP_USER=hiring@tech-021.com
SMTP_PASS=your-email-password
```

### Important Notes:

1. **Port 465**: This requires SSL/TLS encryption (secure: true)
2. **Custom Domain**: You're using tech-021.com, not Gmail
3. **Username**: hiring@tech-021.com
4. **Password**: Use your actual email account password (not an app password)

## Add to your .env file:

```env
# Database (add your actual database URL)
DATABASE_URL="your-database-connection-string"

# JWT Secret (add your actual JWT secret)
JWT_SECRET="your-jwt-secret-key"

# SMTP Configuration for tech-021.com
SMTP_HOST=tech-021.com
SMTP_PORT=465
SMTP_USER=hiring@tech-021.com
SMTP_PASS=your-actual-email-password
```

## Why it wasn't working:

1. **Wrong Host**: Was trying to connect to smtp.gmail.com instead of tech-021.com
2. **Wrong Port**: Was using port 587 instead of 465
3. **Wrong Security**: Was using secure: false instead of secure: true
4. **Missing TLS Config**: Your server might need TLS configuration

## After updating your .env file:

1. **Restart your development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test the configuration**:
   - Go to Offer Letter page
   - Click "Test Email Configuration"
   - Should now show "✓ Connected successfully"

## If you still get errors:

1. **Check your password**: Make sure it's the correct password for hiring@tech-021.com
2. **Check firewall**: Your network might be blocking port 465
3. **Contact your email provider**: They might have additional security requirements

The configuration is now updated to match your actual email server settings!
