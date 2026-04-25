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
interface AttendanceRow {
  id: string; present: boolean
  session: { title: string; startTime: Date }
}
interface ChildRow {
  id: string; jerseyNumber: number | null; position: string | null
  user: { name: string }
  attendances: AttendanceRow[]
}

export default async function ParentDashboard() {
  const session = await requireRole(Role.PARENT)
  const userId  = (session.user as { id: string }).id

  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      children: {
        include: {
          user: { select: { name: true } },
          attendances: {
            include: { session: { select: { title: true, startTime: true } } },
            orderBy: { session: { startTime: 'desc' } }, take: 5,
          },
        },
      },
    },
  })

  const [upcomingSessions, latestDevotional, recentAnnouncements] = await Promise.all([
    prisma.session.findMany({
      where: { startTime: { gte: new Date() } },
      include: { coach: { include: { user: { select: { name: true } } } } },
      orderBy: { startTime: 'asc' }, take: 5,
    }) as Promise<SessionRow[]>,
    prisma.devotional.findFirst({
      where: { publishedAt: { not: null, lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.announcement.findMany({
      where: {
        targetRoles: { has: Role.PARENT },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ urgent: 'desc' }, { publishedAt: 'desc' }], take: 4,
    }) as Promise<AnnouncementRow[]>,
  ])

  const children = (parent?.children ?? []) as ChildRow[]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Parent Dashboard</h1>
        <p className="text-ink-500 text-sm mt-1">Stay connected with your child's camp experience</p>
      </div>

      {children.length === 0 ? (
        <div className="card card-body text-center py-10">
          <p className="text-ink-500 text-sm">No children linked to your account yet.</p>
          <p className="text-ink-400 text-xs mt-1">Contact the camp admin to link your child's profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child: ChildRow) => {
            const total   = child.attendances.length
            const present = child.attendances.filter((a: AttendanceRow) => a.present).length
            const rate    = total > 0 ? Math.round((present / total) * 100) : 0
            return (
              <div key={child.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-semibold text-ink-800">{child.user.name}</h2>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {child.position ?? 'Position not set'}
                        {child.jerseyNumber ? ` · #${child.jerseyNumber}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-court-600">{rate}%</p>
                      <p className="text-xs text-ink-400">Attendance</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">Recent Sessions</p>
                  {child.attendances.length === 0 ? (
                    <p className="text-sm text-ink-400">No sessions recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {child.attendances.map((a: AttendanceRow) => (
                        <div key={a.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-ink-700">{a.session.title}</span>
                            <span className="text-ink-400 text-xs ml-2">
                              {new Date(a.session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className={a.present ? 'badge-green' : 'badge-red'}>
                            {a.present ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Upcoming Sessions</h2>
            <Link href="/dashboard/parent/schedule" className="text-xs text-court-500 hover:underline">Full schedule →</Link>
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
                </div>
                <SessionTypeBadge type={s.type} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">Announcements</h2>
            <Link href="/dashboard/parent/announcements" className="text-xs text-court-500 hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentAnnouncements.length === 0 && (
              <p className="px-6 py-4 text-sm text-ink-400">No announcements.</p>
            )}
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
      </div>

      {latestDevotional && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-800">This Week's Devotional</h2>
            <Link href="/dashboard/parent/devotionals" className="text-xs text-court-500 hover:underline">All devotionals →</Link>
          </div>
          <div className="card-body">
            <span className="badge-green mb-3 inline-block">{latestDevotional.weekTheme}</span>
            <h3 className="font-display text-base font-semibold text-ink-800 mb-2">{latestDevotional.title}</h3>
            <div className="rounded-xl bg-spirit-50 border border-spirit-200 p-4 mb-3">
              <p className="text-xs font-semibold text-spirit-700 mb-1">{latestDevotional.bibleReference}</p>
              <p className="text-sm text-spirit-900 italic leading-relaxed">"{latestDevotional.bibleText}"</p>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">{latestDevotional.commentary}</p>
            {latestDevotional.application && (
              <div className="mt-4 rounded-xl bg-court-50 border border-court-200 p-4">
                <p className="text-xs font-bold text-court-700 uppercase tracking-wide mb-1">This week's challenge</p>
                <p className="text-sm text-court-800">{latestDevotional.application}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
