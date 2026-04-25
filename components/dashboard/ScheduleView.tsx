'use client'

import { useEffect, useState } from 'react'
import { SessionTypeBadge } from '@/components/ui/SessionTypeBadge'
import { SessionType } from '@/lib/enums'

interface Session {
  id: string
  title: string
  type: SessionType
  description: string | null
  location: string | null
  startTime: string
  endTime: string
  coach?: { user: { name: string } } | null
  _count?: { attendances: number }
}

interface Props {
  canCreate?: boolean
  onCreateClick?: () => void
}

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'TRAINING',   label: 'Training' },
  { value: 'GAME',       label: 'Games' },
  { value: 'BIBLE_STUDY',label: 'Bible Study' },
  { value: 'DEVOTIONAL', label: 'Devotional' },
]

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(sessions: Session[]) {
  const map = new Map<string, Session[]>()
  sessions.forEach(s => {
    const key = formatDate(s.startTime)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  })
  return map
}

export default function ScheduleView({ canCreate = false, onCreateClick }: Props) {
  const [sessions, setSessions]   = useState<Session[]>([])
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [showPast, setShowPast]   = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (!showPast) params.set('upcoming', '1')
    if (typeFilter) params.set('type', typeFilter)

    fetch(`/api/sessions?${params}`)
      .then(r => r.json())
      .then(data => { setSessions(data); setLoading(false) })
  }, [typeFilter, showPast])

  const grouped = groupByDate(sessions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Schedule</h1>
          <p className="text-ink-500 text-sm mt-0.5">Training, games, and Bible sessions</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <button onClick={onCreateClick} className="btn-primary">+ New Session</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              typeFilter === f.value
                ? 'bg-court-500 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-1.5 text-sm text-ink-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPast}
            onChange={e => setShowPast(e.target.checked)}
            className="rounded border-ink-300"
          />
          Show past
        </label>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="card-body space-y-3">
                <div className="h-4 bg-ink-100 rounded w-1/3"/>
                <div className="h-3 bg-ink-100 rounded w-2/3"/>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-ink-500">No sessions found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([date, daySessions]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">{date}</h3>
              <div className="space-y-3">
                {daySessions.map(s => (
                  <div key={s.id} className="card hover:shadow-md transition-shadow">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-ink-800">{s.title}</h4>
                            <SessionTypeBadge type={s.type} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                            <span>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                            {s.location && <span>📍 {s.location}</span>}
                            {s.coach   && <span>👤 {s.coach.user.name}</span>}
                          </div>
                          {s.description && (
                            <p className="text-sm text-ink-500 mt-2 leading-relaxed">{s.description}</p>
                          )}
                        </div>
                        {s._count !== undefined && (
                          <div className="text-right shrink-0">
                            <p className="font-display text-xl font-bold text-ink-800">{s._count.attendances}</p>
                            <p className="text-xs text-ink-400">marked</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
