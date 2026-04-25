import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db/prisma'
import { Role, SessionType } from '@/lib/enums'
import { StatCard } from '@/components/ui/StatCard'
import { SessionTypeBadge } from '@/components/ui/SessionTypeBadge'
import Link from 'next/link'

interface SessionRow {
  id: string; title: string; type: SessionType; startTime: Date
  location: string | null; coach: { user: { name: string } } | null
}
interface AnnouncementRow { id: string; title: string; body: string; urgent: boolean }

export default async function AdminDashboard() {
  await requireRole(Role.ADMIN)

  const [totalPlayerCount, coachCount, upcomingSessions, recentAnnouncements] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.PLAYER } }),
      prisma.user.count({ where: { role: Role.COACH } }),
      prisma.session.findMany({
        where: { startTime: { gte: new Date() } },
        include: { coach: { include: { user: { select: { name: true } } } } },
        orderBy: { startTime: 'asc' }, take: 5,
      }) as Promise<SessionRow[]>,
      prisma.announcement.findMany({
        orderBy: { publishedAt: 'desc' }, take: 4,
      }) as Promise<AnnouncementRow[]>,
    ])

  const presentCount = await prisma.attendance.count({ where: { present: true } })
  const totalCount   = await prisma.attendance.count()
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
        <p className="text-ink-500 text-sm mt-1">Full overview of camp operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Players"     value={totalPlayerCount}        accent="orange" sub="Registered this camp" />
        <StatCard label="Coaches"           value={coachCount}              accent="green"  sub="Active staff" />
        <StatCard label="Upcoming Sessions" value={upcomingSessions.length} accent="blue"   sub="Next 30 days" />
        <StatCard label="Attendance Rate"   value={`${attendanceRate}%`}    accent="purple" sub="All-time average" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Upcoming Sessions</h2>
            <Link href="/dashboard/admin/schedule" className="text-xs text-court-500 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {upcomingSessions.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No upcoming sessions scheduled.</p>
            )}
            {upcomingSessions.map((s: SessionRow) => (
              <div key={s.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{s.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {s.location && ` · ${s.location}`}
                    </p>
                    {s.coach && <p className="text-xs text-ink-400 mt-0.5">Coach: {s.coach.user.name}</p>}
                  </div>
                  <SessionTypeBadge type={s.type} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Recent Announcements</h2>
            <Link href="/dashboard/admin/announcements" className="text-xs text-court-500 hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentAnnouncements.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No announcements yet.</p>
            )}
            {recentAnnouncements.map((a: AnnouncementRow) => (
              <div key={a.id} className="px-6 py-4">
                <div className="flex items-start gap-2">
                  {a.urgent && <span className="badge-red mt-0.5 shrink-0">Urgent</span>}
                  <div>
                    <p className="text-sm font-medium text-ink-800">{a.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{a.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-body">
        <h2 className="font-display text-base font-semibold text-ink-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/schedule?new=1"      className="btn-primary">+ New Session</Link>
          <Link href="/dashboard/admin/announcements?new=1" className="btn-secondary">+ Announcement</Link>
          <Link href="/dashboard/admin/devotionals?new=1"   className="btn-secondary">+ Devotional</Link>
          <Link href="/dashboard/admin/players"             className="btn-ghost">View Players</Link>
          <Link href="/dashboard/admin/attendance"          className="btn-ghost">Take Attendance</Link>
        </div>
      </div>
    </div>
  )
}
