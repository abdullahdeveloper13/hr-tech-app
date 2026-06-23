import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError } from "@/lib/api/route-utils"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN and HR to view settings
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    // Get or create settings
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          companyName: "Your Company",
          standardWorkHours: 8,
          annualLeaveDays: 25,
          slackEnabled: false,
          emailNotifications: true,
          sessionTimeout: 480,
          passwordPolicy: "Minimum 8 characters, must include uppercase, lowercase, number, and special character",
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Get settings error:", error)
    return jsonError("Internal server error", 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN and HR to update settings
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    const body = await request.json()
    const {
      companyName,
      standardWorkHours,
      annualLeaveDays,
      slackEnabled,
      slackWebhookUrl,
      slackVerificationToken,
      slackChannel,
      emailNotifications,
      sessionTimeout,
      passwordPolicy,
    } = body as Record<string, unknown>

    const safeCompanyName = typeof companyName === "string" ? companyName.trim() : ""
    const safeWorkHours = Number(standardWorkHours)
    const safeLeaveDays = Number(annualLeaveDays)
    const safeSessionTimeout = Number(sessionTimeout)
    const safePasswordPolicy =
      typeof passwordPolicy === "string" && passwordPolicy.trim()
        ? passwordPolicy.trim()
        : "Minimum 8 characters, must include uppercase, lowercase, number, and special character"

    // Validate required fields
    if (!safeCompanyName || !Number.isFinite(safeWorkHours) || !Number.isFinite(safeLeaveDays)) {
      return jsonError("Required fields missing", 400)
    }

    // Validate numeric values
    if (safeWorkHours < 1 || safeWorkHours > 24) {
      return jsonError("Standard work hours must be between 1 and 24", 400)
    }

    if (safeLeaveDays < 0 || safeLeaveDays > 365) {
      return jsonError("Annual leave days must be between 0 and 365", 400)
    }

    if (!Number.isFinite(safeSessionTimeout) || safeSessionTimeout < 30 || safeSessionTimeout > 1440) {
      return jsonError("Session timeout must be between 30 and 1440 minutes", 400)
    }

    // Get or create settings
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          companyName: safeCompanyName,
          standardWorkHours: safeWorkHours,
          annualLeaveDays: safeLeaveDays,
          slackEnabled: Boolean(slackEnabled),
          slackWebhookUrl: typeof slackWebhookUrl === "string" ? slackWebhookUrl.trim() || null : null,
          slackVerificationToken: typeof slackVerificationToken === "string" ? slackVerificationToken.trim() || null : null,
          slackChannel: typeof slackChannel === "string" && slackChannel.trim() ? slackChannel.trim() : "#hr-notifications",
          emailNotifications: typeof emailNotifications === "boolean" ? emailNotifications : true,
          sessionTimeout: safeSessionTimeout,
          passwordPolicy: safePasswordPolicy,
        },
      })
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          companyName: safeCompanyName,
          standardWorkHours: safeWorkHours,
          annualLeaveDays: safeLeaveDays,
          slackEnabled: Boolean(slackEnabled),
          slackWebhookUrl: typeof slackWebhookUrl === "string" ? slackWebhookUrl.trim() || null : null,
          slackVerificationToken: typeof slackVerificationToken === "string" ? slackVerificationToken.trim() || null : null,
          slackChannel: typeof slackChannel === "string" && slackChannel.trim() ? slackChannel.trim() : "#hr-notifications",
          emailNotifications: typeof emailNotifications === "boolean" ? emailNotifications : true,
          sessionTimeout: safeSessionTimeout,
          passwordPolicy: safePasswordPolicy,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Update settings error:", error)
    return jsonError("Internal server error", 500)
  }
}
