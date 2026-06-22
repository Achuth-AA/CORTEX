"""Lightweight baselines for context in the comparison dashboard.

These are simple, CPU-friendly stand-ins (not the original authors' code) so the
dashboard can show ARISE against alternative paradigms:

* LOF        -- density-based local outlier factor on node attributes only.
* AttrResidual -- reconstruct each node's attributes from its neighbourhood mean
  and use the residual as the anomaly score (a Radar/ANOMALOUS-style idea).
* RandomScore -- the "random guessing" reference line from the ROC plots.
"""

from __future__ import annotations

import numpy as np
from sklearn.neighbors import LocalOutlierFactor

from .data import AttributedGraph
from .metrics import evaluate


def lof_scores(graph: AttributedGraph, n_neighbors: int = 20) -> np.ndarray:
    lof = LocalOutlierFactor(n_neighbors=min(n_neighbors, graph.num_nodes - 1))
    lof.fit(graph.features)
    return -lof.negative_outlier_factor_  # higher = more anomalous


def attr_residual_scores(graph: AttributedGraph) -> np.ndarray:
    """Score = ||x_i - mean(x_neighbours)||  (attribute vs. neighbourhood)."""
    adj = graph.adj
    deg = np.asarray(adj.sum(1)).ravel()
    deg[deg == 0] = 1
    neigh_mean = (adj @ graph.features) / deg[:, None]
    return np.linalg.norm(graph.features - neigh_mean, axis=1)


def random_scores(graph: AttributedGraph, seed: int = 0) -> np.ndarray:
    return np.random.default_rng(seed).random(graph.num_nodes)


def run_baselines(graph: AttributedGraph) -> dict:
    out = {}
    for name, fn in [
        ("LOF", lof_scores),
        ("AttrResidual", attr_residual_scores),
        ("Random", random_scores),
    ]:
        scores = fn(graph)
        out[name] = {"scores": scores.tolist(), "metrics": evaluate(graph.labels, scores)}
    return out
