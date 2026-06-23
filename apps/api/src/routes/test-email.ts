import { Router } from "express"
import { Resend } from "resend"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { testEmail } = req.body as { testEmail?: string }

    if (!testEmail) {
      throw new HttpError("Test email address is required", 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      throw new HttpError("Invalid email format", 400)
    }

    if (!process.env.RESEND_API_KEY) {
      res.status(500).json({
        error: "Resend API key missing. Please configure RESEND_API_KEY environment variable.",
        details: {
          RESEND_API_KEY: "✗ Missing",
          RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ? "✓ Configured" : "Using default",
        },
      })
      return
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      const { data, error: resendError } = await resend.emails.send({
        from: `Tech-021 HR System <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: testEmail,
        subject: "Email Configuration Test - HR System",
        text: `This is a test email from your HR system.\n\nIf you received this email, your email configuration is working correctly!\n\nTest sent at: ${new Date().toLocaleString()}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${process.env.LOGO_URL || "https://tech-021.com/021-logo.png"}" alt="Company Logo" style="max-width: 150px; height: auto;" />
          </div>
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email from your HR system.</p>
          <p style="color: green; font-weight: bold;">✓ If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Test sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
      })

      if (resendError) {
        throw new Error(resendError.message || "Failed to send test email")
      }

      res.json({
        message: "Test email sent successfully!",
        status: "success",
        connectionStatus: "✓ Connected successfully",
        details: {
          provider: "Resend",
          fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          testEmail,
          emailId: data?.id,
          sentAt: new Date().toISOString(),
        },
      })
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : "Failed to send test email"
      res.status(500).json({
        error: errorMessage,
        connectionStatus: "✗ Connection failed",
        details: {
          provider: "Resend",
          fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          toEmail: testEmail,
          error: sendError instanceof Error ? sendError.message : "Unknown error",
        },
      })
    }
  }),
)

export const testEmailRouter = router
