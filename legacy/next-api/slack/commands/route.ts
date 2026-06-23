import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const command = formData.get("command") as string
    const text = formData.get("text") as string
    const userId = formData.get("user_id") as string
    const userName = formData.get("user_name") as string

    // Verify Slack token (in production, verify the signing secret)
    const token = formData.get("token") as string
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    switch (command) {
      case "/checkin":
        return await handleCheckIn(userId, userName)

      case "/checkout":
        return await handleCheckOut(userId, userName)

      case "/leave":
        return await handleLeaveRequest(userId, userName, text)

      case "/status":
        return await handleStatus(userId)

      default:
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Unknown command. Available commands: /checkin, /checkout, /leave, /status",
        })
    }
  } catch (error) {
    console.error("Slack command error:", error)
    return NextResponse.json({
      response_type: "ephemeral",
      text: "An error occurred processing your request.",
    })
  }
}

async function handleCheckIn(slackUserId: string, userName: string) {
  try {
    // Find employee by Slack user ID or create mapping
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      OR email ILIKE ${userName + "@%"}
      LIMIT 1
    `

    if (employee.length === 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      })
    }

    const employeeId = employee[0].id

    // Check if already checked in today
    const today = new Date().toISOString().split("T")[0]
    const existingCheckIn = await sql`
      SELECT * FROM check_ins 
      WHERE employee_id = ${employeeId} 
      AND DATE(check_in_time) = ${today}
      AND check_out_time IS NULL
    `

    if (existingCheckIn.length > 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "You are already checked in today!",
      })
    }

    // Create check-in record
    await sql`
      INSERT INTO check_ins (employee_id, check_in_time)
      VALUES (${employeeId}, NOW())
    `

    return NextResponse.json({
      response_type: "in_channel",
      text: `✅ ${userName} has checked in at ${new Date().toLocaleTimeString()}`,
    })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Failed to check in. Please try again.",
    })
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
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      })
    }

    const employeeId = employee[0].id

    // Find today's check-in without check-out
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
      return NextResponse.json({
        response_type: "ephemeral",
        text: "No active check-in found for today. Please check in first.",
      })
    }

    // Update check-out time
    await sql`
      UPDATE check_ins 
      SET check_out_time = NOW()
      WHERE id = ${checkIn[0].id}
    `

    // Calculate hours worked
    const checkInTime = new Date(checkIn[0].check_in_time)
    const checkOutTime = new Date()
    const hoursWorked = ((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)

    return NextResponse.json({
      response_type: "in_channel",
      text: `✅ ${userName} has checked out at ${checkOutTime.toLocaleTimeString()}. Hours worked: ${hoursWorked}`,
    })
  } catch (error) {
    console.error("Check-out error:", error)
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Failed to check out. Please try again.",
    })
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
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      })
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Please provide leave details. Format: /leave [start_date] [end_date] [reason]",
      })
    }

    return NextResponse.json({
      response_type: "ephemeral",
      text: "Leave request functionality coming soon! Please use the web portal for now.",
    })
  } catch (error) {
    console.error("Leave request error:", error)
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Failed to process leave request. Please try again.",
    })
  }
}

async function handleStatus(slackUserId: string) {
  try {
    const employee = await sql`
      SELECT * FROM employees WHERE slack_user_id = ${slackUserId}
      LIMIT 1
    `

    if (employee.length === 0) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Employee not found. Please contact HR to link your Slack account.",
      })
    }

    const employeeId = employee[0].id
    const today = new Date().toISOString().split("T")[0]

    // Get today's check-in status
    const checkIn = await sql`
      SELECT * FROM check_ins 
      WHERE employee_id = ${employeeId} 
      AND DATE(check_in_time) = ${today}
      ORDER BY check_in_time DESC
      LIMIT 1
    `

    // Get leave balance
    const leaveBalance = await sql`
      SELECT 
        (SELECT COALESCE(SUM(days_requested), 0) FROM leave_requests 
         WHERE employee_id = ${employeeId} AND status = 'approved' 
         AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)) as used_days
    `

    const usedDays = leaveBalance[0]?.used_days || 0
    const remainingDays = 25 - usedDays // Assuming 25 days annual leave

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

    return NextResponse.json({
      response_type: "ephemeral",
      text: statusText,
    })
  } catch (error) {
    console.error("Status error:", error)
    return NextResponse.json({
      response_type: "ephemeral",
      text: "Failed to get status. Please try again.",
    })
  }
}
