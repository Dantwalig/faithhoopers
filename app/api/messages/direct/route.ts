import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

// GET /api/messages/direct?withUserId=xxx — conversation between current user and another
// GET /api/messages/direct                 — all direct message threads for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { searchParams } = new URL(req.url)
  const withUserId = searchParams.get('withUserId')

  if (withUserId) {
    // Full conversation between two users
    const messages = await prisma.message.findMany({
      where: {
        isBroadcast: false,
        OR: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      },
      include: {
        sender:   { select: { name: true, role: true } },
        receiver: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark incoming messages as read
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: userId, readAt: null },
      data:  { readAt: new Date() },
    })

    return NextResponse.json(messages)
  }

  // Return latest message per conversation partner
  const allMessages = await prisma.message.findMany({
    where: {
      isBroadcast: false,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender:   { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Deduplicate: one entry per conversation partner
  const seen = new Set<string>()
  const threads = allMessages.filter((msg: typeof allMessages[0]) => {
    const partnerId = msg.senderId === userId ? msg.receiverId! : msg.senderId
    if (seen.has(partnerId)) return false
    seen.add(partnerId)
    return true
  })

  return NextResponse.json(threads)
}

// POST /api/messages/direct — send a direct message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const senderId = (session.user as any).id as string
  const { receiverId, subject, body } = await req.json()

  if (!receiverId || !body?.trim()) {
    return NextResponse.json({ error: 'receiverId and body are required' }, { status: 400 })
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      subject: subject || null,
      body,
      isBroadcast: false,
    },
    include: {
      sender:   { select: { name: true, role: true } },
      receiver: { select: { name: true, role: true } },
    },
  })

  return NextResponse.json(message, { status: 201 })
}
