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
import { fmt3, seriesColor } from '../lib/format'

const HERO = 'ARISE (full)'

// Merge an object of {series: [{x,y},...]} into a single array keyed by x.
function mergeSeries(obj) {
  const names = Object.keys(obj)
  const map = new Map()
  names.forEach((name) => {
    obj[name].forEach((pt) => {
      const key = pt.x
      if (!map.has(key)) map.set(key, { x: key })
      map.get(key)[name] = pt.y
    })
  })
  return {
    names,
    rows: Array.from(map.values()).sort((a, b) => a.x - b.x),
  }
}

function CurveChart({ title, obj, xLabel, yLabel }) {
  const { names, rows } = mergeSeries(obj)
  return (
    <div className="card">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={rows} margin={{ top: 6, right: 16, bottom: 18, left: -6 }}>
          <CartesianGrid stroke="#232b3b" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            tick={{ fill: '#97a3b6', fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: xLabel, position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: '#97a3b6', fontSize: 11 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#6b7689', fontSize: 11 }}
          />
          <Tooltip
            content={<ChartTooltip fmt={fmt3} labelName={xLabel} />}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {names.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              name={name}
              stroke={seriesColor(name, i)}
              strokeWidth={name === HERO ? 3 : 1.5}
              strokeOpacity={name === HERO ? 1 : 0.8}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Curves({ data }) {
  return (
    <div className="section" id="curves">
      <div className="section-head">
        <h2>ROC &amp; PR Curves</h2>
        <p>
          Per-method ROC (false-positive vs true-positive rate) and precision-recall
          curves. <b>ARISE (full)</b> is drawn bold.
        </p>
      </div>
      <div className="grid grid-2">
        <CurveChart
          title="ROC Curve"
          obj={data.roc}
          xLabel="False Positive Rate"
          yLabel="True Positive Rate"
        />
        <CurveChart
          title="Precision-Recall Curve"
          obj={data.pr}
          xLabel="Recall"
          yLabel="Precision"
        />
      </div>
    </div>
  )
}
