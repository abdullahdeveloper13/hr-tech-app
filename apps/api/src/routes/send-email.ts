import { Router } from "express"
import { Resend } from "resend"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"

interface Recipient {
  id: string
  name: string
  email: string
}

interface EmailRequest {
  recipients: Recipient[]
  subject: string
  message: string
}

const router = Router()

router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = req.body as EmailRequest

    if (!body.recipients || body.recipients.length === 0) {
      throw new HttpError("At least one recipient is required", 400)
    }

    if (!body.subject || !body.subject.trim()) {
      throw new HttpError("Subject is required", 400)
    }

    if (!body.message || !body.message.trim()) {
      throw new HttpError("Message is required", 400)
    }

    if (!process.env.RESEND_API_KEY) {
      throw new HttpError("Email service is not configured. Please contact your administrator.", 500)
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    const htmlTemplate = generateEmailHTML(body.message, body.subject)

    const emailPromises = body.recipients.map((recipient) => {
      return resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject: body.subject,
        html: htmlTemplate,
        replyTo: process.env.RESEND_REPLY_TO_EMAIL || "hr@tech-021.com",
      })
    })

    const results = await Promise.all(emailPromises)

    const failures = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.error)
    const successes = results.filter((result) => !result.error)

    if (failures.length > 0) {
      res.status(207).json({
        error: `Failed to send ${failures.length} email(s), ${successes.length} sent successfully`,
        details: failures.map(({ result, index }) => ({
          email: body.recipients[index].email,
          error: result.error?.message,
        })),
        sentCount: successes.length,
      })
      return
    }

    res.json({
      success: true,
      message: `Email sent successfully to ${body.recipients.length} recipient(s)`,
      sentCount: successes.length,
      recipients: body.recipients.map((r) => r.email),
    })
  }),
)

function generateEmailHTML(message: string, subject: string): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(subject)}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f5f5;
        padding: 20px;
      }
      .email-container {
        background-color: white;
        max-width: 700px;
        margin: 0 auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #000;
        padding: 40px;
        text-align: center;
      }
      .logo-container {
        background-color: white;
        padding: 15px;
        border-radius: 8px;
        display: inline-block;
        margin-bottom: 15px;
      }
      .logo {
        max-width: 100px;
        height: auto;
        display: block;
      }
      .company-name {
        color: white;
        font-size: 28px;
        font-weight: bold;
        margin-top: 15px;
      }
      .content {
        padding: 40px;
      }
      .subject {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #000;
      }
      .message {
        font-size: 16px;
        line-height: 1.8;
        color: #333;
        margin-bottom: 30px;
        white-space: pre-wrap;
      }
      .footer {
        border-top: 1px solid #eee;
        padding-top: 20px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      .date {
        color: #999;
        font-size: 12px;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <div class="logo-container">
          <img src="${process.env.LOGO_URL || "https://tech-021.com/021-logo.png"}" alt="Logo" class="logo" />
        </div>
        <div class="company-name">Zero to One</div>
      </div>
      <div class="content">
        <div class="subject">${escapeHtml(subject)}</div>
        <div class="message">${escapeHtml(message)}</div>
        <div class="footer">
          This message was sent from your HR system.
          <div class="date">${currentDate}</div>
        </div>
      </div>
    </div>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const sendEmailRouter = router
