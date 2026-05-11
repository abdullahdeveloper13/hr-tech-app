import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow ADMIN and HR to export reports
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "employees"
    const format = searchParams.get("format") || "json"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let data: any = {}

    switch (reportType) {
      case "employees":
        data = await prisma.employee.findMany({
          include: {
            user: {
              select: { email: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        break

      case "attendance":
        const attendanceWhere: any = {}
        if (startDate && endDate) {
          attendanceWhere.checkInTime = {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        }

        data = await prisma.checkIn.findMany({
          where: attendanceWhere,
          include: {
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                department: true,
                position: true,
              },
            },
          },
          orderBy: { checkInTime: "desc" },
        })
        break

      case "leave":
        const leaveWhere: any = {}
        if (startDate && endDate) {
          leaveWhere.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        }

        data = await prisma.leaveRequest.findMany({
          where: leaveWhere,
          include: {
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                department: true,
                position: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    if (format === "csv") {
      // Convert to CSV format
      let csv = ""
      if (data.length > 0) {
        // Get headers
        const headers = Object.keys(flattenObject(data[0]))
        csv += headers.join(",") + "\n"

        // Add data rows
        data.forEach((row: any) => {
          const flatRow = flattenObject(row)
          const values = headers.map((header) => {
            const value = flatRow[header]
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ""
          })
          csv += values.join(",") + "\n"
        })
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      reportType,
      generatedAt: new Date().toISOString(),
      totalRecords: data.length,
      data,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to flatten nested objects for CSV export
function flattenObject(obj: any, prefix = ""): any {
  const flattened: any = {}

  for (const key in obj) {
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`))
    } else {
      flattened[`${prefix}${key}`] = obj[key]
    }
  }

  return flattened
}
