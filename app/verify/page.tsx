'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Step = 'code' | 'password' | 'done'

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  )
}

function VerifyForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<Step>('code')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const res = await fetch('/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Verification failed.')
      return
    }

    setStep(data.needsPassword ? 'password' : 'done')
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)

    const res = await fetch('/api/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Could not set password.')
      return
    }

    setStep('done')
  }

  async function handleResend() {
    if (!email) {
      setError('Enter your email first.')
      return
    }
    setError('')
    setLoading(true)
    await fetch('/api/verify-email/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setInfo('A new code has been sent if that email is registered.')
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
          {step === 'code' && (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Verify your email</h1>
              <p className="text-ink-400 text-sm mb-6">Enter the 6-digit code we emailed you.</p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</div>
              )}
              {info && (
                <div className="mb-4 rounded-xl bg-court-900/30 border border-court-700 px-4 py-3 text-sm text-court-300">{info}</div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="label text-white/60">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="you@example.com"/>
                </div>
                <div>
                  <label className="label text-white/60">Verification code</label>
                  <input required value={code} onChange={e => setCode(e.target.value)} maxLength={6} inputMode="numeric"
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30 text-center text-2xl tracking-[0.3em] font-bold"
                    placeholder="••••••"/>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
                  {loading ? 'Verifying…' : 'Verify email'}
                </button>
              </form>

              <button onClick={handleResend} disabled={loading} type="button"
                className="mt-4 w-full text-center text-sm text-white/40 hover:text-white transition-colors">
                Didn't get a code? Resend
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Set your password</h1>
              <p className="text-ink-400 text-sm mb-6">Your email is verified — now choose a password for your account.</p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="label text-white/60">New password</label>
                  <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="Min 8 characters"/>
                </div>
                <div>
                  <label className="label text-white/60">Confirm password</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="Repeat password"/>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
                  {loading ? 'Saving…' : 'Set password & activate account'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🎉</p>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Welcome to Faith Hoopers!</h1>
              <p className="text-ink-400 text-sm mb-6">Your account is active. You're all set to sign in.</p>
              <button onClick={() => router.push('/login')} className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
                Continue to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
