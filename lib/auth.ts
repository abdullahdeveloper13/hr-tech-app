import { type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { generateToken as generateJWT, verifyToken as verifyJWT } from "./jwt"
import bcrypt from "bcryptjs"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface CurrentUser {
  id: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return generateJWT(payload)
}

export function verifyToken(token: string): JWTPayload | null {
  return verifyJWT(token)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Also check cookies
  const token = request.cookies.get("auth-token")?.value
  return token || null
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  return verifyToken(token)
}

export function convertUserIdToInt(userId: string | number): number {
  if (typeof userId === 'number') return userId
  return Number.parseInt(userId, 10)
}

/**
 * Get current user from NextAuth session
 * Use this in API routes instead of the old getCurrentUser function
 */
export async function getCurrentUserFromSession(): Promise<CurrentUser | null> {
  try {
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/option")
    const session = await getServerSession(authOptions)
    
    if (!session?.user) return null
    
    const user = session.user as any
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Failed to get current user from session:", error)
    return null
  }
}

