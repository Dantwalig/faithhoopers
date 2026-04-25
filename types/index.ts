import { Role, SessionType } from '@/lib/enums'

export type { Role, SessionType }

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface DashboardStats {
  totalPlayers?: number
  totalCoaches?: number
  upcomingSessions?: number
  attendanceRate?: number
}

export interface SessionWithCoach {
  id: string
  title: string
  type: SessionType
  description: string | null
  location: string | null
  startTime: Date
  endTime: Date
  coach?: {
    user: { name: string }
  } | null
}

export interface AttendanceRecord {
  playerId: string
  sessionId: string
  present: boolean
  player: {
    user: { name: string }
    jerseyNumber: number | null
  }
}

export interface DevotionalWithPassage {
  id: string
  title: string
  weekTheme: string
  bibleReference: string
  bibleText: string
  commentary: string
  application: string | null
  publishedAt: Date | null
}

export interface AnnouncementItem {
  id: string
  title: string
  body: string
  urgent: boolean
  targetRoles: Role[]
  publishedAt: Date
  expiresAt: Date | null
}

export interface MessageThread {
  id: string
  sender: { name: string; role: Role }
  receiver?: { name: string; role: Role } | null
  subject: string | null
  body: string
  isBroadcast: boolean
  readAt: Date | null
  createdAt: Date
}
