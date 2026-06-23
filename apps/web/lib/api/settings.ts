import { apiRequest } from "@/lib/api/client"
import { isSettingsData, type SettingsData, type SettingsUpdatePayload } from "@/lib/api/types"

function ensureFiniteNumber(value: unknown, label: string): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    throw new Error(`${label} must be a valid number`)
  }
  return numericValue
}

function normalizeSettingsPayload(payload: SettingsUpdatePayload): SettingsUpdatePayload {
  const normalized: SettingsUpdatePayload = {
    companyName: payload.companyName.trim(),
    standardWorkHours: ensureFiniteNumber(payload.standardWorkHours, "Standard work hours"),
    annualLeaveDays: ensureFiniteNumber(payload.annualLeaveDays, "Annual leave days"),
    slackEnabled: Boolean(payload.slackEnabled),
    slackWebhookUrl: payload.slackWebhookUrl?.trim() ?? "",
    slackVerificationToken: payload.slackVerificationToken?.trim() ?? "",
    slackChannel: payload.slackChannel?.trim() ?? "#hr-notifications",
    emailNotifications: Boolean(payload.emailNotifications),
    sessionTimeout: ensureFiniteNumber(payload.sessionTimeout, "Session timeout"),
    passwordPolicy: payload.passwordPolicy.trim(),
  }

  if (!normalized.companyName) {
    throw new Error("Company name is required")
  }

  if (normalized.standardWorkHours < 1 || normalized.standardWorkHours > 24) {
    throw new Error("Standard work hours must be between 1 and 24")
  }

  if (normalized.annualLeaveDays < 0 || normalized.annualLeaveDays > 365) {
    throw new Error("Annual leave days must be between 0 and 365")
  }

  if (normalized.sessionTimeout < 30 || normalized.sessionTimeout > 1440) {
    throw new Error("Session timeout must be between 30 and 1440 minutes")
  }

  if (!normalized.passwordPolicy) {
    throw new Error("Password policy is required")
  }

  return normalized
}

export async function getSettings(): Promise<SettingsData> {
  return apiRequest("/api/settings", {
    method: "GET",
    validate: isSettingsData,
    errorMessage: "Failed to fetch settings",
  })
}

export async function updateSettings(payload: SettingsUpdatePayload): Promise<SettingsData> {
  const normalizedPayload = normalizeSettingsPayload(payload)

  return apiRequest("/api/settings", {
    method: "PUT",
    body: normalizedPayload,
    validate: isSettingsData,
    errorMessage: "Failed to save settings",
  })
}
