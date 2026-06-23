import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { Resend } from "resend"

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

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow ADMIN and HR to send emails
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body: EmailRequest = await request.json()

    // Validate request data
    if (!body.recipients || body.recipients.length === 0) {
      console.warn("No recipients provided")
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      )
    }

    if (!body.subject || !body.subject.trim()) {
      console.warn("No subject provided")
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      )
    }

    if (!body.message || !body.message.trim()) {
      console.warn("No message provided")
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured")
      return NextResponse.json(
        { error: "Email service is not configured. Please contact your administrator." },
        { status: 500 }
      )
    }

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Use verified Resend domain for localhost testing
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

    console.log("Sending emails from:", fromEmail)
    console.log("Recipients count:", body.recipients.length)
    console.log("Recipients:", body.recipients.map(r => ({ name: r.name, email: r.email })))

    // Generate HTML template
    const htmlTemplate = generateEmailHTML(body.message, body.subject)

    // Send emails to all recipients
    const emailPromises = body.recipients.map((recipient) => {
      console.log("Sending email to:", recipient.email)
      return resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject: body.subject,
        html: htmlTemplate,
        replyTo: process.env.RESEND_REPLY_TO_EMAIL || "hr@tech-021.com",
      })
    })

    const results = await Promise.all(emailPromises)

    // Check for any failures
    const failures = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.error)
    const successes = results.filter((result) => !result.error)

    console.log(
      "Email send results - Successes:",
      successes.length,
      "Failures:",
      failures.length
    )

    if (failures.length > 0) {
      console.error("Failed emails:", failures)
      return NextResponse.json(
        {
          error: `Failed to send ${failures.length} email(s), ${successes.length} sent successfully`,
          details: failures.map(({ result, index }) => ({
            email: body.recipients[index].email,
            error: result.error?.message,
          })),
          sentCount: successes.length,
        },
        { status: 207 } // 207 Multi-Status: Some succeeded, some failed
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Email sent successfully to ${body.recipients.length} recipient(s)`,
        sentCount: successes.length,
        recipients: body.recipients.map(r => r.email),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send email error:", error instanceof Error ? error.message : error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to send email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    )
  }
}

// Helper function to generate professional email HTML
function generateEmailHTML(message: string, subject: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
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
      .company-tagline {
        color: #ccc;
        font-size: 14px;
        margin-top: 5px;
      }
      .content {
        padding: 40px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 20px;
        color: #000;
      }
      .body-text {
        font-size: 14px;
        line-height: 1.8;
        color: #333;
        margin-bottom: 20px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .divider {
        height: 1px;
        background-color: #ddd;
        margin: 30px 0;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 30px 40px;
        border-top: 1px solid #ddd;
      }
      .footer-content {
        font-size: 12px;
        color: #666;
        line-height: 1.8;
      }
      .footer-company {
        font-weight: bold;
        color: #000;
        margin-top: 10px;
      }
      .footer-tagline {
        color: #999;
        font-size: 11px;
        margin-top: 15px;
        font-style: italic;
      }
      .date {
        color: #999;
        font-size: 12px;
        text-align: right;
        margin-top: 10px;
      }
      .cta-button {
        display: inline-block;
        background-color: #000;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        margin-top: 20px;
        font-size: 14px;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header with Logo -->
      <div class="header">
        <div class="logo-container">
          <img src="${process.env.LOGO_URL || 'https://tech-021.com/021-logo.png'}" alt="Company Logo" class="logo" />
        </div>
        <div class="company-name">Zero To One</div>
        <div class="company-tagline">Every one deserves a zero</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hello,</div>
        
        <div class="body-text">${escapeHtml(message)}</div>
        
        <div class="divider"></div>

        <!-- Subject as secondary heading -->
        <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 20px;">
          ${escapeHtml(subject)}
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-content">
          <div class="footer-company">Zero To One</div>
          <div>Human Resources Department</div>
          <div>3rd Floor, RJ Mall, Rashid Minhas Road</div>
          <div>Karachi, Pakistan</div>
          <div style="margin-top: 15px;">
            Email: <a href="mailto:infohr@tech-021.com" style="color: #0066cc; text-decoration: none;">infohr@tech-021.com</a><br>
            Phone: +92-335-2204608
          </div>
          <div class="footer-tagline">Every one deserves a zero</div>
        </div>
        <div class="date">${currentDate}</div>
      </div>
    </div>
  </body>
</html>`
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}