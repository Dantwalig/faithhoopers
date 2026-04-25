'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'PLAYER', phone: '',
    // Player-specific
    jerseyNumber: '', position: '',
    // Parent contact (for players)
    parentName: '', parentEmail: '', parentPhone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Registration failed.')
      setLoading(false)
      return
    }

    router.push('/login?registered=1')
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400"/>

      <div className="w-full max-w-lg">
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
          <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-ink-400 text-sm mb-6">Join the faith-based basketball platform</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="label text-ink-300">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {(['PLAYER','PARENT','COACH'] as const).map(r => (
                  <label key={r} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.role === r
                      ? 'border-court-500 bg-court-900/30 text-court-300'
                      : 'border-ink-700 bg-ink-900 text-ink-400 hover:border-ink-600'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">{r.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Core fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label text-ink-300">Full name</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                  placeholder="Your full name"/>
              </div>
              <div>
                <label className="label text-ink-300">Email address</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                  placeholder="you@example.com"/>
              </div>
              <div>
                <label className="label text-ink-300">Phone (optional)</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                  placeholder="+250 7xx xxx xxx"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-ink-300">Password</label>
                  <input name="password" type="password" required value={form.password} onChange={handleChange}
                    className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                    placeholder="Min 8 characters" minLength={8}/>
                </div>
                <div>
                  <label className="label text-ink-300">Confirm</label>
                  <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                    className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                    placeholder="Repeat password"/>
                </div>
              </div>
            </div>

            {/* Player-specific fields */}
            {form.role === 'PLAYER' && (
              <div className="rounded-xl border border-ink-700 p-4 space-y-4">
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Player details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-ink-300">Jersey #</label>
                    <input name="jerseyNumber" type="number" value={form.jerseyNumber} onChange={handleChange}
                      className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                      placeholder="e.g. 23" min={1} max={99}/>
                  </div>
                  <div>
                    <label className="label text-ink-300">Position</label>
                    <input name="position" value={form.position} onChange={handleChange}
                      className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                      placeholder="e.g. Point Guard"/>
                  </div>
                </div>
                <div className="pt-2 border-t border-ink-700">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-3">Parent / Guardian</p>
                  <div className="space-y-3">
                    <input name="parentName" value={form.parentName} onChange={handleChange}
                      className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                      placeholder="Parent full name"/>
                    <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange}
                      className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                      placeholder="Parent email"/>
                    <input name="parentPhone" value={form.parentPhone} onChange={handleChange}
                      className="input bg-ink-900 border-ink-700 text-white placeholder:text-ink-500"
                      placeholder="Parent phone"/>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 rounded-2xl text-base font-semibold">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account?{' '}
            <Link href="/login" className="text-court-400 hover:text-court-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
