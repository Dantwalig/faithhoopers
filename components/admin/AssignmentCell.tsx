'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StaffOption { id: string; name: string }

interface Props {
  playerId: string
  coachId: string | null
  facilitatorId: string | null
  coaches: StaffOption[]
  facilitators: StaffOption[]
}

export function AssignmentCell({ playerId, coachId, facilitatorId, coaches, facilitators }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function update(field: 'coachId' | 'facilitatorId', value: string) {
    setSaving(true)
    await fetch(`/api/players/${playerId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value || null }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <select
        defaultValue={coachId ?? ''}
        disabled={saving}
        onChange={e => update('coachId', e.target.value)}
        className="input text-xs py-1.5"
      >
        <option value="">No coach</option>
        {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select
        defaultValue={facilitatorId ?? ''}
        disabled={saving}
        onChange={e => update('facilitatorId', e.target.value)}
        className="input text-xs py-1.5"
      >
        <option value="">No facilitator</option>
        {facilitators.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </div>
  )
}
