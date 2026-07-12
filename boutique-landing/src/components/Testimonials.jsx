import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TESTIMONIALS } from '../data'
import Reveal, { EASE } from './Reveal'

export default function Testimonials() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
      6000
    )
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[index]

  return (
    <section className="section testimonials" id="testimonials">
      <Reveal>
        <p className="eyebrow eyebrow--center">04 — Kind Words</p>
      </Reveal>
      <div className="testimonials__stage">
        <span className="testimonials__mark" aria-hidden="true">
          “
        </span>
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="testimonials__quote">{t.quote}</p>
            <footer>
              <span className="testimonials__name">{t.name}</span>
              <span className="testimonials__role">{t.role}</span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="testimonials__dots" role="tablist" aria-label="Testimonials">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`testimonials__dot ${i === index ? 'is-active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
