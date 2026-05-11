# HR Management System - Deployment Guide

This guide will help you deploy the HR Management System to production and set up the database with seed data.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hr_management"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# App URL (for production)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Resend Email Configuration (for offer letters)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Optional - defaults to onboarding@resend.dev

# Optional: Slack Integration
SLACK_VERIFICATION_TOKEN="your-slack-token"
SLACK_WEBHOOK_URL="your-slack-webhook-url"
```

For detailed email setup instructions, see [RESEND_SETUP.md](RESEND_SETUP.md)

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE hr_management;
   ```

### Option 2: Cloud PostgreSQL (Recommended for Production)

#### Using Neon (Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file

#### Using Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

#### Using Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Run Database Seeding
```bash
npm run db:seed
```

## Production Deployment

### Using Vercel (Recommended)

1. **Connect your repository to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables from your `.env` file

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

4. **Run database setup on production**
   ```bash
   # Connect to your production database
   npx vercel env pull .env.production.local
   
   # Run migrations and seed
   npm run db:push
   npm run db:seed
   ```

### Using Railway

1. **Connect your repository to Railway**
2. **Add environment variables in Railway dashboard**
3. **Deploy automatically on push to main branch**
4. **Run database setup**
   ```bash
   # Connect to Railway shell
   railway shell
   
   # Run database setup
   npm run db:push
   npm run db:seed
   ```

### Using DigitalOcean App Platform

1. **Create a new app in DigitalOcean**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy**
5. **Run database setup via console**

## Database Commands

### Development
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run seed data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

### Production
```bash
# Deploy migrations
npm run db:migrate

# Run seed data
npm run db:seed
```

## Seed Data Information

The seed script creates the following data:

### Users Created:
- **Admin**: `admin@company.com` / `admin123`
- **HR Director**: `hr@company.com` / `hr123`
- **HR Assistant**: `hr.assistant@company.com` / `hr123`
- **Engineering Manager**: `engineering.manager@company.com` / `manager123`
- **Sales Manager**: `sales.manager@company.com` / `manager123`
- **8 Regular Employees**: Various roles and departments

### Sample Data:
- 13 employees across different departments
- Leave balances for all employees (Annual, Sick, Personal)
- Sample check-ins for the past week
- Sample leave requests (approved and pending)

## Security Notes

⚠️ **Important**: Change the default passwords after first login!

The seed data includes default passwords for demonstration. In production:

1. **Change admin password immediately**
2. **Change HR passwords**
3. **Have employees change their passwords on first login**
4. **Consider implementing password reset functionality**

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database (development only)
npm run db:reset
```

### Seed Script Errors
```bash
# Check if Prisma client is generated
npm run db:generate

# Run seed with verbose output
npx tsx prisma/seed.ts
```

### Production Deployment Issues
1. **Check environment variables** are set correctly
2. **Verify database connection** string
3. **Ensure JWT_SECRET** is set
4. **Check build logs** for any compilation errors

## Monitoring & Maintenance

### Database Backups
Set up regular backups for your PostgreSQL database:

```bash
# Example backup command
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Logs
Monitor application logs for errors and performance issues.

### Updates
Regularly update dependencies:
```bash
npm update
npm run db:generate
```

## Support

If you encounter any issues during deployment:

1. Check the troubleshooting section above
2. Review the application logs
3. Verify all environment variables are set correctly
4. Ensure database permissions are properly configured

## Default Login Credentials

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@company.com` | `admin123` |
| HR | `hr@company.com` | `hr123` |
| Manager | `engineering.manager@company.com` | `manager123` |
| Employee | `developer1@company.com` | `employee123` |

**Remember to change these passwords in production!**
