import { Router } from "express"
import { Resend } from "resend"
import { readFileSync } from "fs"
import { join } from "path"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      candidateEmail,
      candidateName,
      position,
      department,
      startDate,
      salary,
      reportingManager,
      offerLetterContent,
      companyName = "Zero To One",
      companyAddress = "3rd Floor, RJ Mall, Rashid Minhas Road, Karachi, Pakistan",
      hrEmail = "infohr@tech-021.com",
      hrPhone = "+92335-2204608",
    } = req.body as Record<string, string>

    if (!candidateEmail || !candidateName || !position || !department || !startDate || !offerLetterContent) {
      throw new HttpError("All required fields must be provided", 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(candidateEmail)) {
      throw new HttpError("Invalid email format", 400)
    }

    if (!process.env.RESEND_API_KEY) {
      throw new HttpError("Resend API key missing. Please configure RESEND_API_KEY environment variable.", 500)
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const replacePlaceholders = (content: string) => {
      return content
        .replace(/\[Position\]/g, position)
        .replace(/\[Department\]/g, department)
        .replace(/\[Company Name\]/g, companyName)
        .replace(
          /\[Start Date\]/g,
          new Date(startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        )
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Offer Letter</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .letter-container {
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 20px;
            }
            .company-address {
              font-size: 14px;
              color: #666;
            }
            .content {
              margin-bottom: 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .body-text {
              margin-bottom: 15px;
              text-align: justify;
            }
            .offer-details {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #000;
            }
            .detail-row {
              display: flex;
              margin-bottom: 10px;
            }
            .detail-label {
              font-weight: bold;
              width: 200px;
              color: #000;
            }
            .detail-value {
              flex: 1;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="letter-container">
            <div class="header">
              <img src="${process.env.LOGO_URL || "https://tech-021.com/021-logo.png"}" alt="${companyName} Logo" class="company-logo" />
              <div class="company-address">${companyAddress}</div>
            </div>

            <div class="date">${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>

            <div class="content">
              <div class="greeting">Dear ${candidateName},</div>

              <div class="body-text">
                ${replacePlaceholders(offerLetterContent)}
              </div>

              <div class="offer-details">
                <div class="detail-row">
                  <div class="detail-label">Position:</div>
                  <div class="detail-value">${position}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Department:</div>
                  <div class="detail-value">${department}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Start Date:</div>
                  <div class="detail-value">${new Date(startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</div>
                </div>
                ${salary ? `
                <div class="detail-row">
                  <div class="detail-label">Salary:</div>
                  <div class="detail-value">PKR${Number(salary).toLocaleString()}</div>
                </div>
                ` : ""}
                ${reportingManager ? `
                <div class="detail-row">
                  <div class="detail-label">Reporting Manager:</div>
                  <div class="detail-value">${reportingManager}</div>
                </div>
                ` : ""}
              </div>

              <div class="body-text">
                We are excited about the possibility of you joining our team and look forward to your positive response.
              </div>

              <div class="offer-details" style="background-color: #fff3cd; border-left: 4px solid #ffc107; margin-top: 20px;">
                <h3 style="color: #856404; margin-top: 0;">📎 Important Document Attached</h3>
                <p style="color: #856404; margin-bottom: 10px;">
                  Please find attached the <strong>"Zero to One HR Handbook"</strong> which contains important information about our company policies, procedures, and employee guidelines.
                </p>
                <p style="color: #856404; margin-bottom: 0;">
                  <strong>Action Required:</strong> Please read the attached handbook carefully and confirm your acceptance of this offer along with acknowledgment that you have read and understood the company handbook by replying to this email.
                </p>
              </div>
            </div>

            <div class="footer">
              <div class="body-text">
                If you have any questions about the offer or the handbook, please feel free to contact our HR department.
              </div>

              <div class="signature">
                <div class="body-text">
                  Best regards,<br>
                  Human Resources Department<br>
                  ${companyName}
                </div>
                <div style="margin-top: 20px; color: #666;">
                  Email: ${hrEmail}<br>
                  Phone: ${hrPhone}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const textTemplate = `
Job Offer Letter

${companyName}
${companyAddress}

Date: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

Dear ${candidateName},

${replacePlaceholders(offerLetterContent)}

OFFER DETAILS:
Position: ${position}
Department: ${department}
Start Date: ${new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
${salary ? `Salary: $${Number(salary).toLocaleString()}` : ""}
${reportingManager ? `Reporting Manager: ${reportingManager}` : ""}

We are excited about the possibility of you joining our team and look forward to your positive response.

*** IMPORTANT DOCUMENT ATTACHED ***

Please find attached the "Zero to One HR Handbook" which contains important information about our company policies, procedures, and employee guidelines.

ACTION REQUIRED:
Please read the attached handbook carefully and confirm your acceptance of this offer along with acknowledgment that you have read and understood the company handbook by replying to this email.

*********************************

If you have any questions about the offer or the handbook, please feel free to contact our HR department.

Best regards,
Human Resources Department
${companyName}

Email: ${hrEmail}
Phone: ${hrPhone}
    `

    let pdfAttachment = null
    try {
      const pdfPath = join(process.cwd(), "public", "doc", "Zero to One HR.pdf")
      const pdfBuffer = readFileSync(pdfPath)
      pdfAttachment = {
        filename: "Zero_to_One_HR_Handbook.pdf",
        content: pdfBuffer,
      }
    } catch (pdfError) {
      console.error("Error reading PDF file:", pdfError)
    }

    const emailOptions: Record<string, unknown> = {
      from: `${companyName} - HR <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: candidateEmail,
      subject: `Job Offer Letter - ${position} at ${companyName}`,
      text: textTemplate,
      html: htmlTemplate,
      reply_to: hrEmail,
    }

    if (pdfAttachment) {
      emailOptions.attachments = [pdfAttachment]
    }

    const { error: resendError } = await resend.emails.send(emailOptions)

    if (resendError) {
      console.error("Resend error:", resendError)
      throw new Error(resendError.message || "Failed to send email")
    }

    res.json({
      message: "Offer letter sent successfully",
      sentTo: candidateEmail,
      candidateName,
      position,
    })
  }),
)

export const offerLetterRouter = router
