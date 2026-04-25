import { requireRole } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import MessagesViewWrapper from '@/components/dashboard/MessagesViewWrapper'

export default async function ParentMessagesPage() {
  const session = await requireRole(Role.PARENT)
  const user = session.user as { id: string; role: Role }
  return <MessagesViewWrapper userId={user.id} userRole={user.role} canBroadcast={false} />
}
