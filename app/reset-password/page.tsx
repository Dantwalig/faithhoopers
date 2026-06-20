'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Status = 'form' | 'done' | 'invalid'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  // "invite" = first-time setup (admin/parent invite), default = a genuine
  // forgot-password reset. Only changes the copy shown.
  const isInvite = searchParams.get('context') === 'invite'

  const [status, setStatus] = useState<Status>(token ? 'form' : 'invalid')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!token) return
    setLoading(true)

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Could not set your password.')
      if (res.status === 404 || res.status === 400) setStatus('invalid')
      return
    }

    setStatus('done')
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
          {status === 'form' && (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">
                {isInvite ? 'Set your password' : 'Reset your password'}
              </h1>
              <p className="text-ink-400 text-sm mb-6">
                {isInvite
                  ? 'Choose a password to activate your account.'
                  : 'Choose a new password for your account.'}
              </p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  {loading ? 'Saving…' : isInvite ? 'Set password & activate account' : 'Reset password'}
                </button>
              </form>
            </>
          )}

          {status === 'done' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">✅</p>
              <h1 className="font-display text-2xl font-bold text-white mb-2">
                {isInvite ? 'Account activated!' : 'Password updated'}
              </h1>
              <p className="text-ink-400 text-sm mb-6">You're signed in — taking you to your dashboard.</p>
              <a href="/dashboard" className="w-full btn-primary py-3 rounded-2xl text-base font-semibold inline-block">
                Go to dashboard
              </a>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">⚠️</p>
              <h1 className="font-display text-xl font-bold text-white mb-2">Link invalid or expired</h1>
              <p className="text-ink-400 text-sm mb-6">
                {error || 'This link is no longer valid. Request a new one to continue.'}
              </p>
              <Link href="/forgot-password" className="w-full btn-primary py-3 rounded-2xl text-base font-semibold inline-block">
                Request a new link
              </Link>
              <p className="mt-6 text-center text-sm text-white/40">
                <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium">Back to sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
