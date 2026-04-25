import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'

// GET /api/attendance?sessionId=xxx  — fetch attendance for a session
// GET /api/attendance?playerId=xxx   — fetch attendance history for a player
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const playerId  = searchParams.get('playerId')

  if (sessionId) {
    const records = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        player: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { player: { user: { name: 'asc' } } },
    })
    return NextResponse.json(records)
  }

  if (playerId) {
    const records = await prisma.attendance.findMany({
      where: { playerId },
      include: { session: true },
      orderBy: { session: { startTime: 'desc' } },
    })
    return NextResponse.json(records)
  }

  return NextResponse.json({ error: 'sessionId or playerId required' }, { status: 400 })
}

// POST /api/attendance — bulk mark attendance for a session
// Body: { sessionId: string, records: { playerId: string, present: boolean, notes?: string }[] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN && role !== Role.COACH) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sessionId, records } = await req.json()

  if (!sessionId || !Array.isArray(records)) {
    return NextResponse.json({ error: 'sessionId and records[] required' }, { status: 400 })
  }

  // Upsert each record
  const ops = records.map((r: { playerId: string; present: boolean; notes?: string }) =>
    prisma.attendance.upsert({
      where: { playerId_sessionId: { playerId: r.playerId, sessionId } },
      update: { present: r.present, notes: r.notes, markedAt: new Date() },
      create: { playerId: r.playerId, sessionId, present: r.present, notes: r.notes },
    })
  )

  const results = await prisma.$transaction(ops)
  return NextResponse.json({ saved: results.length }, { status: 200 })
}
