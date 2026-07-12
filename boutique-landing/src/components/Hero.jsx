import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { HERO_IMAGE } from '../data'
import { EASE } from './Reveal'

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, delay, ease: EASE },
})

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section className="hero" id="top" ref={ref}>
      <motion.div className="hero__bg" style={{ y: bgY }}>
        <motion.img
          src={HERO_IMAGE}
          alt="Woman in elegant boutique fashion"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        <div className="hero__scrim" />
      </motion.div>

      <motion.div className="hero__content" style={{ opacity: fade }}>
        <motion.p className="hero__eyebrow" {...fadeUp(0.5)}>
          Curated Boutique — Est. 2018
        </motion.p>
        <h1 className="hero__title">
          <span className="hero__line">
            <motion.span className="hero__word" {...fadeUp(0.65)}>
              Timeless style,
            </motion.span>
          </span>
          <span className="hero__line">
            <motion.span className="hero__word hero__word--italic" {...fadeUp(0.8)}>
              thoughtfully curated
            </motion.span>
          </span>
        </h1>
        <motion.p className="hero__sub" {...fadeUp(1)}>
          Limited collections of handcrafted pieces for the woman who dresses
          with intention — not with the season.
        </motion.p>
        <motion.div className="hero__cta" {...fadeUp(1.15)}>
          <a href="#collections" className="btn btn--light">
            Explore Collections
          </a>
          <a href="#story" className="btn btn--ghost">
            Our Story
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#collections"
        className="hero__scroll"
        aria-label="Scroll to collections"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
      >
        <span>Scroll</span>
        <ArrowDown size={16} strokeWidth={1.5} />
      </motion.a>
    </section>
  )
}
