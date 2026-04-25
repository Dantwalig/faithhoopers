import AttendancePage from '@/app/dashboard/coach/attendance/page'
import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'

export default async function AdminAttendancePage() {
  await requireRole(Role.ADMIN)
  return <AttendancePage />
}
