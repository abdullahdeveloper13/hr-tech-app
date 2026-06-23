import type { NextFunction, Request, Response } from "express"

export class HttpError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status = 500, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    const body: Record<string, unknown> = { error: err.message }
    if (err.details !== undefined) {
      body.details = err.details
    }
    res.status(err.status).json(body)
    return
  }

  console.error("[api] Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
}
