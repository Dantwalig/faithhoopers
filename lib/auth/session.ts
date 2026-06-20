// Mints a NextAuth (JWT strategy) session cookie outside of the normal
// signIn() flow, so we can log someone in right after they click an email
// link — verifying their email or setting their password — without making
// them type their password again immediately afterward.
//
// This mirrors what next-auth's own jwt/session callbacks in auth-options.ts
// expect on the token (id, role), and uses the same cookie name + maxAge
// next-auth would use itself, so the session it creates is indistinguishable
// from one created via the normal credentials sign-in.

import { encode } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { Role } from '@/lib/enums'

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days — matches auth-options.ts

interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

// Attaches a valid session cookie to `response` for `user`. Safe to call
// even if NEXTAUTH_SECRET isn't set (e.g. some local setups) — in that case
// it logs a warning and leaves the response untouched, so the rest of the
// flow (verifying the email / setting the password) still succeeds; the
// person just lands on the login page instead of being auto-signed-in.
export async function attachSessionCookie(response: NextResponse, user: SessionUser): Promise<NextResponse> {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.warn('[session] NEXTAUTH_SECRET not set — skipping auto sign-in.')
    return response
  }

  const token = await encode({
    secret,
    maxAge: SESSION_MAX_AGE,
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return response
}
