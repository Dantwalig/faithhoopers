import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { Role } from '@/lib/enums'
import { fetchBiblePassage } from '@/lib/bible-api/fetch-passage'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(2),
  weekTheme: z.string().min(2),
  bibleReference: z.string().min(3),
  bibleText: z.string().optional(),    // if omitted, fetched from API
  commentary: z.string().min(10),
  application: z.string().optional(),
  publishNow: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'

  const devotionals = await prisma.devotional.findMany({
    where: all ? {} : { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
  })

  return NextResponse.json(devotionals)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role as Role
  if (role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Only admins can create devotionals' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { title, weekTheme, bibleReference, bibleText, commentary, application, publishNow } = parsed.data

  // Auto-fetch Bible text if not provided
  let verseText = bibleText
  if (!verseText || verseText.trim() === '') {
    const passage = await fetchBiblePassage(bibleReference)
    verseText = passage.text
  }

  const devotional = await prisma.devotional.create({
    data: {
      title,
      weekTheme,
      bibleReference,
      bibleText: verseText,
      commentary,
      application: application || null,
      publishedAt: publishNow ? new Date() : null,
    },
  })

  return NextResponse.json(devotional, { status: 201 })
}
