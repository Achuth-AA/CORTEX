import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { STORY_IMAGE } from '../data'
import Reveal, { EASE } from './Reveal'

const STATS = [
  { value: 8, suffix: '+', label: 'Years of curation' },
  { value: 12, suffix: 'k', label: 'Happy clients' },
  { value: 40, suffix: '+', label: 'Artisan partners' },
]

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    let start
    let raf
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / duration, 1)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}

export default function Story() {
  return (
    <section className="section story" id="story">
      <div className="story__inner">
        <motion.div
          className="story__media"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <img src={STORY_IMAGE} alt="Inside the Maison Élan boutique" loading="lazy" />
          <div className="story__frame" aria-hidden="true" />
        </motion.div>

        <div className="story__text">
          <Reveal>
            <p className="eyebrow">02 — Our Story</p>
            <h2 className="section__title">
              A boutique built on <em>quiet luxury</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Maison Élan began in 2018 as a single rail of hand-picked pieces
              in a sunlit atelier. Today we work directly with forty artisan
              workshops across Europe and Asia — but the philosophy hasn't
              changed: fewer, better things.
            </p>
            <p>
              Every fabric is traced to its source, every silhouette is worn
              and re-worn before it earns a place on our floor. We would rather
              sell you one dress you keep for a decade than five you forget.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="story__stats">
              {STATS.map((s) => (
                <div className="story__stat" key={s.label}>
                  <span className="story__stat-num">
                    <Counter value={s.value} suffix={s.suffix} />
                  </span>
                  <span className="story__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <a href="#contact" className="btn btn--dark">
              Visit the Atelier
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
