import ScheduleView from '@/components/dashboard/ScheduleView'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function CoachSchedulePage() {
  await requireRole(Role.COACH)
  return <ScheduleView />
}
