import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db/prisma'
import { Role, SessionType } from '@/lib/enums'
import { StatCard } from '@/components/ui/StatCard'
import { SessionTypeBadge } from '@/components/ui/SessionTypeBadge'
import Link from 'next/link'

interface SessionRow {
  id: string; title: string; type: SessionType; startTime: Date
  location: string | null
}
interface BroadcastRow { id: string; subject: string | null; body: string; createdAt: Date }

export default async function CoachDashboard() {
  const session = await requireRole(Role.COACH)
  const userId  = (session.user as { id: string }).id

  const coach = await prisma.coach.findUnique({
    where: { userId },
    include: {
      sessions: {
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' }, take: 5,
      },
    },
  })

  const playerCount = await prisma.player.count()

  const broadcastMessages = await prisma.message.findMany({
    where: { isBroadcast: true, senderId: userId },
    orderBy: { createdAt: 'desc' }, take: 3,
    include: { sender: { select: { name: true } } },
  }) as BroadcastRow[]

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)
  const todaySessions = await prisma.session.count({
    where: { startTime: { gte: todayStart, lte: todayEnd } },
  })

  const coachSessions = (coach?.sessions ?? []) as SessionRow[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Coach Dashboard</h1>
        <p className="text-ink-500 text-sm mt-1">Your sessions, players, and messages</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Players"          value={playerCount}                 accent="orange" />
        <StatCard label="My Sessions"      value={coachSessions.length}        accent="green"  sub="Upcoming" />
        <StatCard label="Today's Sessions" value={todaySessions}               accent="blue" />
        <StatCard label="Broadcasts Sent"  value={broadcastMessages.length}    accent="purple" sub="Your messages" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">My Upcoming Sessions</h2>
            <Link href="/dashboard/coach/schedule" className="text-xs text-court-500 hover:underline">Full schedule →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {coachSessions.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No upcoming sessions assigned to you.</p>
            )}
            {coachSessions.map((s: SessionRow) => (
              <div key={s.id} className="px-6 py-4 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink-800">{s.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {s.location && ` · ${s.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SessionTypeBadge type={s.type} />
                  <Link href={`/dashboard/coach/attendance?sessionId=${s.id}`} className="btn-ghost text-xs py-1 px-2">
                    Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Recent Broadcasts</h2>
            <Link href="/dashboard/coach/messages" className="text-xs text-court-500 hover:underline">Send message →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {broadcastMessages.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No broadcasts sent yet.</p>
            )}
            {broadcastMessages.map((m: BroadcastRow) => (
              <div key={m.id} className="px-6 py-4">
                <p className="text-sm font-medium text-ink-800">{m.subject || '(no subject)'}</p>
                <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{m.body}</p>
                <p className="text-xs text-ink-400 mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-body">
        <h2 className="font-display text-base font-semibold text-ink-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/coach/attendance" className="btn-primary">Take Attendance</Link>
          <Link href="/dashboard/coach/messages"   className="btn-secondary">Send Broadcast</Link>
          <Link href="/dashboard/coach/schedule"   className="btn-ghost">View Schedule</Link>
        </div>
      </div>
    </div>
  )
}
