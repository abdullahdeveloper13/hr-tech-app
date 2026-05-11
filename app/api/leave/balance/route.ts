import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseInteger } from "@/lib/api/route-utils"
import { LeaveType } from "@prisma/client"

const PROFILE_MISSING_MESSAGE = "Employee profile not found. Please contact HR to set up your employee record."
const DEFAULT_LEAVE_DAYS_BY_TYPE: Record<LeaveType, number> = {
  [LeaveType.ANNUAL]: 25,
  [LeaveType.SICK]: 10,
  [LeaveType.MATERNITY]: 90,
  [LeaveType.PATERNITY]: 14,
  [LeaveType.PERSONAL]: 5,
  [LeaveType.EMERGENCY]: 5,
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const year = parseInteger(searchParams.get("year")) ?? new Date().getFullYear()
    if (year < 2000 || year > 2100) {
      return jsonError("Invalid year", 400)
    }

    const currentUserId = parseInteger(currentUser.id)
    if (currentUserId === null) {
      return jsonError("Unauthorized", 401)
    }

    // Get employee record
    let targetEmployeeId: number

    if (employeeId && ["ADMIN", "HR", "MANAGER"].includes(currentUser.role)) {
      const parsedEmployeeId = parseInteger(employeeId)
      if (parsedEmployeeId === null) {
        return jsonError("Invalid employeeId", 400)
      }
      targetEmployeeId = parsedEmployeeId
    } else {
      const employee = await prisma.employee.findFirst({
        where: { userId: currentUserId },
      })

      if (!employee) {
        return NextResponse.json([], {
          headers: {
            "x-profile-missing": "true",
            "x-profile-message": PROFILE_MISSING_MESSAGE,
          },
        })
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

    // Ensure all leave types have a balance row
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

      return NextResponse.json([...leaveBalances, ...createdBalances])
    }

    return NextResponse.json(leaveBalances)
  } catch (error) {
    console.error("Get leave balance error:", error)
    return jsonError("Internal server error", 500)
  }
}
