import DevotionalsView from '@/components/dashboard/DevotionalsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function AdminDevotionalsPage() {
  await requireRole(Role.ADMIN)
  return <DevotionalsView canCreate={true} showUnpublished={true} />
}
