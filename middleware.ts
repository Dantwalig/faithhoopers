import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@/lib/enums'

// NOTE: deliberately not importing from lib/auth/helpers.ts here — it pulls
// in the Prisma client (via auth-options.ts), which isn't supported on the
// Edge runtime middleware runs on. Keep this mapping in sync with
// dashboardPath() in lib/auth/helpers.ts.
function ownDashboardPath(role: Role): string {
  switch (role) {
    case Role.ADMIN:       return '/dashboard/admin'
    case Role.COACH:       return '/dashboard/coach'
    case Role.FACILITATOR: return '/dashboard/coach'
    case Role.PLAYER:      return '/dashboard/player'
    case Role.PARENT:      return '/dashboard/parent'
    default:                return '/dashboard'
  }
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path  = req.nextUrl.pathname

    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const role = token.role as Role

    // Guard role-specific dashboard paths. Facilitators share the coach
    // dashboard (same permission tier), so they're allowed under that prefix too.
    const roleGuards: Record<string, Role[]> = {
      '/dashboard/admin':  [Role.ADMIN],
      '/dashboard/coach':  [Role.COACH, Role.FACILITATOR],
      '/dashboard/player': [Role.PLAYER],
      '/dashboard/parent': [Role.PARENT],
    }

    for (const [prefix, allowedRoles] of Object.entries(roleGuards)) {
      if (path.startsWith(prefix) && !allowedRoles.includes(role) && role !== Role.ADMIN) {
        return NextResponse.redirect(new URL(ownDashboardPath(role), req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
