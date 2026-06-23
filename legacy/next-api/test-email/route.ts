import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow ADMIN and HR to test email configuration
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: "Test email address is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: "Resend API key missing. Please configure RESEND_API_KEY environment variable.",
        details: {
          RESEND_API_KEY: "✗ Missing",
          RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ? "✓ Configured" : "Using default"
        }
      }, { status: 500 })
    }

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send test email using Resend
    try {
      const { data, error: resendError } = await resend.emails.send({
        from: `Tech-021 HR System <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: testEmail,
        subject: "Email Configuration Test - HR System",
        text: `This is a test email from your HR system.

If you received this email, your email configuration is working correctly!

Test sent at: ${new Date().toLocaleString()}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${process.env.LOGO_URL || 'https://tech-021.com/021-logo.png'}" alt="Company Logo" style="max-width: 150px; height: auto;" />
          </div>
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email from your HR system.</p>
          <p style="color: green; font-weight: bold;">✓ If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Test sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      })

      if (resendError) {
        console.error("Resend error:", resendError)
        throw new Error(resendError.message || "Failed to send test email")
      }
      
      return NextResponse.json({
        message: "Test email sent successfully!",
        status: "success",
        connectionStatus: "✓ Connected successfully",
        details: {
          provider: "Resend",
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          testEmail,
          emailId: data?.id,
          sentAt: new Date().toISOString()
        }
      })

    } catch (sendError) {
      console.error("Send test email error:", sendError)
      
      // More detailed error information
      let errorMessage = "Failed to send test email"
      if (sendError instanceof Error) {
        errorMessage = sendError.message
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        connectionStatus: "✗ Connection failed",
        details: {
          provider: "Resend",
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          toEmail: testEmail,
          error: sendError instanceof Error ? sendError.message : 'Unknown error'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
