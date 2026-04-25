'use client'

import MessagesView from './MessagesView'
import { Role } from '@/lib/enums'

interface Props {
  userId: string
  userRole: Role
  canBroadcast?: boolean
}

export default function MessagesViewWrapper({ userId, userRole, canBroadcast = false }: Props) {
  return (
    <MessagesView
      currentUserId={userId}
      currentUserRole={userRole}
      canBroadcast={canBroadcast}
    />
  )
}
