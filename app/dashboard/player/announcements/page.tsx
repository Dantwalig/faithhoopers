import AnnouncementsView from '@/components/dashboard/AnnouncementsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function PlayerAnnouncementsPage() {
  await requireRole(Role.PLAYER)
  return <AnnouncementsView canCreate={false} />
}
