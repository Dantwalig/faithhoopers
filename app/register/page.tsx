'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const AGE_OPTIONS = Array.from({ length: 19 - 13 + 1 }, (_, i) => 13 + i)

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'PLAYER', phone: '',
    // Player-specific
    gender: '', age: '', medicalNotes: '',
    // Parent contact (for players)
    parentName: '', parentEmail: '', parentPhone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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

    router.push(`/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <div className="relative min-h-screen bg-brand-black flex items-center justify-center px-4 py-12 overflow-hidden">
      <Image src="/gallery/gallery-helpside.jpg" alt="" fill className="object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/90 via-brand-black/95 to-brand-black" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-court-500 to-court-400 z-10"/>

      <div className="w-full max-w-lg relative z-10">
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
              <label className="label text-white/70">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {(['PLAYER','COACH','FACILITATOR'] as const).map(r => (
                  <label key={r} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.role === r
                      ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                      : 'border-white/10 bg-brand-black text-white/40 hover:border-ink-600'
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
                <label className="label text-white/70">Full name</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                  placeholder="Your full name"/>
              </div>
              <div>
                <label className="label text-white/70">Email address</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                  placeholder="you@example.com"/>
              </div>
              <div>
                <label className="label text-white/70">Phone (optional)</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                  placeholder="+250 7xx xxx xxx"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-white/70">Password</label>
                  <input name="password" type="password" required value={form.password} onChange={handleChange}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="Min 8 characters" minLength={8}/>
                </div>
                <div>
                  <label className="label text-white/70">Confirm</label>
                  <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                    placeholder="Repeat password"/>
                </div>
              </div>
            </div>

            {/* Gender (required for every role) */}
            <div>
              <label className="label text-white/70">Gender</label>
              <select name="gender" required value={form.gender} onChange={handleChange}
                className="input bg-brand-black border-white/10 text-white">
                <option value="" disabled>Select…</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Player-specific fields */}
            {form.role === 'PLAYER' && (
              <div className="rounded-xl border border-white/10 p-4 space-y-4">
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Player details</p>
                <div>
                  <label className="label text-white/70">Age</label>
                  <select name="age" required value={form.age} onChange={handleChange}
                    className="input bg-brand-black border-white/10 text-white">
                    <option value="" disabled>Select…</option>
                    {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-white/70">Pre-existing health conditions or injuries (optional)</label>
                  <textarea name="medicalNotes" value={form.medicalNotes} onChange={handleChange} rows={3}
                    className="input bg-brand-black border-white/10 text-white placeholder:text-white/30 resize-none"
                    placeholder="e.g. asthma, previous ankle injury, allergies — anything coaches should know"/>
                  <p className="text-xs text-ink-500 mt-1">Only visible to camp coaches and admins.</p>
                </div>
                <div className="pt-2 border-t border-ink-700">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-3">Parent / Guardian</p>
                  <p className="text-xs text-ink-500 mb-3">
                    Add your parent's details and we'll set up their account too — they'll get an email to verify and activate it.
                    If a sibling registers with the same parent email, they'll automatically be linked to the same parent account.
                  </p>
                  <div className="space-y-3">
                    <input name="parentName" value={form.parentName} onChange={handleChange}
                      className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                      placeholder="Parent full name"/>
                    <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange}
                      className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
                      placeholder="Parent email"/>
                    <input name="parentPhone" value={form.parentPhone} onChange={handleChange}
                      className="input bg-brand-black border-white/10 text-white placeholder:text-white/30"
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

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange hover:text-court-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
