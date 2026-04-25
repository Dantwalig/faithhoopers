// These match Prisma schema enums exactly.
// In production, Prisma generates these — this file makes the codebase
// type-check without needing `prisma generate` to have run first.

export enum Role {
  ADMIN  = 'ADMIN',
  COACH  = 'COACH',
  PLAYER = 'PLAYER',
  PARENT = 'PARENT',
}

export enum SessionType {
  TRAINING   = 'TRAINING',
  GAME       = 'GAME',
  BIBLE_STUDY = 'BIBLE_STUDY',
  DEVOTIONAL = 'DEVOTIONAL',
}
