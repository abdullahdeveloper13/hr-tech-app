import { Router } from "express"
import { prisma } from "@hr/db"
import { LeaveType } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, type AuthenticatedRequest, requireRole } from "../middleware/auth"
import { parseDate, parseInteger, startOfDay } from "../utils/route-utils"

const router = Router()

const PROFILE_MISSING_MESSAGE = "Employee profile not found. Please contact HR to set up your employee record."
const QUERY_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const
const DEFAULT_LEAVE_DAYS_BY_TYPE: Record<LeaveType, number> = {
  [LeaveType.ANNUAL]: 25,
  [LeaveType.SICK]: 10,
  [LeaveType.MATERNITY]: 90,
  [LeaveType.PATERNITY]: 14,
  [LeaveType.PERSONAL]: 5,
  [LeaveType.EMERGENCY]: 5,
}

function isValidLeaveType(value: string): value is LeaveType {
  return Object.values(LeaveType).includes(value as LeaveType)
}

function isValidQueryStatus(value: string): value is (typeof QUERY_STATUSES)[number] {
  return QUERY_STATUSES.includes(value as (typeof QUERY_STATUSES)[number])
}

router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : null
    const employeeIdParam = typeof req.query.employeeId === "string" ? req.query.employeeId : null
    const requestedEmployeeId = parseInteger(employeeIdParam)
    if (employeeIdParam && requestedEmployeeId === null) {
      throw new HttpError("Invalid employeeId", 400)
    }

    const page = parseInteger(typeof req.query.page === "string" ? req.query.page : null) ?? 1
    const limit = parseInteger(typeof req.query.limit === "string" ? req.query.limit : null) ?? 10
    if (page < 1 || limit < 1 || limit > 100) {
      throw new HttpError("Invalid pagination parameters", 400)
    }

    const currentUserId = parseInteger(req.user?.userId)
    if (currentUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    if (!employee) {
      res.json({
        leaveRequests: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
        hasEmployeeProfile: false,
        message: PROFILE_MISSING_MESSAGE,
      })
      return
    }

    const where: Prisma.LeaveRequestWhereInput = {}

    if (!req.user || !["ADMIN", "HR", "MANAGER"].includes(req.user.role)) {
      where.employeeId = employee.id
    } else if (requestedEmployeeId !== null) {
      where.employeeId = requestedEmployeeId
    }

    if (status) {
      if (!isValidQueryStatus(status)) {
        throw new HttpError("Invalid leave status filter", 400)
      }
      where.status = status
    }

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ])

    res.json({
      leaveRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      hasEmployeeProfile: true,
      message: null,
    })
  }),
)

router.post(
  "/",
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
      throw new HttpError(PROFILE_MISSING_MESSAGE, 409, { code: "EMPLOYEE_PROFILE_MISSING" })
    }

    const { leaveType, startDate, endDate, reason } = req.body as {
      leaveType?: string
      startDate?: string
      endDate?: string
      reason?: string
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      throw new HttpError("All fields are required", 400)
    }

    if (!isValidLeaveType(leaveType)) {
      throw new HttpError("Invalid leave type", 400)
    }

    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end) {
      throw new HttpError("Invalid leave dates", 400)
    }

    if (start >= end) {
      throw new HttpError("End date must be after start date", 400)
    }

    if (startOfDay(start) < startOfDay(new Date())) {
      throw new HttpError("Start date cannot be in the past", 400)
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const currentYear = new Date().getFullYear()
    let leaveBalance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: employee.id,
          leaveType,
          year: currentYear,
        },
      },
    })

    if (!leaveBalance) {
      const totalDays = DEFAULT_LEAVE_DAYS_BY_TYPE[leaveType]
      leaveBalance = await prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          leaveType,
          totalDays,
          usedDays: 0,
          remainingDays: totalDays,
          year: currentYear,
        },
      })
    }

    if (leaveBalance.remainingDays < totalDays) {
      throw new HttpError(`Insufficient leave balance. Available: ${leaveBalance.remainingDays} days`, 400)
    }

    const overlappingRequest = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    })

    if (overlappingRequest) {
      throw new HttpError("You have an overlapping leave request", 400)
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
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
    })

    res.status(201).json(leaveRequest)
  }),
)

router.get(
  "/balance",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : null
    const year = parseInteger(typeof req.query.year === "string" ? req.query.year : null) ?? new Date().getFullYear()
    if (year < 2000 || year > 2100) {
      throw new HttpError("Invalid year", 400)
    }

    const currentUserId = parseInteger(req.user?.userId)
    if (currentUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    let targetEmployeeId: number

    if (employeeId && ["ADMIN", "HR", "MANAGER"].includes(req.user?.role ?? "")) {
      const parsedEmployeeId = parseInteger(employeeId)
      if (parsedEmployeeId === null) {
        throw new HttpError("Invalid employeeId", 400)
      }
      targetEmployeeId = parsedEmployeeId
    } else {
      const employee = await prisma.employee.findFirst({
        where: { userId: currentUserId },
      })

      if (!employee) {
        res.set({
          "x-profile-missing": "true",
          "x-profile-message": PROFILE_MISSING_MESSAGE,
        })
        res.json([])
        return
      }

      targetEmployeeId = employee.id
    }

    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: targetEmployeeId,
        year,
      },
      orderBy: { leaveType: "asc" },
    })

    const existingTypes = new Set(leaveBalances.map((balance) => balance.leaveType))
    const missingTypes = (Object.values(LeaveType) as LeaveType[]).filter(
      (type) => !existingTypes.has(type),
    )

    if (missingTypes.length > 0) {
      const createdBalances = await Promise.all(
        missingTypes.map((leaveType) => {
          const totalDays = DEFAULT_LEAVE_DAYS_BY_TYPE[leaveType]
          return prisma.leaveBalance.create({
            data: {
              employeeId: targetEmployeeId,
              leaveType,
              totalDays,
              usedDays: 0,
              remainingDays: totalDays,
              year,
            },
          })
        }),
      )

      res.json([...leaveBalances, ...createdBalances])
      return
    }

    res.json(leaveBalances)
  }),
)

router.put(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const leaveRequestId = parseInteger(req.params.id)
    if (leaveRequestId === null) {
      throw new HttpError("Invalid leave request id", 400)
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { employee: true },
    })

    if (!leaveRequest) {
      throw new HttpError("Leave request not found", 404)
    }

    if (leaveRequest.status !== "PENDING") {
      throw new HttpError("Leave request has already been processed", 400)
    }

    const { status, rejectedReason } = req.body as { status?: string; rejectedReason?: string }

    const processableStatuses = ["APPROVED", "REJECTED"] as const
    if (!status || !processableStatuses.includes(status as (typeof processableStatuses)[number])) {
      throw new HttpError("Invalid status", 400)
    }

    if (status === "REJECTED" && (!rejectedReason || !rejectedReason.trim())) {
      throw new HttpError("Rejection reason is required", 400)
    }

    const approverUserId = parseInteger(req.user?.userId)
    if (approverUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const approver = await prisma.employee.findFirst({
      where: { userId: approverUserId },
    })

    const updateData: Prisma.LeaveRequestUpdateInput = {
      status,
      approvedBy: approver?.id?.toString(),
      approvedAt: new Date(),
    }

    if (status === "REJECTED") {
      updateData.rejectedReason = rejectedReason?.trim()
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: updateData,
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
      })

      if (status === "APPROVED") {
        const currentYear = new Date().getFullYear()
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveType_year: {
              employeeId: leaveRequest.employeeId,
              leaveType: leaveRequest.leaveType,
              year: currentYear,
            },
          },
          data: {
            usedDays: { increment: leaveRequest.totalDays },
            remainingDays: { decrement: leaveRequest.totalDays },
          },
        })
      }

      return updatedRequest
    })

    res.json(result)
  }),
)

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const leaveRequestId = parseInteger(req.params.id)
    if (leaveRequestId === null) {
      throw new HttpError("Invalid leave request id", 400)
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { employee: true },
    })

    if (!leaveRequest) {
      throw new HttpError("Leave request not found", 404)
    }

    const currentUserId = parseInteger(req.user?.userId)
    if (currentUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const canDelete =
      (currentUserId === leaveRequest.employee.userId && leaveRequest.status === "PENDING") ||
      ["ADMIN", "HR"].includes(req.user?.role ?? "")

    if (!canDelete) {
      throw new HttpError("Cannot delete this leave request", 403)
    }

    await prisma.leaveRequest.delete({
      where: { id: leaveRequestId },
    })

    res.json({ message: "Leave request deleted successfully" })
  }),
)

export const leaveRouter = router
