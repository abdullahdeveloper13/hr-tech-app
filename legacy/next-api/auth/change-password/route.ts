import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { verifyPassword, hashPassword } from "@/lib/auth"
import { jsonError } from "@/lib/api/route-utils"
import { prisma } from "@/lib/prisma"

interface ChangePasswordBody {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401)
    }

    const body = (await request.json()) as ChangePasswordBody
    const currentPassword = body.currentPassword?.trim() ?? ""
    const newPassword = body.newPassword?.trim() ?? ""
    const confirmPassword = body.confirmPassword?.trim() ?? ""

    if (!currentPassword || !newPassword || !confirmPassword) {
      return jsonError("All password fields are required", 400)
    }

    if (newPassword.length < 6) {
      return jsonError("New password must be at least 6 characters", 400)
    }

    if (newPassword !== confirmPassword) {
      return jsonError("New password and confirmation do not match", 400)
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return jsonError("User not found", 404)
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return jsonError("Current password is incorrect", 400)
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ ok: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Failed to change password:", error)
    return jsonError("Failed to change password", 500)
  }
}
