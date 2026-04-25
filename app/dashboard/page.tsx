import { requireAuth } from '@/lib/auth/helpers'
import { dashboardPath } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await requireAuth()
  redirect(dashboardPath((session.user as any).role as Role))
}
