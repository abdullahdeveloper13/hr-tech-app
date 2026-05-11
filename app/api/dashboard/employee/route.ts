import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseInteger } from "@/lib/api/route-utils"

const PROFILE_MISSING_MESSAGE = "Employee profile not found. Please contact HR to set up your employee record."

function createMissingProfileResponse() {
  return {
    hasEmployeeProfile: false,
    message: PROFILE_MISSING_MESSAGE,
    employee: {
      id: 0,
      firstName: "",
      lastName: "",
      department: "",
      position: "",
    },
    stats: {
      weeklyHours: 0,
      monthlyHours: 0,
      attendanceRate: 0,
      performanceScore: 0,
      remainingAnnualDays: 0,
      totalAnnualDays: 0,
      isCheckedIn: false,
      currentCheckInTime: null,
    },
    leaveBalances: [],
    recentActivities: [],
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    const currentUserId = parseInteger(currentUser.id)
    if (currentUserId === null) {
      return jsonError("Unauthorized", 401)
    }

    // Get employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      return NextResponse.json(createMissingProfileResponse())
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const currentDate = new Date()
    
    // Get start and end of current week
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    
    // Get start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Get leave balances
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: employee.id,
        year: currentYear,
      },
      orderBy: { leaveType: "asc" },
    })

    // If no balances exist, create default ones
    let finalLeaveBalances = leaveBalances
    if (leaveBalances.length === 0) {
      const defaultBalances = [
        { leaveType: "ANNUAL", totalDays: 25 },
        { leaveType: "SICK", totalDays: 10 },
        { leaveType: "PERSONAL", totalDays: 5 },
      ]

      finalLeaveBalances = await Promise.all(
        defaultBalances.map((balance) =>
          prisma.leaveBalance.create({
            data: {
              employeeId: employee.id,
              leaveType: balance.leaveType as any,
              totalDays: balance.totalDays,
              usedDays: 0,
              remainingDays: balance.totalDays,
              year: currentYear,
            },
          }),
        ),
      )
    }

    // Get check-ins for this week
    const weeklyCheckIns = await prisma.checkIn.findMany({
      where: {
        employeeId: employee.id,
        checkInTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
        totalHours: { not: null },
      },
    })

    // Get check-ins for this month
    const monthlyCheckIns = await prisma.checkIn.findMany({
      where: {
        employeeId: employee.id,
        checkInTime: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
        totalHours: { not: null },
      },
    })

    // Get all check-ins for attendance calculation
    const allCheckIns = await prisma.checkIn.findMany({
      where: {
        employeeId: employee.id,
        checkInTime: {
          gte: new Date(currentYear, 0, 1), // Start of year
        },
      },
    })

    // Calculate weekly hours
    const weeklyHours = weeklyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0)
    
    // Calculate monthly hours
    const monthlyHours = monthlyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0)

    // Calculate attendance rate (days with check-ins vs working days)
    const workingDaysThisMonth = getWorkingDaysInMonth(currentYear, currentMonth)
    const daysWithCheckIns = new Set(
      monthlyCheckIns.map(checkIn => 
        new Date(checkIn.checkInTime).toDateString()
      )
    ).size
    const attendanceRate = workingDaysThisMonth > 0 ? Math.round((daysWithCheckIns / workingDaysThisMonth) * 100) : 0

    // Get recent activities (check-ins and leave requests)
    const recentCheckIns = await prisma.checkIn.findMany({
      where: { employeeId: employee.id },
      orderBy: { checkInTime: "desc" },
      take: 5,
    })

    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    // Get current check-in status
    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        employeeId: employee.id,
        checkOutTime: null,
      },
      orderBy: { checkInTime: "desc" },
    })

    // Calculate performance score (based on attendance and hours)
    const targetWeeklyHours = 40
    const weeklyPerformance = Math.min(100, (weeklyHours / targetWeeklyHours) * 100)
    const performanceScore = Math.round((attendanceRate * 0.6 + weeklyPerformance * 0.4))

    // Get annual leave balance
    const annualLeave = finalLeaveBalances.find(balance => balance.leaveType === "ANNUAL")
    const totalAnnualDays = annualLeave?.totalDays || 25
    const remainingAnnualDays = annualLeave?.remainingDays || 25

    return NextResponse.json({
      hasEmployeeProfile: true,
      message: null,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        position: employee.position,
      },
      stats: {
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        monthlyHours: Math.round(monthlyHours * 100) / 100,
        attendanceRate,
        performanceScore,
        remainingAnnualDays,
        totalAnnualDays,
        isCheckedIn: !!activeCheckIn,
        currentCheckInTime: activeCheckIn?.checkInTime,
      },
      leaveBalances: finalLeaveBalances,
      recentActivities: [
        ...recentCheckIns.map((checkIn) => ({
          id: `checkin-${checkIn.id}`,
          type: "checkin",
          action: checkIn.checkOutTime ? "checked out" : "checked in",
          time: checkIn.checkInTime,
          date: checkIn.checkInTime,
          timestamp: checkIn.checkInTime,
        })),
        ...recentLeaveRequests.map((request) => ({
          id: `leave-${request.id}`,
          type: "leave",
          action: `submitted ${request.leaveType.toLowerCase()} leave request`,
          time: request.createdAt,
          date: request.createdAt,
          timestamp: request.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8),
    })
  } catch (error) {
    console.error("Employee dashboard error:", error)
    return jsonError("Internal server error", 500)
  }
}

// Helper function to calculate working days in a month (excluding weekends)
function getWorkingDaysInMonth(year: number, month: number): number {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  let workingDays = 0
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++
    }
  }
  
  return workingDays
}
