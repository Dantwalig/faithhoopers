// Shared helpers for the email-verification / password-setup flows.
//
// Both flows now use long, random, URL-safe tokens embedded in a link
// rather than a short code the person has to type in — they're stored in
// the same `verificationCode` / `resetCode` columns as before (the column
// names are legacy, but a token is just a longer "code").

import { randomBytes } from 'crypto'

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

const TOKEN_BYTES = 32 // 256 bits — plenty to make guessing infeasible

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex')
}

// Used for the "verify your email" link sent to self-registered accounts
// (players, coaches, facilitators).
export function generateVerificationToken(): string {
  return generateToken()
}

export function newVerificationExpiry(): Date {
  return new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
}

// Used for the "set/reset your password" link — covers forgot-password,
// admin invites, and parent invites. A separate column/lifetime from the
// verification token so a leaked/guessed one can't be reused for the other.
export function generateResetToken(): string {
  return generateToken()
}

// Genuine "forgot password" requests get a short-lived link (1 hour) since
// the account already works and this is a sensitive, time-pressured action.
export function newResetExpiry(): Date {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS)
}

// Admin/parent "set your password for the first time" invites get a longer
// window (24 hours, same as email verification) since there's no urgency —
// the account isn't usable yet either way, and people don't always check
// invite emails right away.
export function newInviteExpiry(): Date {
  return new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
}
