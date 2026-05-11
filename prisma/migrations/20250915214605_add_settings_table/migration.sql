-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Your Company',
    "standardWorkHours" INTEGER NOT NULL DEFAULT 8,
    "annualLeaveDays" INTEGER NOT NULL DEFAULT 25,
    "slackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slackWebhookUrl" TEXT,
    "slackVerificationToken" TEXT,
    "slackChannel" TEXT DEFAULT '#hr-notifications',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 480,
    "passwordPolicy" TEXT NOT NULL DEFAULT 'Minimum 8 characters, must include uppercase, lowercase, number, and special character',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
