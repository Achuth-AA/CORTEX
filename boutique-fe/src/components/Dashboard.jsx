import { inr, txStatus } from '../store.js'
import { useData } from '../dataContext.js'

/* Categorical palette validated with the dataviz six-checks script
   (lightness band, chroma floor, CVD ΔE 29.0, ≥3:1 on the white card surface). */
const SERIES = { gold: '#c08a3e', teal: '#0a9483', wine: '#a63030', blue: '#4664c9' }
const METHOD_COLORS = {
  UPI: SERIES.gold,
  Cash: SERIES.teal,
  Card: SERIES.wine,
  'Bank Transfer': SERIES.blue,
}
const INK = '#1a1816'
const MUTED = '#8a8378'
const GRID = '#eae6de'

const compact = (n) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
    : n >= 1000
      ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
      : `₹${n}`

function buildStats(profiles, txs) {
  const clientNames = new Set(
    [...profiles.map((p) => p.name), ...txs.map((t) => t.client)].map((n) =>
      n.trim().toLowerCase(),
    ),
  )
  const garments = profiles.reduce((s, p) => s + p.garments.length, 0)
  const billed = txs.reduce((s, t) => s + t.amount, 0)
  const received = txs.reduce((s, t) => s + t.received, 0)

  const typeCounts = {}
  profiles.forEach((p) =>
    p.garments.forEach((g) => {
      typeCounts[g.type] = (typeCounts[g.type] ?? 0) + 1
    }),
  )
  const byType = Object.entries(typeCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const monthMap = new Map()
  ;[...txs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => {
      const key = t.date.slice(0, 7)
      monthMap.set(key, (monthMap.get(key) ?? 0) + t.received)
    })
  const byMonth = [...monthMap.entries()].slice(-6).map(([key, value]) => ({
    label: new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', {
      month: 'short',
    }),
    value,
  }))

  const methodMap = {}
  txs.forEach((t) => {
    methodMap[t.method] = (methodMap[t.method] ?? 0) + t.received
  })
  const byMethod = Object.keys(METHOD_COLORS)
    .filter((m) => methodMap[m] > 0)
    .map((m) => ({ label: m, value: methodMap[m] }))

  const status = { Paid: 0, Partial: 0, Pending: 0 }
  txs.forEach((t) => {
    status[txStatus(t)] += 1
  })

  return {
    tiles: {
      clients: clientNames.size,
      garments,
      received,
      outstanding: billed - received,
    },
    byMonth,
    byType,
    byMethod,
    status,
  }
}

const niceMax = (n) => {
  if (n <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(n))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * pow >= n) return m * pow
  }
  return 10 * pow
}

function ColumnChart({ data }) {
  const W = 480
  const H = 230
  const M = { top: 22, right: 8, bottom: 28, left: 48 }
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom
  const yMax = niceMax(Math.max(...data.map((d) => d.value)))
  const ticks = [0, 0.5, 1].map((f) => f * yMax)
  const band = plotW / data.length
  const barW = Math.min(24, band * 0.5)
  const maxIdx = data.findIndex((d) => d.value === Math.max(...data.map((x) => x.value)))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Revenue received by month">
      {ticks.map((t) => {
        const y = M.top + plotH - (t / yMax) * plotH
        return (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
            <text x={M.left - 8} y={y + 4} textAnchor="end" fontSize="12" fill={MUTED}>
              {compact(t)}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const h = Math.max((d.value / yMax) * plotH, d.value > 0 ? 2 : 0)
        const x = M.left + band * i + (band - barW) / 2
        const y = M.top + plotH - h
        const r = Math.min(4, h)
        return (
          <g key={d.label} className="col-group">
            <title>{`${d.label}: ${inr(d.value)}`}</title>
            <rect x={M.left + band * i} y={M.top} width={band} height={plotH} fill="transparent" />
            {h > 0 && (
              <path
                d={`M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${y + h} Z`}
                fill={SERIES.gold}
              />
            )}
            {i === maxIdx && d.value > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="500" fill={INK}>
                {compact(d.value)}
              </text>
            )}
            <text x={M.left + band * i + band / 2} y={H - 8} textAnchor="middle" fontSize="12" fill={MUTED}>
              {d.label}
            </text>
          </g>
        )
      })}
      <line x1={M.left} x2={W - M.right} y1={M.top + plotH} y2={M.top + plotH} stroke="#c9c3b8" strokeWidth="1" />
    </svg>
  )
}

function BarList({ data, color, unit }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="barlist">
      {data.map((d) => (
        <div className="barlist-row" key={d.label} title={`${d.label}: ${d.value}${unit}`}>
          <span className="barlist-label">{d.label}</span>
          <div className="barlist-track">
            <div
              className="barlist-bar"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
            <span className="barlist-value">{d.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MethodSplit({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div>
      <div className="split-bar">
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label}: ${inr(d.value)}`}
            style={{
              width: `${(d.value / total) * 100}%`,
              background: METHOD_COLORS[d.label],
            }}
          />
        ))}
      </div>
      <ul className="split-legend">
        {data.map((d) => (
          <li key={d.label}>
            <i style={{ background: METHOD_COLORS[d.label] }} />
            <span>{d.label}</span>
            <strong>{inr(d.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

const STATUS_DOTS = { Paid: '#0ca30c', Partial: '#b7791f', Pending: '#d03b3b' }

function Dashboard({ onNavigate }) {
  const { profiles, txs, ready, dbError } = useData()
  const isEmpty = ready && profiles.length === 0 && txs.length === 0
  const stats = buildStats(profiles, txs)

  const tiles = [
    { label: 'Total Clients', value: stats.tiles.clients },
    { label: 'Garments Recorded', value: stats.tiles.garments },
    { label: 'Revenue Received', value: inr(stats.tiles.received) },
    { label: 'Outstanding Balance', value: inr(stats.tiles.outstanding) },
  ]

  return (
    <section className="section measure dash">
      <div className="measure-head">
        <p className="eyebrow">Atelier Overview</p>
        <h1>Dashboard</h1>
        <p className="measure-sub">
          A live picture of the boutique — clients, garments, and money in one
          place.
        </p>
      </div>

      {dbError && <p className="m-banner m-banner-error">{dbError}</p>}
      {!ready && <p className="d-empty">Loading your live numbers…</p>}
      {isEmpty && (
        <p className="m-banner m-banner-success">
          ✦ No records yet — save a few{' '}
          <button type="button" className="d-link" onClick={() => onNavigate('measurements')}>
            measurements
          </button>{' '}
          and{' '}
          <button type="button" className="d-link" onClick={() => onNavigate('transactions')}>
            transactions
          </button>{' '}
          to see your live numbers here.
        </p>
      )}

      <div className="d-tiles">
        {tiles.map((t) => (
          <div className="d-tile" key={t.label}>
            <span>{t.label}</span>
            <strong>{t.value}</strong>
          </div>
        ))}
      </div>

      <div className="d-grid">
        <div className="m-card d-card d-card-wide">
          <h2>Revenue by Month</h2>
          <p className="d-card-sub">Amount received, last 6 months</p>
          {stats.byMonth.length > 0 ? (
            <ColumnChart data={stats.byMonth} />
          ) : (
            <p className="d-empty">No transactions yet.</p>
          )}
        </div>

        <div className="m-card d-card">
          <h2>Payment Status</h2>
          <p className="d-card-sub">Across all transactions</p>
          <ul className="d-status">
            {Object.entries(stats.status).map(([label, count]) => (
              <li key={label}>
                <i style={{ background: STATUS_DOTS[label] }} />
                <span>{label}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="m-card d-card">
          <h2>Garments by Type</h2>
          <p className="d-card-sub">From saved measurement profiles</p>
          {stats.byType.length > 0 ? (
            <BarList data={stats.byType} color={SERIES.teal} unit=" garments" />
          ) : (
            <p className="d-empty">No measurements yet.</p>
          )}
        </div>

        <div className="m-card d-card">
          <h2>Received by Method</h2>
          <p className="d-card-sub">Share of payments collected</p>
          {stats.byMethod.length > 0 ? (
            <MethodSplit data={stats.byMethod} />
          ) : (
            <p className="d-empty">No payments recorded yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Dashboard
