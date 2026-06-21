import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSession } from '../hooks/useSession.js'
import FloatingInput from '../components/FloatingInput.jsx'
import { ChevronLeftIcon, CheckIcon } from '../components/icons.jsx'

const steps = ['Shipping', 'Payment', 'Confirm']
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Available promo codes.
const PROMOS = {
  VELORA10: { type: 'percent', value: 10, label: '10% off your order' },
  WELCOME15: { type: 'percent', value: 15, label: '15% off your order' },
  FREESHIP: { type: 'shipping', value: 0, label: 'Free shipping' },
}

function detectCard(number) {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  if (/^6/.test(n)) return 'Discover'
  return ''
}

function Confetti() {
  const pieces = Array.from({ length: 60 })
  const colors = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 37) % 100
        const delay = (i % 10) * 0.05
        const color = colors[i % colors.length]
        const rotate = (i * 47) % 360
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: 0, opacity: 1, rotate }}
            animate={{ y: '110vh', x: ((i % 5) - 2) * 40, opacity: 0, rotate: rotate + 360 }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay, ease: 'easeIn' }}
            className="absolute top-0 h-3 w-2 rounded-sm"
            style={{ left: `${left}%`, background: color }}
          />
        )
      })}
    </div>
  )
}

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart()
  const { currentUser } = useAuth()
  const [, setLastOrder] = useSession('lastOrder', null)
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [flipped, setFlipped] = useState(false)

  const [shipping, setShipping] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
  })
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })
  const [touched, setTouched] = useState({})

  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    const found = PROMOS[code]
    if (!found) {
      setPromo(null)
      setPromoError('That code isn’t valid.')
      return
    }
    setPromo({ code, ...found })
    setPromoError('')
  }

  const removePromo = () => {
    setPromo(null)
    setPromoInput('')
    setPromoError('')
  }

  const baseShipping = subtotal >= 150 ? 0 : 12
  const discount = promo?.type === 'percent' ? subtotal * (promo.value / 100) : 0
  const shipping_ = promo?.type === 'shipping' ? 0 : baseShipping
  const total = Math.max(0, subtotal - discount) + (cart.length ? shipping_ : 0)
  const cardType = useMemo(() => detectCard(payment.cardNumber), [payment.cardNumber])

  const updS = (k) => (e) => setShipping((s) => ({ ...s, [k]: e.target.value }))
  const updP = (k) => (e) => {
    let v = e.target.value
    if (k === 'cardNumber') {
      v = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    }
    if (k === 'expiry') {
      v = v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})(.+)/, '$1/$2')
    }
    if (k === 'cvv') v = v.replace(/\D/g, '').slice(0, 4)
    setPayment((p) => ({ ...p, [k]: v }))
  }

  const shippingErrors = {
    fullName: shipping.fullName.trim().length < 2 ? 'Required' : '',
    email: !emailRe.test(shipping.email) ? 'Valid email required' : '',
    phone: shipping.phone.trim().length < 7 ? 'Required' : '',
    address: shipping.address.trim().length < 4 ? 'Required' : '',
    city: shipping.city.trim().length < 2 ? 'Required' : '',
    zip: shipping.zip.trim().length < 3 ? 'Required' : '',
    country: shipping.country.trim().length < 2 ? 'Required' : '',
  }
  const paymentErrors = {
    cardNumber: payment.cardNumber.replace(/\s/g, '').length < 15 ? 'Enter a valid card number' : '',
    expiry: !/^\d{2}\/\d{2}$/.test(payment.expiry) ? 'MM/YY' : '',
    cvv: payment.cvv.length < 3 ? '3-4 digits' : '',
    cardName: payment.cardName.trim().length < 2 ? 'Required' : '',
  }

  const shippingValid = Object.values(shippingErrors).every((e) => !e)
  const paymentValid = Object.values(paymentErrors).every((e) => !e)

  const next = () => {
    if (step === 0) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(shipping).map((k) => [k, true])) }))
      if (!shippingValid) return
    }
    if (step === 1) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(payment).map((k) => [k, true])) }))
      if (!paymentValid) return
    }
    setStep((s) => Math.min(s + 1, 2))
  }

  const placeOrder = () => {
    const id = 'LUM-' + Math.floor(100000 + (subtotal * 7 + cart.length * 131) % 900000)
    const order = {
      orderId: id,
      items: cart,
      total,
      discount,
      promoCode: promo?.code || null,
      shippingDetails: shipping,
      placedAt: new Date().toISOString(),
    }
    setLastOrder(order)
    setOrderId(id)
    setPlaced(true)
    clearCart()
  }

  // Empty cart guard.
  if (!placed && cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-3xl font-extrabold">Your cart is empty</h1>
        <p className="text-zinc-500">Add some products before checking out.</p>
        <button onClick={() => navigate('/products')} className="btn-accent">
          Browse products
        </button>
      </div>
    )
  }

  if (placed) {
    return (
      <div className="relative mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <Confetti />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white"
        >
          <motion.span
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            <CheckIcon width={48} height={48} strokeWidth={3} />
          </motion.span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-display text-4xl font-extrabold"
        >
          Order confirmed!
        </motion.h1>
        <p className="mt-3 text-zinc-500">
          Thank you for your purchase. A confirmation has been sent to{' '}
          <span className="font-semibold text-accent">{shipping.email}</span>.
        </p>
        <div className="mt-4 rounded-xl bg-accent/10 px-5 py-3 font-mono text-sm font-bold text-accent">
          Order ID: {orderId}
        </div>
        <button onClick={() => navigate('/')} className="btn-accent mt-8">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="mb-8 font-display text-4xl font-extrabold">Checkout</h1>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 font-bold transition-colors ${
                    i <= step
                      ? 'border-accent bg-accent text-white'
                      : 'border-black/15 text-zinc-400 dark:border-white/15'
                  }`}
                >
                  {i < step ? <CheckIcon width={18} height={18} /> : i + 1}
                </div>
                <span className={`mt-2 text-xs font-semibold ${i <= step ? 'text-accent' : 'text-zinc-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <motion.div
                    className="h-full bg-accent"
                    initial={false}
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Step content */}
        <div className="card-surface rounded-2xl p-6 shadow-card md:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-bold">Shipping details</h2>
                <FloatingInput id="fullName" label="Full name" value={shipping.fullName} onChange={updS('fullName')} error={touched.fullName && shippingErrors.fullName} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput id="email" label="Email" type="email" value={shipping.email} onChange={updS('email')} error={touched.email && shippingErrors.email} />
                  <FloatingInput id="phone" label="Phone" value={shipping.phone} onChange={updS('phone')} error={touched.phone && shippingErrors.phone} />
                </div>
                <FloatingInput id="address" label="Street address" value={shipping.address} onChange={updS('address')} error={touched.address && shippingErrors.address} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <FloatingInput id="city" label="City" value={shipping.city} onChange={updS('city')} error={touched.city && shippingErrors.city} />
                  <FloatingInput id="zip" label="ZIP" value={shipping.zip} onChange={updS('zip')} error={touched.zip && shippingErrors.zip} />
                  <FloatingInput id="country" label="Country" value={shipping.country} onChange={updS('country')} error={touched.country && shippingErrors.country} />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-5"
              >
                <h2 className="font-display text-xl font-bold">Payment</h2>

                {/* Animated card preview */}
                <div className="[perspective:1400px]">
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative h-48 w-full [transform-style:preserve-3d]"
                  >
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-accent to-accent-violet p-5 text-white shadow-glow [backface-visibility:hidden]">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-12 rounded-md bg-yellow-300/80" />
                        <span className="font-display text-lg font-bold">{cardType || 'CARD'}</span>
                      </div>
                      <div className="font-mono text-xl tracking-widest">
                        {payment.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="uppercase">{payment.cardName || 'CARDHOLDER NAME'}</span>
                        <span>{payment.expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ink-800 to-ink-700 p-5 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="-mx-5 mt-3 h-10 bg-black" />
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <div className="flex-1 rounded bg-white/80 py-2 pr-3 text-right font-mono text-ink-900">
                          {payment.cvv || '•••'}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-white/60">CVV — for your eyes only</p>
                    </div>
                  </motion.div>
                </div>

                <FloatingInput id="cardNumber" label="Card number" value={payment.cardNumber} onChange={updP('cardNumber')} onFocus={() => setFlipped(false)} error={touched.cardNumber && paymentErrors.cardNumber} inputMode="numeric" />
                <FloatingInput id="cardName" label="Cardholder name" value={payment.cardName} onChange={updP('cardName')} onFocus={() => setFlipped(false)} error={touched.cardName && paymentErrors.cardName} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput id="expiry" label="Expiry (MM/YY)" value={payment.expiry} onChange={updP('expiry')} onFocus={() => setFlipped(false)} error={touched.expiry && paymentErrors.expiry} inputMode="numeric" />
                  <FloatingInput id="cvv" label="CVV" value={payment.cvv} onChange={updP('cvv')} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} error={touched.cvv && paymentErrors.cvv} inputMode="numeric" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-bold">Review your order</h2>
                <ul className="divide-y divide-black/10 dark:divide-white/10">
                  {cart.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{it.name}</p>
                        <p className="text-xs text-zinc-500">
                          {it.size} · Qty {it.quantity}
                        </p>
                      </div>
                      <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl bg-black/5 p-4 text-sm dark:bg-white/5">
                  <p className="font-semibold">Shipping to</p>
                  <p className="mt-1 text-zinc-500">
                    {shipping.fullName}, {shipping.address}, {shipping.city} {shipping.zip}, {shipping.country}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost !py-2.5 text-sm">
                <ChevronLeftIcon width={16} height={16} /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button onClick={next} className="btn-accent">
                Continue
              </button>
            ) : (
              <button onClick={placeOrder} className="btn-accent animate-pulse-glow">
                Place Order
              </button>
            )}
          </div>
        </div>

        {/* Order summary */}
        <aside className="h-fit lg:sticky lg:top-20">
          <div className="card-surface rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-lg font-bold">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-500">
                  <span>Discount ({promo.value}%)</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>{shipping_ === 0 ? 'Free' : `$${shipping_.toFixed(2)}`}</span>
              </div>
              <div className="my-2 h-px bg-black/10 dark:bg-white/10" />
              <div className="flex justify-between font-display text-xl font-bold">
                <span>Total</span>
                <motion.span key={total} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                  ${total.toFixed(2)}
                </motion.span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-5 border-t border-black/10 pt-5 dark:border-white/10">
              {promo ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {promo.code} — {promo.label}
                  </span>
                  <button onClick={removePromo} className="text-xs font-semibold text-zinc-500 hover:text-rose-500">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value)
                        setPromoError('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                      placeholder="Promo code"
                      className="focus-ring w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm uppercase dark:border-white/15"
                    />
                    <button onClick={applyPromo} className="btn-ghost shrink-0 !py-2 text-sm">
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="mt-2 text-xs text-rose-500">{promoError}</p>}
                  <p className="mt-2 text-xs text-zinc-400">
                    Try <span className="font-semibold">VELORA10</span>, <span className="font-semibold">WELCOME15</span>, or{' '}
                    <span className="font-semibold">FREESHIP</span>.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
