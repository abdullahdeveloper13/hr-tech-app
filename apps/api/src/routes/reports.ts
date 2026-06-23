import { Router } from "express"
import { prisma } from "@hr/db"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"

const router = Router()

router.get(
  "/analytics",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const startDateParam = typeof req.query.startDate === "string" ? req.query.startDate : null
    const endDateParam = typeof req.query.endDate === "string" ? req.query.endDate : null

    const start = startDateParam
      ? new Date(startDateParam)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDateParam
      ? new Date(endDateParam)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    const totalEmployees = await prisma.employee.count({
      where: { status: "ACTIVE" },
    })

    const employeesByDepartment = await prisma.employee.groupBy({
      by: ["department"],
      where: { status: "ACTIVE" },
      _count: { id: true },
    })

    const employeesByStatus = await prisma.employee.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    const totalCheckIns = await prisma.checkIn.count({
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
      },
    })

    const avgWorkingHours = await prisma.checkIn.aggregate({
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
        totalHours: { not: null },
      },
      _avg: { totalHours: true },
    })

    const allCheckIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end },
      },
      select: { checkInTime: true },
    })

    const dailyAttendanceMap = allCheckIns.reduce((acc, checkIn) => {
      const date = checkIn.checkInTime.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dailyAttendance = Object.entries(dailyAttendanceMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const leaveRequests = await prisma.leaveRequest.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: { id: true },
    })

    const leaveByType = await prisma.leaveRequest.groupBy({
      by: ["leaveType"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "APPROVED",
      },
      _count: { id: true },
      _sum: { totalDays: true },
    })

    const allEmployees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, department: true },
    })

    const checkInsInPeriod = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end },
      },
      select: { employeeId: true },
      distinct: ["employeeId"],
    })

    const checkedInEmployeeIds = new Set(checkInsInPeriod.map((ci) => ci.employeeId))

    const departmentStats = allEmployees.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { total: 0, present: 0 }
      }
      acc[emp.department].total++
      if (checkedInEmployeeIds.has(emp.id)) {
        acc[emp.department].present++
      }
      return acc
    }, {} as Record<string, { total: number; present: number }>)

    const departmentAttendance = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      present_employees: stats.present,
      total_employees: stats.total,
      attendance_rate: stats.total > 0 ? Number(((stats.present / stats.total) * 100).toFixed(2)) : 0,
    }))

    const employeeAttendanceData = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end },
      },
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

    const detailedAttendanceRecords = employeeAttendanceData.map((checkIn) => ({
      id: checkIn.id,
      employeeId: checkIn.employee.employeeId,
      employeeName: `${checkIn.employee.firstName} ${checkIn.employee.lastName}`,
      department: checkIn.employee.department,
      position: checkIn.employee.position,
      checkInTime: checkIn.checkInTime,
      checkOutTime: checkIn.checkOutTime,
      totalHours: checkIn.totalHours,
    }))

    const employeeAttendanceMap = employeeAttendanceData.reduce((acc, checkIn) => {
      const empId = checkIn.employee.id
      if (!acc[empId]) {
        acc[empId] = {
          employeeId: checkIn.employee.employeeId,
          firstName: checkIn.employee.firstName,
          lastName: checkIn.employee.lastName,
          department: checkIn.employee.department,
          position: checkIn.employee.position,
          totalCheckIns: 0,
          totalHours: 0,
          lastCheckIn: null as Date | null,
          daysPresent: new Set<string>(),
        }
      }
      acc[empId].totalCheckIns++
      acc[empId].totalHours += checkIn.totalHours || 0
      acc[empId].daysPresent.add(checkIn.checkInTime.toISOString().split("T")[0])
      if (!acc[empId].lastCheckIn || checkIn.checkInTime > acc[empId].lastCheckIn) {
        acc[empId].lastCheckIn = checkIn.checkInTime
      }
      return acc
    }, {} as Record<string, any>)

    const employeeAttendance = Object.values(employeeAttendanceMap).map((emp: any) => ({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      position: emp.position,
      totalCheckIns: emp.totalCheckIns,
      totalHours: emp.totalHours,
      daysPresent: emp.daysPresent.size,
      lastCheckIn: emp.lastCheckIn,
    }))

    res.json({
      summary: {
        totalEmployees,
        totalCheckIns,
        avgWorkingHours: avgWorkingHours._avg.totalHours || 0,
      },
      employeesByDepartment,
      employeesByStatus,
      dailyAttendance,
      leaveRequests,
      leaveByType,
      departmentAttendance,
      detailedAttendanceRecords,
      employeeAttendance,
    })
  }),
)

router.get(
  "/export",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const reportType = typeof req.query.type === "string" ? req.query.type : "employees"
    const format = typeof req.query.format === "string" ? req.query.format : "json"
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : null
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : null

    let data: any = {}

    switch (reportType) {
      case "employees":
        data = await prisma.employee.findMany({
          include: {
            user: {
              select: { email: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        break

      case "attendance": {
        const attendanceWhere: any = {}
        if (startDate && endDate) {
          attendanceWhere.checkInTime = {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        }

        data = await prisma.checkIn.findMany({
          where: attendanceWhere,
          include: {
            employee: {
              select: {
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
        break
      }

      case "leave": {
        const leaveWhere: any = {}
        if (startDate && endDate) {
          leaveWhere.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        }

        data = await prisma.leaveRequest.findMany({
          where: leaveWhere,
          include: {
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                department: true,
                position: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        break
      }

      default:
        throw new HttpError("Invalid report type", 400)
    }

    if (format === "csv") {
      let csv = ""
      if (data.length > 0) {
        const headers = Object.keys(flattenObject(data[0]))
        csv += headers.join(",") + "\n"

        data.forEach((row: any) => {
          const flatRow = flattenObject(row)
          const values = headers.map((header) => {
            const value = flatRow[header]
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ""
          })
          csv += values.join(",") + "\n"
        })
      }

      res.set({
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=\"${reportType}-report-${new Date().toISOString().split("T")[0]}.csv\"`,
      })
      res.send(csv)
      return
    }

    res.json({
      reportType,
      generatedAt: new Date().toISOString(),
      totalRecords: data.length,
      data,
    })
  }),
)

function flattenObject(obj: any, prefix = ""): any {
  const flattened: any = {}

  for (const key in obj) {
    if (
      obj[key] !== null &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Date)
    ) {
      Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`))
    } else {
      flattened[`${prefix}${key}`] = obj[key]
    }
  }

  return flattened
}

export const reportsRouter = router
