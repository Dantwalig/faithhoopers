// Shared helpers for the email-verification flow.

const CODE_LENGTH = 6
export const VERIFICATION_CODE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
export const RESET_CODE_TTL_MS = 60 * 60 * 1000 // 1 hour

export function generateVerificationCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

export function newVerificationExpiry(): Date {
  return new Date(Date.now() + VERIFICATION_CODE_TTL_MS)
}

// Reset codes use the same 6-digit shape but a shorter lifetime and a
// separate column, so a leaked/guessed verification code can't be reused
// to take over a password, and vice versa.
export function generateResetCode(): string {
  return generateVerificationCode()
}

export function newResetExpiry(): Date {
  return new Date(Date.now() + RESET_CODE_TTL_MS)
}
