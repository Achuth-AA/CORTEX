import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { COLLECTIONS } from '../data'
import Reveal, { EASE } from './Reveal'

export default function Collections() {
  return (
    <section className="section collections" id="collections">
      <div className="section__head">
        <Reveal>
          <p className="eyebrow">01 — Collections</p>
          <h2 className="section__title">
            Pieces that <em>outlive</em> the season
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="section__lead">
            Four edits, released in small batches. When a piece sells out, it
            rarely returns — each collection is designed to be kept, not cycled.
          </p>
        </Reveal>
      </div>

      <div className="collections__grid">
        {COLLECTIONS.map((c, i) => (
          <motion.a
            href="#featured"
            className="collection-card"
            key={c.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
          >
            <div className="collection-card__media">
              <img src={c.image} alt={c.title} loading="lazy" />
            </div>
            <div className="collection-card__body">
              <div>
                <p className="collection-card__tag">{c.tag}</p>
                <h3 className="collection-card__title">{c.title}</h3>
              </div>
              <span className="collection-card__arrow">
                <ArrowUpRight size={18} strokeWidth={1.5} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
