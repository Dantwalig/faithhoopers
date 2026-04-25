'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400"/>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-court-500 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="18" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M4 22h36M22 4v36M8 10c6 3 10 8 14 12M36 10c-6 3-10 8-14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white">Faith Hoopers</span>
          </Link>
        </div>

        <div className="bg-ink-800 rounded-3xl border border-ink-700 p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-ink-400 text-sm mb-6">Sign in to your camp account</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-ink-300" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500 focus:border-court-500 focus:ring-court-900"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label text-ink-300" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500 focus:border-court-500 focus:ring-court-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-2xl text-base font-semibold mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            No account?{' '}
            <Link href="/register" className="text-court-400 hover:text-court-300 font-medium">
              Register here
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-xl bg-ink-900 border border-ink-700 p-4 text-xs text-ink-400 space-y-1">
            <p className="font-medium text-ink-300 mb-2">Demo accounts (after seeding):</p>
            <p>Admin: admin@faithhoopers.com / admin123</p>
            <p>Coach: coach.james@faithhoopers.com / coach123</p>
            <p>Player: david.mukamana@faithhoopers.com / player123</p>
            <p>Parent: sarah.mukamana@email.com / parent123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
