'use client'

import { useState } from 'react'
import ScheduleView from '@/components/dashboard/ScheduleView'
import { SessionType } from '@/lib/enums'

export default function AdminSchedulePage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', type: 'TRAINING' as SessionType,
    description: '', location: '',
    startTime: '', endTime: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime:   new Date(form.endTime).toISOString(),
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to create session')
      setSaving(false)
      return
    }
    setSaving(false)
    setShowModal(false)
    setForm({ title: '', type: SessionType.TRAINING, description: '', location: '', startTime: '', endTime: '' })
    window.location.reload()
  }

  return (
    <>
      <ScheduleView canCreate onCreateClick={() => setShowModal(true)} />

      {/* Create session modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-800">New Session</h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="label">Session title</label>
                <input name="title" required value={form.title} onChange={handleChange} className="input" placeholder="e.g. Morning Drills"/>
              </div>
              <div>
                <label className="label">Session type</label>
                <select name="type" value={form.type} onChange={handleChange} className="input">
                  <option value="TRAINING">Training</option>
                  <option value="GAME">Game</option>
                  <option value="BIBLE_STUDY">Bible Study</option>
                  <option value="DEVOTIONAL">Devotional</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start time</label>
                  <input name="startTime" type="datetime-local" required value={form.startTime} onChange={handleChange} className="input"/>
                </div>
                <div>
                  <label className="label">End time</label>
                  <input name="endTime" type="datetime-local" required value={form.endTime} onChange={handleChange} className="input"/>
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="input" placeholder="e.g. Main Court"/>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="input h-24 resize-none" placeholder="Session details, focus areas…"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating…' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
