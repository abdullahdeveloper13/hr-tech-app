#!/bin/bash

# HR Management System Setup Script
# This script automates the setup process for both development and production

set -e

echo "🚀 HR Management System Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hr_management"

# JWT Secret (generate a secure random string)
JWT_SECRET="$(openssl rand -base64 32)"

# App URL (for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Slack Integration
SLACK_VERIFICATION_TOKEN="your-slack-token"
SLACK_WEBHOOK_URL="your-slack-webhook-url"
EOF
    echo "📝 Created .env template. Please update with your actual values."
    echo "   You can now run this script again after updating .env"
    exit 0
fi

echo "✅ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env || grep -q "username:password" .env; then
    echo "❌ Please update DATABASE_URL in .env file with your actual database connection string"
    exit 1
fi

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

# Run seed data
echo "🌱 Running database seeding..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Login with admin@company.com / admin123"
echo ""
echo "🔐 Security reminder: Change default passwords after first login!"
echo ""
echo "📚 For production deployment, see DEPLOYMENT.md"
