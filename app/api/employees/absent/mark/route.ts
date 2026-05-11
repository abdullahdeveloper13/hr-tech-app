import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonError, parseDate, parseInteger, startOfDay } from "@/lib/api/route-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    if (session.user.role !== "ADMIN") {
      return jsonError("Forbidden - Only admins can mark absent", 403)
    }

    const body = await request.json()
    const parsedEmployeeId = parseInteger(String(body.employeeId))

    if (parsedEmployeeId === null) {
      return jsonError("Valid employee ID is required", 400)
    }

    const absentDateInput = parseDate(typeof body.date === "string" ? body.date : null)
    const absentDate = startOfDay(absentDateInput ?? new Date())

    const employee = await prisma.employee.findUnique({
      where: { id: parsedEmployeeId },
    })

    if (!employee) {
      return jsonError("Employee not found", 404)
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
      select: { id: true },
    })

    if (!currentUser) {
      return jsonError("User not found", 404)
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
        markedBy: currentUser.id,
      },
      create: {
        employeeId: parsedEmployeeId,
        date: absentDate,
        status: "ABSENT",
        reason: typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : null,
        markedBy: currentUser.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `${employee.firstName} ${employee.lastName} marked as absent`,
      absent,
    })
  } catch (error) {
    console.error("Failed to mark absent:", error)
    return jsonError("Failed to mark absent", 500)
  }
}

export async function GET() {
  return jsonError("Method not allowed", 405)
}
