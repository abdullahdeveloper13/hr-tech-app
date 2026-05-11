import { apiRequest } from "@/lib/api/client"
import { isApiSuccessResponse } from "@/lib/api/types"

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export async function changeOwnPassword(payload: ChangePasswordPayload): Promise<void> {
  const currentPassword = payload.currentPassword.trim()
  const newPassword = payload.newPassword.trim()
  const confirmPassword = payload.confirmPassword.trim()

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required")
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters")
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirmation do not match")
  }

  await apiRequest("/api/auth/change-password", {
    method: "POST",
    body: {
      currentPassword,
      newPassword,
      confirmPassword,
    },
    validate: isApiSuccessResponse,
    errorMessage: "Failed to update password",
  })
}
