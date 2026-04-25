import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import MessagesViewWrapper from '@/components/dashboard/MessagesViewWrapper'

export default async function PlayerMessagesPage() {
  const session = await requireRole(Role.PLAYER)
  const user = session.user as { id: string; role: Role }
  return <MessagesViewWrapper userId={user.id} userRole={user.role} canBroadcast={false} />
}
