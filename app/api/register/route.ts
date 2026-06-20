import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@/lib/enums'
import { z } from 'zod'
import { sendEmail, verificationEmailHtml, setPasswordEmailHtml, getAppUrl } from '@/lib/email/send'
import { generateVerificationToken, newVerificationExpiry, generateResetToken, newInviteExpiry } from '@/lib/auth/verification'

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['PLAYER', 'COACH', 'FACILITATOR']),
    phone: z.string().optional(),
    // Gender (required for all roles)
    gender: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['MALE', 'FEMALE']).optional()),
    age: z.string().optional(),
    medicalNotes: z.string().max(2000).optional(),
    // Parent contact (collected during a player's signup)
    parentName: z.string().optional(),
    parentEmail: z.string().email().optional().or(z.literal('')),
    parentPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.gender) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a gender.', path: ['gender'] })
    }
    if (data.role === 'PLAYER') {
      const ageNum = data.age ? parseInt(data.age, 10) : NaN
      if (!data.age || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 19) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select an age between 13 and 19.', path: ['age'] })
      }
      if (data.parentEmail && !data.parentName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Parent/guardian full name is required.', path: ['parentName'] })
      }
      if (data.parentEmail && data.parentEmail.toLowerCase() === data.email.toLowerCase()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Parent email must be different from your own email.', path: ['parentEmail'] })
      }
    }
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

    const { name, password, role, phone, gender, age, medicalNotes,
            parentName, parentPhone } = parsed.data

    // Normalize emails so "Mom@Gmail.com" and "mom@gmail.com" are treated as
    // the same account — this is what makes sibling-linking actually reliable.
    const email = parsed.data.email.trim().toLowerCase()
    const parentEmail = parsed.data.parentEmail?.trim().toLowerCase() || ''

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const appUrl = getAppUrl()
    const hashedPassword = await bcrypt.hash(password, 12)
    const token = generateVerificationToken()
    const expiresAt = newVerificationExpiry()

    if (role === 'PLAYER') {
      // Create (or link to) a parent account if guardian details were provided.
      let parentRecord = null
      if (parentEmail) {
        let parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
        if (!parentUser) {
          // Auto-create a placeholder parent account. They have no usable
          // password yet (passwordSet: false) — they set one the first time
          // they click their "set password" link, which also verifies them.
          const tempPass = await bcrypt.hash(Math.random().toString(36), 10)
          const parentToken = generateResetToken()
          const parentExpiresAt = newInviteExpiry()

          parentUser = await prisma.user.create({
            data: {
              name: parentName || 'Parent',
              email: parentEmail,
              password: tempPass,
              phone: parentPhone,
              role: Role.PARENT,
              passwordSet: false,
              resetCode: parentToken,
              resetCodeExpiresAt: parentExpiresAt,
              parent: { create: {} },
            },
            include: { parent: true },
          })

          await sendEmail({
            to: parentEmail,
            subject: `${name} added you as their parent on Faith Hoopers`,
            html: setPasswordEmailHtml({
              name: parentName || 'there',
              link: `${appUrl}/reset-password?token=${parentToken}&context=invite`,
              reason: 'parent',
            }),
          })
        }
        // Whether newly created or pre-existing, link this child to that parent.
        // (A parent can have multiple children — siblings just share this parentId.)
        parentRecord = await prisma.parent.findUnique({ where: { userId: parentUser.id } })
      }

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: Role.PLAYER,
          verificationCode: token,
          verificationCodeExpiresAt: expiresAt,
          player: {
            create: {
              gender,
              age: age ? parseInt(age, 10) : null,
              medicalNotes: medicalNotes || null,
              parentId: parentRecord?.id || null,
            },
          },
        },
      })
    } else if (role === 'COACH') {
      await prisma.user.create({
        data: {
          name, email, password: hashedPassword, phone, role: Role.COACH,
          verificationCode: token,
          verificationCodeExpiresAt: expiresAt,
          coach: { create: { gender } },
        },
      })
    } else if (role === 'FACILITATOR') {
      await prisma.user.create({
        data: {
          name, email, password: hashedPassword, phone, role: Role.FACILITATOR,
          verificationCode: token,
          verificationCodeExpiresAt: expiresAt,
          facilitator: { create: { gender } },
        },
      })
    }

    await sendEmail({
      to: email,
      subject: 'Verify your email — Faith Hoopers',
      html: verificationEmailHtml({ name, link: `${appUrl}/verify?token=${token}` }),
    })

    return NextResponse.json({ success: true, email }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
