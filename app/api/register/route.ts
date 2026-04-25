import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@/lib/enums'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['PLAYER', 'PARENT', 'COACH']),
  phone: z.string().optional(),
  jerseyNumber: z.string().optional(),
  position: z.string().optional(),
  parentName: z.string().optional(),
  parentEmail: z.string().email().optional().or(z.literal('')),
  parentPhone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input: ' + parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, phone, jerseyNumber, position,
            parentName, parentEmail, parentPhone } = parsed.data

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    if (role === 'PLAYER') {
      // Create parent user first if details provided
      let parentRecord = null
      if (parentEmail) {
        let parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
        if (!parentUser) {
          const tempPass = await bcrypt.hash(Math.random().toString(36), 10)
          parentUser = await prisma.user.create({
            data: {
              name: parentName || 'Parent',
              email: parentEmail,
              password: tempPass,
              phone: parentPhone,
              role: Role.PARENT,
              parent: { create: {} },
            },
            include: { parent: true },
          })
        }
        parentRecord = await prisma.parent.findUnique({ where: { userId: parentUser.id } })
      }

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: Role.PLAYER,
          player: {
            create: {
              jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
              position: position || null,
              parentId: parentRecord?.id || null,
            },
          },
        },
      })
    } else if (role === 'COACH') {
      await prisma.user.create({
        data: {
          name, email, password: hashedPassword, phone, role: Role.COACH,
          coach: { create: {} },
        },
      })
    } else if (role === 'PARENT') {
      await prisma.user.create({
        data: {
          name, email, password: hashedPassword, phone, role: Role.PARENT,
          parent: { create: {} },
        },
      })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
