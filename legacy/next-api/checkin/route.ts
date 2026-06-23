import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserFromSession } from "@/lib/auth"

const PROFILE_MISSING_MESSAGE = "Employee profile not found. Please contact HR to set up your employee record."

function parseUserId(value: string): number | null {
  const userId = Number.parseInt(value, 10)
  return Number.isNaN(userId) ? null : userId
}

function createMissingProfileStatus() {
  return {
    activeCheckIn: null,
    recentCheckIns: [],
    isCheckedIn: false,
    hasCompletedWorkDay: false,
    hasCheckedInToday: false,
    todayCheckIn: null,
    hasEmployeeProfile: false,
    message: PROFILE_MISSING_MESSAGE,
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = parseUserId(currentUser.id)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      return NextResponse.json(
        {
          error: PROFILE_MISSING_MESSAGE,
          code: "EMPLOYEE_PROFILE_MISSING",
        },
        { status: 409 },
      )
    }

    const { action, notes, location } = await request.json()

    if (action === "checkin") {
      // Check if already checked in today (regardless of checkout status)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          employeeId: employee.id,
          checkInTime: {
            gte: today,
            lt: tomorrow,
          },
        },
      })

      if (existingCheckIn) {
        if (existingCheckIn.checkOutTime === null) {
          return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
        } else {
          return NextResponse.json({ error: "You have already completed your check-in/check-out for today" }, { status: 400 })
        }
      }

      // Create new check-in
      const checkIn = await prisma.checkIn.create({
        data: {
          employeeId: employee.id,
          checkInTime: new Date(),
          notes,
          location,
        },
      })

      return NextResponse.json(checkIn, { status: 201 })
    } else if (action === "checkout") {
      // Find active check-in
      const activeCheckIn = await prisma.checkIn.findFirst({
        where: {
          employeeId: employee.id,
          checkOutTime: null,
        },
        orderBy: { checkInTime: "desc" },
      })

      if (!activeCheckIn) {
        return NextResponse.json({ error: "No active check-in found" }, { status: 400 })
      }

      // Calculate total hours
      const checkOutTime = new Date()
      const totalHours = (checkOutTime.getTime() - activeCheckIn.checkInTime.getTime()) / (1000 * 60 * 60)

      // Update check-in with checkout time
      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: activeCheckIn.id },
        data: {
          checkOutTime,
          totalHours: Math.round(totalHours * 100) / 100,
          notes: notes || activeCheckIn.notes,
        },
      })

      return NextResponse.json(updatedCheckIn)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("POST /api/checkin failed:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized - Please log in again" }, { status: 401 })
    }

    const currentUserId = parseUserId(currentUser.id)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized - Please log in again" }, { status: 401 })
    }

    // Get employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      return NextResponse.json(createMissingProfileStatus())
    }

    // Get current status (active check-in)
    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        employeeId: employee.id,
        checkOutTime: null,
      },
      orderBy: { checkInTime: "desc" },
    })

    // Check if employee has completed check-in/check-out for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCheckIn = await prisma.checkIn.findFirst({
      where: {
        employeeId: employee.id,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { checkInTime: "desc" },
    })

    // Determine if employee has completed their work day
    const hasCompletedWorkDay = todayCheckIn && todayCheckIn.checkOutTime !== null
    const hasCheckedInToday = !!todayCheckIn
    const isCurrentlyCheckedIn = !!activeCheckIn

    // Get recent check-ins
    const recentCheckIns = await prisma.checkIn.findMany({
      where: { employeeId: employee.id },
      orderBy: { checkInTime: "desc" },
      take: 10,
    })

    return NextResponse.json({
      activeCheckIn,
      recentCheckIns,
      isCheckedIn: isCurrentlyCheckedIn,
      hasCompletedWorkDay,
      hasCheckedInToday,
      todayCheckIn,
      hasEmployeeProfile: true,
      message: null,
    })
  } catch (error) {
    console.error("GET /api/checkin failed:", error)
    return NextResponse.json({ 
      error: "Internal server error. Please try again later.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
