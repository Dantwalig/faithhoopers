import ScheduleView from '@/components/dashboard/ScheduleView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function PlayerSchedulePage() {
  await requireRole(Role.PLAYER)
  return <ScheduleView />
}
