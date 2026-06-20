import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'
import { z } from 'zod'

const schema = z.object({
  // Empty string / null clears the assignment.
  coachId: z.string().nullable().optional(),
  facilitatorId: z.string().nullable().optional(),
})

// PATCH /api/players/[id]/assign — admin-only: assign (or unassign) a
// player to a coach and/or facilitator. [id] is the Player record id.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role: Role }).role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const data: { coachId?: string | null; facilitatorId?: string | null } = {}
    if ('coachId' in parsed.data) data.coachId = parsed.data.coachId || null
    if ('facilitatorId' in parsed.data) data.facilitatorId = parsed.data.facilitatorId || null

    const updated = await prisma.player.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, player: updated })
  } catch (err) {
    console.error('[players/assign]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
