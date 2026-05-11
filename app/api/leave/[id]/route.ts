import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseInteger } from "@/lib/api/route-utils"
import type { Prisma } from "@prisma/client"

const PROCESSABLE_STATUSES = ["APPROVED", "REJECTED"] as const
type ProcessableStatus = (typeof PROCESSABLE_STATUSES)[number]

function isProcessableStatus(value: string): value is ProcessableStatus {
  return PROCESSABLE_STATUSES.includes(value as ProcessableStatus)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    // Only allow ADMIN, HR, and MANAGER to approve/reject requests
    if (!["ADMIN", "HR", "MANAGER"].includes(currentUser.role)) {
      return jsonError("Forbidden", 403)
    }

    const { id } = await params
    const leaveRequestId = parseInteger(id)
    if (leaveRequestId === null) {
      return jsonError("Invalid leave request id", 400)
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { employee: true },
    })

    if (!leaveRequest) {
      return jsonError("Leave request not found", 404)
    }

    if (leaveRequest.status !== "PENDING") {
      return jsonError("Leave request has already been processed", 400)
    }

    const { status, rejectedReason } = await request.json() as { status?: string; rejectedReason?: string }

    if (!status || !isProcessableStatus(status)) {
      return jsonError("Invalid status", 400)
    }

    if (status === "REJECTED" && (!rejectedReason || !rejectedReason.trim())) {
      return jsonError("Rejection reason is required", 400)
    }

    const currentUserId = parseInteger(currentUser.id)
    if (currentUserId === null) {
      return jsonError("Unauthorized", 401)
    }

    const approver = await prisma.employee.findFirst({
      where: { userId: currentUserId },
    })

    const updateData: Prisma.LeaveRequestUpdateInput = {
      status,
      approvedBy: approver?.id.toString(),
      approvedAt: new Date(),
    }

    if (status === "REJECTED") {
      updateData.rejectedReason = rejectedReason?.trim()
    }

    // Update leave request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the leave request
      const updatedRequest = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: updateData,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              department: true,
              position: true,
            },
          },
        },
      })

      // If approved, update leave balance
      if (status === "APPROVED") {
        const currentYear = new Date().getFullYear()
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveType_year: {
              employeeId: leaveRequest.employeeId,
              leaveType: leaveRequest.leaveType,
              year: currentYear,
            },
          },
          data: {
            usedDays: { increment: leaveRequest.totalDays },
            remainingDays: { decrement: leaveRequest.totalDays },
          },
        })
      }

      return updatedRequest
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update leave request error:", error)
    return jsonError("Internal server error", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    const { id } = await params
    const leaveRequestId = parseInteger(id)
    if (leaveRequestId === null) {
      return jsonError("Invalid leave request id", 400)
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { employee: true },
    })

    if (!leaveRequest) {
      return jsonError("Leave request not found", 404)
    }

    // Check permissions - users can only delete their own pending requests
    const currentUserId = parseInteger(currentUser.id)
    if (currentUserId === null) {
      return jsonError("Unauthorized", 401)
    }

    const canDelete =
      (currentUserId === leaveRequest.employee.userId && leaveRequest.status === "PENDING") ||
      ["ADMIN", "HR"].includes(currentUser.role)

    if (!canDelete) {
      return jsonError("Cannot delete this leave request", 403)
    }

    await prisma.leaveRequest.delete({
      where: { id: leaveRequestId },
    })

    return NextResponse.json({ message: "Leave request deleted successfully" })
  } catch (error) {
    console.error("Delete leave request error:", error)
    return jsonError("Internal server error", 500)
  }
}
