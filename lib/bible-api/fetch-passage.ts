const BASE = process.env.BIBLE_API_BASE || 'https://api.scripture.api.bible/v1'
const KEY  = process.env.BIBLE_API_KEY  || ''
const VERSION = process.env.BIBLE_VERSION_ID || 'de4e12af7f28f599-01'

export interface BiblePassage {
  reference: string
  text: string
  copyright?: string
}

/**
 * Fetch a Bible passage from api.bible.
 * Falls back gracefully when no API key is configured.
 *
 * @param reference - Human-readable reference like "John 3:16" or "Philippians 4:13"
 */
export async function fetchBiblePassage(reference: string): Promise<BiblePassage> {
  if (!KEY) {
    return {
      reference,
      text: '[Bible API key not configured — paste the verse text manually or add BIBLE_API_KEY to your .env file]',
    }
  }

  try {
    // Step 1: Search for the passage to get its canonical ID
    const searchRes = await fetch(
      `${BASE}/bibles/${VERSION}/search?query=${encodeURIComponent(reference)}&limit=1`,
      { headers: { 'api-key': KEY }, next: { revalidate: 86400 } }
    )

    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`)
    const searchData = await searchRes.json()
    const passages = searchData?.data?.passages
    if (!passages?.length) throw new Error('No passages found')

    const passageId = passages[0].id

    // Step 2: Fetch full passage text
    const passageRes = await fetch(
      `${BASE}/bibles/${VERSION}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false`,
      { headers: { 'api-key': KEY }, next: { revalidate: 86400 } }
    )

    if (!passageRes.ok) throw new Error(`Passage fetch failed: ${passageRes.status}`)
    const passageData = await passageRes.json()

    const raw: string = passageData?.data?.content || ''
    // Strip any leftover markup tags
    const text = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

    return {
      reference: passageData?.data?.reference || reference,
      text,
      copyright: passageData?.data?.copyright,
    }
  } catch (err) {
    console.error('[BibleAPI]', err)
    return {
      reference,
      text: '[Could not fetch verse — please enter the text manually]',
    }
  }
}

/**
 * Search for Bible verses containing a keyword.
 * Useful for the admin devotional editor's reference picker.
 */
export async function searchBibleVerses(query: string, limit = 5) {
  if (!KEY) return []

  try {
    const res = await fetch(
      `${BASE}/bibles/${VERSION}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: { 'api-key': KEY }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data?.data?.verses || []).map((v: any) => ({
      id: v.id,
      reference: v.reference,
      text: v.text?.replace(/<[^>]+>/g, '').trim(),
    }))
  } catch {
    return []
  }
}
