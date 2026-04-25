import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import MessagesViewWrapper from '@/components/dashboard/MessagesViewWrapper'

export default async function CoachMessagesPage() {
  const session = await requireRole(Role.COACH)
  const user = session.user as { id: string; role: Role }
  return <MessagesViewWrapper userId={user.id} userRole={user.role} canBroadcast={true} />
}
