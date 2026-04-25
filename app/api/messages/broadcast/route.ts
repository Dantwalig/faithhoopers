import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'

// GET /api/messages/broadcast — fetch all broadcast messages (coach → all players)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { isBroadcast: true },
    include: {
      sender: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(messages)
}

// POST /api/messages/broadcast — send a broadcast message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  const senderId = (session.user as any).id as string

  if (role !== Role.ADMIN && role !== Role.COACH) {
    return NextResponse.json({ error: 'Only coaches and admins can broadcast messages' }, { status: 403 })
  }

  const { subject, body } = await req.json()
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      subject: subject || null,
      body,
      isBroadcast: true,
      receiverId: null,
    },
    include: { sender: { select: { name: true, role: true } } },
  })

  return NextResponse.json(message, { status: 201 })
}
