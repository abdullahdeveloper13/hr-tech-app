import { apiRequest } from "@/lib/api/client"
import { isApiSuccessResponse } from "@/lib/api/types"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    throw new Error("Email is required")
  }

  await apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: { email: normalizedEmail },
    validate: isApiSuccessResponse,
    errorMessage: "Failed to send reset email",
  })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const normalizedToken = token.trim()
  const normalizedPassword = password.trim()

  if (!normalizedToken) {
    throw new Error("Missing token")
  }

  if (!normalizedPassword || normalizedPassword.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  await apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: {
      token: normalizedToken,
      password: normalizedPassword,
    },
    validate: isApiSuccessResponse,
    errorMessage: "Failed to reset password",
  })
}
