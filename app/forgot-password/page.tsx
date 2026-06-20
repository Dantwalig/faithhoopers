'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  )
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="relative min-h-screen bg-brand-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <Image src="/gallery/gallery-helpside.jpg" alt="" fill className="object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/90 via-brand-black/95 to-brand-black" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400 z-10"/>

      <div className="w-full max-w-md relative z-10">
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
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Forgot password</h1>
              <p className="text-ink-400 text-sm mb-6">Enter your email and we'll send you a link to reset it.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label text-white/60">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="you@example.com"/>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/40">
                Remembered it?{' '}
                <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium">Sign in</Link>
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">📬</p>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-ink-400 text-sm mb-6">
                If an account exists for {email ? <span className="text-white">{email}</span> : 'that address'}, a reset link is on its way. It expires in 1 hour.
              </p>
              <button onClick={() => setSent(false)} type="button"
                className="w-full rounded-2xl border border-white/10 py-3 text-base font-semibold text-white hover:bg-white/5 transition-colors mb-3">
                Use a different email
              </button>
              <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium text-sm">Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
