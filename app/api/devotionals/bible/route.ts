import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { fetchBiblePassage, searchBibleVerses } from '@/lib/bible-api/fetch-passage'

// GET /api/devotionals/bible?ref=John+3:16      — fetch a specific passage
// GET /api/devotionals/bible?search=perseverance — search for verses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ref    = searchParams.get('ref')
  const search = searchParams.get('search')

  if (ref) {
    const passage = await fetchBiblePassage(ref)
    return NextResponse.json(passage)
  }

  if (search) {
    const results = await searchBibleVerses(search, 8)
    return NextResponse.json(results)
  }

  return NextResponse.json({ error: 'ref or search param required' }, { status: 400 })
}
