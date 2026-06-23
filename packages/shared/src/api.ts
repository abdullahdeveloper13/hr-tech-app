import { z } from "zod"

export type JsonRecord = Record<string, unknown>

export interface ApiSuccessResponse {
  ok: true
}

export const apiSuccessSchema = z.object({
  ok: z.literal(true),
})

export const settingsSchema = z.object({
  id: z.number().finite(),
  companyName: z.string(),
  standardWorkHours: z.number().finite(),
  annualLeaveDays: z.number().finite(),
  slackEnabled: z.boolean(),
  slackWebhookUrl: z.string().nullable().optional(),
  slackVerificationToken: z.string().nullable().optional(),
  slackChannel: z.string().nullable().optional(),
  emailNotifications: z.boolean(),
  sessionTimeout: z.number().finite(),
  passwordPolicy: z.string(),
})

export type SettingsData = z.infer<typeof settingsSchema>

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

export function isApiSuccessResponse(value: unknown): value is ApiSuccessResponse {
  return apiSuccessSchema.safeParse(value).success
}

export function isSettingsData(value: unknown): value is SettingsData {
  return settingsSchema.safeParse(value).success
}
