'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Session { id: string; title: string; startTime: string; type: string }
interface AttendanceRecord {
  playerId: string
  present: boolean
  notes: string
  player: { user: { name: string }; jerseyNumber: number | null }
}

export default function AttendancePage() {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('sessionId')

  const [sessions, setSessions]     = useState<Session[]>([])
  const [sessionId, setSessionId]   = useState(preselectedId || '')
  const [records, setRecords]       = useState<AttendanceRecord[]>([])
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    fetch('/api/sessions?upcoming=0')
      .then(r => r.json())
      .then(setSessions)
  }, [])

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    setSaved(false)

    // Load existing attendance records for this session
    fetch(`/api/attendance?sessionId=${sessionId}`)
      .then(r => r.json())
      .then((existing: AttendanceRecord[]) => {
        setRecords(existing)
        setLoading(false)
      })
  }, [sessionId])

  // If no existing records, load all players and create blank records
  useEffect(() => {
    if (!sessionId || loading || records.length > 0) return
    fetch('/api/users?role=PLAYER')
      .then(r => r.json())
      .then((players: any[]) => {
        setRecords(players.map(p => ({
          playerId: p.player?.id ?? p.id,
          present:  false,
          notes:    '',
          player:   { user: { name: p.name }, jerseyNumber: p.player?.jerseyNumber ?? null },
        })))
      })
  }, [sessionId, loading, records.length])

  function toggle(playerId: string) {
    setRecords(r => r.map(rec =>
      rec.playerId === playerId ? { ...rec, present: !rec.present } : rec
    ))
  }

  function setNote(playerId: string, notes: string) {
    setRecords(r => r.map(rec =>
      rec.playerId === playerId ? { ...rec, notes } : rec
    ))
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, records }),
    })
    setSaving(false)
    setSaved(true)
  }

  const presentCount = records.filter(r => r.present).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Attendance</h1>
          <p className="text-ink-500 text-sm mt-0.5">Mark players present or absent for a session</p>
        </div>
        {sessionId && records.length > 0 && (
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Attendance'}
          </button>
        )}
      </div>

      {/* Session picker */}
      <div className="card card-body">
        <label className="label">Select session</label>
        <select
          value={sessionId}
          onChange={e => { setSessionId(e.target.value); setRecords([]); setSaved(false) }}
          className="input max-w-md"
        >
          <option value="">Choose a session…</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance sheet */}
      {sessionId && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">
              Player Roster
            </h2>
            {records.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-spirit-600 font-medium">{presentCount} present</span>
                <span className="text-ink-400">{records.length - presentCount} absent</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-14 bg-ink-50 rounded-xl animate-pulse"/>
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-ink-400">No players registered yet.</p>
          ) : (
            <div className="divide-y divide-ink-100">
              {records.map(rec => (
                <div key={rec.playerId} className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                  rec.present ? 'bg-spirit-50/50' : ''
                }`}>
                  {/* Toggle */}
                  <button
                    onClick={() => toggle(rec.playerId)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all shrink-0 ${
                      rec.present
                        ? 'bg-spirit-500 text-white scale-105 shadow-sm'
                        : 'bg-ink-100 text-ink-300 hover:bg-ink-200'
                    }`}
                    aria-label={rec.present ? 'Mark absent' : 'Mark present'}
                  >
                    {rec.present ? '✓' : '○'}
                  </button>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-800">{rec.player.user.name}</p>
                    {rec.player.jerseyNumber && (
                      <p className="text-xs text-ink-400">#{rec.player.jerseyNumber}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={rec.notes}
                    onChange={e => setNote(rec.playerId, e.target.value)}
                    className="input w-48 text-xs py-2"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bulk actions */}
          {records.length > 0 && (
            <div className="px-6 py-4 border-t border-ink-100 flex items-center gap-3">
              <button
                onClick={() => setRecords(r => r.map(rec => ({ ...rec, present: true })))}
                className="btn-ghost text-xs"
              >
                Mark all present
              </button>
              <button
                onClick={() => setRecords(r => r.map(rec => ({ ...rec, present: false })))}
                className="btn-ghost text-xs"
              >
                Clear all
              </button>
              <div className="flex-1"/>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
