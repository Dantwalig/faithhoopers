'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Status = 'checking' | 'verified' | 'error' | 'awaiting'

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // No token in the URL — this is someone who just registered (or followed
  // an old link) landing here to wait for / resend the email.
  const [status, setStatus] = useState<Status>(token ? 'checking' : 'awaiting')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Auto-verify as soon as the page loads with a token.
  useEffect(() => {
    if (!token) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setError(data.error || 'This link is invalid or has expired.')
          if (data.email) setEmail(data.email)
          setStatus('error')
          return
        }

        setStatus('verified')
      } catch {
        if (!cancelled) {
          setError('Something went wrong. Please try again.')
          setStatus('error')
        }
      }
    })()

    return () => { cancelled = true }
  }, [token])

  // Count down, then send the now-signed-in user to their dashboard.
  useEffect(() => {
    if (status !== 'verified') return
    if (countdown <= 0) {
      window.location.href = '/dashboard'
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown])

  async function handleResend() {
    if (!email) {
      setError('Enter your email first.')
      return
    }
    setError('')
    setResending(true)
    await fetch('/api/verify-email/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResending(false)
    setInfo('A new verification link has been sent if that email is registered and unverified.')
  }

  return (
    <div className="relative min-h-screen bg-brand-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <Image src="/gallery/gallery-practice.jpg" alt="" fill className="object-cover opacity-20" />
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
          {status === 'checking' && (
            <div className="text-center py-6">
              <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-court-500 border-t-transparent animate-spin" />
              <h1 className="font-display text-xl font-bold text-white mb-1">Verifying your email…</h1>
              <p className="text-ink-400 text-sm">Just a moment.</p>
            </div>
          )}

          {status === 'verified' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🎉</p>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Account verified!</h1>
              <p className="text-ink-400 text-sm mb-6">
                Taking you to your dashboard in {countdown}…
              </p>
              <a href="/dashboard" className="w-full btn-primary py-3 rounded-2xl text-base font-semibold inline-block">
                Go now
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">⚠️</p>
              <h1 className="font-display text-xl font-bold text-white mb-2">Verification failed</h1>
              <p className="text-ink-400 text-sm mb-6">{error}</p>

              {info && (
                <div className="mb-4 rounded-xl bg-court-900/30 border border-court-700 px-4 py-3 text-sm text-court-300 text-left">{info}</div>
              )}

              <div className="space-y-3 text-left">
                <div>
                  <label className="label text-white/60">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="you@example.com"/>
                </div>
                <button onClick={handleResend} disabled={resending} type="button"
                  className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
                  {resending ? 'Sending…' : 'Resend verification link'}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-white/40">
                <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium">Back to sign in</Link>
              </p>
            </div>
          )}

          {status === 'awaiting' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">📬</p>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-ink-400 text-sm mb-6">
                We sent a verification link to {email ? <span className="text-white">{email}</span> : 'your inbox'}.
                Click it to activate your account.
              </p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300 text-left">{error}</div>
              )}
              {info && !error && (
                <div className="mb-4 rounded-xl bg-court-900/30 border border-court-700 px-4 py-3 text-sm text-court-300 text-left">{info}</div>
              )}

              <div className="space-y-3 text-left">
                <div>
                  <label className="label text-white/60">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="you@example.com"/>
                </div>
                <button onClick={handleResend} disabled={resending} type="button"
                  className="w-full rounded-2xl border border-white/10 py-3 text-base font-semibold text-white hover:bg-white/5 transition-colors">
                  {resending ? 'Sending…' : "Didn't get it? Resend link"}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-white/40">
                Already verified?{' '}
                <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
