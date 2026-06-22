"""Ablation studies reproduced from the ARISE paper.

* Substructure-detector ablation (Table VI): k-core region proposal vs. classic
  community-detection algorithms.
* Score-component ablation (Table VII): averaging on/off in Eq. 2, node-count vs.
  node-pair-count weighting in Eq. 9.
* Fusion-strategy ablation (Table VIII): max / sum / weighted fusion.
* Imbalanced-ratio alpha analysis (Table X / Fig. 8): vary the topology:attribute
  anomaly ratio, retrain, and sweep alpha.
"""

from __future__ import annotations

import networkx as nx
import numpy as np
import scipy.sparse as sp

from .data import AttributedGraph, inject_anomalies
from .metrics import auc as auc_fn
from .pipeline import (
    attribute_anomaly_scores,
    node_embeddings,
    normalize_features,
    train_contrastive,
)
from .topology import (
    _cosine_avg_similarity,
    _size_weight,
    topology_anomaly_scores,
)


def _minmax(x: np.ndarray) -> np.ndarray:
    lo, hi = float(x.min()), float(x.max())
    if hi - lo < 1e-12:
        return np.zeros_like(x)
    return (x - lo) / (hi - lo)


# ---------------------------------------------------------------------------
# (2) Substructure-detector ablation  (Table VI)
# ---------------------------------------------------------------------------


def _score_from_substructures(adj: sp.csr_matrix, emb: np.ndarray,
                              substructures: list[np.ndarray]) -> np.ndarray:
    """Single-round topology score for an arbitrary substructure partition."""
    n = adj.shape[0]
    scores = np.zeros(n, dtype=np.float64)
    for sub in substructures:
        if len(sub) < 2:
            continue
        d_j = _cosine_avg_similarity(emb[sub])
        scores[sub] = _size_weight(len(sub), "nodes") * (1.0 / d_j)
    return scores


def _community_substructures(adj: sp.csr_matrix, method: str) -> list[np.ndarray]:
    """Detect substructures with a classic community-detection algorithm."""
    g = nx.from_scipy_sparse_array(adj)
    g.remove_edges_from(nx.selfloop_edges(g))
    if method == "greedy_modularity":
        comms = nx.community.greedy_modularity_communities(g)
    elif method == "label_propagation":
        comms = nx.community.label_propagation_communities(g)
    elif method == "kernighan_lin":
        a, b = nx.community.kernighan_lin_bisection(g, seed=0)
        comms = [a, b]
    else:
        raise ValueError(method)
    return [np.array(sorted(c), dtype=np.int64) for c in comms if len(c) >= 2]


def substructure_detector_ablation(graph: AttributedGraph, emb: np.ndarray) -> list[dict]:
    """Compare k-core (ARISE) against community-detection region proposals."""
    labels = graph.labels
    topo = graph.topo_mask.astype(int)
    out = []

    # k-core (the ARISE method, multi-round)
    score_kcore, info = topology_anomaly_scores(graph.adj, emb)
    n_subs = sum(r["num_substructures"] for r in info["rounds"])
    out.append({
        "method": "k-core (ARISE)",
        "auc_overall": round(auc_fn(labels, _minmax(score_kcore)), 4),
        "auc_topology": round(auc_fn(topo, _minmax(score_kcore)), 4),
        "num_substructures": int(n_subs),
    })

    for method, label in [
        ("greedy_modularity", "Greedy Modularity"),
        ("label_propagation", "Label Propagation"),
        ("kernighan_lin", "Kernighan-Lin"),
    ]:
        try:
            subs = _community_substructures(graph.adj, method)
            score = _score_from_substructures(graph.adj, emb, subs)
            out.append({
                "method": label,
                "auc_overall": round(auc_fn(labels, _minmax(score)), 4),
                "auc_topology": round(auc_fn(topo, _minmax(score)), 4),
                "num_substructures": int(len(subs)),
            })
        except Exception as exc:  # noqa: BLE001
            out.append({"method": label, "error": str(exc)})
    return out


# ---------------------------------------------------------------------------
# (3a) Score-component ablation  (Table VII)
# ---------------------------------------------------------------------------


def score_component_ablation(graph: AttributedGraph, emb: np.ndarray) -> list[dict]:
    """Effect of the averaging term (Eq. 2) and size weighting (Eq. 9)."""
    topo = graph.topo_mask.astype(int)
    variants = [
        ("Avg sim + node count (ARISE)", dict(similarity_average=True, size_weight="nodes")),
        ("W/o averaging (sum sim)", dict(similarity_average=False, size_weight="nodes")),
        ("Node-pair count weight", dict(similarity_average=True, size_weight="pairs")),
    ]
    out = []
    for label, kw in variants:
        score, _ = topology_anomaly_scores(graph.adj, emb, **kw)
        out.append({
            "variant": label,
            "auc_topology": round(auc_fn(topo, _minmax(score)), 4),
            "auc_overall": round(auc_fn(graph.labels, _minmax(score)), 4),
        })
    return out


# ---------------------------------------------------------------------------
# (3b) Fusion-strategy ablation  (Table VIII)
# ---------------------------------------------------------------------------


def fusion_strategy_ablation(labels: np.ndarray, norm_t: np.ndarray,
                             norm_a: np.ndarray, alpha: float = 0.8) -> list[dict]:
    """max / sum / weighted fusion of topology and attribute scores."""
    strategies = {
        "Max": np.maximum(norm_t, norm_a),
        "Sum": norm_t + norm_a,
        f"Weight (alpha={alpha})": (1 - alpha) * norm_t + alpha * norm_a,
    }
    return [{"strategy": name, "auc": round(auc_fn(labels, s), 4)}
            for name, s in strategies.items()]


# ---------------------------------------------------------------------------
# (4) Imbalanced-ratio alpha analysis  (Table X / Fig. 8)
# ---------------------------------------------------------------------------


def imbalance_alpha_analysis(
    clean_graph: AttributedGraph,
    total_anomalies: int = 150,
    clique_size: int = 15,
    ratios=((9, 1), (7, 3), (1, 1), (3, 7), (1, 9)),
    epochs: int = 60,
    lr: float = 0.003,
    seed: int = 42,
    verbose: bool = True,
) -> dict:
    """For each topology:attribute ratio, retrain and sweep alpha 0..1 -> AUC."""
    alphas = list(np.round(np.linspace(0, 1, 11), 2))
    series = []
    for (rt, ra) in ratios:
        n_topo = int(round(total_anomalies * rt / (rt + ra)))
        n_cliques = max(1, round(n_topo / clique_size))
        n_topo = n_cliques * clique_size
        n_attr = total_anomalies - n_topo
        if n_attr < 0:
            n_attr = 0
        if verbose:
            print(f"  ratio {rt}:{ra} -> {n_cliques} cliques ({n_topo} topo), {n_attr} attr")

        g = inject_anomalies(clean_graph, num_cliques=n_cliques, clique_size=clique_size,
                             num_attribute=n_attr, k_candidates=50, seed=seed)
        gm = normalize_features(g)
        model, _ = train_contrastive(gm, epochs=epochs, lr=lr, weight_decay=1e-5,
                                     seed=0, verbose=False)
        score_a = attribute_anomaly_scores(gm, model, rounds=4, seed=0)
        emb = node_embeddings(gm, model)
        score_t, _ = topology_anomaly_scores(g.adj, emb)
        norm_t, norm_a = _minmax(score_t), _minmax(score_a)

        aucs = [round(auc_fn(g.labels, (1 - a) * norm_t + a * norm_a), 4) for a in alphas]
        series.append({"ratio": f"{rt}:{ra}", "auc_by_alpha": aucs})
    return {"alphas": [float(a) for a in alphas], "series": series}
