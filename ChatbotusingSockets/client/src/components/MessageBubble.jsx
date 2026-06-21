import { useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { LockIcon, EditIcon, TrashIcon, ReplyIcon, CopyIcon, SmileIcon, CheckIcon, XIcon } from './icons.jsx'

const QUICK = ['👍', '❤️', '😂', '😮']

const fmtTime = (ts) =>
  new Date(ts.replace(' ', 'T') + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function MessageBubble({
  message,
  isOwn,
  myId,
  onEdit,
  onDelete,
  onReact,
  onReply,
}) {
  const [hover, setHover] = useState(false)
  const [menuReact, setMenuReact] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)

  // System messages render centered.
  if (message.type === 'system') {
    return (
      <div className="my-2 text-center text-xs text-zinc-500">{message.text}</div>
    )
  }

  const reactions = message.reactions || {}
  const hasReactions = Object.keys(reactions).length > 0

  const saveEdit = () => {
    if (draft.trim() && draft.trim() !== message.text) onEdit(message.id, draft)
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group flex gap-3 px-4 py-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setMenuReact(false)
      }}
    >
      {!isOwn && <Avatar name={message.senderName} color={message.senderAvatar} size={36} />}

      <div className={`flex max-w-[85%] flex-col sm:max-w-[78%] xl:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="mb-0.5 flex items-center gap-2 px-1">
            <span className="text-xs font-semibold text-zinc-300">{message.senderName}</span>
            <span className="text-[10px] text-zinc-500">{fmtTime(message.createdAt)}</span>
          </div>
        )}

        <div className="relative">
          {/* Hover action toolbar */}
          {hover && !editing && !message.deleted && (
            <div
              className={`absolute -top-4 z-10 flex items-center gap-0.5 rounded-lg border border-white/10 bg-panel p-0.5 shadow-panel ${
                isOwn ? 'right-0' : 'left-0'
              }`}
            >
              <div className="relative">
                <button onClick={() => setMenuReact((m) => !m)} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" title="React">
                  <SmileIcon width={15} height={15} />
                </button>
                {menuReact && (
                  <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 gap-1 rounded-xl border border-white/10 bg-panel p-1.5 shadow-panel">
                    {QUICK.map((e) => (
                      <button key={e} onClick={() => { onReact(message.id, e); setMenuReact(false) }} className="rounded-lg p-1 text-base transition-transform hover:scale-125 hover:bg-white/10">
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => onReply(message)} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" title="Reply">
                <ReplyIcon width={15} height={15} />
              </button>
              <button onClick={() => navigator.clipboard?.writeText(message.text)} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" title="Copy">
                <CopyIcon width={15} height={15} />
              </button>
              {isOwn && (
                <>
                  <button onClick={() => { setDraft(message.text); setEditing(true) }} className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" title="Edit">
                    <EditIcon width={15} height={15} />
                  </button>
                  <button onClick={() => onDelete(message.id)} className="rounded p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400" title="Delete">
                    <TrashIcon width={15} height={15} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bubble */}
          <div
            className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow ${
              message.deleted
                ? 'bg-white/5 italic text-zinc-500'
                : isOwn
                ? 'rounded-br-sm bg-gradient-to-br from-accent to-accent-violet text-white'
                : 'rounded-bl-sm bg-bubble text-zinc-100'
            }`}
          >
            {message.deleted ? (
              'This message was deleted'
            ) : editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  rows={2}
                  autoFocus
                  className="w-56 resize-none rounded-lg bg-black/20 p-2 text-sm text-white outline-none"
                />
                <div className="flex justify-end gap-1">
                  <button onClick={() => setEditing(false)} className="rounded-lg bg-white/10 p-1.5"><XIcon width={14} height={14} /></button>
                  <button onClick={saveEdit} className="rounded-lg bg-white/20 p-1.5"><CheckIcon width={14} height={14} /></button>
                </div>
              </div>
            ) : (
              <span className="whitespace-pre-wrap break-words">{message.text}</span>
            )}
          </div>

          {/* Meta row: lock + time + edited */}
          {!message.deleted && (
            <div className={`mt-0.5 flex items-center gap-1.5 px-1 text-[10px] text-zinc-500 ${isOwn ? 'justify-end' : ''}`}>
              <span title="End-to-end encrypted with AES-256" className="flex items-center gap-0.5 text-green-500/80">
                <LockIcon width={10} height={10} />
              </span>
              {isOwn && <span>{fmtTime(message.createdAt)}</span>}
              {message.edited && <span className="italic">(edited)</span>}
            </div>
          )}

          {/* Reactions */}
          {hasReactions && (
            <div className={`mt-1 flex flex-wrap gap-1 ${isOwn ? 'justify-end' : ''}`}>
              {Object.entries(reactions).map(([emoji, userIds]) => {
                const mine = userIds.includes(myId)
                return (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => onReact(message.id, emoji)}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                      mine ? 'border-accent bg-accent/20 text-white' : 'border-white/10 bg-white/5 text-zinc-300'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{userIds.length}</span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
