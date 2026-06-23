import { requestPasswordReset, resetPassword } from "@/lib/api/auth"
import { apiRequest } from "@/lib/api/client"

jest.mock("@/lib/api/client", () => ({
  apiRequest: jest.fn(),
}))

describe("auth API service", () => {
  const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>

  beforeEach(() => {
    apiRequestMock.mockReset()
    apiRequestMock.mockResolvedValue({ ok: true })
  })

  it("sends normalized email for password reset requests", async () => {
    await requestPasswordReset("  USER@Example.com ")

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/api/auth/forgot-password",
      expect.objectContaining({
        method: "POST",
        body: { email: "user@example.com" },
      }),
    )
  })

  it("throws when password reset email is missing", async () => {
    await expect(requestPasswordReset("   ")).rejects.toThrow("Email is required")
    expect(apiRequestMock).not.toHaveBeenCalled()
  })

  it("submits valid reset-password payload", async () => {
    await resetPassword(" token-value ", " password123 ")

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      expect.objectContaining({
        method: "POST",
        body: {
          token: "token-value",
          password: "password123",
        },
      }),
    )
  })

  it("rejects invalid reset-password inputs", async () => {
    await expect(resetPassword("", "password123")).rejects.toThrow("Missing token")
    await expect(resetPassword("token-value", "123")).rejects.toThrow(
      "Password must be at least 6 characters",
    )
    expect(apiRequestMock).not.toHaveBeenCalled()
  })
})
