import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case "leave_request":
        await sendLeaveRequestNotification(data)
        break

      case "leave_approved":
        await sendLeaveApprovedNotification(data)
        break

      case "leave_rejected":
        await sendLeaveRejectedNotification(data)
        break

      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Slack notification error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

async function sendLeaveRequestNotification(data: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: `🏖️ New Leave Request`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${data.employeeName}* has requested leave from *${data.startDate}* to *${data.endDate}*`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Type:*\n${data.leaveType}`,
          },
          {
            type: "mrkdwn",
            text: `*Days:*\n${data.daysRequested}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Reason:*\n${data.reason}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View in HR Portal",
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leave`,
            style: "primary",
          },
        ],
      },
    ],
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })
}

async function sendLeaveApprovedNotification(data: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: `✅ Leave Request Approved`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Great news! Your leave request from *${data.startDate}* to *${data.endDate}* has been approved! 🎉`,
        },
      },
    ],
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })
}

async function sendLeaveRejectedNotification(data: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: `❌ Leave Request Rejected`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Your leave request from *${data.startDate}* to *${data.endDate}* has been rejected.`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Reason:*\n${data.rejectionReason || "No reason provided"}`,
        },
      },
    ],
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })
}
