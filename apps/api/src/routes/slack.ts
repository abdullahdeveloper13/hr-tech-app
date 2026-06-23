import { Router } from "express"
import { neon } from "@neondatabase/serverless"

const router = Router()

const sql = neon(process.env.DATABASE_URL || "")

router.post("/commands", async (req, res) => {
  try {
    const command = req.body.command as string
    const text = req.body.text as string
    const userId = req.body.user_id as string
    const userName = req.body.user_name as string

    const token = req.body.token as string
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
      res.status(401).json({ error: "Invalid token" })
      return
    }

    switch (command) {
      case "/checkin":
        res.json(await handleCheckIn(userId, userName))
        return
      case "/checkout":
        res.json(await handleCheckOut(userId, userName))
        return
      case "/leave":
        res.json(await handleLeaveRequest(userId, userName, text))
        return
      case "/status":
        res.json(await handleStatus(userId))
        return
      default:
        res.json({
          response_type: "ephemeral",
          text: "Unknown command. Available commands: /checkin, /checkout, /leave, /status",
        })
        return
    }
  } catch (error) {
    console.error("Slack command error:", error)
    res.json({
      response_type: "ephemeral",
      text: "An error occurred processing your request.",
    })
  }
})

router.post("/notifications", async (req, res) => {
  try {
    const { type, data } = req.body as { type?: string; data?: any }

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
        res.status(400).json({ error: "Unknown notification type" })
        return
    }

    res.json({ success: true })
  } catch (error) {
    console.error("Slack notification error:", error)
    res.status(500).json({ error: "Failed to send notification" })
  }
})

async function handleCheckIn(slackUserId: string, userName: string) {
  try {
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      OR email ILIKE ${userName + "@%"}
      LIMIT 1
    `

    if (employee.length === 0) {
      return {
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      }
    }

    const employeeId = employee[0].id

    const today = new Date().toISOString().split("T")[0]
    const existingCheckIn = await sql`
      SELECT * FROM check_ins 
      WHERE employee_id = ${employeeId} 
      AND DATE(check_in_time) = ${today}
      AND check_out_time IS NULL
    `

    if (existingCheckIn.length > 0) {
      return {
        response_type: "ephemeral",
        text: "You are already checked in today!",
      }
    }

    await sql`
      INSERT INTO check_ins (employee_id, check_in_time)
      VALUES (${employeeId}, NOW())
    `

    return {
      response_type: "in_channel",
      text: `✅ ${userName} has checked in at ${new Date().toLocaleTimeString()}`,
    }
  } catch (error) {
    console.error("Check-in error:", error)
    return {
      response_type: "ephemeral",
      text: "Failed to check in. Please try again.",
    }
  }
}

async function handleCheckOut(slackUserId: string, userName: string) {
  try {
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      OR email ILIKE ${userName + "@%"}
      LIMIT 1
    `

    if (employee.length === 0) {
      return {
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      }
    }

    const employeeId = employee[0].id

    const today = new Date().toISOString().split("T")[0]
    const checkIn = await sql`
      SELECT * FROM check_ins 
      WHERE employee_id = ${employeeId} 
      AND DATE(check_in_time) = ${today}
      AND check_out_time IS NULL
      ORDER BY check_in_time DESC
      LIMIT 1
    `

    if (checkIn.length === 0) {
      return {
        response_type: "ephemeral",
        text: "No active check-in found for today. Please check in first.",
      }
    }

    await sql`
      UPDATE check_ins 
      SET check_out_time = NOW()
      WHERE id = ${checkIn[0].id}
    `

    const checkInTime = new Date(checkIn[0].check_in_time)
    const checkOutTime = new Date()
    const hoursWorked = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)

    return {
      response_type: "in_channel",
      text: `✅ ${userName} has checked out at ${checkOutTime.toLocaleTimeString()}. Hours worked: ${hoursWorked}`,
    }
  } catch (error) {
    console.error("Check-out error:", error)
    return {
      response_type: "ephemeral",
      text: "Failed to check out. Please try again.",
    }
  }
}

async function handleLeaveRequest(slackUserId: string, userName: string, text: string) {
  try {
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      OR email ILIKE ${userName + "@%"}
      LIMIT 1
    `

    if (employee.length === 0) {
      return {
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      }
    }

    if (!text || text.trim() === "") {
      return {
        response_type: "ephemeral",
        text: "Please provide leave details. Format: /leave [start_date] [end_date] [reason]",
      }
    }

    return {
      response_type: "ephemeral",
      text: "Leave request functionality coming soon! Please use the web portal for now.",
    }
  } catch (error) {
    console.error("Leave request error:", error)
    return {
      response_type: "ephemeral",
      text: "Failed to process leave request. Please try again.",
    }
  }
}

async function handleStatus(slackUserId: string) {
  try {
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      LIMIT 1
    `

    if (employee.length === 0) {
      return {
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      }
    }

    const employeeId = employee[0].id
    const today = new Date().toISOString().split("T")[0]

    const checkIn = await sql`
      SELECT * FROM check_ins 
      WHERE employee_id = ${employeeId} 
      AND DATE(check_in_time) = ${today}
      ORDER BY check_in_time DESC
      LIMIT 1
    `

    const leaveBalance = await sql`
      SELECT 
        (SELECT COALESCE(SUM(days_requested), 0) FROM leave_requests 
         WHERE employee_id = ${employeeId} AND status = 'approved' 
         AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)) as used_days
    `

    const usedDays = leaveBalance[0]?.used_days || 0
    const remainingDays = 25 - usedDays

    let statusText = `📊 *Your Status*\n`

    if (checkIn.length > 0 && !checkIn[0].check_out_time) {
      const checkInTime = new Date(checkIn[0].check_in_time).toLocaleTimeString()
      statusText += `✅ Checked in at ${checkInTime}\n`
    } else if (checkIn.length > 0 && checkIn[0].check_out_time) {
      const checkOutTime = new Date(checkIn[0].check_out_time).toLocaleTimeString()
      statusText += `✅ Checked out at ${checkOutTime}\n`
    } else {
      statusText += `❌ Not checked in today\n`
    }

    statusText += `🏖️ Leave balance: ${remainingDays} days remaining`

    return {
      response_type: "ephemeral",
      text: statusText,
    }
  } catch (error) {
    console.error("Status error:", error)
    return {
      response_type: "ephemeral",
      text: "Failed to get status. Please try again.",
    }
  }
}

async function sendLeaveRequestNotification(data: any) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: "🏖️ New Leave Request",
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
    text: "✅ Leave Request Approved",
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
    text: "❌ Leave Request Rejected",
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

export const slackRouter = router
