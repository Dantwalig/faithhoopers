import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-court-500 mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-ink-400 mb-8">Looks like this page took an out-of-bounds turn.</p>
        <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
      </div>
    </div>
  )
}
