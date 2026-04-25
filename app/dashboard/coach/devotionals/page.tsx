import DevotionalsView from '@/components/dashboard/DevotionalsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function CoachDevotionalsPage() {
  await requireRole(Role.COACH)
  return <DevotionalsView canCreate={false} showUnpublished={false} />
}
