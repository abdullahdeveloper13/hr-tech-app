import { Router } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "@hr/db"
import { Role } from "@prisma/client"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, requireRole, type AuthenticatedRequest } from "../middleware/auth"
import { parseDate, parseInteger, startOfDay } from "../utils/route-utils"

const router = Router()

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role)
}

router.get(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR", "MANAGER"]),
  asyncHandler(async (req, res) => {
    const limit = parseInteger(String(req.query.limit ?? "")) ?? 0

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit > 0 ? Math.min(limit, 1000) : undefined,
    })

    const formattedEmployees = employees.map((emp) => ({
      id: emp.id.toString(),
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      hireDate: emp.hireDate,
      user: {
        email: emp.user?.email || "",
      },
    }))

    res.json({
      employees: formattedEmployees,
      count: formattedEmployees.length,
    })
  }),
)

router.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "HR"]),
  asyncHandler(async (req, res) => {
    const body = req.body as {
      userId?: string | number
      email?: string
      password?: string
      role?: string
      employeeId?: string | number
      firstName?: string
      lastName?: string
      position?: string
      department?: string
      hireDate?: string
      salary?: string | number
      phoneNumber?: string
      address?: string
      emergencyContact?: string
    }

    if (!body.firstName || !body.lastName || !body.position || !body.department || !body.hireDate) {
      throw new HttpError("Missing required fields", 400)
    }

    const hireDate = parseDate(body.hireDate)
    if (!hireDate) {
      throw new HttpError("Invalid hireDate", 400)
    }

    let parsedEmployeeId: number | null = null
    if (body.employeeId !== undefined && String(body.employeeId).trim()) {
      parsedEmployeeId = parseInteger(String(body.employeeId))
      if (parsedEmployeeId === null) {
        throw new HttpError("Invalid employeeId", 400)
      }
    }

    let userId: number

    if (body.userId !== undefined && String(body.userId).trim()) {
      const parsedUserId = parseInteger(String(body.userId))
      if (parsedUserId === null) {
        throw new HttpError("Invalid userId", 400)
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: parsedUserId },
        include: { employee: true },
      })

      if (!existingUser) {
        throw new HttpError("User not found", 404)
      }

      if (existingUser.employee) {
        throw new HttpError("This user already has an employee profile", 409)
      }

      userId = existingUser.id
    } else {
      const normalizedEmail = body.email?.trim().toLowerCase()
      const password = body.password?.trim()
      const normalizedRole = (body.role ?? "EMPLOYEE").toUpperCase()

      if (!normalizedEmail || !password) {
        throw new HttpError("email and password are required when userId is not provided", 400)
      }

      if (!isValidRole(normalizedRole)) {
        throw new HttpError("Invalid role", 400)
      }

      if (password.length < 6) {
        throw new HttpError("Password must be at least 6 characters", 400)
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (existingUserByEmail) {
        throw new HttpError("User already exists with this email", 409)
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const createdUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: normalizedRole,
        },
      })
      userId = createdUser.id
    }

    const salary =
      body.salary !== undefined && String(body.salary).trim() !== ""
        ? Number(body.salary)
        : null
    if (salary !== null && !Number.isFinite(salary)) {
      throw new HttpError("Invalid salary", 400)
    }

    if (parsedEmployeeId !== null) {
      const existingEmployeeId = await prisma.employee.findUnique({
        where: { employeeId: parsedEmployeeId },
        select: { id: true },
      })
      if (existingEmployeeId) {
        throw new HttpError("Employee ID already exists", 409)
      }
    }

    const employee = await prisma.employee.create({
      data: {
        ...(parsedEmployeeId !== null ? { employeeId: parsedEmployeeId } : {}),
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        position: body.position.trim(),
        department: body.department.trim(),
        hireDate,
        phoneNumber: body.phoneNumber?.trim() || null,
        address: body.address?.trim() || null,
        emergencyContact: body.emergencyContact?.trim() || null,
        salary,
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    res.status(201).json(employee)
  }),
)

router.get(
  "/absent",
  authenticate,
  requireRole(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const dateParam = String(req.query.date ?? "")
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const markedAbsentRecords = await prisma.absent.findMany({
      where: {
        date: targetDate,
        status: "ABSENT",
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: [
        { employee: { department: "asc" } },
        { employee: { firstName: "asc" } },
      ],
    })

    res.json({
      marked: markedAbsentRecords,
      count: markedAbsentRecords.length,
    })
  }),
)

router.post(
  "/absent/mark",
  authenticate,
  requireRole(["ADMIN"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = req.body as { employeeId?: string | number; date?: string; reason?: string }
    const parsedEmployeeId = parseInteger(String(body.employeeId))

    if (parsedEmployeeId === null) {
      throw new HttpError("Valid employee ID is required", 400)
    }

    const absentDateInput = parseDate(typeof body.date === "string" ? body.date : null)
    const absentDate = startOfDay(absentDateInput ?? new Date())

    const employee = await prisma.employee.findUnique({
      where: { id: parsedEmployeeId },
    })

    if (!employee) {
      throw new HttpError("Employee not found", 404)
    }

    const currentUserId = parseInteger(req.user?.userId)
    if (currentUserId === null) {
      throw new HttpError("User not found", 404)
    }

    const absent = await prisma.absent.upsert({
      where: {
        employeeId_date: {
          employeeId: parsedEmployeeId,
          date: absentDate,
        },
      },
      update: {
        status: "ABSENT",
        reason: typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : null,
        markedBy: currentUserId,
      },
      create: {
        employeeId: parsedEmployeeId,
        date: absentDate,
        status: "ABSENT",
        reason: typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : null,
        markedBy: currentUserId,
      },
    })

    res.json({
      success: true,
      message: `${employee.firstName} ${employee.lastName} marked as absent`,
      absent,
    })
  }),
)

router.post(
  "/absent/unmark",
  authenticate,
  requireRole(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const body = req.body as { employeeId?: string | number; date?: string }

    const parsedEmployeeId = parseInteger(String(body.employeeId))
    if (parsedEmployeeId === null) {
      throw new HttpError("Valid employee ID is required", 400)
    }

    const absentDate = startOfDay(parseDate(typeof body.date === "string" ? body.date : null) ?? new Date())

    const absent = await prisma.absent.findUnique({
      where: {
        employeeId_date: {
          employeeId: parsedEmployeeId,
          date: absentDate,
        },
      },
    })

    if (!absent) {
      throw new HttpError("Absent record not found", 404)
    }

    await prisma.absent.delete({
      where: {
        employeeId_date: {
          employeeId: parsedEmployeeId,
          date: absentDate,
        },
      },
    })

    const employee = await prisma.employee.findUnique({
      where: { id: parsedEmployeeId },
    })

    res.json({
      success: true,
      message: `${employee?.firstName ?? "Employee"} ${employee?.lastName ?? ""} unmarked as absent`.trim(),
    })
  }),
)

router.get(
  "/absent/list",
  authenticate,
  requireRole(["ADMIN"]),
  asyncHandler(async (_req, res) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

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

    const absentEmployees = allEmployees.filter(
      (emp) =>
        !checkedInIds.has(emp.id) &&
        !markedAbsentIds.has(emp.id) &&
        !onLeaveIds.has(emp.id),
    )

    res.json({
      absent: absentEmployees,
      total: allEmployees.length,
      checkedIn: checkedInToday.length,
      markedAbsent: markedAbsentToday.length,
      onLeave: onLeaveToday.length,
      date: today.toISOString().split("T")[0],
    })
  }),
)

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const employeeId = parseInteger(req.params.id)
    if (employeeId === null) {
      throw new HttpError("Invalid employee id", 400)
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        leaveBalances: true,
        checkIns: {
          orderBy: {
            checkInTime: "desc",
          },
        },
        leaveRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!employee) {
      throw new HttpError("Employee not found", 404)
    }

    const currentUserRole = req.user?.role
    const isPrivileged = ["ADMIN", "HR", "MANAGER"].includes(currentUserRole ?? "")
    const isOwnProfile = employee.user.email === req.user?.email

    if (!isPrivileged && !isOwnProfile) {
      throw new HttpError("Forbidden", 403)
    }

    res.json(employee)
  }),
)

router.put(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const employeeId = parseInteger(req.params.id)
    if (employeeId === null) {
      throw new HttpError("Invalid employee id", 400)
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    })

    if (!employee) {
      throw new HttpError("Employee not found", 404)
    }

    const isAdmin = req.user?.role === "ADMIN"
    const isOwnProfile = employee.user.email === req.user?.email

    if (!isAdmin && !isOwnProfile) {
      throw new HttpError("Forbidden - You can only edit your own profile", 403)
    }

    if (req.body.status && !isAdmin) {
      throw new HttpError("Only admins can change employee status", 403)
    }

    if (req.body.email && req.body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(req.body.email)) {
        throw new HttpError("Invalid email format", 400)
      }

      if (req.body.email !== employee.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: req.body.email },
        })

        if (existingUser) {
          throw new HttpError("Email already in use", 400)
        }
      }
    }

    if (req.body.bankIban && req.body.bankIban.trim()) {
      const cleanIBAN = req.body.bankIban.replace(/\s/g, "").toUpperCase()
      if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
        throw new HttpError("Invalid IBAN format. Please enter a valid IBAN number.", 400)
      }
      if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN)) {
        throw new HttpError("Invalid IBAN format. Please enter a valid IBAN number.", 400)
      }
      if (cleanIBAN.startsWith("PK") && cleanIBAN.length !== 24) {
        throw new HttpError("Invalid IBAN format. Please enter a valid IBAN number.", 400)
      }
    }

    if (req.body.bankAccountNumber && req.body.bankAccountNumber.trim()) {
      const clean = req.body.bankAccountNumber.replace(/\s/g, "")
      if (!/^\d{8,17}$/.test(clean)) {
        throw new HttpError("Invalid account number. Please enter 8-17 digits.", 400)
      }
    }

    if (req.body.bankAccountTitle && req.body.bankAccountTitle.trim()) {
      const clean = req.body.bankAccountTitle.trim()
      if (clean.length < 2 || clean.length > 100) {
        throw new HttpError("Invalid account title. Must be 2-100 characters with only letters, numbers, spaces, and hyphens.", 400)
      }
      if (!/^[a-zA-Z0-9\s\-\.]+$/.test(clean)) {
        throw new HttpError("Invalid account title. Must be 2-100 characters with only letters, numbers, spaces, and hyphens.", 400)
      }
    }

    const isBankDetailsUpdate =
      req.body.bankAccountNumber !== undefined ||
      req.body.bankIban !== undefined ||
      req.body.bankAccountTitle !== undefined

    if (req.body.email && req.body.email !== employee.user.email) {
      await prisma.user.update({
        where: { id: employee.user.id },
        data: { email: req.body.email },
      })
    }

    const updateData: Record<string, unknown> = {
      firstName: req.body.firstName !== undefined ? req.body.firstName : employee.firstName,
      lastName: req.body.lastName !== undefined ? req.body.lastName : employee.lastName,
      phoneNumber: req.body.phoneNumber !== undefined ? req.body.phoneNumber : employee.phoneNumber,
      address: req.body.address !== undefined ? req.body.address : employee.address,
      emergencyContact: req.body.emergencyContact !== undefined ? req.body.emergencyContact : employee.emergencyContact,
      bankAccountNumber: req.body.bankAccountNumber !== undefined ? req.body.bankAccountNumber : employee.bankAccountNumber,
      bankIban: req.body.bankIban !== undefined ? req.body.bankIban : employee.bankIban,
      bankAccountTitle: req.body.bankAccountTitle !== undefined ? req.body.bankAccountTitle : employee.bankAccountTitle,
    }

    if (isBankDetailsUpdate) {
      updateData.bankDetailsUpdatedAt = new Date()
    }

    if (req.body.status !== undefined && isAdmin) {
      updateData.status = req.body.status
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        leaveBalances: true,
        checkIns: {
          orderBy: {
            checkInTime: "desc",
          },
        },
        leaveRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    res.json(updatedEmployee)
  }),
)

router.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN"]),
  asyncHandler(async (req, res) => {
    const employeeId = parseInteger(req.params.id)
    if (employeeId === null) {
      throw new HttpError("Invalid employee id", 400)
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    })

    if (!employee) {
      throw new HttpError("Employee not found", 404)
    }

    await prisma.employee.delete({
      where: { id: employeeId },
    })

    res.json({ success: true })
  }),
)

export const employeesRouter = router
