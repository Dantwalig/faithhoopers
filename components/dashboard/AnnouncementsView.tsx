'use client'

import { useEffect, useState } from 'react'
import { Role } from '@/lib/enums'

interface Announcement {
  id: string
  title: string
  body: string
  urgent: boolean
  targetRoles: Role[]
  publishedAt: string
  expiresAt: string | null
}

interface Props {
  canCreate?: boolean
}

const ALL_ROLES: Role[] = [Role.ADMIN, Role.COACH, Role.PLAYER, Role.PARENT]

export default function AnnouncementsView({ canCreate = false }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', body: '', urgent: false,
    targetRoles: [Role.PLAYER, Role.PARENT, Role.COACH] as Role[],
    expiresAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function load() {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(data => { setAnnouncements(data); setLoading(false) })
  }
  useEffect(load, [])

  function toggleRole(role: Role) {
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter(r => r !== role)
        : [...f.targetRoles, role],
    }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
    setAnnouncements(a => [data, ...a])
    setShowForm(false)
    setSaving(false)
    setForm({ title: '', body: '', urgent: false, targetRoles: [Role.PLAYER, Role.PARENT, Role.COACH], expiresAt: '' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    await fetch('/api/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAnnouncements(a => a.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Announcements</h1>
          <p className="text-ink-500 text-sm mt-0.5">Updates and alerts for the camp community</p>
        </div>
        {canCreate && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ New Announcement</button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">New Announcement</h2>
            <button onClick={() => setShowForm(false)} className="text-ink-400 hover:text-ink-700 text-xl">✕</button>
          </div>
          <form onSubmit={handleCreate} className="card-body space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="label">Title</label>
              <input
                required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input" placeholder="e.g. Reminder: Bring water bottles"/>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                required value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                className="input h-28 resize-none"
                placeholder="What do players, parents, or coaches need to know?"/>
            </div>
            <div>
              <label className="label mb-2">Visible to</label>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.filter(r => r !== 'ADMIN').map(role => (
                  <label key={role} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm transition-colors ${
                    form.targetRoles.includes(role)
                      ? 'border-court-400 bg-court-50 text-court-800'
                      : 'border-ink-200 text-ink-500 hover:border-ink-300'
                  }`}>
                    <input
                      type="checkbox" checked={form.targetRoles.includes(role)}
                      onChange={() => toggleRole(role)} className="sr-only"
                    />
                    {role.charAt(0) + role.slice(1).toLowerCase() + 's'}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-700">
                <input
                  type="checkbox" checked={form.urgent}
                  onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))}
                  className="rounded border-ink-300"
                />
                Mark as urgent
              </label>
              <div className="flex items-center gap-2">
                <label className="label mb-0 text-ink-500">Expires (optional)</label>
                <input
                  type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="input py-1.5 w-40"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving || form.targetRoles.length === 0} className="btn-primary flex-1">
                {saving ? 'Posting…' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card card-body h-24 animate-pulse bg-ink-50"/>)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-3xl mb-3">📢</p>
          <p className="text-ink-500">No announcements right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`card transition-shadow hover:shadow-md ${a.urgent ? 'border-red-200' : ''}`}>
              <div className="card-body">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {a.urgent && <span className="badge-red">Urgent</span>}
                      <h3 className="font-semibold text-ink-800">{a.title}</h3>
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed">{a.body}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-400">
                      <span>{new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>→ {a.targetRoles.map(r => r.charAt(0) + r.slice(1).toLowerCase() + 's').join(', ')}</span>
                      {a.expiresAt && <span>Expires {new Date(a.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {canCreate && (
                    <button onClick={() => handleDelete(a.id)} className="btn-danger text-xs py-1 px-2 shrink-0">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
