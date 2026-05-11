import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseDate, parseInteger } from "@/lib/api/route-utils"
import { Role } from "@prisma/client"

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role)
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN, HR, and MANAGER to view all employees
    if (!["ADMIN", "HR", "MANAGER"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInteger(searchParams.get("limit")) ?? 0

    // Fetch all employees with their user info
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

    // Format the response
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

    return NextResponse.json({
      employees: formattedEmployees,
      count: formattedEmployees.length,
    })
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return jsonError("Failed to fetch employees", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN and HR to create new employees
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    const body = await request.json() as {
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

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.position || !body.department || !body.hireDate) {
      return jsonError("Missing required fields", 400)
    }

    const hireDate = parseDate(body.hireDate)
    if (!hireDate) {
      return jsonError("Invalid hireDate", 400)
    }

    let parsedEmployeeId: number | null = null
    if (body.employeeId !== undefined && String(body.employeeId).trim()) {
      parsedEmployeeId = parseInteger(String(body.employeeId))
      if (parsedEmployeeId === null) {
        return jsonError("Invalid employeeId", 400)
      }
    }

    let userId: number

    if (body.userId !== undefined && String(body.userId).trim()) {
      const parsedUserId = parseInteger(String(body.userId))
      if (parsedUserId === null) {
        return jsonError("Invalid userId", 400)
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: parsedUserId },
        include: { employee: true },
      })

      if (!existingUser) {
        return jsonError("User not found", 404)
      }

      if (existingUser.employee) {
        return jsonError("This user already has an employee profile", 409)
      }

      userId = existingUser.id
    } else {
      const normalizedEmail = body.email?.trim().toLowerCase()
      const password = body.password?.trim()
      const normalizedRole = (body.role ?? "EMPLOYEE").toUpperCase()

      if (!normalizedEmail || !password) {
        return jsonError("email and password are required when userId is not provided", 400)
      }

      if (!isValidRole(normalizedRole)) {
        return jsonError("Invalid role", 400)
      }

      if (password.length < 6) {
        return jsonError("Password must be at least 6 characters", 400)
      }

      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (existingUserByEmail) {
        return jsonError("User already exists with this email", 409)
      }

      const hashedPassword = await hashPassword(password)
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
      return jsonError("Invalid salary", 400)
    }

    if (parsedEmployeeId !== null) {
      const existingEmployeeId = await prisma.employee.findUnique({
        where: { employeeId: parsedEmployeeId },
        select: { id: true },
      })
      if (existingEmployeeId) {
        return jsonError("Employee ID already exists", 409)
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

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Failed to create employee:", error)
    return jsonError("Failed to create employee", 500)
  }
}
