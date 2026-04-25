import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role, SessionType } from '@/lib/enums'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(2),
  type: z.nativeEnum(SessionType),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  coachId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const upcoming = searchParams.get('upcoming') === '1'
  const type = searchParams.get('type') as SessionType | null

  const where: any = {}
  if (upcoming) where.startTime = { gte: new Date() }
  if (type) where.type = type

  const sessions = await prisma.session.findMany({
    where,
    include: {
      coach: { include: { user: { select: { name: true } } } },
      _count: { select: { attendances: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN && role !== Role.COACH) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { startTime, endTime, ...rest } = parsed.data
    const newSession = await prisma.session.create({
      data: {
        ...rest,
        startTime: new Date(startTime as string),
        endTime:   new Date(endTime as string),
      },
      include: { coach: { include: { user: { select: { name: true } } } } },
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (err) {
    console.error('[sessions POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
