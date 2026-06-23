import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { endOfDay, jsonError, parseDate, parseInteger, startOfDay } from "@/lib/api/route-utils"
import type { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN, HR, and MANAGER to view all check-ins
    if (!["ADMIN", "HR", "MANAGER"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    const { searchParams } = new URL(request.url)
    const parsedDate = parseDate(searchParams.get("date")) ?? new Date()
    const employeeId = parseInteger(searchParams.get("employeeId"))
    if (searchParams.get("employeeId") && employeeId === null) {
      return jsonError("Invalid employeeId", 400)
    }

    const startDate = startOfDay(parsedDate)
    const lastDate = endOfDay(parsedDate)

    const where: Prisma.CheckInWhereInput = {
      checkInTime: {
        gte: startDate,
        lt: lastDate,
      },
    }

    if (employeeId !== null) {
      where.employeeId = employeeId
    }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: { checkInTime: "desc" },
    })

    // Get summary stats
    const totalEmployees = await prisma.employee.count({
      where: { status: "ACTIVE" },
    })

    const presentToday = checkIns.filter((checkIn) => checkIn.checkInTime >= startDate).length

    const currentlyCheckedIn = await prisma.checkIn.count({
      where: {
        checkOutTime: null,
        checkInTime: {
          gte: startDate,
        },
      },
    })

    return NextResponse.json({
      checkIns,
      stats: {
        totalEmployees,
        presentToday,
        currentlyCheckedIn,
        attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Get all check-ins error:", error)
    return jsonError("Internal server error", 500)
  }
}
