import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserFromSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jsonError, parseInteger } from "@/lib/api/route-utils"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromSession()

    if (!currentUser) {
      return jsonError("Unauthorized", 401)
    }

    const userId = parseInteger(currentUser.id)
    if (userId === null) {
      return jsonError("Unauthorized", 401)
    }

    // Get full user data with employee info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    })

    if (!user) {
      return jsonError("User not found", 404)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return jsonError("Internal server error", 500)
  }
}
