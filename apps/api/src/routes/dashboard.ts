import { Router } from "express"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { authenticate, type AuthenticatedRequest } from "../middleware/auth"
import { HttpError } from "../middleware/error"
import { parseInteger } from "../utils/route-utils"

const router = Router()

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

router.get(
  "/stats",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      throw new HttpError("Unauthorized", 401)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalEmployees = await prisma.employee.count({
      where: { status: "ACTIVE" },
    })

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

    const lateThreshold = new Date(today)
    lateThreshold.setHours(9, 30, 0, 0)

    const lateComers = todayCheckIns.filter((checkIn) => new Date(checkIn.checkInTime) > lateThreshold)

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

    const avgWorkHours =
      weeklyCheckIns.length > 0
        ? Math.round(
            (weeklyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0) /
              weeklyCheckIns.length) *
              10,
          ) / 10
        : 0

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

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

    const recentActivities = [
      ...recentCheckIns.map((checkIn) => ({
        id: `checkin-${checkIn.id}`,
        user: `${checkIn.employee.firstName} ${checkIn.employee.lastName}`,
        action: "checked in",
        time: checkIn.checkInTime,
        type: "checkin",
        department: checkIn.employee.department,
        timestamp: checkIn.checkInTime,
      })),
      ...recentCheckOuts.map((checkOut) => ({
        id: `checkout-${checkOut.id}`,
        user: `${checkOut.employee.firstName} ${checkOut.employee.lastName}`,
        action: "checked out",
        time: checkOut.checkOutTime!,
        type: "checkout",
        department: checkOut.employee.department,
        timestamp: checkOut.checkOutTime!,
      })),
      ...recentLeaveRequests.map((request) => ({
        id: `leave-${request.id}`,
        user: `${request.employee.firstName} ${request.employee.lastName}`,
        action: "submitted leave request",
        time: request.createdAt,
        type: "leave",
        department: request.employee.department,
        timestamp: request.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: "PENDING" },
    })

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

    res.json({
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
        lateBy: Math.round(
          (new Date(checkIn.checkInTime).getTime() - lateThreshold.getTime()) / (1000 * 60),
        ),
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
  }),
)

router.get(
  "/employee",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const currentUserId = parseInteger(req.user?.userId)
    if (currentUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      res.json(createMissingProfileResponse())
      return
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const currentDate = new Date()

    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: employee.id,
        year: currentYear,
      },
      orderBy: { leaveType: "asc" },
    })

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

    const weeklyHours = weeklyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0)
    const monthlyHours = monthlyCheckIns.reduce((sum, checkIn) => sum + (checkIn.totalHours || 0), 0)

    const workingDaysThisMonth = getWorkingDaysInMonth(currentYear, currentMonth)
    const daysWithCheckIns = new Set(
      monthlyCheckIns.map((checkIn) => new Date(checkIn.checkInTime).toDateString()),
    ).size
    const attendanceRate =
      workingDaysThisMonth > 0 ? Math.round((daysWithCheckIns / workingDaysThisMonth) * 100) : 0

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

    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        employeeId: employee.id,
        checkOutTime: null,
      },
      orderBy: { checkInTime: "desc" },
    })

    const targetWeeklyHours = 40
    const weeklyPerformance = Math.min(100, (weeklyHours / targetWeeklyHours) * 100)
    const performanceScore = Math.round(attendanceRate * 0.6 + weeklyPerformance * 0.4)

    const annualLeave = finalLeaveBalances.find((balance) => balance.leaveType === "ANNUAL")
    const totalAnnualDays = annualLeave?.totalDays || 25
    const remainingAnnualDays = annualLeave?.remainingDays || 25

    res.json({
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
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8),
    })
  }),
)

function getWorkingDaysInMonth(year: number, month: number): number {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  let workingDays = 0

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
  }

  return workingDays
}

export const dashboardRouter = router
