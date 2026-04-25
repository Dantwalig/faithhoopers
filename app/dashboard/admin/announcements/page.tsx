import AnnouncementsView from '@/components/dashboard/AnnouncementsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function AdminAnnouncementsPage() {
  await requireRole(Role.ADMIN)
  return <AnnouncementsView canCreate={true} />
}
