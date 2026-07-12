import { HERO_IMAGE } from '../data.js'

function Hero() {
  return (
    <section className="hero" id="top">
      <img className="hero-bg" src={HERO_IMAGE} alt="" aria-hidden="true" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow light">Spring / Summer 2026</p>
        <h1>
          Dress with
          <br />
          <em>Quiet Confidence</em>
        </h1>
        <p className="hero-sub">
          A curated boutique of timeless womenswear — crafted in small batches,
          designed to be loved for decades, not seasons.
        </p>
        <div className="hero-actions">
          <a href="#collections" className="btn btn-light">
            Explore Collections
          </a>
          <a href="#story" className="btn btn-ghost">
            Our Story
          </a>
        </div>
      </div>
      <a href="#collections" className="hero-scroll" aria-label="Scroll to collections">
        <span />
      </a>
    </section>
  )
}

export default Hero
