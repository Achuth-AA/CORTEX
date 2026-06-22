import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { COLORS, fmtInt } from '../lib/format'

const VIEWS = [
  { key: 'final', label: 'Final (fused)' },
  { key: 'topology', label: 'Topology' },
  { key: 'attribute', label: 'Attribute' },
]

export default function ScoreDistributions({ data }) {
  const [view, setView] = useState('final')
  const dist = data.score_distributions[view]

  const rows = dist.bins.map((center, i) => ({
    bin: typeof center === 'number' ? center.toFixed(2) : center,
    normal: dist.normal[i],
    anomaly: dist.anomaly[i],
  }))

  return (
    <div className="section" id="distributions">
      <div className="section-head">
        <h2>Score Distributions</h2>
        <p>
          Histogram of anomaly scores for normal vs. anomalous nodes across score bins. A
          good detector pushes anomalies to the right.
        </p>
      </div>

      <div className="control-row">
        <span className="muted">Score:</span>
        <div className="seg">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={view === v.key ? 'active' : ''}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={rows} margin={{ top: 6, right: 16, bottom: 18, left: 0 }}>
            <CartesianGrid stroke="#232b3b" vertical={false} />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#97a3b6', fontSize: 10 }}
              interval="preserveStartEnd"
              label={{ value: 'Score', position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
            />
            <YAxis tick={{ fill: '#97a3b6', fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<ChartTooltip fmt={fmtInt} labelName="Score" />} cursor={{ fill: '#ffffff08' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="normal" name="Normal" fill={COLORS.accent2} fillOpacity={0.85} radius={[2, 2, 0, 0]} />
            <Bar dataKey="anomaly" name="Anomaly" fill={COLORS.warm} fillOpacity={0.9} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
