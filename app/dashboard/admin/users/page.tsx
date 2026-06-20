import { requireRole } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db/prisma'
import { Role } from '@/lib/enums'

interface UserRow {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  emailVerified: boolean
  createdAt: Date
  player: { age: number | null; gender: string | null } | null
  coach: { specialty: string | null } | null
  facilitator: { specialty: string | null } | null
  parent: { _count: { children: number } } | null
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin', COACH: 'Coach', FACILITATOR: 'Facilitator', PLAYER: 'Player', PARENT: 'Parent',
}

const ROLE_BADGE: Record<Role, string> = {
  ADMIN:       'bg-purple-100 text-purple-800',
  COACH:       'bg-spirit-100 text-spirit-700',
  FACILITATOR: 'bg-spirit-100 text-spirit-700',
  PLAYER:      'bg-court-100 text-court-800',
  PARENT:      'bg-blue-100 text-blue-800',
}

export default async function AdminUsersPage() {
  await requireRole(Role.ADMIN)

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      emailVerified: true, createdAt: true,
      player: { select: { age: true, gender: true } },
      coach: { select: { specialty: true } },
      facilitator: { select: { specialty: true } },
      parent: { select: { _count: { select: { children: true } } } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  }) as UserRow[]

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})

  function detailFor(u: UserRow): string {
    switch (u.role) {
      case Role.PLAYER:
        return [u.player?.gender === 'MALE' ? 'Boy' : u.player?.gender === 'FEMALE' ? 'Girl' : null, u.player?.age ? `${u.player.age}y` : null]
          .filter(Boolean).join(' · ') || '—'
      case Role.COACH:
        return u.coach?.specialty || '—'
      case Role.FACILITATOR:
        return u.facilitator?.specialty || '—'
      case Role.PARENT:
        return u.parent ? `${u.parent._count.children} child${u.parent._count.children === 1 ? '' : 'ren'}` : '—'
      default:
        return '—'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Users</h1>
        <p className="text-ink-500 text-sm mt-0.5">Every account on the platform, grouped by role</p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {(Object.keys(ROLE_LABEL) as Role[]).map(role => (
          <div key={role} className="card card-body py-4 text-center">
            <p className="text-2xl font-bold text-ink-900">{counts[role] ?? 0}</p>
            <p className="text-xs text-ink-500 mt-0.5">{ROLE_LABEL[role]}s</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50 border-b border-ink-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Details</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Verified</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                <td className="px-6 py-3 font-medium text-ink-800">{u.name}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="px-4 py-3 text-ink-600 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-ink-600 text-xs">{u.phone ?? '—'}</td>
                <td className="px-4 py-3 text-ink-600 text-xs">{detailFor(u)}</td>
                <td className="px-4 py-3 text-center">
                  {u.emailVerified
                    ? <span className="text-spirit-600">✓</span>
                    : <span className="text-ink-300">—</span>}
                </td>
                <td className="px-4 py-3 text-ink-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
