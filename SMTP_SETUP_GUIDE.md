# SMTP Setup Guide - Fix "Greeting never received" Error

## Current Issue
You're getting the error: `Greeting never received ETIMEDOUT` because SMTP configuration is missing.

## Solution Steps

### Step 1: Open your `.env` file
Your `.env` file is located at: `D:\Development\hr-021\.env`

### Step 2: Add SMTP Configuration
Add these lines to your `.env` file:

```env
# SMTP Configuration for Email Sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 3: Gmail App Password Setup

#### For Gmail Users:
1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" as the app
   - Copy the generated 16-character password
   - Use this password in `SMTP_PASS` (NOT your regular Gmail password)

#### For Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Step 4: Restart Development Server
After adding the environment variables:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Configuration
1. Go to the Offer Letter page in your HR system
2. Click "Test Email Configuration" button
3. It will show you if the configuration is working

## Example .env File
Your complete `.env` file should look like this:

```env
# Database
DATABASE_URL="your-database-url"

# JWT Secret
JWT_SECRET="your-jwt-secret"

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd-efgh-ijkl-mnop
```

## Common Issues & Solutions

### Issue: "Greeting never received"
**Solution**: SMTP credentials not configured or incorrect

### Issue: "Invalid login"
**Solution**: Wrong password - use App Password for Gmail

### Issue: "Connection refused"
**Solution**: Check firewall or network settings

### Issue: "Authentication failed"
**Solution**: Enable 2FA and use App Password

## Quick Test
After configuration, the test button will show:
- ✅ "Connection: ✓ Connected successfully" - Configuration is working
- ❌ "Connection: ✗ Connection failed" - Check your credentials

## Need Help?
1. Make sure you're using an App Password (not regular password) for Gmail
2. Ensure 2-factor authentication is enabled
3. Check that your `.env` file is in the project root directory
4. Restart your development server after making changes
