import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"
import { jsonError } from "@/lib/api/route-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string }
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return jsonError("Email and password are required", 400)
    }

    // Find user with employee data
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { employee: true },
    })

    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("Invalid credentials", 401)
    }

    // Generate JWT token - convert userId to string
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    })

    // Create response with token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return jsonError("Internal server error", 500)
  }
}
