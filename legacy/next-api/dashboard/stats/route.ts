import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total employees
    const totalEmployees = await prisma.employee.count({
      where: { status: "ACTIVE" },
    })

    // Get employees who checked in today
    const todayCheckIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    })

    const activeToday = todayCheckIns.length
    const attendanceRate = totalEmployees > 0 ? Math.round((activeToday / totalEmployees) * 100) : 0

    // Get late comers (checked in after 9:30 AM)
    const lateThreshold = new Date(today)
    lateThreshold.setHours(9, 30, 0, 0)

    const lateComers = todayCheckIns.filter(
      (checkIn) => new Date(checkIn.checkInTime) > lateThreshold
    )

    // Get average work hours for this week
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const weeklyCheckIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
        totalHours: { not: null },
      },
    })

    const avgWorkHours = weeklyCheckIns.length > 0
      ? Math.round((weeklyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0) / weeklyCheckIns.length) * 10) / 10
      : 0

    // Get recent activities (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Get recent check-ins (last 24 hours)
    const recentCheckIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: {
          gte: yesterday,
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { checkInTime: "desc" },
      take: 15,
    })

    // Get recent check-outs (last 24 hours)
    const recentCheckOuts = await prisma.checkIn.findMany({
      where: {
        checkOutTime: {
          gte: yesterday,
          not: null,
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { checkOutTime: "desc" },
      take: 15,
    })

    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Format recent activities
    const recentActivities = [
      // Add check-in activities
      ...recentCheckIns.map((checkIn) => ({
        id: `checkin-${checkIn.id}`,
        user: `${checkIn.employee.firstName} ${checkIn.employee.lastName}`,
        action: "checked in",
        time: checkIn.checkInTime, // Send raw timestamp for client-side formatting
        type: "checkin",
        department: checkIn.employee.department,
        timestamp: checkIn.checkInTime,
      })),
      // Add check-out activities
      ...recentCheckOuts.map((checkOut) => ({
        id: `checkout-${checkOut.id}`,
        user: `${checkOut.employee.firstName} ${checkOut.employee.lastName}`,
        action: "checked out",
        time: checkOut.checkOutTime!, // Send raw timestamp for client-side formatting
        type: "checkout",
        department: checkOut.employee.department,
        timestamp: checkOut.checkOutTime!,
      })),
      // Add leave request activities
      ...recentLeaveRequests.map((request) => ({
        id: `leave-${request.id}`,
        user: `${request.employee.firstName} ${request.employee.lastName}`,
        action: "submitted leave request",
        time: request.createdAt, // Send raw timestamp for client-side formatting
        type: "leave",
        department: request.employee.department,
        timestamp: request.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    // Get pending leave requests
    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: "PENDING" },
    })

    // Get pending leave requests with details
    const pendingLeaveRequests = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalEmployees,
        activeToday,
        lateComers: lateComers.length,
        avgWorkHours,
        attendanceRate,
        pendingLeaves,
      },
      lateComers: lateComers.map((checkIn) => ({
        id: checkIn.id,
        employee: `${checkIn.employee.firstName} ${checkIn.employee.lastName}`,
        department: checkIn.employee.department,
        checkInTime: checkIn.checkInTime,
        lateBy: Math.round((new Date(checkIn.checkInTime).getTime() - lateThreshold.getTime()) / (1000 * 60)), // minutes late
      })),
      recentActivities,
      pendingLeaveRequests: pendingLeaveRequests.map((request) => ({
        id: request.id,
        employee: `${request.employee.firstName} ${request.employee.lastName}`,
        type: request.leaveType,
        dates: `${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}`,
        days: request.totalDays,
        status: request.status,
      })),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
