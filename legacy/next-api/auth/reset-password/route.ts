import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { convertUserIdToInt } from "@/lib/auth"
import { jsonError } from "@/lib/api/route-utils"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "change_me"
interface ResetTokenPayload {
  userId: string | number
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json() as { token?: string; password?: string }
    if (!token || !password) return jsonError("Missing token or password", 400)
    if (password.trim().length < 6) return jsonError("Password must be at least 6 characters", 400)

    let payload: ResetTokenPayload
    try {
      payload = jwt.verify(token, JWT_SECRET) as ResetTokenPayload
    } catch {
      return jsonError("Invalid or expired token", 400)
    }

    const userId = convertUserIdToInt(payload.userId)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return jsonError("User not found", 404)

    const hashed = await bcrypt.hash(password.trim(), 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("reset-password error:", err)
    return jsonError("Internal server error", 500)
  }
}
