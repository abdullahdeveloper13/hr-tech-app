import type { Request, Response, NextFunction } from "express"
import { verifyToken, type JwtPayload } from "../auth/jwt"
import { HttpError } from "./error"

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  let token: string | undefined

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7)
  }

  if (!token && req.cookies?.["auth-token"]) {
    token = req.cookies["auth-token"]
  }

  if (!token) {
    return next(new HttpError("Unauthorized", 401))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return next(new HttpError("Unauthorized", 401))
  }

  req.user = payload
  return next()
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role || !roles.includes(role)) {
      return next(new HttpError("Forbidden", 403))
    }
    return next()
  }
}
