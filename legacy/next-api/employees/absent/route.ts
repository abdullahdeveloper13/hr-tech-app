import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jsonError } from "@/lib/api/route-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    if (session.user.role !== "ADMIN") {
      return jsonError("Forbidden - Only admins can view marked absent records", 403)
    }

    // Get date from query parameter, default to today
    const dateParam = request.nextUrl.searchParams.get("date")
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    // Fetch all marked absent records for the specified date
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

    return NextResponse.json({
      marked: markedAbsentRecords,
      count: markedAbsentRecords.length,
    })
  } catch (error) {
    console.error("Error fetching marked absent records:", error)
    return jsonError("Internal server error", 500)
  }
}
