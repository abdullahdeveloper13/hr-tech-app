import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, getCurrentUserFromSession } from "@/lib/auth"
import { Role } from "@prisma/client"
import { jsonError, parseDate, parseInteger } from "@/lib/api/route-utils"

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role)
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication for all registrations
    const currentUser = await getCurrentUserFromSession()
    
    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN and HR to register new users
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return jsonError("Forbidden: Only administrators can register new users", 403)
    }

    const {
      email,
      password,
      firstName,
      lastName,
      department,
      position,
      employeeId,
      hireDate,
      role = Role.EMPLOYEE,
    } = await request.json() as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      department?: string
      position?: string
      employeeId?: number | string
      hireDate?: string
      role?: string
    }

    if (!email || !password || !firstName || !lastName || !department || !position || !employeeId) {
      return jsonError("All required fields must be provided", 400)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedRole = role.toUpperCase()
    if (!isValidRole(normalizedRole)) {
      return jsonError("Invalid role", 400)
    }

    const parsedEmployeeId = parseInteger(String(employeeId))
    if (parsedEmployeeId === null) {
      return jsonError("Invalid employeeId", 400)
    }

    const parsedHireDate = parseDate(hireDate)
    if (!parsedHireDate) {
      return jsonError("Invalid hireDate", 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return jsonError("User already exists", 409)
    }

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: parsedEmployeeId },
    })

    if (existingEmployee) {
      return jsonError("Employee ID already exists", 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: normalizedRole,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: parsedEmployeeId,
          firstName,
          lastName,
          department,
          position,
          hireDate: parsedHireDate,
        },
      })

      return { user, employee }
    })

    // Return success response without token (admin is registering for someone else)
    return NextResponse.json({
      message: "Employee registered successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        employee: result.employee,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return jsonError("Internal server error", 500)
  }
}
