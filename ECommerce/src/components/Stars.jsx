import { StarIcon } from './icons.jsx'

export default function Stars({ rating = 0, count, size = 16 }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} width={size} height={size} filled={i < rounded} />
        ))}
      </div>
      <span className="text-xs text-zinc-500">
        {rating.toFixed(1)}
        {count != null && <span className="ml-1">({count.toLocaleString()})</span>}
      </span>
    </div>
  )
}
