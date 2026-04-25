import AnnouncementsView from '@/components/dashboard/AnnouncementsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function ParentAnnouncementsPage() {
  await requireRole(Role.PARENT)
  return <AnnouncementsView canCreate={false} />
}
