'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<React.ReactNode>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'

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
      if (res.error === 'UNVERIFIED' || res.error === 'NEEDS_PASSWORD') {
        setError(
          <>
            Please verify your email before signing in.{' '}
            <Link href={`/verify?email=${encodeURIComponent(email)}`} className="underline font-medium">
              Verify now
            </Link>
          </>
        )
      } else {
        setError('Invalid email or password.')
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-brand-black flex items-center justify-center px-4 overflow-hidden">
      <Image src="/gallery/gallery-jumpshot.jpg" alt="" fill className="object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/90 via-brand-black/95 to-brand-black" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400 z-10"/>

      <div className="w-full max-w-md relative z-10">
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

        <div className="bg-brand-coal rounded-3xl border border-white/5 p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-ink-400 text-sm mb-6">Sign in to your camp account</p>

          {justRegistered && !error && (
            <div className="mb-4 rounded-xl bg-court-900/30 border border-court-700 px-4 py-3 text-sm text-court-300">
              Account created! Check your email for a verification code before signing in.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-white/60" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input bg-brand-black border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label text-white/60" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-orange hover:text-court-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input bg-brand-black border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange focus:ring-brand-orange/20"
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

          <p className="mt-6 text-center text-sm text-white/40">
            No account?{' '}
            <Link href="/register" className="text-brand-orange hover:text-court-400 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
