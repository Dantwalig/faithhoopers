'use client'

import { useEffect, useState } from 'react'

interface Devotional {
  id: string
  title: string
  weekTheme: string
  bibleReference: string
  bibleText: string
  commentary: string
  application: string | null
  publishedAt: string | null
  createdAt: string
}

interface Props {
  canCreate?: boolean
  showUnpublished?: boolean
}

export default function DevotionalsView({ canCreate = false, showUnpublished = false }: Props) {
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [selected, setSelected]       = useState<Devotional | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)

  // Form state
  const [form, setForm] = useState({
    title: '', weekTheme: '', bibleReference: '', bibleText: '',
    commentary: '', application: '', publishNow: true,
  })
  const [fetchingVerse, setFetchingVerse] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const params = showUnpublished ? '?all=1' : ''
    fetch(`/api/devotionals${params}`)
      .then(r => r.json())
      .then(data => {
        setDevotionals(data)
        if (data.length > 0) setSelected(data[0])
        setLoading(false)
      })
  }, [showUnpublished])

  async function fetchVerse() {
    if (!form.bibleReference.trim()) return
    setFetchingVerse(true)
    const res = await fetch(`/api/devotionals/bible?ref=${encodeURIComponent(form.bibleReference)}`)
    const data = await res.json()
    setForm(f => ({ ...f, bibleText: data.text || '' }))
    setFetchingVerse(false)
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveError('')
    const res = await fetch('/api/devotionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setSaveError(data.error || 'Failed'); setSaving(false); return }
    setDevotionals(d => [data, ...d])
    setSelected(data)
    setShowForm(false)
    setSaving(false)
    setForm({ title: '', weekTheme: '', bibleReference: '', bibleText: '', commentary: '', application: '', publishNow: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Devotionals</h1>
          <p className="text-ink-500 text-sm mt-0.5">Weekly Bible themes and reflections</p>
        </div>
        {canCreate && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ New Devotional</button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">New Devotional</h2>
            <button onClick={() => setShowForm(false)} className="text-ink-400 hover:text-ink-700">✕</button>
          </div>
          <form onSubmit={handleCreate} className="card-body space-y-4">
            {saveError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{saveError}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input name="title" required value={form.title} onChange={handleFormChange} className="input" placeholder="e.g. Running the Race"/>
              </div>
              <div>
                <label className="label">Week theme</label>
                <input name="weekTheme" required value={form.weekTheme} onChange={handleFormChange} className="input" placeholder="e.g. Identity &amp; Purpose"/>
              </div>
            </div>
            <div>
              <label className="label">Bible reference</label>
              <div className="flex gap-2">
                <input
                  name="bibleReference" required value={form.bibleReference}
                  onChange={handleFormChange} className="input flex-1"
                  placeholder="e.g. Philippians 4:13"
                />
                <button type="button" onClick={fetchVerse} disabled={fetchingVerse} className="btn-secondary shrink-0">
                  {fetchingVerse ? 'Fetching…' : 'Fetch verse'}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Verse text</label>
              <textarea
                name="bibleText" value={form.bibleText} onChange={handleFormChange}
                className="input h-24 resize-none"
                placeholder="Auto-fetched from Bible API, or paste manually…"
              />
            </div>
            <div>
              <label className="label">Commentary <span className="text-ink-400 font-normal">(your reflection)</span></label>
              <textarea
                name="commentary" required value={form.commentary} onChange={handleFormChange}
                className="input h-32 resize-none"
                placeholder="Unpack the verse — what does it mean for these teens, on and off the court?"
              />
            </div>
            <div>
              <label className="label">Weekly challenge <span className="text-ink-400 font-normal">(optional)</span></label>
              <input name="application" value={form.application} onChange={handleFormChange} className="input"
                placeholder="e.g. Before practice, pray for a teammate by name"/>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-700">
              <input
                type="checkbox" checked={form.publishNow}
                onChange={e => setForm(f => ({ ...f, publishNow: e.target.checked }))}
                className="rounded border-ink-300"
              />
              Publish immediately
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : 'Create Devotional'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-pane layout */}
      {loading ? (
        <div className="card card-body animate-pulse h-64"/>
      ) : devotionals.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-ink-500">No devotionals yet.</p>
          {canCreate && <p className="text-ink-400 text-sm mt-1">Create the first one above.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {devotionals.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  selected?.id === d.id
                    ? 'border-court-300 bg-court-50'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-ink-800 text-sm leading-snug">{d.title}</p>
                  {!d.publishedAt && (
                    <span className="badge-gray shrink-0">Draft</span>
                  )}
                </div>
                <p className="text-xs text-spirit-600 font-medium">{d.weekTheme}</p>
                <p className="text-xs text-ink-400 mt-1">{d.bibleReference}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2 card">
              <div className="card-body space-y-5">
                <div>
                  <span className="badge-green mb-2 inline-block">{selected.weekTheme}</span>
                  <h2 className="font-display text-xl font-bold text-ink-800">{selected.title}</h2>
                </div>

                {/* Verse */}
                <div className="rounded-2xl bg-spirit-50 border border-spirit-200 p-5">
                  <p className="text-xs font-bold text-spirit-700 uppercase tracking-wide mb-2">{selected.bibleReference}</p>
                  <p className="text-base text-spirit-900 italic leading-relaxed">"{selected.bibleText}"</p>
                </div>

                {/* Commentary */}
                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Reflection</p>
                  <p className="text-ink-700 leading-relaxed whitespace-pre-line">{selected.commentary}</p>
                </div>

                {/* Application */}
                {selected.application && (
                  <div className="rounded-2xl bg-court-50 border border-court-200 p-5">
                    <p className="text-xs font-bold text-court-700 uppercase tracking-wide mb-2">This week's challenge</p>
                    <p className="text-court-800">{selected.application}</p>
                  </div>
                )}

                {selected.publishedAt && (
                  <p className="text-xs text-ink-400">
                    Published {new Date(selected.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
