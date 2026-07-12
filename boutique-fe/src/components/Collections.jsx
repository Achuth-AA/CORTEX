import Reveal from './Reveal.jsx'
import { COLLECTIONS } from '../data.js'

function Collections() {
  return (
    <section className="section" id="collections">
      <Reveal>
        <div className="section-head">
          <div>
            <p className="eyebrow">The Collections</p>
            <h2>Curated for Every Moment</h2>
          </div>
          <p className="section-note">
            Four edits, one philosophy — considered pieces that move effortlessly
            from morning coffee to midnight.
          </p>
        </div>
      </Reveal>

      <div className="collections-grid">
        {COLLECTIONS.map((c, i) => (
          <Reveal key={c.title} delay={i * 90} className="collection-cell">
            <a href="#featured" className="collection-card">
              <div className="collection-media">
                <img src={c.image} alt={c.title} loading="lazy" />
              </div>
              <div className="collection-info">
                <span className="collection-tag">{c.tag}</span>
                <h3>{c.title}</h3>
                <span className="collection-link">
                  Discover <i>→</i>
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Collections
