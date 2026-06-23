import { Router } from "express"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"
import { endOfDay, parseDate, parseInteger, startOfDay } from "../utils/route-utils"
import type { Prisma } from "@prisma/client"

const router = Router()

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

router.get(
  "/all",
  authenticate,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  asyncHandler(async (req, res) => {
    const parsedDate = parseDate(String(req.query.date ?? "")) ?? new Date()
    const employeeId = parseInteger(String(req.query.employeeId ?? ""))
    if (req.query.employeeId && employeeId === null) {
      throw new HttpError("Invalid employeeId", 400)
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

    res.json({
      checkIns,
      stats: {
        totalEmployees,
        presentToday,
        currentlyCheckedIn,
        attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
      },
    })
  }),
)

router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const currentUserId = parseUserId(req.user?.userId ?? "")
    if (!currentUserId) {
      throw new HttpError("Unauthorized", 401)
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      res.status(409).json({
        error: PROFILE_MISSING_MESSAGE,
        code: "EMPLOYEE_PROFILE_MISSING",
      })
      return
    }

    const { action, notes, location } = req.body as {
      action?: string
      notes?: string
      location?: string
    }

    if (action === "checkin") {
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
          throw new HttpError("Already checked in today", 400)
        }
        throw new HttpError("You have already completed your check-in/check-out for today", 400)
      }

      const checkIn = await prisma.checkIn.create({
        data: {
          employeeId: employee.id,
          checkInTime: new Date(),
          notes,
          location,
        },
      })

      res.status(201).json(checkIn)
      return
    }

    if (action === "checkout") {
      const activeCheckIn = await prisma.checkIn.findFirst({
        where: {
          employeeId: employee.id,
          checkOutTime: null,
        },
        orderBy: { checkInTime: "desc" },
      })

      if (!activeCheckIn) {
        throw new HttpError("No active check-in found", 400)
      }

      const checkOutTime = new Date()
      const totalHours =
        (checkOutTime.getTime() - activeCheckIn.checkInTime.getTime()) / (1000 * 60 * 60)

      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: activeCheckIn.id },
        data: {
          checkOutTime,
          totalHours: Math.round(totalHours * 100) / 100,
          notes: notes || activeCheckIn.notes,
        },
      })

      res.json(updatedCheckIn)
      return
    }

    throw new HttpError("Invalid action", 400)
  }),
)

router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const currentUserId = parseUserId(req.user?.userId ?? "")
    if (!currentUserId) {
      throw new HttpError("Unauthorized - Please log in again", 401)
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      res.json(createMissingProfileStatus())
      return
    }

    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        employeeId: employee.id,
        checkOutTime: null,
      },
      orderBy: { checkInTime: "desc" },
    })

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

    const hasCompletedWorkDay = !!(todayCheckIn && todayCheckIn.checkOutTime !== null)
    const hasCheckedInToday = !!todayCheckIn
    const isCurrentlyCheckedIn = !!activeCheckIn

    const recentCheckIns = await prisma.checkIn.findMany({
      where: { employeeId: employee.id },
      orderBy: { checkInTime: "desc" },
      take: 10,
    })

    res.json({
      activeCheckIn,
      recentCheckIns,
      isCheckedIn: isCurrentlyCheckedIn,
      hasCompletedWorkDay,
      hasCheckedInToday,
      todayCheckIn,
      hasEmployeeProfile: true,
      message: null,
    })
  }),
)

export const checkinRouter = router
