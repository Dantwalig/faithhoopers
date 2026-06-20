import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'

// GET /api/users?role=PLAYER — list users (for message recipient picker, admin management).
//
// Coaches and facilitators only ever see players assigned to them — not the
// full roster. Admins see everyone, unfiltered.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id: string; role: Role }
  const { searchParams } = new URL(req.url)
  const roleFilter = searchParams.get('role') as Role | null

  // Build the where-clause. Coaches/facilitators requesting players only get
  // back players assigned to their own Coach/Facilitator record.
  let playerScope: { coachId?: string; facilitatorId?: string } | null = null
  if (roleFilter === Role.PLAYER && (sessionUser.role === Role.COACH || sessionUser.role === Role.FACILITATOR)) {
    if (sessionUser.role === Role.COACH) {
      const coach = await prisma.coach.findUnique({ where: { userId: sessionUser.id }, select: { id: true } })
      playerScope = { coachId: coach?.id ?? '__none__' }
    } else {
      const facilitator = await prisma.facilitator.findUnique({ where: { userId: sessionUser.id }, select: { id: true } })
      playerScope = { facilitatorId: facilitator?.id ?? '__none__' }
    }
  }

  const users = await prisma.user.findMany({
    where: {
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(playerScope ? { player: { is: playerScope } } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      player: {
        select: {
          jerseyNumber: true,
          position: true,
          gender: true,
          age: true,
          medicalNotes: true,
          coachId: true,
          facilitatorId: true,
          parent: { select: { user: { select: { name: true, email: true } } } },
        },
      },
      coach: { select: { specialty: true } },
      facilitator: { select: { specialty: true } },
      parent: { select: { _count: { select: { children: true } } } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
