import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { prisma } from "@/lib/prisma"
import { TransactionStatus } from "@prisma/client"
import { jsonError, parseDate, parseInteger } from "@/lib/api/route-utils"

function isTransactionStatus(value: string): value is TransactionStatus {
  return Object.values(TransactionStatus).includes(value as TransactionStatus)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return jsonError("Unauthorized", 401)

    const { id } = await params
    const txId = parseInteger(id)
    if (txId === null) return jsonError("Invalid id", 400)

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
    if (!tx) return jsonError("Not found", 404)

    const isAdmin = session.user.role === "ADMIN"
    const sessionUserId = parseInteger(session.user.id)
    if (!isAdmin && sessionUserId !== tx.userId) {
      return jsonError("Forbidden", 403)
    }

    return NextResponse.json(tx)
  } catch (err) {
    console.error("GET /api/transactions/[id]", err)
    return jsonError("Internal server error", 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return jsonError("Unauthorized", 401)

    const { id } = await params
    const txId = parseInteger(id)
    if (txId === null) return jsonError("Invalid id", 400)

    const body = await request.json()

    const existing = await prisma.transaction.findUnique({ where: { id: txId } })
    if (!existing) return jsonError("Not found", 404)

    const isAdmin = session.user.role === "ADMIN"
    const sessionUserId = parseInteger(session.user.id)
    if (!isAdmin && sessionUserId !== existing.userId) {
      return jsonError("Forbidden", 403)
    }

    const data: Record<string, unknown> = {}
    if (body.transactionId !== undefined) {
      const transactionId = String(body.transactionId).trim()
      if (!transactionId) {
        return jsonError("transactionId cannot be empty", 400)
      }
      data.transactionId = transactionId
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return jsonError("Invalid transaction amount", 400)
      }
      data.amount = amount
    }
    if (body.method !== undefined) {
      const method = String(body.method).trim()
      if (!method) {
        return jsonError("method cannot be empty", 400)
      }
      data.method = method
    }
    if (body.date !== undefined) {
      const parsedDate = parseDate(String(body.date))
      if (!parsedDate) {
        return jsonError("Invalid transaction date", 400)
      }
      data.date = parsedDate
    }
    if (body.status !== undefined) {
      const status = String(body.status).toUpperCase()
      if (!isTransactionStatus(status)) {
        return jsonError("Invalid transaction status", 400)
      }
      data.status = status
    }
    if (isAdmin && body.userId !== undefined) {
      const userId = parseInteger(String(body.userId))
      if (userId === null) {
        return jsonError("Invalid userId", 400)
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

    return NextResponse.json(updated)
  } catch (err) {
    console.error("PUT /api/transactions/[id]", err)
    return jsonError("Failed to update", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonError("Unauthorized", 401)
    }

    const { id } = await params
    const txId = parseInteger(id)
    if (txId === null) {
      return jsonError("Invalid transaction id", 400)
    }

    const tx = await prisma.transaction.findUnique({ where: { id: txId } })
    if (!tx) {
      return jsonError("Transaction not found", 404)
    }

    const isAdmin = session.user.role === "ADMIN"
    const sessionUserId = parseInteger(session.user.id)
    if (!isAdmin && tx.userId !== sessionUserId) {
      return jsonError("Forbidden", 403)
    }

    await prisma.transaction.delete({ where: { id: txId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE error:", err)
    return jsonError("Failed to delete transaction", 500)
  }
}
