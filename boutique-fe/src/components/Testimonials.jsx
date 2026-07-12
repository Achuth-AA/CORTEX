import { useEffect, useState } from 'react'
import Reveal from './Reveal.jsx'
import { TESTIMONIALS } from '../data.js'

function Testimonials() {
  const [index, setIndex] = useState(0)
  const count = TESTIMONIALS.length

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 6000)
    return () => clearInterval(timer)
  }, [count])

  return (
    <section className="section section-dark" id="testimonials">
      <Reveal>
        <p className="eyebrow gold">Kind Words</p>
        <h2 className="testimonials-title">Loved by Women Who Know</h2>
      </Reveal>

      <Reveal delay={120}>
        <div className="testimonial-stage">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className={`testimonial ${i === index ? 'is-active' : ''}`}
              aria-hidden={i !== index}
            >
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial from ${t.name}`}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </Reveal>
    </section>
  )
}

export default Testimonials
