import { useState } from 'react'
import Reveal from './Reveal.jsx'
import { NEWSLETTER_IMAGE } from '../data.js'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <section className="newsletter" id="newsletter">
      <img className="newsletter-bg" src={NEWSLETTER_IMAGE} alt="" aria-hidden="true" />
      <div className="newsletter-overlay" />
      <Reveal className="newsletter-content">
        <p className="eyebrow light">The Boutique List</p>
        <h2>First to Know, Never Rushed</h2>
        <p className="newsletter-sub">
          Private previews, styling notes, and early access to limited runs —
          one considered letter a month, nothing more.
        </p>

        {sent ? (
          <p className="newsletter-thanks">
            Thank you — your first letter is on its way. ✦
          </p>
        ) : (
          <form className="newsletter-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-light">
              Subscribe
            </button>
          </form>
        )}
      </Reveal>
    </section>
  )
}

export default Newsletter
