import { requireAuth } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()
  const user = session.user as { name: string; email: string; role: Role; id: string }

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      <SidebarNav role={user.role} userName={user.name} userEmail={user.email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
