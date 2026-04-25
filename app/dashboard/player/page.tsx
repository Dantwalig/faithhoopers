import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db/prisma'
import { Role, SessionType } from '@/lib/enums'
import { SessionTypeBadge } from '@/components/ui/SessionTypeBadge'
import Link from 'next/link'

interface SessionRow {
  id: string; title: string; type: SessionType; startTime: Date
  location: string | null; coach: { user: { name: string } } | null
}
interface AnnouncementRow { id: string; title: string; body: string; urgent: boolean }

export default async function PlayerDashboard() {
  const session  = await requireRole(Role.PLAYER)
  const userId   = (session.user as { id: string; name: string }).id
  const userName = (session.user as { name: string }).name

  const player = await prisma.player.findUnique({ where: { userId } })

  const [upcomingSessions, latestDevotional, recentAnnouncements] = await Promise.all([
    prisma.session.findMany({
      where: { startTime: { gte: new Date() } },
      include: { coach: { include: { user: { select: { name: true } } } } },
      orderBy: { startTime: 'asc' }, take: 4,
    }) as Promise<SessionRow[]>,
    prisma.devotional.findFirst({
      where: { publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.announcement.findMany({
      where: {
        targetRoles: { has: Role.PLAYER },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ urgent: 'desc' }, { publishedAt: 'desc' }],
      take: 3,
    }) as Promise<AnnouncementRow[]>,
  ])

  const attendedCount = player
    ? await prisma.attendance.count({ where: { playerId: player.id, present: true } })
    : 0
  const totalCount = player
    ? await prisma.attendance.count({ where: { playerId: player.id } })
    : 0
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome, {userName} 👋</h1>
        <p className="text-ink-500 text-sm mt-1">Here's what's happening at camp today</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-court-200 bg-court-50 p-5 text-court-600">
          <p className="text-sm font-medium opacity-70 mb-1">My Attendance</p>
          <p className="font-display text-3xl font-bold">{attendanceRate}%</p>
          <p className="text-xs mt-1 opacity-60">{attendedCount} of {totalCount} sessions</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
          <p className="text-sm font-medium opacity-70 mb-1">Upcoming</p>
          <p className="font-display text-3xl font-bold">{upcomingSessions.length}</p>
          <p className="text-xs mt-1 opacity-60">Sessions scheduled</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 text-purple-700">
          <p className="text-sm font-medium opacity-70 mb-1">Jersey #</p>
          <p className="font-display text-3xl font-bold">{player?.jerseyNumber ?? '–'}</p>
          <p className="text-xs mt-1 opacity-60">{player?.position ?? 'Position not set'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Next Up</h2>
            <Link href="/dashboard/player/schedule" className="text-xs text-court-500 hover:underline">Full schedule →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {upcomingSessions.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No upcoming sessions.</p>
            )}
            {upcomingSessions.map((s: SessionRow) => (
              <div key={s.id} className="px-6 py-4 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink-800">{s.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {s.location && ` · ${s.location}`}
                  </p>
                  {s.coach && <p className="text-xs text-ink-400 mt-0.5">{s.coach.user.name}</p>}
                </div>
                <SessionTypeBadge type={s.type} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">This Week's Devotional</h2>
            <Link href="/dashboard/player/devotionals" className="text-xs text-court-500 hover:underline">All devotionals →</Link>
          </div>
          {latestDevotional ? (
            <div className="card-body">
              <span className="badge-green mb-3 inline-block">{latestDevotional.weekTheme}</span>
              <h3 className="font-display text-base font-semibold text-ink-800 mb-2">{latestDevotional.title}</h3>
              <div className="rounded-xl bg-spirit-50 border border-spirit-200 p-4 mb-3">
                <p className="text-xs font-semibold text-spirit-700 mb-1">{latestDevotional.bibleReference}</p>
                <p className="text-sm text-spirit-900 italic leading-relaxed">"{latestDevotional.bibleText}"</p>
              </div>
              <p className="text-sm text-ink-600 line-clamp-3 leading-relaxed">{latestDevotional.commentary}</p>
            </div>
          ) : (
            <p className="px-6 py-4 text-sm text-ink-400">No devotionals published yet.</p>
          )}
        </div>
      </div>

      {recentAnnouncements.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Announcements</h2>
            <Link href="/dashboard/player/announcements" className="text-xs text-court-500 hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentAnnouncements.map((a: AnnouncementRow) => (
              <div key={a.id} className="px-6 py-4 flex items-start gap-3">
                {a.urgent && <span className="badge-red shrink-0 mt-0.5">Urgent</span>}
                <div>
                  <p className="text-sm font-medium text-ink-800">{a.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
