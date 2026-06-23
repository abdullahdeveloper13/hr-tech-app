import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { jsonError } from "@/lib/api/route-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    if (session.user.role !== "ADMIN") {
      return jsonError("Forbidden - Only admins can view absent employees", 403)
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all active employees
    const allEmployees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        department: true,
        phoneNumber: true,
        status: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    // Get employees who checked in today
    const checkedInToday = await prisma.checkIn.findMany({
      where: {
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        employeeId: true,
      },
      distinct: ["employeeId"],
    })

    const checkedInIds = new Set(checkedInToday.map((c) => c.employeeId))

    // Get employees marked as absent in DB
    const markedAbsentToday = await prisma.absent.findMany({
      where: {
        date: today,
        status: "ABSENT",
      },
      select: {
        employeeId: true,
      },
    })

    const markedAbsentIds = new Set(markedAbsentToday.map((a) => a.employeeId))

    // Get employees on leave today
    const onLeaveToday = await prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      select: {
        employeeId: true,
      },
      distinct: ["employeeId"],
    })

    const onLeaveIds = new Set(onLeaveToday.map((l) => l.employeeId))

    // Filter absent employees (not checked in, not marked present, not on leave)
    const absentEmployees = allEmployees.filter(
      (emp) =>
        !checkedInIds.has(emp.id) &&
        !markedAbsentIds.has(emp.id) &&
        !onLeaveIds.has(emp.id)
    )

    return NextResponse.json({
      absent: absentEmployees,
      total: allEmployees.length,
      checkedIn: checkedInToday.length,
      markedAbsent: markedAbsentToday.length,
      onLeave: onLeaveToday.length,
      date: today.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Failed to fetch absent employees:", error)
    return jsonError("Failed to fetch absent employees", 500)
  }
}
