import AnnouncementsView from '@/components/dashboard/AnnouncementsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function CoachAnnouncementsPage() {
  await requireRole(Role.COACH, Role.FACILITATOR)
  return <AnnouncementsView canCreate={true} />
}
