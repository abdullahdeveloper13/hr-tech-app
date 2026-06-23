import { Router } from "express"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

type AttendanceRange = "week" | "month" | "year"

function normalizeRange(value: string | null): AttendanceRange {
  if (value === "month" || value === "year") {
    return value
  }
  return "week"
}

router.get(
  "/reports",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const range = normalizeRange(typeof req.query.range === "string" ? req.query.range : null)

    const user = await prisma.user.findUnique({
      where: { email: req.user?.email ?? "" },
      include: { employee: true },
    })

    if (!user?.employee) {
      res.set({
        "x-profile-missing": "true",
        "x-profile-message": "Employee profile not found. Please contact HR to set up your employee record.",
      })
      res.json([])
      return
    }

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

    res.json(formattedData)
  }),
)

export const attendanceRouter = router
