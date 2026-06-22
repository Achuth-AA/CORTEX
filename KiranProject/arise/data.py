"""Data loading and anomaly injection for ARISE.

Implements the two anomaly-injection schemes described in the paper
(Section V-A2):

* Topology anomalies  -- randomly pick ``clique_size`` nodes and make them
  fully connected; repeat ``num_cliques`` times.  (Ding et al. 2019)
* Attribute anomalies -- for a target node, sample ``k_candidates`` random
  nodes and overwrite the target's attributes with those of the candidate that
  is *furthest* away in Euclidean space.  (Song et al. 2007)

A real benchmark (Cora) is downloaded and parsed from its raw text files; a
fully synthetic generator is provided as an offline fallback so the notebooks
always run.
"""

from __future__ import annotations

import io
import os
import tarfile
import urllib.request
from dataclasses import dataclass

import numpy as np
import scipy.sparse as sp

# ---------------------------------------------------------------------------
# Container
# ---------------------------------------------------------------------------


@dataclass
class AttributedGraph:
    """A clean attributed network plus injected-anomaly bookkeeping."""

    adj: sp.csr_matrix            # (n, n) binary adjacency, symmetric, no self loops
    features: np.ndarray          # (n, d) node attribute matrix
    labels: np.ndarray            # (n,) anomaly labels (1 = anomaly, 0 = normal)
    topo_mask: np.ndarray         # (n,) bool, True for topology anomalies
    attr_mask: np.ndarray         # (n,) bool, True for attribute anomalies
    name: str = "graph"

    @property
    def num_nodes(self) -> int:
        return self.adj.shape[0]

    @property
    def num_edges(self) -> int:
        return int(self.adj.nnz // 2)

    @property
    def num_features(self) -> int:
        return self.features.shape[1]

    @property
    def avg_degree(self) -> float:
        return float(self.adj.sum() / self.num_nodes)

    def summary(self) -> dict:
        return {
            "name": self.name,
            "num_nodes": self.num_nodes,
            "num_edges": self.num_edges,
            "num_features": self.num_features,
            "avg_degree": round(self.avg_degree, 3),
            "num_anomalies": int(self.labels.sum()),
            "num_topology_anomalies": int(self.topo_mask.sum()),
            "num_attribute_anomalies": int(self.attr_mask.sum()),
        }


# ---------------------------------------------------------------------------
# Real dataset: Cora (raw LINQS text format)
# ---------------------------------------------------------------------------

_CORA_URLS = [
    "https://linqs-data.soe.ucsc.edu/public/lbc/cora.tgz",
    "https://github.com/FelixDJC/datasets-mirror/raw/main/cora.tgz",  # best-effort mirror
]


def load_cora(data_dir: str = "data") -> AttributedGraph:
    """Download + parse the raw Cora citation network (no anomalies yet)."""
    os.makedirs(data_dir, exist_ok=True)
    tgz_path = os.path.join(data_dir, "cora.tgz")

    if not os.path.exists(tgz_path):
        last_err = None
        for url in _CORA_URLS:
            try:
                urllib.request.urlretrieve(url, tgz_path)  # noqa: S310
                break
            except Exception as exc:  # noqa: BLE001
                last_err = exc
        else:
            raise RuntimeError(f"Could not download Cora: {last_err}")

    with tarfile.open(tgz_path, "r:gz") as tar:
        content = tar.extractfile("cora/cora.content").read().decode()
        cites = tar.extractfile("cora/cora.cites").read().decode()

    # cora.content: <id> <1433 binary features> <class label>
    ids, feats, labels = [], [], []
    for line in content.strip().splitlines():
        parts = line.split("\t")
        ids.append(parts[0])
        feats.append([int(x) for x in parts[1:-1]])
        labels.append(parts[-1])
    id_to_idx = {pid: i for i, pid in enumerate(ids)}
    features = np.asarray(feats, dtype=np.float32)
    n = len(ids)

    # cora.cites: <cited_id> <citing_id>
    rows, cols = [], []
    for line in cites.strip().splitlines():
        a, b = line.split("\t")
        if a in id_to_idx and b in id_to_idx:
            i, j = id_to_idx[a], id_to_idx[b]
            rows += [i, j]
            cols += [j, i]
    adj = sp.coo_matrix((np.ones(len(rows)), (rows, cols)), shape=(n, n))
    adj = _clean_adj(adj)

    return AttributedGraph(
        adj=adj,
        features=features,
        labels=np.zeros(n, dtype=np.int64),
        topo_mask=np.zeros(n, dtype=bool),
        attr_mask=np.zeros(n, dtype=bool),
        name="Cora",
    )


# ---------------------------------------------------------------------------
# Synthetic dataset (offline fallback)
# ---------------------------------------------------------------------------


def load_synthetic(
    num_nodes: int = 1500,
    num_communities: int = 6,
    num_features: int = 100,
    p_in: float = 0.04,
    p_out: float = 0.0015,
    rng: np.random.Generator | None = None,
) -> AttributedGraph:
    """Stochastic block model with community-correlated Gaussian attributes."""
    rng = rng or np.random.default_rng(0)
    comm = rng.integers(0, num_communities, size=num_nodes)

    # Edges via SBM
    rows, cols = [], []
    for i in range(num_nodes):
        for j in range(i + 1, num_nodes):
            p = p_in if comm[i] == comm[j] else p_out
            if rng.random() < p:
                rows += [i, j]
                cols += [j, i]
    adj = sp.coo_matrix((np.ones(len(rows)), (rows, cols)), shape=(num_nodes, num_nodes))
    adj = _clean_adj(adj)

    # Each community has its own attribute centroid
    centroids = rng.normal(0, 1, size=(num_communities, num_features))
    features = centroids[comm] + rng.normal(0, 0.3, size=(num_nodes, num_features))
    features = features.astype(np.float32)

    return AttributedGraph(
        adj=adj,
        features=features,
        labels=np.zeros(num_nodes, dtype=np.int64),
        topo_mask=np.zeros(num_nodes, dtype=bool),
        attr_mask=np.zeros(num_nodes, dtype=bool),
        name="Synthetic-SBM",
    )


def load_dataset(name: str = "cora", data_dir: str = "data") -> AttributedGraph:
    """Load a clean dataset by name, falling back to synthetic on failure."""
    name = name.lower()
    if name in {"cora"}:
        try:
            return load_cora(data_dir)
        except Exception as exc:  # noqa: BLE001
            print(f"[data] Cora download failed ({exc}); using synthetic fallback.")
            return load_synthetic()
    if name in {"synthetic", "sbm"}:
        return load_synthetic()
    raise ValueError(f"Unknown dataset: {name}")


# ---------------------------------------------------------------------------
# Anomaly injection
# ---------------------------------------------------------------------------


def inject_anomalies(
    graph: AttributedGraph,
    num_cliques: int = 5,
    clique_size: int = 15,
    num_attribute: int = 75,
    k_candidates: int = 50,
    seed: int = 42,
) -> AttributedGraph:
    """Inject topology + attribute anomalies (paper Section V-A2).

    Topology: ``num_cliques`` disjoint cliques of ``clique_size`` nodes.
    Attribute: ``num_attribute`` nodes whose features are swapped for the
    most-distant of ``k_candidates`` sampled nodes.
    """
    rng = np.random.default_rng(seed)
    n = graph.num_nodes
    adj = graph.adj.tolil(copy=True)
    features = graph.features.copy()
    topo_mask = np.zeros(n, dtype=bool)
    attr_mask = np.zeros(n, dtype=bool)

    # --- Topology anomalies: fully-connected cliques of dissimilar nodes ---
    available = list(range(n))
    rng.shuffle(available)
    cursor = 0
    for _ in range(num_cliques):
        if cursor + clique_size > len(available):
            break
        clique = available[cursor : cursor + clique_size]
        cursor += clique_size
        for a_i in range(len(clique)):
            for b_i in range(a_i + 1, len(clique)):
                u, v = clique[a_i], clique[b_i]
                adj[u, v] = 1
                adj[v, u] = 1
        topo_mask[clique] = True

    # --- Attribute anomalies: max-Euclidean-distance feature swap ---
    # Don't reuse topology-anomaly nodes as attribute anomalies.
    candidates_pool = np.array([i for i in range(n) if not topo_mask[i]])
    chosen = rng.choice(candidates_pool, size=min(num_attribute, len(candidates_pool)), replace=False)
    for vi in chosen:
        cand = rng.choice(n, size=k_candidates, replace=False)
        dists = np.linalg.norm(features[cand] - features[vi], axis=1)
        vj = cand[int(np.argmax(dists))]
        features[vi] = features[vj]
        attr_mask[vi] = True

    adj = _clean_adj(adj.tocoo())
    labels = (topo_mask | attr_mask).astype(np.int64)

    return AttributedGraph(
        adj=adj,
        features=features,
        labels=labels,
        topo_mask=topo_mask,
        attr_mask=attr_mask,
        name=graph.name,
    )


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def _clean_adj(adj: sp.spmatrix) -> sp.csr_matrix:
    """Symmetrise, binarise, drop self loops, return CSR."""
    adj = adj.tocoo()
    adj = adj + adj.T
    adj.data[:] = 1.0
    adj = adj.tocsr()
    adj.setdiag(0)
    adj.eliminate_zeros()
    adj.data[:] = 1.0
    return adj


# Per-dataset injection settings from the paper (Table II / Section V-A2).
PAPER_INJECTION = {
    # name: (num_cliques p, clique_size m̂, num_attribute, k_candidates n̂)
    "Cora": dict(num_cliques=5, clique_size=15, num_attribute=75, k_candidates=50),
    "CiteSeer": dict(num_cliques=5, clique_size=15, num_attribute=75, k_candidates=50),
    "DBLP": dict(num_cliques=10, clique_size=15, num_attribute=150, k_candidates=50),
    "Citation": dict(num_cliques=15, clique_size=15, num_attribute=225, k_candidates=50),
    "ACM": dict(num_cliques=15, clique_size=15, num_attribute=225, k_candidates=50),
    "PubMed": dict(num_cliques=20, clique_size=15, num_attribute=300, k_candidates=50),
}
