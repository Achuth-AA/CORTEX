import { MARQUEE_ITEMS } from '../data'

export default function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((item, i) => (
          <span className="marquee__item" key={i}>
            {item} <span className="marquee__dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
