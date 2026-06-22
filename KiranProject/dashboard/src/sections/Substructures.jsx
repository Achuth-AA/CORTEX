import { useState, useEffect } from 'react'
import { fmt3, fmtInt } from '../lib/format'

export default function Substructures({ data }) {
  const rounds = data.substructure_rounds || []
  const [idx, setIdx] = useState(0)

  // reset selection when dataset changes
  useEffect(() => {
    setIdx(0)
  }, [data])

  if (rounds.length === 0) {
    return (
      <div className="section" id="substructures">
        <div className="section-head">
          <h2>Substructure Explorer</h2>
        </div>
        <div className="card muted">No substructure rounds available.</div>
      </div>
    )
  }

  const safeIdx = Math.min(idx, rounds.length - 1)
  const round = rounds[safeIdx]

  return (
    <div className="section" id="substructures">
      <div className="section-head">
        <h2>Substructure Explorer</h2>
        <p>
          Topology detection iteratively extracts k-core substructures. Pick a round (k
          value) to inspect the discovered substructures and their intra-group similarity.
        </p>
      </div>

      <div className="control-row">
        <span className="muted">Round (k):</span>
        <select value={safeIdx} onChange={(e) => setIdx(Number(e.target.value))}>
          {rounds.map((r, i) => (
            <option key={i} value={i}>
              k = {r.k}
            </option>
          ))}
        </select>
        <span className="pill">k = {round.k}</span>
        <span className="pill">{fmtInt(round.num_substructures)} substructures</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Size</th>
                <th>Avg similarity</th>
                <th>Anomaly estimate</th>
              </tr>
            </thead>
            <tbody>
              {round.substructures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No substructures in this round.
                  </td>
                </tr>
              ) : (
                round.substructures.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{fmtInt(s.size)}</td>
                    <td>{fmt3(s.avg_similarity)}</td>
                    <td>{fmt3(s.anomaly_estimate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
