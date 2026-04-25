import DevotionalsView from '@/components/dashboard/DevotionalsView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function PlayerDevotionalsPage() {
  await requireRole(Role.PLAYER)
  return <DevotionalsView canCreate={false} showUnpublished={false} />
}
