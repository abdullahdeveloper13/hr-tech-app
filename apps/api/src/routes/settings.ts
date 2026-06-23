import { Router } from "express"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

router.get(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (_req: AuthenticatedRequest, res) => {
    let settings = await prisma.settings.findFirst()

    if (!settings) {
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

    res.json(settings)
  }),
)

router.put(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
    } = req.body as Record<string, unknown>

    const safeCompanyName = typeof companyName === "string" ? companyName.trim() : ""
    const safeWorkHours = Number(standardWorkHours)
    const safeLeaveDays = Number(annualLeaveDays)
    const safeSessionTimeout = Number(sessionTimeout)
    const safePasswordPolicy =
      typeof passwordPolicy === "string" && passwordPolicy.trim()
        ? passwordPolicy.trim()
        : "Minimum 8 characters, must include uppercase, lowercase, number, and special character"

    if (!safeCompanyName || !Number.isFinite(safeWorkHours) || !Number.isFinite(safeLeaveDays)) {
      throw new HttpError("Required fields missing", 400)
    }

    if (safeWorkHours < 1 || safeWorkHours > 24) {
      throw new HttpError("Standard work hours must be between 1 and 24", 400)
    }

    if (safeLeaveDays < 0 || safeLeaveDays > 365) {
      throw new HttpError("Annual leave days must be between 0 and 365", 400)
    }

    if (!Number.isFinite(safeSessionTimeout) || safeSessionTimeout < 30 || safeSessionTimeout > 1440) {
      throw new HttpError("Session timeout must be between 30 and 1440 minutes", 400)
    }

    let settings = await prisma.settings.findFirst()

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          companyName: safeCompanyName,
          standardWorkHours: safeWorkHours,
          annualLeaveDays: safeLeaveDays,
          slackEnabled: Boolean(slackEnabled),
          slackWebhookUrl: typeof slackWebhookUrl === "string" ? slackWebhookUrl.trim() || null : null,
          slackVerificationToken:
            typeof slackVerificationToken === "string" ? slackVerificationToken.trim() || null : null,
          slackChannel:
            typeof slackChannel === "string" && slackChannel.trim() ? slackChannel.trim() : "#hr-notifications",
          emailNotifications: typeof emailNotifications === "boolean" ? emailNotifications : true,
          sessionTimeout: safeSessionTimeout,
          passwordPolicy: safePasswordPolicy,
        },
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          companyName: safeCompanyName,
          standardWorkHours: safeWorkHours,
          annualLeaveDays: safeLeaveDays,
          slackEnabled: Boolean(slackEnabled),
          slackWebhookUrl: typeof slackWebhookUrl === "string" ? slackWebhookUrl.trim() || null : null,
          slackVerificationToken:
            typeof slackVerificationToken === "string" ? slackVerificationToken.trim() || null : null,
          slackChannel:
            typeof slackChannel === "string" && slackChannel.trim() ? slackChannel.trim() : "#hr-notifications",
          emailNotifications: typeof emailNotifications === "boolean" ? emailNotifications : true,
          sessionTimeout: safeSessionTimeout,
          passwordPolicy: safePasswordPolicy,
        },
      })
    }

    res.json(settings)
  }),
)

export const settingsRouter = router
