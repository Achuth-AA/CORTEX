import { fmt3, fmtInt } from '../lib/format'

function TypeBadge({ type }) {
  const cls =
    type === 'topology'
      ? 'badge badge-topology'
      : type === 'attribute'
        ? 'badge badge-attribute'
        : 'badge badge-normal'
  return <span className={cls}>{type}</span>
}

export default function TopNodes({ data }) {
  const rows = data.top_nodes || []

  return (
    <div className="section" id="topnodes">
      <div className="section-head">
        <h2>Top Flagged Nodes</h2>
        <p>
          Nodes with the highest fused anomaly scores, with their topology and attribute
          sub-scores and ground-truth labels.
        </p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Final</th>
                <th>Topology</th>
                <th>Attribute</th>
                <th>True type</th>
                <th>Anomaly?</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.node}>
                  <td>{fmtInt(r.node)}</td>
                  <td>{fmt3(r.final)}</td>
                  <td>{fmt3(r.topology)}</td>
                  <td>{fmt3(r.attribute)}</td>
                  <td>
                    <TypeBadge type={r.true_type} />
                  </td>
                  <td>
                    <span className={r.is_anomaly ? 'badge badge-yes' : 'badge badge-no'}>
                      {r.is_anomaly ? 'yes' : 'no'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
