import { Router } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, type AuthenticatedRequest, requireRole } from "../middleware/auth"
import { signResetToken, signToken, verifyToken } from "../auth/jwt"
import { parseDate, parseInteger } from "../utils/route-utils"
import { Role } from "@prisma/client"

const router = Router()

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role)
}

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string }
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      throw new HttpError("Email and password are required", 400)
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { employee: true },
    })

    if (!user) {
      throw new HttpError("Invalid credentials", 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new HttpError("Invalid credentials", 401)
    }

    const token = signToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    })

    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
      token,
    })
  }),
)

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    res.cookie("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })
    res.json({ message: "Logged out successfully" })
  }),
)

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const currentUser = req.user
    if (!currentUser) {
      throw new HttpError("Unauthorized", 401)
    }

    const userId = parseInteger(currentUser.userId)
    if (userId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    })

    if (!user) {
      throw new HttpError("User not found", 404)
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    })
  }),
)

router.post(
  "/change-password",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const currentUser = req.user
    if (!currentUser?.email) {
      throw new HttpError("Unauthorized", 401)
    }

    const { currentPassword, newPassword, confirmPassword } = req.body as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }

    const safeCurrent = currentPassword?.trim() ?? ""
    const safeNew = newPassword?.trim() ?? ""
    const safeConfirm = confirmPassword?.trim() ?? ""

    if (!safeCurrent || !safeNew || !safeConfirm) {
      throw new HttpError("All password fields are required", 400)
    }

    if (safeNew.length < 6) {
      throw new HttpError("New password must be at least 6 characters", 400)
    }

    if (safeNew !== safeConfirm) {
      throw new HttpError("New password and confirmation do not match", 400)
    }

    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
      select: { id: true, password: true },
    })

    if (!user) {
      throw new HttpError("User not found", 404)
    }

    const valid = await bcrypt.compare(safeCurrent, user.password)
    if (!valid) {
      throw new HttpError("Current password is incorrect", 400)
    }

    const hashed = await bcrypt.hash(safeNew, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    res.json({ ok: true, message: "Password updated successfully" })
  }),
)

router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string }
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail) {
      throw new HttpError("Missing email", 400)
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      res.json({ ok: true })
      return
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      throw new HttpError("Email service is not configured", 500)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const token = signResetToken({ userId: user.id.toString(), email: user.email, role: user.role })
    const resetUrl = `${appUrl}/forgot_password?token=${encodeURIComponent(token)}`

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "no-reply@example.com",
        to: normalizedEmail,
        subject: "Reset your password",
        html: `\n          <div style=\"font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.4;\">\n            <h2>Reset your password</h2>\n            <p>Click the button below to reset your password. This link expires in 1 hour.</p>\n            <a href=\"${resetUrl}\" style=\"display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none;\">Reset Password</a>\n            <p>If you did not request this, you can ignore this email.</p>\n          </div>\n        `,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Resend error:", text)
      throw new HttpError("Failed to send email", 500)
    }

    res.json({ ok: true })
  }),
)

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, password } = req.body as { token?: string; password?: string }
    if (!token || !password) {
      throw new HttpError("Missing token or password", 400)
    }

    const trimmedPassword = password.trim()
    if (trimmedPassword.length < 6) {
      throw new HttpError("Password must be at least 6 characters", 400)
    }

    const payload = verifyToken(token)
    if (!payload) {
      throw new HttpError("Invalid or expired token", 400)
    }

    const userId = parseInteger(payload.userId)
    if (userId === null) {
      throw new HttpError("User not found", 404)
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new HttpError("User not found", 404)
    }

    const hashed = await bcrypt.hash(trimmedPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    res.json({ ok: true })
  }),
)

router.post(
  "/register",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      email,
      password,
      firstName,
      lastName,
      department,
      position,
      employeeId,
      hireDate,
      role = Role.EMPLOYEE,
    } = req.body as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      department?: string
      position?: string
      employeeId?: number | string
      hireDate?: string
      role?: string
    }

    if (!email || !password || !firstName || !lastName || !department || !position || !employeeId) {
      throw new HttpError("All required fields must be provided", 400)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedRole = role.toUpperCase()
    if (!isValidRole(normalizedRole)) {
      throw new HttpError("Invalid role", 400)
    }

    const parsedEmployeeId = parseInteger(String(employeeId))
    if (parsedEmployeeId === null) {
      throw new HttpError("Invalid employeeId", 400)
    }

    const parsedHireDate = parseDate(hireDate)
    if (!parsedHireDate) {
      throw new HttpError("Invalid hireDate", 400)
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      throw new HttpError("User already exists", 409)
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { employeeId: parsedEmployeeId } })
    if (existingEmployee) {
      throw new HttpError("Employee ID already exists", 409)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: normalizedRole,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: parsedEmployeeId,
          firstName,
          lastName,
          department,
          position,
          hireDate: parsedHireDate,
        },
      })

      return { user, employee }
    })

    res.status(201).json({
      message: "Employee registered successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        employee: result.employee,
      },
    })
  }),
)

export const authRouter = router
