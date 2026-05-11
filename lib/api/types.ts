export type JsonRecord = Record<string, unknown>

export interface ApiSuccessResponse {
  ok: true
}

export interface SettingsData {
  id: number
  companyName: string
  standardWorkHours: number
  annualLeaveDays: number
  slackEnabled: boolean
  slackWebhookUrl?: string | null
  slackVerificationToken?: string | null
  slackChannel?: string | null
  emailNotifications: boolean
  sessionTimeout: number
  passwordPolicy: string
}

export interface SettingsUpdatePayload {
  companyName: string
  standardWorkHours: number
  annualLeaveDays: number
  slackEnabled: boolean
  slackWebhookUrl?: string
  slackVerificationToken?: string
  slackChannel?: string
  emailNotifications: boolean
  sessionTimeout: number
  passwordPolicy: string
}

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string"
}

export function isApiSuccessResponse(value: unknown): value is ApiSuccessResponse {
  return isRecord(value) && value.ok === true
}

export function isSettingsData(value: unknown): value is SettingsData {
  if (!isRecord(value)) {
    return false
  }

  return (
    isFiniteNumber(value.id) &&
    typeof value.companyName === "string" &&
    isFiniteNumber(value.standardWorkHours) &&
    isFiniteNumber(value.annualLeaveDays) &&
    typeof value.slackEnabled === "boolean" &&
    isOptionalString(value.slackWebhookUrl) &&
    isOptionalString(value.slackVerificationToken) &&
    isOptionalString(value.slackChannel) &&
    typeof value.emailNotifications === "boolean" &&
    isFiniteNumber(value.sessionTimeout) &&
    typeof value.passwordPolicy === "string"
  )
}
