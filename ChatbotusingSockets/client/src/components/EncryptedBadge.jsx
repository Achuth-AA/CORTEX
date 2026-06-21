import { LockIcon } from './icons.jsx'

// Reusable "AES-256 encrypted" trust indicator with a hover tooltip.
export default function EncryptedBadge({ label = 'Encrypted', compact = false }) {
  return (
    <span
      className="group relative inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-400"
      title="End-to-end encrypted with AES-256"
    >
      <LockIcon width={12} height={12} />
      {!compact && label}
      <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        End-to-end encrypted with AES-256
      </span>
    </span>
  )
}
