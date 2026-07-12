import { useState } from 'react'
import { NEWSLETTER_IMAGE } from '../data'
import Reveal from './Reveal'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (email.trim()) setDone(true)
  }

  return (
    <section className="newsletter" id="contact">
      <img
        className="newsletter__bg"
        src={NEWSLETTER_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="newsletter__scrim" />
      <div className="newsletter__content">
        <Reveal>
          <h2 className="newsletter__title">
            Join the <em>inner circle</em>
          </h2>
          <p className="newsletter__sub">
            Early access to new drops, private styling sessions and stories
            from the atelier. One letter a month — never more.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          {done ? (
            <p className="newsletter__thanks">
              Welcome to the circle — check your inbox. ✦
            </p>
          ) : (
            <form className="newsletter__form" onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="btn btn--light">
                Subscribe
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
