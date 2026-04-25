import DevotionalsView from '@/components/dashboard/DevotionalsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function ParentDevotionalsPage() {
  await requireRole(Role.PARENT)
  return <DevotionalsView canCreate={false} showUnpublished={false} />
}
