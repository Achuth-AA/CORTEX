import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { PRODUCTS } from '../data'
import Reveal, { EASE } from './Reveal'

export default function Featured() {
  return (
    <section className="section featured" id="featured">
      <div className="section__head">
        <Reveal>
          <p className="eyebrow">03 — Featured</p>
          <h2 className="section__title">
            This week's <em>most loved</em>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="section__lead">
            The pieces our clients keep coming back for — restocked in limited
            numbers, styled by our in-house team.
          </p>
        </Reveal>
      </div>

      <div className="featured__grid">
        {PRODUCTS.map((p, i) => (
          <motion.article
            className="product-card"
            key={p.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
          >
            <div className="product-card__media">
              <img src={p.image} alt={p.name} loading="lazy" />
              <span className="product-card__label">{p.label}</span>
              <button className="product-card__add" aria-label={`Add ${p.name} to bag`}>
                <Plus size={16} strokeWidth={2} />
                <span>Add to bag</span>
              </button>
            </div>
            <div className="product-card__info">
              <h3>{p.name}</h3>
              <p>{p.price}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <Reveal className="featured__more" delay={0.1}>
        <a href="#contact" className="btn btn--dark">
          View Full Collection
        </a>
      </Reveal>
    </section>
  )
}
