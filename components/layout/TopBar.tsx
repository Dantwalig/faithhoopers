'use client'

import { Role } from '@/lib/enums'

interface Props {
  user: { name: string; role: Role }
}

const greetingByRole: Record<Role, string> = {
  ADMIN:  'Managing the camp',
  COACH:  'Ready to coach',
  PLAYER: 'Ready to play',
  PARENT: 'Staying connected',
}

export function TopBar({ user }: Props) {
  const hour  = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-14 border-b border-ink-200 bg-white flex items-center px-6 shrink-0">
      <div className="flex-1">
        <p className="text-sm text-ink-500">
          {greeting}, <span className="font-medium text-ink-800">{user.name}</span>
          <span className="mx-2 text-ink-300">·</span>
          <span className="text-ink-400">{greetingByRole[user.role]}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </header>
  )
}
