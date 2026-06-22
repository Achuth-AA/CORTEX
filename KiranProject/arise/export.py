"""Build a self-contained JSON payload for the React dashboard.

Consolidates everything a front-end needs: metrics, method comparison, ROC/PR
curves, Precision@K curves, score distributions, training loss, an alpha sweep,
2-D node embeddings, and the substructure breakdown.
"""

from __future__ import annotations

import numpy as np
from sklearn.decomposition import PCA
from sklearn.metrics import precision_recall_curve, roc_curve

from .baselines import run_baselines
from .data import AttributedGraph
from .metrics import auc as auc_fn
from .metrics import evaluate, precision_at_k
from .pipeline import node_embeddings, normalize_features


def _downsample_curve(xs, ys, n=120):
    xs, ys = np.asarray(xs), np.asarray(ys)
    if len(xs) <= n:
        idx = np.arange(len(xs))
    else:
        idx = np.linspace(0, len(xs) - 1, n).astype(int)
    return [{"x": round(float(xs[i]), 4), "y": round(float(ys[i]), 4)} for i in idx]


def _roc(labels, scores):
    fpr, tpr, _ = roc_curve(labels, scores)
    return _downsample_curve(fpr, tpr)


def _pr(labels, scores):
    precision, recall, _ = precision_recall_curve(labels, scores)
    return _downsample_curve(recall, precision)


def _histogram(scores, mask, bins=25):
    scores = np.asarray(scores)
    edges = np.linspace(float(scores.min()), float(scores.max()), bins + 1)
    centers = (edges[:-1] + edges[1:]) / 2
    normal, _ = np.histogram(scores[~mask], bins=edges)
    anom, _ = np.histogram(scores[mask], bins=edges)
    return {
        "bins": [round(float(c), 4) for c in centers],
        "normal": normal.tolist(),
        "anomaly": anom.tolist(),
    }


def build_dashboard_payload(graph: AttributedGraph, result: dict, model=None) -> dict:
    labels = np.asarray(result["labels"])
    topo_mask = np.asarray(result["topo_mask"], dtype=bool)
    attr_mask = np.asarray(result["attr_mask"], dtype=bool)
    final = np.asarray(result["scores"]["final"])
    norm_t = np.asarray(result["scores"]["topology_norm"])
    norm_a = np.asarray(result["scores"]["attribute_norm"])

    # --- baselines for comparison ---
    baselines = run_baselines(graph)

    comparison = [
        {"method": "ARISE (full)", **result["metrics"]["overall"]},
        {"method": "ARISE (attr-only)", **result["metrics"]["attribute_only"]},
        {"method": "ARISE (topo-only)", **result["metrics"]["topology_only"]},
    ]
    for name, b in baselines.items():
        comparison.append({"method": name, **b["metrics"]})

    # --- ROC / PR curves for a few methods ---
    roc = {"ARISE (full)": _roc(labels, final)}
    pr = {"ARISE (full)": _pr(labels, final)}
    for name, b in baselines.items():
        sc = np.asarray(b["scores"])
        roc[name] = _roc(labels, sc)
        pr[name] = _pr(labels, sc)

    # --- Precision@K curves (total vs topology, paper Fig. 4) ---
    n = graph.num_nodes
    ks = [k for k in range(50, min(n, 600) + 1, 50)]
    pk_total = [round(precision_at_k(labels, final, k), 4) for k in ks]
    pk_topo = [round(precision_at_k(topo_mask.astype(int), norm_t, k), 4) for k in ks]
    pk_attr = [round(precision_at_k(attr_mask.astype(int), norm_a, k), 4) for k in ks]

    # --- alpha sweep (paper Fig. 6), recompute fusion cheaply ---
    alpha_sweep = []
    for a in np.round(np.linspace(0, 1, 11), 2):
        fused = (1 - a) * norm_t + a * norm_a
        alpha_sweep.append({"alpha": float(a), "auc": round(auc_fn(labels, fused), 4)})

    # --- 2-D embeddings (PCA) coloured by anomaly type ---
    emb = node_embeddings(normalize_features(graph), model) if model is not None else None
    if emb is None:
        emb = graph.features
    coords = PCA(n_components=2, random_state=0).fit_transform(emb)
    node_type = np.where(topo_mask, "topology", np.where(attr_mask, "attribute", "normal"))
    embedding_2d = [
        {"x": round(float(coords[i, 0]), 3), "y": round(float(coords[i, 1]), 3),
         "type": node_type[i], "score": round(float(final[i]), 4)}
        for i in range(n)
    ]

    # --- top flagged nodes table ---
    order = np.argsort(-final)[:25]
    top_nodes = [
        {"node": int(i), "final": round(float(final[i]), 4),
         "topology": round(float(norm_t[i]), 4), "attribute": round(float(norm_a[i]), 4),
         "true_type": node_type[i], "is_anomaly": bool(labels[i])}
        for i in order
    ]

    # --- substructure breakdown (cap records for payload size) ---
    rounds = []
    for r in result["topology_info"]["rounds"]:
        subs = sorted(r["substructures"], key=lambda s: -s["anomaly_estimate"])[:30]
        rounds.append({"k": r["k"], "num_substructures": r["num_substructures"], "substructures": subs})

    return {
        "dataset": result["dataset"],
        "alpha": result["alpha"],
        "elapsed_sec": result["elapsed_sec"],
        "metrics": result["metrics"],
        "comparison": comparison,
        "roc": roc,
        "pr": pr,
        "precision_at_k_curve": {
            "ks": ks, "total": pk_total, "topology": pk_topo, "attribute": pk_attr,
        },
        "alpha_sweep": alpha_sweep,
        "loss_history": result["loss_history"],
        "score_distributions": {
            "final": _histogram(final, labels.astype(bool)),
            "topology": _histogram(norm_t, topo_mask),
            "attribute": _histogram(norm_a, attr_mask),
        },
        "embedding_2d": embedding_2d,
        "top_nodes": top_nodes,
        "substructure_rounds": rounds,
    }
