import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(5),
  urgent: z.boolean().optional(),
  targetRoles: z.array(z.nativeEnum(Role)).min(1),
  expiresAt: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  const now  = new Date()

  const announcements = await prisma.announcement.findMany({
    where: {
      targetRoles: { has: role },
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    orderBy: [{ urgent: 'desc' }, { publishedAt: 'desc' }],
  })

  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN && role !== Role.COACH) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      urgent: parsed.data.urgent ?? false,
      targetRoles: parsed.data.targetRoles,
      publishedAt: new Date(),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  })

  return NextResponse.json(announcement, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await req.json()
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
