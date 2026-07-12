import Reveal from './Reveal.jsx'
import { STORY_IMAGE, STORY_STATS } from '../data.js'

function Story() {
  return (
    <section className="section story" id="story">
      <div className="story-grid">
        <Reveal className="story-media-wrap">
          <div className="story-media">
            <img src={STORY_IMAGE} alt="Inside the Boutique atelier" loading="lazy" />
          </div>
        </Reveal>

        <Reveal delay={120} className="story-body">
          <p className="eyebrow">Our Story</p>
          <h2>Slow Fashion, Made to Keep</h2>
          <p>
            Boutique began in a single Lisbon atelier with one conviction —
            that a wardrobe should be built, not bought. Every garment is cut
            from natural fibres, finished by hand, and produced in runs small
            enough that nothing goes to waste.
          </p>
          <p>
            Fourteen years on, we still work the same way: fewer pieces, better
            made, designed to outlive every trend cycle.
          </p>

          <dl className="story-stats">
            {STORY_STATS.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>

          <a href="#newsletter" className="btn btn-solid">
            Read the Journal
          </a>
        </Reveal>
      </div>
    </section>
  )
}

export default Story
