import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { fmt3, COLORS } from '../lib/format'

export default function PrecisionAtK({ data }) {
  const c = data.precision_at_k_curve
  const rows = c.ks.map((k, i) => ({
    k,
    total: c.total[i],
    topology: c.topology[i],
    attribute: c.attribute[i],
  }))

  return (
    <div className="section" id="precisionk">
      <div className="section-head">
        <h2>Precision@K</h2>
        <p>
          Fraction of true anomalies among the top-K flagged nodes, split by anomaly type.
        </p>
      </div>
      <div className="card">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={rows} margin={{ top: 6, right: 16, bottom: 18, left: -6 }}>
            <CartesianGrid stroke="#232b3b" />
            <XAxis
              dataKey="k"
              type="number"
              tick={{ fill: '#97a3b6', fontSize: 11 }}
              label={{ value: 'K', position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
            />
            <YAxis domain={[0, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }} />
            <Tooltip content={<ChartTooltip fmt={fmt3} labelName="K" />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="total" name="Total" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="topology" name="Topology" stroke={COLORS.topology} strokeWidth={1.8} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="attribute" name="Attribute" stroke={COLORS.attribute} strokeWidth={1.8} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
