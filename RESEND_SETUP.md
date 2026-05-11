# Resend Email Setup Guide

This application uses [Resend](https://resend.com) for sending emails. Resend is a modern, reliable email API that's much simpler than configuring SMTP servers.

## Why Resend?

- ✅ Simple API - no complex SMTP configuration
- ✅ Free tier includes 3,000 emails/month
- ✅ Great deliverability and uptime
- ✅ Easy to set up and use
- ✅ Built-in email testing and monitoring

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "HR System Production")
5. Copy the API key (it will only be shown once!)

### 3. Add Domain (Optional but Recommended)

For production use, you should add and verify your own domain:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your domain registrar
5. Wait for verification (usually takes a few minutes)

**Note:** For testing, you can use the default `onboarding@resend.dev` email address, but for production, you should use your own verified domain.

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Important:**
- `RESEND_API_KEY`: Your Resend API key (required)
- `RESEND_FROM_EMAIL`: The "from" email address (optional - defaults to `onboarding@resend.dev`)
  - If using your own domain, use an email like `noreply@yourdomain.com`
  - If using the default, omit this variable or leave it empty

### 5. Test Your Configuration

1. Log in to your HR system as an Admin or HR user
2. Navigate to **Offer Letter** page
3. Scroll down to **Email Configuration Test**
4. Enter a test email address
5. Click **Test Email Configuration**
6. Check your inbox for the test email

## Usage Examples

### Default Configuration (Testing)
```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# No RESEND_FROM_EMAIL needed - will use onboarding@resend.dev
```

### Production Configuration (With Custom Domain)
```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="hr@yourdomain.com"
```

## Troubleshooting

### "Resend API key missing" Error
- Make sure you've added `RESEND_API_KEY` to your `.env` file
- Restart your development server after adding environment variables
- Verify the API key is correct (no extra spaces or quotes)

### Email Not Received
- Check your spam/junk folder
- Verify the recipient email address is correct
- Check Resend dashboard for delivery status
- If using a custom domain, ensure DNS records are verified

### "Failed to send email" Error
- Verify your API key is valid
- Check if you've exceeded your monthly sending limit
- Review Resend dashboard for any account issues
- Ensure the "from" email address is from a verified domain (if using custom domain)

### Domain Verification Issues
If you're adding your own domain:
1. Double-check DNS records in your domain registrar
2. Wait up to 48 hours for DNS propagation
3. Use the **Verify Domain** button in Resend dashboard
4. Check Resend documentation for domain-specific issues

## Resend Features

### Email Dashboard
- View all sent emails
- Check delivery status
- See open and click rates
- Debug failed emails

### Testing
- Test emails using `onboarding@resend.dev`
- No domain verification needed for testing
- Switch to custom domain for production

### Rate Limits

**Free Tier:**
- 3,000 emails per month
- 100 emails per day

**Paid Plans:**
- Higher limits based on your plan
- Custom domains included
- Priority support

## Migration from SMTP

The following environment variables are **NO LONGER NEEDED**:
- ~~`SMTP_HOST`~~
- ~~`SMTP_PORT`~~
- ~~`SMTP_USER`~~
- ~~`SMTP_PASS`~~

You can safely remove these from your `.env` file.

## Support

If you encounter any issues:

1. Check the [Resend documentation](https://resend.com/docs)
2. Visit the [Resend status page](https://status.resend.com)
3. Contact Resend support through their dashboard
4. Check the troubleshooting section above

## Security Best Practices

- ✅ Never commit your API key to version control
- ✅ Keep `.env` file in `.gitignore`
- ✅ Use different API keys for development and production
- ✅ Rotate API keys periodically
- ✅ Use domain verification for production emails

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/dashboard)
- [Node.js SDK Documentation](https://resend.com/docs/send-with-nodejs)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

