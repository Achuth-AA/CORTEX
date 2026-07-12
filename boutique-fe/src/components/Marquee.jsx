import { MARQUEE_ITEMS } from '../data.js'

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}

export default Marquee
