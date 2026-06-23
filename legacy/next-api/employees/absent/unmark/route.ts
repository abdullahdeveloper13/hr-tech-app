import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { jsonError, parseDate, parseInteger, startOfDay } from "@/lib/api/route-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    if (session.user.role !== "ADMIN") {
      return jsonError("Forbidden - Only admins can unmark absent", 403)
    }

    const body = await request.json()
    const { employeeId, date } = body

    const parsedEmployeeId = parseInteger(String(employeeId))
    if (parsedEmployeeId === null) {
      return jsonError("Valid employee ID is required", 400)
    }

    const absentDate = startOfDay(parseDate(typeof date === "string" ? date : null) ?? new Date())

    // Delete absent record
    const absent = await prisma.absent.findUnique({
      where: {
        employeeId_date: {
          employeeId: parsedEmployeeId,
          date: absentDate,
        },
      },
    })

    if (!absent) {
      return jsonError("Absent record not found", 404)
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

    return NextResponse.json({
      success: true,
      message: `${employee?.firstName} ${employee?.lastName} unmarked as absent`,
    })
  } catch (error) {
    console.error("Failed to unmark absent:", error)
    return jsonError("Failed to unmark absent", 500)
  }
}
