import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow ADMIN and HR to view analytics
    if (!["ADMIN", "HR"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // Employee statistics
    const totalEmployees = await prisma.employee.count({
      where: { status: "ACTIVE" },
    })

    const employeesByDepartment = await prisma.employee.groupBy({
      by: ["department"],
      where: { status: "ACTIVE" },
      _count: { id: true },
    })

    const employeesByStatus = await prisma.employee.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    // Attendance statistics
    const totalCheckIns = await prisma.checkIn.count({
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
      },
    })

    const avgWorkingHours = await prisma.checkIn.aggregate({
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
        totalHours: { not: null },
      },
      _avg: { totalHours: true },
    })

    // Daily attendance for the period - using Prisma aggregation
    const allCheckIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end }
      },
      select: { checkInTime: true }
    })

    const dailyAttendanceMap = allCheckIns.reduce((acc, checkIn) => {
      const date = checkIn.checkInTime.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dailyAttendance = Object.entries(dailyAttendanceMap)
      .map(([date, count]) => ({ date, count: BigInt(count) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Leave statistics
    const leaveRequests = await prisma.leaveRequest.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: { id: true },
    })

    const leaveByType = await prisma.leaveRequest.groupBy({
      by: ["leaveType"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "APPROVED",
      },
      _count: { id: true },
      _sum: { totalDays: true },
    })

    // Department-wise attendance - using simpler approach
    const allEmployees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, department: true }
    })

    const checkInsInPeriod = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end }
      },
      select: { employeeId: true },
      distinct: ['employeeId']
    })

    const checkedInEmployeeIds = new Set(checkInsInPeriod.map(ci => ci.employeeId))
    
    const departmentStats = allEmployees.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { total: 0, present: 0 }
      }
      acc[emp.department].total++
      if (checkedInEmployeeIds.has(emp.id)) {
        acc[emp.department].present++
      }
      return acc
    }, {} as Record<string, { total: number, present: number }>)

    const departmentAttendance = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      present_employees: BigInt(stats.present),
      total_employees: BigInt(stats.total),
      attendance_rate: stats.total > 0 ? Number(((stats.present / stats.total) * 100).toFixed(2)) : 0
    }))

    // Employee attendance summary - detailed check-in data per employee
    const employeeAttendanceData = await prisma.checkIn.findMany({
      where: {
        checkInTime: { gte: start, lte: end }
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: { checkInTime: 'desc' }
    })

    // Detailed attendance records (per check-in)
    const detailedAttendanceRecords = employeeAttendanceData.map((checkIn) => ({
      id: checkIn.id,
      employeeId: checkIn.employee.employeeId,
      employeeName: `${checkIn.employee.firstName} ${checkIn.employee.lastName}`,
      department: checkIn.employee.department,
      position: checkIn.employee.position,
      checkInTime: checkIn.checkInTime,
      checkOutTime: checkIn.checkOutTime,
      totalHours: checkIn.totalHours,
    }))

    // Group by employee and calculate stats
    const employeeAttendanceMap = employeeAttendanceData.reduce((acc, checkIn) => {
      const empId = checkIn.employee.id
      if (!acc[empId]) {
        acc[empId] = {
          employeeId: checkIn.employee.employeeId,
          firstName: checkIn.employee.firstName,
          lastName: checkIn.employee.lastName,
          department: checkIn.employee.department,
          position: checkIn.employee.position,
          totalCheckIns: 0,
          totalHours: 0,
          lastCheckIn: null as Date | null,
          daysPresent: new Set<string>()
        }
      }
      acc[empId].totalCheckIns++
      acc[empId].totalHours += checkIn.totalHours || 0
      acc[empId].daysPresent.add(checkIn.checkInTime.toISOString().split('T')[0])
      if (!acc[empId].lastCheckIn || checkIn.checkInTime > acc[empId].lastCheckIn) {
        acc[empId].lastCheckIn = checkIn.checkInTime
      }
      return acc
    }, {} as Record<string, any>)

    const employeeAttendance = Object.values(employeeAttendanceMap).map((emp: any) => ({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      position: emp.position,
      totalCheckIns: emp.totalCheckIns,
      totalHours: Number(emp.totalHours.toFixed(2)),
      daysPresent: emp.daysPresent.size,
      lastCheckIn: emp.lastCheckIn,
      avgHoursPerDay: emp.daysPresent.size > 0 ? Number((emp.totalHours / emp.daysPresent.size).toFixed(2)) : 0
    }))

    // Recent activities - using Prisma queries
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recentCheckIns = await prisma.checkIn.findMany({
      where: { checkInTime: { gte: yesterday } },
      include: { 
        employee: { 
          select: { firstName: true, lastName: true, department: true } 
        } 
      },
      orderBy: { checkInTime: 'desc' },
      take: 5
    })

    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      where: { createdAt: { gte: yesterday } },
      include: { 
        employee: { 
          select: { firstName: true, lastName: true, department: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentActivities = [
      ...recentCheckIns.map(ci => ({
        type: 'check_in',
        employee_name: `${ci.employee.firstName} ${ci.employee.lastName}`,
        department: ci.employee.department,
        timestamp: ci.checkInTime,
        activity: 'Checked in'
      })),
      ...recentLeaveRequests.map(lr => ({
        type: 'leave_request',
        employee_name: `${lr.employee.firstName} ${lr.employee.lastName}`,
        department: lr.employee.department,
        timestamp: lr.createdAt,
        activity: `Submitted ${lr.leaveType} leave request`
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return NextResponse.json({
      period: { start, end },
      employees: {
        total: totalEmployees,
        byDepartment: employeesByDepartment.map((item) => ({
          department: item.department,
          count: Number(item._count.id),
        })),
        byStatus: employeesByStatus.map((item) => ({
          status: item.status,
          count: Number(item._count.id),
        })),
      },
      attendance: {
        totalCheckIns,
        avgWorkingHours: avgWorkingHours._avg.totalHours || 0,
        daily: dailyAttendance.map((item) => ({
          date: item.date,
          count: Number(item.count),
        })),
        byDepartment: departmentAttendance.map((item) => ({
          department: item.department,
          presentEmployees: Number(item.present_employees),
          totalEmployees: Number(item.total_employees),
          attendanceRate: item.attendance_rate,
        })),
        byEmployee: employeeAttendance,
        records: detailedAttendanceRecords.map((record) => ({
          ...record,
          checkInTime: record.checkInTime.toISOString(),
          checkOutTime: record.checkOutTime ? record.checkOutTime.toISOString() : null,
          totalHours: record.totalHours ?? 0,
        })),
      },
      leave: {
        byStatus: leaveRequests.map((item) => ({
          status: item.status,
          count: Number(item._count.id),
        })),
        byType: leaveByType.map((item) => ({
          type: item.leaveType,
          count: Number(item._count.id),
          totalDays: Number(item._sum.totalDays || 0),
        })),
      },
      recentActivities: recentActivities.map((activity) => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
