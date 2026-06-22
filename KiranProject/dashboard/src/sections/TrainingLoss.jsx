import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { COLORS } from '../lib/format'

const fmtLoss = (v) => (typeof v === 'number' ? v.toFixed(4) : v)

export default function TrainingLoss({ data }) {
  const rows = (data.loss_history || []).map((loss, i) => ({ epoch: i + 1, loss }))

  return (
    <div className="section" id="loss">
      <div className="section-head">
        <h2>Training Loss</h2>
        <p>Contrastive training loss of the attribute GCN over epochs.</p>
      </div>
      <div className="card">
        {rows.length === 0 ? (
          <div className="muted">No loss history recorded.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={rows} margin={{ top: 6, right: 20, bottom: 18, left: 0 }}>
              <CartesianGrid stroke="#232b3b" />
              <XAxis
                dataKey="epoch"
                type="number"
                domain={[1, 'dataMax']}
                tick={{ fill: '#97a3b6', fontSize: 11 }}
                label={{ value: 'Epoch', position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
              />
              <YAxis tick={{ fill: '#97a3b6', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip fmt={fmtLoss} labelName="Epoch" />} />
              <Line type="monotone" dataKey="loss" name="Loss" stroke={COLORS.accent2} strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
