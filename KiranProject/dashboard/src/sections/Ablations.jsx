import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { fmt3, fmtInt, COLORS, seriesColor } from '../lib/format'

const HERO_SUBSTR = 'k-core (ARISE)'
const RATIO_COLORS = ['#5b8cff', '#34d399', '#f59e0b', '#a78bfa', '#f43f5e']

// Merge imbalance series ({alphas, series:[{ratio, auc_by_alpha}]}) into rows by alpha.
function imbalanceRows(imb) {
  const { alphas, series } = imb
  return alphas.map((a, i) => {
    const row = { alpha: a }
    series.forEach((s) => {
      row[s.ratio] = s.auc_by_alpha[i]
    })
    return row
  })
}

function SubstructureCard({ rows }) {
  return (
    <div className="card">
      <div className="chart-title">
        Region proposal: k-core vs. community detection (topology-anomaly AUC)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rows} margin={{ top: 6, right: 10, bottom: 46, left: -8 }}>
          <CartesianGrid stroke="#232b3b" vertical={false} />
          <XAxis
            dataKey="method"
            tick={{ fill: '#97a3b6', fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis domain={[0, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }} />
          <Tooltip content={<ChartTooltip fmt={fmt3} />} cursor={{ fill: '#ffffff08' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="auc_topology" name="AUC (topology)" radius={[4, 4, 0, 0]}>
            {rows.map((r, i) => (
              <Cell key={i} fill={r.method === HERO_SUBSTR ? COLORS.topology : '#3a4a6b'} />
            ))}
          </Bar>
          <Bar dataKey="auc_overall" name="AUC (overall)" radius={[4, 4, 0, 0]} fill="#3a5b4b" />
        </BarChart>
      </ResponsiveContainer>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>AUC (topology)</th>
              <th>AUC (overall)</th>
              <th># substructures</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.method} className={r.method === HERO_SUBSTR ? 'highlight' : ''}>
                <td>{r.method}</td>
                <td>{fmt3(r.auc_topology)}</td>
                <td>{fmt3(r.auc_overall)}</td>
                <td>{fmtInt(r.num_substructures)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SimpleBarCard({ title, rows, dataKey, labelKey, name, color, hero }) {
  return (
    <div className="card">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 6, right: 10, bottom: 40, left: -8 }}>
          <CartesianGrid stroke="#232b3b" vertical={false} />
          <XAxis
            dataKey={labelKey}
            tick={{ fill: '#97a3b6', fontSize: 11 }}
            angle={-15}
            textAnchor="end"
            interval={0}
          />
          <YAxis domain={[0, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }} />
          <Tooltip content={<ChartTooltip fmt={fmt3} />} cursor={{ fill: '#ffffff08' }} />
          <Bar dataKey={dataKey} name={name} radius={[4, 4, 0, 0]}>
            {rows.map((r, i) => (
              <Cell
                key={i}
                fill={hero && r[labelKey].includes(hero) ? COLORS.accent : color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ImbalanceCard({ imb }) {
  const rows = imbalanceRows(imb)
  const ratios = imb.series.map((s) => s.ratio)
  return (
    <div className="card">
      <div className="chart-title">
        Imbalanced injection: AUC vs. α for different topology:attribute ratios
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={rows} margin={{ top: 6, right: 16, bottom: 18, left: -6 }}>
          <CartesianGrid stroke="#232b3b" />
          <XAxis
            dataKey="alpha"
            type="number"
            domain={[0, 1]}
            tick={{ fill: '#97a3b6', fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: 'α (attribute weight)', position: 'insideBottom', offset: -8, fill: '#6b7689', fontSize: 11 }}
          />
          <YAxis domain={[0.5, 1]} tick={{ fill: '#97a3b6', fontSize: 11 }}
            label={{ value: 'AUC', angle: -90, position: 'insideLeft', fill: '#6b7689', fontSize: 11 }} />
          <Tooltip content={<ChartTooltip fmt={fmt3} labelName="α" />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {ratios.map((r, i) => (
            <Line
              key={r}
              type="monotone"
              dataKey={r}
              name={`ratio ${r}`}
              stroke={RATIO_COLORS[i % RATIO_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: 8 }}>
        topology:attribute anomaly ratio. As attribute anomalies dominate (e.g. 1:9), the
        best α shifts toward 1; fusion (intermediate α) is strongest in the balanced cases.
      </p>
    </div>
  )
}

export default function Ablations({ data }) {
  const abl = data.ablations
  if (!abl) {
    return (
      <div className="section" id="ablations">
        <div className="section-head">
          <h2>Ablation Studies</h2>
        </div>
        <div className="card muted">
          No ablation results in this dataset's payload. Regenerate with{' '}
          <code>python generate_results.py</code> (ablations are on by default).
        </div>
      </div>
    )
  }

  return (
    <div className="section" id="ablations">
      <div className="section-head">
        <h2>Ablation Studies</h2>
        <p>
          Reproductions of the paper's ablations: which substructure detector to use
          (Table VI), the topology score components (Table VII), the score-fusion strategy
          (Table VIII), and behaviour under imbalanced anomaly ratios (Table X / Fig. 8).
        </p>
      </div>

      <SubstructureCard rows={abl.substructure_detector} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <SimpleBarCard
          title="Topology score components (topology AUC)"
          rows={abl.score_component}
          dataKey="auc_topology"
          labelKey="variant"
          name="AUC (topology)"
          color="#3a4a6b"
          hero="ARISE"
        />
        <SimpleBarCard
          title="Score-fusion strategy (overall AUC)"
          rows={abl.fusion_strategy}
          dataKey="auc"
          labelKey="strategy"
          name="AUC"
          color="#3a5b4b"
          hero="Weight"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <ImbalanceCard imb={abl.imbalance_alpha} />
      </div>
    </div>
  )
}
