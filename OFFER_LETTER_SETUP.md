# Offer Letter Feature Setup

## Overview
The offer letter feature allows administrators and HR personnel to send professional offer letters to new employees via email.

## Features
- Professional HTML email templates
- Form-based offer letter creation
- Real-time preview functionality
- Support for placeholders in content
- Admin/HR role-based access control

## Setup Instructions

### 1. Resend Email Configuration
To enable email sending, configure Resend (a modern email API):

```env
# Resend Email Configuration
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Optional - defaults to onboarding@resend.dev
```

### 2. Getting Your Resend API Key

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to the **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "HR System Production")
5. Copy the API key and add it to your `.env` file

**Free Tier Includes:**
- 3,000 emails per month
- 100 emails per day
- No credit card required

### 3. Custom Domain (Optional but Recommended for Production)

For production use, add and verify your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain registrar
5. Wait for verification (usually a few minutes)
6. Use `noreply@yourdomain.com` or `hr@yourdomain.com` as your `RESEND_FROM_EMAIL`

**Note:** For testing, you can skip this step and use the default `onboarding@resend.dev` address.

For detailed setup instructions, see [RESEND_SETUP.md](RESEND_SETUP.md)

## Usage

### Accessing the Feature
1. Log in as an Admin or HR user
2. Navigate to "Offer Letter" in the sidebar menu
3. Fill out the candidate information form
4. Customize the offer letter content
5. Preview the letter before sending
6. Send the offer letter

### Form Fields
- **Candidate Name** (required): Full name of the candidate
- **Email Address** (required): Candidate's email address
- **Position** (required): Job title/position
- **Department** (required): Department the candidate will join
- **Start Date** (required): Employment start date
- **Salary** (optional): Annual salary amount
- **Reporting Manager** (optional): Direct supervisor's name
- **Offer Letter Content** (required): Main body of the offer letter

### Placeholders
You can use the following placeholders in your offer letter content:
- `[Position]` - Will be replaced with the job position
- `[Department]` - Will be replaced with the department name
- `[Company Name]` - Will be replaced with your company name
- `[Start Date]` - Will be replaced with the formatted start date

### Email Template
The system sends both HTML and plain text versions of the offer letter:
- Professional HTML design with company branding
- Responsive layout that works on all devices
- Clean, business-appropriate styling
- All offer details clearly displayed in a formatted section

## Security
- Only Admin and HR roles can access this feature
- Email addresses are validated before sending
- All form inputs are sanitized and validated
- Resend API credentials are stored securely as environment variables
- Never commit `.env` file to version control

## Troubleshooting

### Common Issues

**"Resend API key missing" Error**
- Make sure you've added `RESEND_API_KEY` to your `.env` file
- Restart your development server after adding environment variables
- Verify the API key is correct (starts with `re_`)

**Email Not Received**
- Check your spam/junk folder
- Verify the recipient email address is correct
- Check Resend dashboard for delivery status
- If using a custom domain, ensure DNS records are verified

**"Failed to send email" Error**
- Verify your API key is valid in the Resend dashboard
- Check if you've exceeded your monthly sending limit (3,000 for free tier)
- Review Resend dashboard for any account issues
- Ensure the "from" email address is from a verified domain (if using custom domain)

**Domain Verification Issues**
If you're adding your own domain:
1. Double-check DNS records in your domain registrar
2. Wait up to 48 hours for DNS propagation
3. Use the **Verify Domain** button in Resend dashboard
4. For testing, use the default `onboarding@resend.dev` instead

**"Invalid email format"**
- Ensure the candidate's email address is properly formatted
- Check for typos in the email address

### Testing
1. Use the preview feature to check the email format
2. Send a test offer letter to your own email first
3. Verify the email arrives in both inbox and spam folders

## File Structure
```
app/
├── api/
│   └── offer-letter/
│       └── route.ts          # API endpoint for sending emails
├── dashboard/
│   └── offer-letter/
│       └── page.tsx          # Main offer letter page
components/
└── sidebar.tsx               # Updated with offer letter menu item
```

## Dependencies
- `resend` - Modern email API for sending emails

The feature is now ready to use! Make sure to configure your Resend API key before sending offer letters.

## Getting Started

1. Sign up for Resend at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to your `.env` file
4. (Optional) Add and verify your custom domain
5. Test the configuration using the test email feature
6. Start sending offer letters!

See [RESEND_SETUP.md](RESEND_SETUP.md) for detailed setup instructions.
