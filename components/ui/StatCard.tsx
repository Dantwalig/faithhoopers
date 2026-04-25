interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'orange' | 'green' | 'purple' | 'blue'
}

const accentClasses = {
  orange: 'bg-court-50  border-court-200 text-court-600',
  green:  'bg-spirit-50 border-spirit-200 text-spirit-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  blue:   'bg-blue-50   border-blue-200   text-blue-700',
}

export function StatCard({ label, value, sub, accent = 'orange' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${accentClasses[accent]}`}>
      <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
      <p className="font-display text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}
