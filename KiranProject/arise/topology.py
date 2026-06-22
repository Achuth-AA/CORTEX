"""ARISE topology-anomaly module (paper Section IV-B1 & IV-B3a).

A group of topology anomalies forms an unusually dense substructure.  We:

1. **Region proposal** -- for k = avg_degree .. k_max, take the k-core of the
   graph and split it into connected components (substructures C_j).
2. **Anomaly degree** -- inside each substructure compute the *average node-pair
   cosine similarity* d_j of node embeddings (Eq. 1 & 2).  Lower similarity =>
   more anomalous, so the per-node topology estimate is t_i = 1/d_j (Eq. 8).
3. **Multi-size scoring** -- weight by substructure size |C_j| and average over
   rounds (Eq. 9).  Nodes never inside any substructure get score 0.
"""

from __future__ import annotations

import networkx as nx
import numpy as np
import scipy.sparse as sp


def _cosine_avg_similarity(emb: np.ndarray, average: bool = True) -> float:
    """(Averaged) pairwise cosine similarity among rows of ``emb`` (Eq. 1 & 2).

    ``average=False`` drops the averaging term in Eq. 2 (the "w/o Averaging"
    ablation, Table VII): the summed pairwise similarity is used instead.
    """
    if emb.shape[0] < 2:
        return 1.0
    norm = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-12)
    sim = norm @ norm.T
    n = sim.shape[0]
    # sum of the off-diagonal upper triangle (all distinct node pairs)
    total = (sim.sum() - np.trace(sim)) / 2.0
    if average:
        num_pairs = n * (n - 1) / 2.0
        val = total / num_pairs
    else:
        val = total
    # shift so the reciprocal in Eq. 8 stays positive
    return float(val + 1.0 + 1e-6)


def detect_substructures(adj: sp.csr_matrix, k: int, min_size: int = 2) -> list[np.ndarray]:
    """k-core region proposal: connected components of the k-core (Eq. region proposal)."""
    g = nx.from_scipy_sparse_array(adj)
    g.remove_edges_from(nx.selfloop_edges(g))
    try:
        core = nx.k_core(g, k=k)
    except nx.NetworkXError:
        return []
    subs = []
    for comp in nx.connected_components(core):
        if len(comp) >= min_size:
            subs.append(np.array(sorted(comp), dtype=np.int64))
    return subs


def _size_weight(size: int, mode: str) -> float:
    """Substructure size weight in Eq. 9: number of nodes vs. number of node pairs."""
    if mode == "pairs":
        return size * (size - 1) / 2.0
    return float(size)  # "nodes" (paper default)


def topology_anomaly_scores(
    adj: sp.csr_matrix,
    embeddings: np.ndarray,
    k_start: int | None = None,
    k_max: int | None = None,
    min_size: int = 2,
    return_rounds: bool = False,
    similarity_average: bool = True,
    size_weight: str = "nodes",
):
    """Compute the final topology anomaly score for every node (Eq. 9).

    Multi-round detection with increasing k, starting at the average degree.
    Returns (scores, info) where info documents each round for visualisation.
    """
    n = adj.shape[0]
    avg_deg = int(max(2, round(adj.sum() / n)))
    k_start = k_start or avg_deg
    if k_max is None:
        k_max = int(np.max(np.asarray(adj.sum(1)).ravel()))  # max degree

    round_scores = []     # per-round per-node weighted estimate |C_j| * t_i
    rounds_info = []

    k = k_start
    while k <= k_max:
        subs = detect_substructures(adj, k, min_size=min_size)
        if not subs:
            break
        score_r = np.zeros(n, dtype=np.float64)
        sub_records = []
        for sub in subs:
            d_j = _cosine_avg_similarity(embeddings[sub], average=similarity_average)  # Eq. 1 & 2
            t_i = 1.0 / d_j                                 # Eq. 8
            score_r[sub] = _size_weight(len(sub), size_weight) * t_i  # Eq. 9 term (multi-size)
            sub_records.append({
                "size": int(len(sub)),
                "avg_similarity": round(d_j, 4),
                "anomaly_estimate": round(t_i, 4),
            })
        round_scores.append(score_r)
        rounds_info.append({
            "k": int(k),
            "num_substructures": len(subs),
            "substructures": sub_records,
        })
        k += 1

    if round_scores:
        scores = np.mean(np.stack(round_scores, axis=0), axis=0)  # average over rounds (Eq. 9)
    else:
        scores = np.zeros(n, dtype=np.float64)

    info = {
        "k_start": int(k_start),
        "k_max": int(k_max),
        "num_rounds": len(round_scores),
        "rounds": rounds_info,
    }
    if return_rounds:
        info["round_scores"] = round_scores
    return scores, info
