import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campSession = await prisma.session.findUnique({
    where: { id: params.id },
    include: {
      coach: { include: { user: { select: { name: true, email: true } } } },
      attendances: {
        include: {
          player: { include: { user: { select: { name: true } } } },
        },
      },
    },
  })

  if (!campSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(campSession)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN && role !== Role.COACH) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.session.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.startTime && { startTime: new Date(body.startTime) }),
      ...(body.endTime && { endTime: new Date(body.endTime) }),
      ...(body.type && { type: body.type }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Only admins can delete sessions' }, { status: 403 })
  }

  await prisma.session.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
