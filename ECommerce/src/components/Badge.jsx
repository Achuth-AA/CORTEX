const styles = {
  New: 'bg-emerald-500/90 text-white',
  Sale: 'bg-rose-500/90 text-white',
  Hot: 'bg-gradient-to-r from-accent to-accent-violet text-white',
}

export default function Badge({ badge, className = '' }) {
  if (!badge) return null
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${
        styles[badge] || 'bg-zinc-700 text-white'
      } ${className}`}
    >
      {badge}
    </span>
  )
}
