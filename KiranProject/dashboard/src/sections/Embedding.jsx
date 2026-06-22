import { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ZAxis,
} from 'recharts'
import { COLORS, fmt3 } from '../lib/format'

const MAX_NORMAL = 2000

function ScatterTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0].payload
  return (
    <div
      style={{
        background: '#0d1119',
        border: '1px solid #303a50',
        borderRadius: 8,
        padding: '8px 11px',
        fontSize: 12,
      }}
    >
      <div style={{ color: '#cfd7e3', textTransform: 'capitalize' }}>{p.type}</div>
      <div style={{ color: '#97a3b6' }}>score: {fmt3(p.score)}</div>
    </div>
  )
}

export default function Embedding({ data }) {
  const groups = useMemo(() => {
    const pts = data.embedding_2d || []
    const normal = []
    const topology = []
    const attribute = []
    for (const p of pts) {
      if (p.type === 'topology') topology.push(p)
      else if (p.type === 'attribute') attribute.push(p)
      else normal.push(p)
    }
    // Always keep all anomalies; sample only the (potentially huge) normal set.
    let sampledNormal = normal
    let sampled = false
    if (normal.length > MAX_NORMAL) {
      const step = normal.length / MAX_NORMAL
      sampledNormal = []
      for (let i = 0; i < normal.length; i += step) {
        sampledNormal.push(normal[Math.floor(i)])
      }
      sampled = true
    }
    return { normal: sampledNormal, topology, attribute, sampled, total: pts.length }
  }, [data])

  return (
    <div className="section" id="embedding">
      <div className="section-head">
        <h2>Embedding Scatter (PCA)</h2>
        <p>
          2-D PCA projection of the learned node embeddings, colored by ground-truth type.
          {groups.sampled
            ? ' Normal nodes are subsampled for rendering; all anomalies are shown.'
            : ''}
        </p>
      </div>

      <div className="card">
        <ResponsiveContainer width="100%" height={460}>
          <ScatterChart margin={{ top: 10, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="#232b3b" strokeOpacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name="PC1"
              tick={{ fill: '#97a3b6', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="PC2"
              tick={{ fill: '#97a3b6', fontSize: 11 }}
            />
            <ZAxis range={[18, 18]} />
            <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Normal" data={groups.normal} fill={COLORS.normal} fillOpacity={0.45} />
            <Scatter name="Attribute" data={groups.attribute} fill={COLORS.attribute} fillOpacity={0.9} />
            <Scatter name="Topology" data={groups.topology} fill={COLORS.topology} fillOpacity={0.9} />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="legend-row">
          <span>
            <span className="legend-dot" style={{ background: COLORS.normal }} />
            Normal ({groups.normal.length}
            {groups.sampled ? ' shown' : ''})
          </span>
          <span>
            <span className="legend-dot" style={{ background: COLORS.topology }} />
            Topology ({groups.topology.length})
          </span>
          <span>
            <span className="legend-dot" style={{ background: COLORS.attribute }} />
            Attribute ({groups.attribute.length})
          </span>
        </div>
      </div>
    </div>
  )
}
