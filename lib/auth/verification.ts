// Shared helpers for the email-verification flow.

const CODE_LENGTH = 6
export const VERIFICATION_CODE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

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
