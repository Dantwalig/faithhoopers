import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'

// GET /api/users?role=PLAYER — list users (for message recipient picker, admin management)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const roleFilter = searchParams.get('role') as Role | null

  const users = await prisma.user.findMany({
    where: roleFilter ? { role: roleFilter } : undefined,
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
          parent: { select: { user: { select: { name: true, email: true } } } },
        },
      },
      coach: { select: { specialty: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
