import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db/prisma'
import { Role } from '@/lib/enums'
import Link from 'next/link'

interface PlayerRow {
  id: string; name: string; email: string; phone: string | null
  player: {
    jerseyNumber: number | null; position: string | null
    attendances: { present: boolean }[]
    _count: { attendances: number }
    parent: { user: { name: string; email: string } } | null
  } | null
}

export default async function AdminPlayersPage() {
  await requireRole(Role.ADMIN)

  const players = await prisma.user.findMany({
    where: { role: Role.PLAYER },
    include: {
      player: {
        include: {
          parent: { include: { user: { select: { name: true, email: true } } } },
          attendances: { where: { present: true } },
          _count: { select: { attendances: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  }) as PlayerRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Players</h1>
          <p className="text-ink-500 text-sm mt-0.5">{players.length} registered players</p>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-3xl mb-3">🏀</p>
          <p className="text-ink-500">No players registered yet.</p>
          <Link href="/register" className="btn-primary mt-4 inline-flex">Register first player</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Player</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Parent</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Attendance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {players.map((p: PlayerRow) => {
                const attended = p.player?.attendances.length ?? 0
                const total    = p.player?._count.attendances ?? 0
                const rate     = total > 0 ? Math.round((attended / total) * 100) : 0
                return (
                  <tr key={p.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-court-100 text-court-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {p.player?.jerseyNumber ?? p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-ink-800">{p.name}</p>
                          <p className="text-xs text-ink-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-600">{p.player?.position ?? '—'}</td>
                    <td className="px-4 py-4">
                      {p.player?.parent ? (
                        <div>
                          <p className="text-ink-700">{p.player.parent.user.name}</p>
                          <p className="text-xs text-ink-400">{p.player.parent.user.email}</p>
                        </div>
                      ) : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-bold ${rate >= 80 ? 'text-spirit-600' : rate >= 50 ? 'text-court-600' : 'text-red-500'}`}>
                          {rate}%
                        </span>
                        <span className="text-xs text-ink-400">{attended}/{total}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-600 text-xs">{p.phone ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
