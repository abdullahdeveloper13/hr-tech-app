import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { jsonError } from "@/lib/api/route-utils"

type AttendanceRange = "week" | "month" | "year"

function normalizeRange(value: string | null): AttendanceRange {
  if (value === "month" || value === "year") {
    return value
  }
  return "week"
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return jsonError("Unauthorized", 401)
    }

    const searchParams = request.nextUrl.searchParams
    const range = normalizeRange(searchParams.get("range"))

    // Get current user's employee record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true },
    })

    if (!user?.employee) {
      return NextResponse.json([], {
        headers: {
          "x-profile-missing": "true",
          "x-profile-message": "Employee profile not found. Please contact HR to set up your employee record.",
        },
      })
    }

    // Calculate date range
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate: Date

    if (range === "week") {
      const dayOfWeek = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - dayOfWeek)
    } else if (range === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if (range === "year") {
      startDate = new Date(today.getFullYear(), 0, 1)
    } else {
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 7)
    }

    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    // Fetch attendance records
    const attendanceRecords = await prisma.checkIn.findMany({
      where: {
        employeeId: user.employee.id,
        checkInTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkInTime: "desc" },
    })

    // Format response
    const formattedData = attendanceRecords.map((record) => ({
      id: record.id,
      employeeId: record.employee.employeeId,
      firstName: record.employee.firstName,
      lastName: record.employee.lastName,
      checkInTime: record.checkInTime.toISOString(),
      checkOutTime: record.checkOutTime?.toISOString() || null,
      totalHours: record.totalHours || 0,
      date: record.checkInTime.toISOString().split("T")[0],
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Attendance reports error:", error)
    return jsonError("Failed to fetch attendance records", 500)
  }
}
