import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { fmt3, fmt2, COLORS } from '../lib/format'

export default function AlphaSweep({ data }) {
  const rows = data.alpha_sweep
  const chosen = data.alpha
  const best = rows.reduce((a, b) => (b.auc > a.auc ? b : a), rows[0])

  return (
    <div className="section" id="alpha">
      <div className="section-head">
        <h2>Alpha Sweep</h2>
        <p>
          Effect of the fusion weight alpha (0 = attribute-only, 1 = topology-only) on
          overall AUC. The configured alpha = {fmt2(chosen)} is marked; best AUC is{' '}
          {fmt3(best.auc)} at alpha = {fmt2(best.alpha)}.
        </p>
      </div>
      <div className="card">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={rows} margin={{ top: 6, right: 20, bottom: 18, left: -6 }}>
            <CartesianGrid stroke="#232b3b" />
            <XAxis
              dataKey="alpha"
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              tick={{ fill: '#97a3b6', fontSize: 11 }}
              label={{ value: 'alpha', position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
            />
            <YAxis tick={{ fill: '#97a3b6', fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip fmt={fmt3} labelName="alpha" />} />
            <ReferenceLine
              x={chosen}
              stroke={COLORS.warm}
              strokeDasharray="5 4"
              label={{ value: `α=${fmt2(chosen)}`, fill: COLORS.warm2, fontSize: 11, position: 'top' }}
            />
            <Line type="monotone" dataKey="auc" name="AUC" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
