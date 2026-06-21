import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from './EmojiPicker.jsx'
import { SendIcon, SmileIcon, LockIcon, XIcon, ReplyIcon } from './icons.jsx'

const MAX = 5000

export default function MessageInput({ onSend, onTypingStart, onTypingStop, replyingTo, onCancelReply, disabled }) {
  const [value, setValue] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [flying, setFlying] = useState(false)
  const taRef = useRef(null)
  const typingTimer = useRef(null)
  const isTyping = useRef(false)

  // Auto-resize up to ~5 lines.
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 132) + 'px'
  }, [value])

  const fireTyping = () => {
    if (!isTyping.current) {
      isTyping.current = true
      onTypingStart?.()
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTyping.current = false
      onTypingStop?.()
    }, 2000)
  }

  const send = () => {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
    clearTimeout(typingTimer.current)
    isTyping.current = false
    onTypingStop?.()
    setFlying(true)
    setTimeout(() => setFlying(false), 600)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="border-t border-white/5 bg-panel/60 px-4 py-3 backdrop-blur">
      {/* Reply preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center justify-between gap-2 overflow-hidden rounded-lg border-l-2 border-accent bg-white/5 px-3 py-1.5 text-xs"
          >
            <span className="flex items-center gap-2 truncate text-zinc-400">
              <ReplyIcon width={13} height={13} /> Replying to{' '}
              <span className="font-semibold text-zinc-200">{replyingTo.senderName}</span>: {replyingTo.text}
            </span>
            <button onClick={onCancelReply} className="text-zinc-400 hover:text-white">
              <XIcon width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-end gap-2">
        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setEmojiOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-accent"
            title="Emoji"
          >
            <SmileIcon />
          </button>
          <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onSelect={(e) => setValue((v) => v + e)} />
        </div>

        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={taRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value.slice(0, MAX))
              fireTyping()
            }}
            onKeyDown={onKeyDown}
            placeholder={disabled ? 'Select a conversation…' : 'Type an encrypted message…'}
            className="no-scrollbar w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          {value.length >= 500 && (
            <span className={`absolute bottom-1.5 right-3 text-[10px] ${value.length >= MAX ? 'text-red-400' : 'text-zinc-500'}`}>
              {value.length}/{MAX}
            </span>
          )}
        </div>

        {/* Send */}
        <button
          onClick={send}
          disabled={!canSend}
          className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all ${
            canSend ? 'bg-gradient-to-br from-accent to-accent-violet text-white shadow-glow hover:brightness-110 active:scale-95' : 'bg-white/5 text-zinc-600'
          }`}
          title="Send (Enter)"
        >
          <SendIcon width={18} height={18} />
          {/* Encrypted send animation */}
          <AnimatePresence>
            {flying && (
              <motion.span
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: -120, opacity: 0, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="pointer-events-none absolute text-green-300"
              >
                <LockIcon width={18} height={18} filled />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}
