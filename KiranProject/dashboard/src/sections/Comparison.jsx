import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { fmt3, COLORS } from '../lib/format'

const HERO = 'ARISE (full)'

export default function Comparison({ data }) {
  const rows = data.comparison

  return (
    <div className="section" id="comparison">
      <div className="section-head">
        <h2>Method Comparison</h2>
        <p>
          AUC and AUPRC for ARISE and its ablations against baseline detectors.{' '}
          <b>ARISE (full)</b> is highlighted.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="chart-title">AUC by method</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows} margin={{ top: 6, right: 10, bottom: 50, left: -8 }}>
              <CartesianGrid stroke="#232b3b" vertical={false} />
              <XAxis
                dataKey="method"
                tick={{ fill: '#97a3b6', fontSize: 11 }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip fmt={fmt3} />} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="auc" name="AUC" radius={[4, 4, 0, 0]}>
                {rows.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.method === HERO ? COLORS.accent : '#3a4a6b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">AUPRC by method</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rows} margin={{ top: 6, right: 10, bottom: 50, left: -8 }}>
              <CartesianGrid stroke="#232b3b" vertical={false} />
              <XAxis
                dataKey="method"
                tick={{ fill: '#97a3b6', fontSize: 11 }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis domain={[0, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip fmt={fmt3} />} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="auprc" name="AUPRC" radius={[4, 4, 0, 0]}>
                {rows.map((r, i) => (
                  <Cell
                    key={i}
                    fill={r.method === HERO ? COLORS.good : '#3a5b4b'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>AUC</th>
                <th>AUPRC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.method} className={r.method === HERO ? 'highlight' : ''}>
                  <td>{r.method}</td>
                  <td>{fmt3(r.auc)}</td>
                  <td>{fmt3(r.auprc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
