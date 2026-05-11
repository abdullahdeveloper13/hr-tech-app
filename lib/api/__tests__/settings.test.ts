import { getSettings, updateSettings } from "@/lib/api/settings"
import { apiRequest } from "@/lib/api/client"
import type { SettingsData, SettingsUpdatePayload } from "@/lib/api/types"

jest.mock("@/lib/api/client", () => ({
  apiRequest: jest.fn(),
}))

const mockSettings: SettingsData = {
  id: 1,
  companyName: "Zero to One",
  standardWorkHours: 8,
  annualLeaveDays: 25,
  slackEnabled: false,
  slackWebhookUrl: "",
  slackVerificationToken: "",
  slackChannel: "#hr-notifications",
  emailNotifications: true,
  sessionTimeout: 480,
  passwordPolicy:
    "Minimum 8 characters, must include uppercase, lowercase, number, and special character",
}

const basePayload: SettingsUpdatePayload = {
  companyName: "Zero to One",
  standardWorkHours: 8,
  annualLeaveDays: 25,
  slackEnabled: false,
  slackWebhookUrl: "",
  slackVerificationToken: "",
  slackChannel: "#hr-notifications",
  emailNotifications: true,
  sessionTimeout: 480,
  passwordPolicy:
    "Minimum 8 characters, must include uppercase, lowercase, number, and special character",
}

describe("settings API service", () => {
  const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>

  beforeEach(() => {
    apiRequestMock.mockReset()
    apiRequestMock.mockResolvedValue(mockSettings)
  })

  it("fetches settings through the shared API client", async () => {
    const response = await getSettings()

    expect(response).toEqual(mockSettings)
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/api/settings",
      expect.objectContaining({
        method: "GET",
      }),
    )
  })

  it("validates required fields before submitting updates", async () => {
    const invalidPayload = {
      ...basePayload,
      companyName: "   ",
    }

    await expect(updateSettings(invalidPayload)).rejects.toThrow(
      "Company name is required",
    )
    expect(apiRequestMock).not.toHaveBeenCalled()
  })

  it("normalizes payload values before update", async () => {
    const payload: SettingsUpdatePayload = {
      companyName: "  Zero to One HR  ",
      standardWorkHours: 9,
      annualLeaveDays: 30,
      slackEnabled: true,
      slackWebhookUrl: "  https://hooks.slack.com/test  ",
      slackVerificationToken: " token-1 ",
      slackChannel: "  #general ",
      emailNotifications: false,
      sessionTimeout: 300,
      passwordPolicy: "  Strong passwords only  ",
    }

    await updateSettings(payload)

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/api/settings",
      expect.objectContaining({
        method: "PUT",
        body: {
          companyName: "Zero to One HR",
          standardWorkHours: 9,
          annualLeaveDays: 30,
          slackEnabled: true,
          slackWebhookUrl: "https://hooks.slack.com/test",
          slackVerificationToken: "token-1",
          slackChannel: "#general",
          emailNotifications: false,
          sessionTimeout: 300,
          passwordPolicy: "Strong passwords only",
        },
      }),
    )
  })

  it("rejects out-of-range settings values", async () => {
    await expect(
      updateSettings({
        ...basePayload,
        standardWorkHours: 30,
      }),
    ).rejects.toThrow("Standard work hours must be between 1 and 24")

    await expect(
      updateSettings({
        ...basePayload,
        sessionTimeout: 10,
      }),
    ).rejects.toThrow("Session timeout must be between 30 and 1440 minutes")
  })
})
