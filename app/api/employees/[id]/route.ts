import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { jsonError, parseInteger } from "@/lib/api/route-utils"

// Validation functions
function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase()
  
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return false
  }
  
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN)) {
    return false
  }
  
  if (cleanIBAN.startsWith("PK") && cleanIBAN.length !== 24) {
    return false
  }
  
  return true
}

function validateAccountNumber(accountNumber: string): boolean {
  const clean = accountNumber.replace(/\s/g, "")
  
  if (!/^\d{8,17}$/.test(clean)) {
    return false
  }
  
  return true
}

function validateAccountTitle(title: string): boolean {
  const clean = title.trim()
  
  if (clean.length < 2 || clean.length > 100) {
    return false
  }
  
  if (!/^[a-zA-Z0-9\s\-\.]+$/.test(clean)) {
    return false
  }
  
  return true
}

// ✅ Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    const { id } = await params
    const employeeId = parseInteger(id)
    if (employeeId === null) {
      return jsonError("Invalid employee id", 400)
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
            checkInTime: "desc"
          }
        },
        leaveRequests: {
          orderBy: {
            createdAt: "desc"
          }
        },
      },
    })

    if (!employee) {
      return jsonError("Employee not found", 404)
    }

    const currentUserRole = session.user.role
    const isPrivileged = ["ADMIN", "HR", "MANAGER"].includes(currentUserRole)
    const isOwnProfile = employee.user.email === session.user.email

    if (!isPrivileged && !isOwnProfile) {
      return jsonError("Forbidden", 403)
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Failed to fetch employee:", error)
    return jsonError("Failed to fetch employee", 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    const { id } = await params
    const body = await request.json()
    const employeeId = parseInteger(id)
    if (employeeId === null) {
      return jsonError("Invalid employee id", 400)
    }

    // Get the employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    })

    if (!employee) {
      return jsonError("Employee not found", 404)
    }

    const isAdmin = session.user.role === "ADMIN"
    const isOwnProfile = employee.user.email === session.user.email

    // Permission check - user can edit own profile or admin can edit any profile
    if (!isAdmin && !isOwnProfile) {
      return jsonError("Forbidden - You can only edit your own profile", 403)
    }

    // Only admins can change status
    if (body.status && !isAdmin) {
      return jsonError("Only admins can change employee status", 403)
    }

    // ✅ Validate email if provided
    if (body.email && body.email.trim()) {
      if (!validateEmail(body.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }

      // ✅ Check if email already exists (and it's not their current email)
      if (body.email !== employee.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: body.email },
        })

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          )
        }
      }
    }

    // Validate IBAN if provided
    if (body.bankIban && body.bankIban.trim()) {
      if (!validateIBAN(body.bankIban)) {
        return jsonError("Invalid IBAN format. Please enter a valid IBAN number.", 400)
      }
    }

    // Validate Account Number if provided
    if (body.bankAccountNumber && body.bankAccountNumber.trim()) {
      if (!validateAccountNumber(body.bankAccountNumber)) {
        return jsonError("Invalid account number. Please enter 8-17 digits.", 400)
      }
    }

    // Validate Account Title if provided
    if (body.bankAccountTitle && body.bankAccountTitle.trim()) {
      if (!validateAccountTitle(body.bankAccountTitle)) {
        return jsonError("Invalid account title. Must be 2-100 characters with only letters, numbers, spaces, and hyphens.", 400)
      }
    }

    // ✅ Check if bank details are being updated
    const isBankDetailsUpdate =
      body.bankAccountNumber !== undefined ||
      body.bankIban !== undefined ||
      body.bankAccountTitle !== undefined

    // ✅ Update user email if provided and different
    if (body.email && body.email !== employee.user.email) {
      await prisma.user.update({
        where: { id: employee.user.id },
        data: { email: body.email },
      })
    }

    // Prepare update data
    const updateData: any = {
      firstName: body.firstName !== undefined ? body.firstName : employee.firstName,
      lastName: body.lastName !== undefined ? body.lastName : employee.lastName,
      phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber : employee.phoneNumber,
      address: body.address !== undefined ? body.address : employee.address,
      emergencyContact: body.emergencyContact !== undefined ? body.emergencyContact : employee.emergencyContact,
      
      // Bank info - Employees can edit their own, Admins can edit anyone's
      bankAccountNumber: body.bankAccountNumber !== undefined ? body.bankAccountNumber : employee.bankAccountNumber,
      bankIban: body.bankIban !== undefined ? body.bankIban : employee.bankIban,
      bankAccountTitle: body.bankAccountTitle !== undefined ? body.bankAccountTitle : employee.bankAccountTitle,
    }

    // ✅ Set timestamp if bank details are being updated
    if (isBankDetailsUpdate) {
      updateData.bankDetailsUpdatedAt = new Date()
    }

    // Only admins can change status
    if (body.status !== undefined && isAdmin) {
      updateData.status = body.status
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
            checkInTime: "desc"
          }
        },
        leaveRequests: {
          orderBy: {
            createdAt: "desc"
          }
        },
      },
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Failed to update employee:", error)
    return jsonError("Failed to update employee", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    if (session.user.role !== "ADMIN") {
      return jsonError("Only admins can delete employees", 403)
    }

    const { id } = await params
    const employeeId = parseInteger(id)
    if (employeeId === null) {
      return jsonError("Invalid employee id", 400)
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    })

    if (!employee) {
      return jsonError("Employee not found", 404)
    }

    await prisma.employee.delete({
      where: { id: employeeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete employee:", error)
    return jsonError("Failed to delete employee", 500)
  }
}
