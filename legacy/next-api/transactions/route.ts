import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/option"
import { prisma } from "@/lib/prisma"
import { TransactionStatus } from "@prisma/client"
import { jsonError, parseDate, parseInteger } from "@/lib/api/route-utils"

function isTransactionStatus(value: string): value is TransactionStatus {
  return Object.values(TransactionStatus).includes(value as TransactionStatus)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return jsonError("Unauthorized", 401)

    const isAdmin = session.user?.role === "ADMIN"
    const sessionUserId = parseInteger(session.user.id)
    if (!isAdmin && sessionUserId === null) {
      return jsonError("Unauthorized", 401)
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

    return NextResponse.json(transactions)
  } catch (err) {
    console.error("GET /api/transactions", err)
    return jsonError("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return jsonError("Unauthorized", 401)

    const body = await request.json()
    const isAdmin = session.user?.role === "ADMIN"
    const sessionUserId = parseInteger(session.user.id)
    if (sessionUserId === null) {
      return jsonError("Unauthorized", 401)
    }

    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonError("Invalid transaction amount", 400)
    }

    const statusValue = (String(body.status || "PENDING").toUpperCase())
    if (!isTransactionStatus(statusValue)) {
      return jsonError("Invalid transaction status", 400)
    }

    const transactionUserId = isAdmin && body.userId ? parseInteger(String(body.userId)) : sessionUserId
    if (transactionUserId === null) {
      return jsonError("Invalid userId", 400)
    }

    const parsedDate = body.date ? parseDate(String(body.date)) : new Date()
    if (!parsedDate) {
      return jsonError("Invalid transaction date", 400)
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
      return jsonError("transactionId and method are required", 400)
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

    return NextResponse.json(created)
  } catch (err) {
    console.error("POST /api/transactions", err)
    return jsonError("Failed to create transaction", 500)
  }
}
