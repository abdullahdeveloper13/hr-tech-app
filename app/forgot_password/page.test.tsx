import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ForgotPasswordPage from "@/app/forgot_password/page"
import { resetPassword } from "@/lib/api/auth"
import { toast } from "sonner"

const pushMock = jest.fn()
let tokenValue = "token-123"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? tokenValue : null),
  }),
}))

jest.mock("@/lib/api/auth", () => ({
  resetPassword: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe("ForgotPasswordPage", () => {
  const resetPasswordMock = resetPassword as jest.MockedFunction<typeof resetPassword>
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    tokenValue = "token-123"
    pushMock.mockReset()
    resetPasswordMock.mockReset()
    ;(toast.error as jest.Mock).mockReset()
    ;(toast.success as jest.Mock).mockReset()
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("submits valid passwords and redirects to login", async () => {
    resetPasswordMock.mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/enter your new password/i), "password123")
    await user.type(screen.getByLabelText(/confirm your password/i), "password123")
    await user.click(screen.getByRole("button", { name: /change password/i }))

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith("token-123", "password123")
    })
    expect(toast.success).toHaveBeenCalledWith("Password changed. Redirecting to login...")
    expect(pushMock).toHaveBeenCalledWith("/login")
  })

  it("shows API errors without redirecting", async () => {
    resetPasswordMock.mockRejectedValue(new Error("Invalid or expired token"))

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/enter your new password/i), "password123")
    await user.type(screen.getByLabelText(/confirm your password/i), "password123")
    await user.click(screen.getByRole("button", { name: /change password/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid or expired token")
    })
    expect(pushMock).not.toHaveBeenCalled()
  })
})
