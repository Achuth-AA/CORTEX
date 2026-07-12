import Reveal from './Reveal.jsx'
import { PRODUCTS } from '../data.js'

function Featured() {
  return (
    <section className="section section-tinted" id="featured">
      <Reveal>
        <div className="section-head">
          <div>
            <p className="eyebrow">New Arrivals</p>
            <h2>This Season&apos;s Icons</h2>
          </div>
          <a href="#newsletter" className="btn btn-outline section-head-cta">
            View All Pieces
          </a>
        </div>
      </Reveal>

      <div className="products-row">
        {PRODUCTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 90} className="product-cell">
            <article className="product-card">
              <div className="product-media">
                <span className="product-label">{p.label}</span>
                <img src={p.image} alt={p.name} loading="lazy" />
                <button type="button" className="product-quick">
                  Add to Bag
                </button>
              </div>
              <div className="product-info">
                <h3>{p.name}</h3>
                <p className="product-price">{p.price}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Featured
