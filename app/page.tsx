import { getSession } from '@/lib/auth/helpers'
import { dashboardPath } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect(dashboardPath((session.user as any).role as Role))
  }

  return (
    <main className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="court-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="1"/>
              <line x1="0" y1="40" x2="80" y2="40" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#court-lines)"/>
        </svg>
      </div>

      {/* Orange accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400"/>

      <div className="relative z-10 text-center max-w-lg">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-court-500 flex items-center justify-center shadow-lg shadow-court-900/40">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="18" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M4 22h36M22 4v36M8 10c6 3 10 8 14 12M36 10c-6 3-10 8-14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 className="font-display text-5xl font-bold text-white mb-3 leading-tight">
          Faith<br />
          <span className="text-court-400">Hoopers</span>
        </h1>

        <p className="text-ink-400 text-lg mb-10 leading-relaxed">
          Faith-based basketball camp platform — organizing training, community, and spiritual growth in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary text-base px-8 py-3 rounded-2xl font-semibold">
            Sign In
          </Link>
          <Link href="/register" className="btn bg-ink-800 text-ink-200 hover:bg-ink-700 text-base px-8 py-3 rounded-2xl font-semibold border border-ink-700">
            Create Account
          </Link>
        </div>

        <p className="mt-8 text-ink-500 text-sm">
          "Whatever you do, work at it with all your heart." — Col 3:23
        </p>
      </div>
    </main>
  )
}
