// Colored initials avatar with an optional online status dot.
const initialsOf = (name = '?') =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function Avatar({ name, color = '#6366f1', size = 40, online, showDot = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full font-display font-bold text-white"
        style={{ background: color, fontSize: size * 0.4 }}
      >
        {initialsOf(name)}
      </div>
      {showDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-panel ${
            online ? 'bg-green-500 animate-pulse-ring' : 'bg-zinc-500'
          }`}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </div>
  )
}
