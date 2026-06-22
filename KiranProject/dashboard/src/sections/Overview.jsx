import { fmt3, fmt2, fmtInt } from '../lib/format'

function Stat({ label, value }) {
  return (
    <div className="card stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

export default function Overview({ data }) {
  const ds = data.dataset
  const overall = data.metrics.overall
  return (
    <div className="section" id="overview">
      <div className="section-head">
        <h2>Overview</h2>
        <p>
          ARISE detects anomalies in attributed graphs by combining two complementary
          signals. <b>Topology anomalies</b> (dense substructures of unrelated nodes) are
          scored via iterative k-core substructure extraction and intra-substructure
          similarity. <b>Attribute anomalies</b> (nodes whose features differ from their
          neighbors) are scored with a GCN trained by contrastive learning. The two scores
          are fused with weight <b>alpha = {fmt2(data.alpha)}</b> into a final anomaly
          score.
        </p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card metric-card stat">
          <span className="stat-label">Overall AUC</span>
          <span className="stat-value">{fmt3(overall.auc)}</span>
          <span className="metric-sub">ROC area under curve</span>
        </div>
        <div className="card metric-card green stat">
          <span className="stat-label">Overall AUPRC</span>
          <span className="stat-value">{fmt3(overall.auprc)}</span>
          <span className="metric-sub">Precision-recall area</span>
        </div>
        <div className="card metric-card warm stat">
          <span className="stat-label">Elapsed time</span>
          <span className="stat-value">{fmt2(data.elapsed_sec)}s</span>
          <span className="metric-sub">End-to-end pipeline</span>
        </div>
      </div>

      <div className="grid grid-auto">
        <Stat label="Nodes" value={fmtInt(ds.num_nodes)} />
        <Stat label="Edges" value={fmtInt(ds.num_edges)} />
        <Stat label="Features" value={fmtInt(ds.num_features)} />
        <Stat label="Avg degree" value={fmt2(ds.avg_degree)} />
        <Stat label="Topology anomalies" value={fmtInt(ds.num_topology_anomalies)} />
        <Stat label="Attribute anomalies" value={fmtInt(ds.num_attribute_anomalies)} />
        <Stat label="Total anomalies" value={fmtInt(ds.num_anomalies)} />
      </div>
    </div>
  )
}
