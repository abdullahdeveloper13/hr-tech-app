import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { jsonError } from "@/lib/api/route-utils"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "no-reply@example.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "change_me"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string }
    const normalizedEmail = email?.trim().toLowerCase()
    if (!normalizedEmail) return jsonError("Missing email", 400)

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    // Respond success even if user not found (prevent enumeration)
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing")
      return jsonError("Email service is not configured", 500)
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    )

    const resetUrl = `${APP_URL}/forgot_password?token=${encodeURIComponent(token)}`

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: normalizedEmail,
        subject: "Reset your password",
        html: `
          <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.4;">
            <h2>Reset your password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
            <p>If you did not request this, you can ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Resend error:", text)
      return jsonError("Failed to send email", 500)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("forgot-password error:", err)
    return jsonError("Internal server error", 500)
  }
}
