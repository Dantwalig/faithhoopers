import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path  = req.nextUrl.pathname

    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const role = token.role as string

    // Guard role-specific dashboard paths
    const roleGuards: Record<string, string> = {
      '/dashboard/admin':  'ADMIN',
      '/dashboard/coach':  'COACH',
      '/dashboard/player': 'PLAYER',
      '/dashboard/parent': 'PARENT',
    }

    for (const [prefix, requiredRole] of Object.entries(roleGuards)) {
      if (path.startsWith(prefix) && role !== requiredRole && role !== 'ADMIN') {
        // Redirect to their own dashboard
        const own = `/dashboard/${role.toLowerCase()}`
        return NextResponse.redirect(new URL(own, req.url))
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
