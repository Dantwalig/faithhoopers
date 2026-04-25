import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { Role } from '@/lib/enums'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth()
  const userRole = (session.user as any).role as Role
  if (!roles.includes(userRole)) {
    redirect('/dashboard')
  }
  return session
}

export function dashboardPath(role: Role): string {
  switch (role) {
    case Role.ADMIN:  return '/dashboard/admin'
    case Role.COACH:  return '/dashboard/coach'
    case Role.PLAYER: return '/dashboard/player'
    case Role.PARENT: return '/dashboard/parent'
    default:          return '/dashboard'
  }
}
