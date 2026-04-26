'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Role } from '@/lib/enums'
import { signOut } from 'next-auth/react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function BookIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function MessageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function ClipboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
}

function navItemsForRole(role: Role): NavItem[] {
  const base = `/dashboard/${role.toLowerCase()}`

  const shared: NavItem[] = [
    { label: 'Dashboard',      href: base,                      icon: <GridIcon /> },
    { label: 'Schedule',       href: `${base}/schedule`,        icon: <CalendarIcon /> },
    { label: 'Devotionals',    href: `${base}/devotionals`,     icon: <BookIcon /> },
    { label: 'Announcements',  href: `${base}/announcements`,   icon: <BellIcon /> },
    { label: 'Messages',       href: `${base}/messages`,        icon: <MessageIcon /> },
  ]

  if (role === Role.ADMIN) {
    return [
      { label: 'Dashboard',      href: base,                       icon: <GridIcon /> },
      { label: 'Schedule',       href: `${base}/schedule`,         icon: <CalendarIcon /> },
      { label: 'Players',        href: `${base}/players`,          icon: <UsersIcon /> },
      { label: 'Attendance',     href: `${base}/attendance`,       icon: <ClipboardIcon /> },
      { label: 'Devotionals',    href: `${base}/devotionals`,      icon: <BookIcon /> },
      { label: 'Announcements',  href: `${base}/announcements`,    icon: <BellIcon /> },
      { label: 'Messages',       href: `${base}/messages`,         icon: <MessageIcon /> },
    ]
  }

  if (role === Role.COACH) {
    return [
      { label: 'Dashboard',      href: base,                       icon: <GridIcon /> },
      { label: 'Schedule',       href: `${base}/schedule`,         icon: <CalendarIcon /> },
      { label: 'Attendance',     href: `${base}/attendance`,       icon: <ClipboardIcon /> },
      { label: 'Devotionals',    href: `${base}/devotionals`,      icon: <BookIcon /> },
      { label: 'Announcements',  href: `${base}/announcements`,    icon: <BellIcon /> },
      { label: 'Messages',       href: `${base}/messages`,         icon: <MessageIcon /> },
    ]
  }

  return shared
}

interface Props {
  role: Role
  userName: string
  userEmail: string
}

export function SidebarNav({ role, userName, userEmail }: Props) {
  const pathname = usePathname()
  const items = navItemsForRole(role)

  const roleLabel: Record<Role, string> = {
    ADMIN: 'Admin', COACH: 'Coach', PLAYER: 'Player', PARENT: 'Parent',
  }

  const roleColor: Record<Role, string> = {
    ADMIN:  'bg-purple-100 text-purple-800',
    COACH:  'bg-spirit-100 text-spirit-700',
    PLAYER: 'bg-court-100 text-court-800',
    PARENT: 'bg-blue-100 text-blue-800',
  }

  return (
    <aside className="w-64 bg-brand-black flex flex-col shrink-0 border-r border-white/5">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-court-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="18" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M4 22h36M22 4v36M8 10c6 3 10 8 14 12M36 10c-6 3-10 8-14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white leading-tight">Faith</p>
            <p className="font-display text-sm font-bold text-court-400 leading-tight">Hoopers</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-orange text-white'
                  : 'text-white/40 hover:bg-brand-coal hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-3 pb-5 border-t border-white/5 pt-3">
        <div className="px-3 py-3 rounded-xl bg-brand-coal">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <span className={`badge text-xs ${roleColor[role]}`}>{roleLabel[role]}</span>
          </div>
          <p className="text-xs text-ink-500 truncate mb-3">{userEmail}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-xs text-white/40 hover:text-white hover:bg-white/10 rounded-lg py-1.5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
