import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseDate, parseInteger, startOfDay } from "@/lib/api/route-utils"
import { LeaveType, Prisma } from "@prisma/client"

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

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const employeeIdParam = searchParams.get("employeeId")
    const requestedEmployeeId = parseInteger(employeeIdParam)
    if (employeeIdParam && requestedEmployeeId === null) {
      return jsonError("Invalid employeeId", 400)
    }

    const page = parseInteger(searchParams.get("page")) ?? 1
    const limit = parseInteger(searchParams.get("limit")) ?? 10
    if (page < 1 || limit < 1 || limit > 100) {
      return jsonError("Invalid pagination parameters", 400)
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
      return NextResponse.json({
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
    }

    const where: Prisma.LeaveRequestWhereInput = {}

    // If user is not admin/hr/manager, only show their own requests
    if (!["ADMIN", "HR", "MANAGER"].includes(currentUser.role)) {
      where.employeeId = employee.id
    } else if (requestedEmployeeId !== null) {
      where.employeeId = requestedEmployeeId
    }

    if (status) {
      if (!isValidQueryStatus(status)) {
        return jsonError("Invalid leave status filter", 400)
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

    return NextResponse.json({
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
  } catch (error) {
    console.error("Get leave requests error:", error)
    return jsonError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
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
      return jsonError(PROFILE_MISSING_MESSAGE, 409, { code: "EMPLOYEE_PROFILE_MISSING" })
    }

    const { leaveType, startDate, endDate, reason } = await request.json()

    if (!leaveType || !startDate || !endDate || !reason) {
      return jsonError("All fields are required", 400)
    }

    if (!isValidLeaveType(leaveType)) {
      return jsonError("Invalid leave type", 400)
    }

    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end) {
      return jsonError("Invalid leave dates", 400)
    }

    if (start >= end) {
      return jsonError("End date must be after start date", 400)
    }

    if (startOfDay(start) < startOfDay(new Date())) {
      return jsonError("Start date cannot be in the past", 400)
    }

    // Calculate total days (excluding weekends for now - can be enhanced)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Check leave balance
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
      return jsonError(
        `Insufficient leave balance. Available: ${leaveBalance.remainingDays} days`,
        400,
      )
    }

    // Check for overlapping requests
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
      return jsonError("You have an overlapping leave request", 400)
    }

    // Create leave request
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

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error("Create leave request error:", error)
    return jsonError("Internal server error", 500)
  }
}
