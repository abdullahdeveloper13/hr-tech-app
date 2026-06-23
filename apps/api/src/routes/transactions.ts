import { Router } from "express"
import { prisma } from "@hr/db"
import { TransactionStatus } from "@prisma/client"
import { asyncHandler } from "../utils/async"
import { HttpError } from "../middleware/error"
import { authenticate, type AuthenticatedRequest } from "../middleware/auth"
import { parseDate, parseInteger } from "../utils/route-utils"

const router = Router()

function isTransactionStatus(value: string): value is TransactionStatus {
  return Object.values(TransactionStatus).includes(value as TransactionStatus)
}

router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const isAdmin = req.user?.role === "ADMIN"
    const sessionUserId = parseInteger(req.user?.userId)
    if (!isAdmin && sessionUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const where = isAdmin ? {} : { userId: sessionUserId! }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    res.json(transactions)
  }),
)

router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = req.body as Record<string, unknown>
    const isAdmin = req.user?.role === "ADMIN"
    const sessionUserId = parseInteger(req.user?.userId)
    if (sessionUserId === null) {
      throw new HttpError("Unauthorized", 401)
    }

    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new HttpError("Invalid transaction amount", 400)
    }

    const statusValue = String(body.status || "PENDING").toUpperCase()
    if (!isTransactionStatus(statusValue)) {
      throw new HttpError("Invalid transaction status", 400)
    }

    const transactionUserId = isAdmin && body.userId ? parseInteger(String(body.userId)) : sessionUserId
    if (transactionUserId === null) {
      throw new HttpError("Invalid userId", 400)
    }

    const parsedDate = body.date ? parseDate(String(body.date)) : new Date()
    if (!parsedDate) {
      throw new HttpError("Invalid transaction date", 400)
    }

    const payload = {
      transactionId: String(body.transactionId || "").trim(),
      amount,
      method: String(body.method || "").trim(),
      date: parsedDate,
      status: statusValue,
      userId: transactionUserId,
    }

    if (!payload.transactionId || !payload.method) {
      throw new HttpError("transactionId and method are required", 400)
    }

    const created = await prisma.transaction.create({
      data: payload,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    res.json(created)
  }),
)

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const txId = parseInteger(req.params.id)
    if (txId === null) {
      throw new HttpError("Invalid id", 400)
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    if (!tx) {
      throw new HttpError("Not found", 404)
    }

    const isAdmin = req.user?.role === "ADMIN"
    const sessionUserId = parseInteger(req.user?.userId)
    if (!isAdmin && sessionUserId !== tx.userId) {
      throw new HttpError("Forbidden", 403)
    }

    res.json(tx)
  }),
)

router.put(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const txId = parseInteger(req.params.id)
    if (txId === null) {
      throw new HttpError("Invalid id", 400)
    }

    const body = req.body as Record<string, unknown>

    const existing = await prisma.transaction.findUnique({ where: { id: txId } })
    if (!existing) {
      throw new HttpError("Not found", 404)
    }

    const isAdmin = req.user?.role === "ADMIN"
    const sessionUserId = parseInteger(req.user?.userId)
    if (!isAdmin && sessionUserId !== existing.userId) {
      throw new HttpError("Forbidden", 403)
    }

    const data: Record<string, unknown> = {}
    if (body.transactionId !== undefined) {
      const transactionId = String(body.transactionId).trim()
      if (!transactionId) {
        throw new HttpError("transactionId cannot be empty", 400)
      }
      data.transactionId = transactionId
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new HttpError("Invalid transaction amount", 400)
      }
      data.amount = amount
    }
    if (body.method !== undefined) {
      const method = String(body.method).trim()
      if (!method) {
        throw new HttpError("method cannot be empty", 400)
      }
      data.method = method
    }
    if (body.date !== undefined) {
      const parsedDate = parseDate(String(body.date))
      if (!parsedDate) {
        throw new HttpError("Invalid transaction date", 400)
      }
      data.date = parsedDate
    }
    if (body.status !== undefined) {
      const status = String(body.status).toUpperCase()
      if (!isTransactionStatus(status)) {
        throw new HttpError("Invalid transaction status", 400)
      }
      data.status = status
    }
    if (isAdmin && body.userId !== undefined) {
      const userId = parseInteger(String(body.userId))
      if (userId === null) {
        throw new HttpError("Invalid userId", 400)
      }
      data.userId = userId
    }

    const updated = await prisma.transaction.update({
      where: { id: txId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    res.json(updated)
  }),
)

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const txId = parseInteger(req.params.id)
    if (txId === null) {
      throw new HttpError("Invalid transaction id", 400)
    }

    const tx = await prisma.transaction.findUnique({ where: { id: txId } })
    if (!tx) {
      throw new HttpError("Transaction not found", 404)
    }

    const isAdmin = req.user?.role === "ADMIN"
    const sessionUserId = parseInteger(req.user?.userId)
    if (!isAdmin && tx.userId !== sessionUserId) {
      throw new HttpError("Forbidden", 403)
    }

    await prisma.transaction.delete({ where: { id: txId } })
    res.json({ success: true })
  }),
)

export const transactionsRouter = router
