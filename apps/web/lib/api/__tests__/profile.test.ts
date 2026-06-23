import { changeOwnPassword } from "@/lib/api/profile"
import { apiRequest } from "@/lib/api/client"

jest.mock("@/lib/api/client", () => ({
  apiRequest: jest.fn(),
}))

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe("changeOwnPassword", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset()
  })

  it("calls change password API for valid payload", async () => {
    mockedApiRequest.mockResolvedValue({ ok: true } as never)

    await changeOwnPassword({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    })

    expect(mockedApiRequest).toHaveBeenCalledWith("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: "oldpass123",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      },
      validate: expect.any(Function),
      errorMessage: "Failed to update password",
    })
  })

  it("throws when fields are missing", async () => {
    await expect(
      changeOwnPassword({
        currentPassword: "",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      }),
    ).rejects.toThrow("All password fields are required")
  })

  it("throws when password is too short", async () => {
    await expect(
      changeOwnPassword({
        currentPassword: "oldpass123",
        newPassword: "123",
        confirmPassword: "123",
      }),
    ).rejects.toThrow("New password must be at least 6 characters")
  })

  it("throws when confirmation does not match", async () => {
    await expect(
      changeOwnPassword({
        currentPassword: "oldpass123",
        newPassword: "newpass123",
        confirmPassword: "different",
      }),
    ).rejects.toThrow("New password and confirmation do not match")
  })
})
