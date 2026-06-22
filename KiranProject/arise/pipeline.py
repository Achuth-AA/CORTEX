"""End-to-end ARISE pipeline (paper Algorithm 1).

Trains the contrastive attribute module, computes attribute anomaly scores
(Eq. 10-11), computes topology anomaly scores from substructure similarity
(Eq. 8-9), then fuses them (Eq. 12).
"""

from __future__ import annotations

import dataclasses
import time

import numpy as np
import scipy.sparse as sp
import torch
import torch.nn.functional as F

from .data import AttributedGraph
from .metrics import evaluate
from .model import ARISEContrastive, _normalized_subgraph_adj, build_subgraphs
from .topology import topology_anomaly_scores


# ---------------------------------------------------------------------------
# tensor preparation
# ---------------------------------------------------------------------------


def normalize_features(graph: AttributedGraph) -> AttributedGraph:
    """Return a copy with L1 row-normalised features (standard GCN/CoLA preproc).

    Bag-of-words attributes (e.g. Cora) are poorly conditioned for a GCN unless
    each row is normalised; this markedly strengthens the attribute module.
    """
    feats = graph.features.astype(np.float32)
    row_sum = feats.sum(axis=1, keepdims=True)
    row_sum[row_sum == 0] = 1.0
    return dataclasses.replace(graph, features=feats / row_sum)


def _prepare_subgraph_tensors(adj: sp.csr_matrix, features: np.ndarray,
                              subgraphs: np.ndarray, device: torch.device):
    """Build (n,K,K) normalised adjacency and (n,K,d) masked-feature tensors."""
    n, K = subgraphs.shape
    adj_norm = np.zeros((n, K, K), dtype=np.float32)
    sub_feats = np.zeros((n, K, features.shape[1]), dtype=np.float32)
    for v in range(n):
        nodes = subgraphs[v]
        adj_norm[v] = _normalized_subgraph_adj(adj, nodes)
        f = features[nodes].copy()
        f[0] = 0.0  # mask the anchor row (Section IV-B2a)
        sub_feats[v] = f
    return (torch.from_numpy(adj_norm).to(device),
            torch.from_numpy(sub_feats).to(device))


# ---------------------------------------------------------------------------
# training (Algorithm 1, attribute anomaly detection loop)
# ---------------------------------------------------------------------------


def train_contrastive(
    graph: AttributedGraph,
    hidden_dim: int = 64,
    epochs: int = 100,
    lr: float = 1e-3,
    weight_decay: float = 0.0,
    batch_size: int = 300,
    subgraph_size: int = 4,
    seed: int = 0,
    device: str = "cpu",
    verbose: bool = True,
):
    """Train the GCN contrastive network and return (model, history)."""
    torch.manual_seed(seed)
    torch.set_num_threads(1)  # reproducible results (CPU reductions are order-sensitive)
    dev = torch.device(device)

    subgraphs = build_subgraphs(graph.adj, subgraph_size=subgraph_size, seed=seed)
    adj_norm, sub_feats = _prepare_subgraph_tensors(graph.adj, graph.features, subgraphs, dev)
    node_feats = torch.from_numpy(graph.features).to(dev)
    n = graph.num_nodes

    model = ARISEContrastive(graph.num_features, hidden_dim).to(dev)
    opt = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    bce = torch.nn.BCELoss()

    history = []
    rng = np.random.default_rng(seed)
    for epoch in range(1, epochs + 1):
        model.train()
        order = rng.permutation(n)
        neg = rng.permutation(n)  # negative subgraph assignment
        total = 0.0
        for start in range(0, n, batch_size):
            idx = order[start : start + batch_size]
            nidx = neg[start : start + batch_size]
            anchors = torch.from_numpy(idx).to(dev)
            negs = torch.from_numpy(nidx).to(dev)

            s_pos = model(adj_norm[anchors], sub_feats[anchors], node_feats[anchors])
            s_neg = model(adj_norm[negs], sub_feats[negs], node_feats[anchors])
            loss = bce(s_pos, torch.ones_like(s_pos)) + bce(s_neg, torch.zeros_like(s_neg))

            opt.zero_grad()
            loss.backward()
            opt.step()
            total += loss.item() * len(idx)
        avg = total / n
        history.append(avg)
        if verbose and (epoch % max(1, epochs // 10) == 0 or epoch == 1):
            print(f"  epoch {epoch:4d}/{epochs}  loss={avg:.4f}")
    return model, history


# ---------------------------------------------------------------------------
# attribute scoring (Eq. 10-11)
# ---------------------------------------------------------------------------


@torch.no_grad()
def attribute_anomaly_scores(
    graph: AttributedGraph,
    model: ARISEContrastive,
    rounds: int = 4,
    subgraph_size: int = 4,
    seed: int = 0,
    device: str = "cpu",
):
    """Multi-round attribute anomaly score a_i = mean(s_neg - s_pos) (Eq. 10-11)."""
    dev = torch.device(device)
    model.eval()
    node_feats = torch.from_numpy(graph.features).to(dev)
    n = graph.num_nodes
    acc = np.zeros(n, dtype=np.float64)

    for r in range(rounds):
        subgraphs = build_subgraphs(graph.adj, subgraph_size=subgraph_size, seed=seed + 100 + r)
        adj_norm, sub_feats = _prepare_subgraph_tensors(graph.adj, graph.features, subgraphs, dev)
        rng = np.random.default_rng(seed + 200 + r)
        neg = torch.from_numpy(rng.permutation(n)).to(dev)
        all_idx = torch.arange(n, device=dev)

        s_pos = model(adj_norm, sub_feats, node_feats)              # positive pairs
        s_neg = model(adj_norm[neg], sub_feats[neg], node_feats)    # negative pairs
        acc += (s_neg - s_pos).cpu().numpy()                        # Eq. 10
    return acc / rounds                                            # Eq. 11


@torch.no_grad()
def node_embeddings(graph: AttributedGraph, model: ARISEContrastive, device: str = "cpu") -> np.ndarray:
    dev = torch.device(device)
    feats = torch.from_numpy(graph.features).to(dev)
    return model.all_node_embeddings(feats).cpu().numpy()


# ---------------------------------------------------------------------------
# fusion + full run (Eq. 12, Algorithm 1)
# ---------------------------------------------------------------------------


def _minmax(x: np.ndarray) -> np.ndarray:
    lo, hi = x.min(), x.max()
    if hi - lo < 1e-12:
        return np.zeros_like(x)
    return (x - lo) / (hi - lo)


def run_arise(
    graph: AttributedGraph,
    alpha: float = 0.8,
    hidden_dim: int = 64,
    epochs: int = 100,
    lr: float = 1e-3,
    weight_decay: float = 1e-5,
    batch_size: int = 300,
    subgraph_size: int = 4,
    attr_rounds: int = 4,
    seed: int = 0,
    device: str = "cpu",
    verbose: bool = True,
    return_model: bool = False,
    normalize: bool = True,
) -> dict:
    """Run the complete ARISE algorithm and evaluate it.

    Returns a result dict with raw + normalised scores, metrics, and the
    topology-module introspection info (for the dashboard).  If ``return_model``
    is set, returns ``(result, model)``.
    """
    t0 = time.time()
    # Feature preprocessing for the neural modules; labels/masks come from `graph`.
    g_model = normalize_features(graph) if normalize else graph

    if verbose:
        print(f"[ARISE] training contrastive module on {graph.name} ...")
    model, history = train_contrastive(
        g_model, hidden_dim=hidden_dim, epochs=epochs, lr=lr, weight_decay=weight_decay,
        batch_size=batch_size, subgraph_size=subgraph_size, seed=seed, device=device,
        verbose=verbose,
    )

    if verbose:
        print("[ARISE] computing attribute anomaly scores ...")
    score_a = attribute_anomaly_scores(g_model, model, rounds=attr_rounds,
                                       subgraph_size=subgraph_size, seed=seed, device=device)

    if verbose:
        print("[ARISE] computing topology anomaly scores (substructure) ...")
    emb = node_embeddings(g_model, model, device=device)
    score_t, topo_info = topology_anomaly_scores(graph.adj, emb)

    # fusion (Eq. 12)
    norm_t, norm_a = _minmax(score_t), _minmax(score_a)
    final = (1 - alpha) * norm_t + alpha * norm_a

    elapsed = time.time() - t0
    result = {
        "dataset": graph.summary(),
        "alpha": alpha,
        "elapsed_sec": round(elapsed, 2),
        "loss_history": [round(float(x), 5) for x in history],
        "scores": {
            "topology_raw": score_t.tolist(),
            "attribute_raw": score_a.tolist(),
            "topology_norm": norm_t.tolist(),
            "attribute_norm": norm_a.tolist(),
            "final": final.tolist(),
        },
        "labels": graph.labels.tolist(),
        "topo_mask": graph.topo_mask.tolist(),
        "attr_mask": graph.attr_mask.tolist(),
        "topology_info": topo_info,
        "metrics": {
            "overall": evaluate(graph.labels, final),
            "topology_only": evaluate(graph.labels, norm_t),
            "attribute_only": evaluate(graph.labels, norm_a),
            "topology_on_topo_anomalies": evaluate(graph.topo_mask.astype(int), norm_t),
            "attribute_on_attr_anomalies": evaluate(graph.attr_mask.astype(int), norm_a),
        },
    }
    if verbose:
        m = result["metrics"]["overall"]
        print(f"[ARISE] done in {elapsed:.1f}s  AUC={m['auc']}  AUPRC={m['auprc']}")
    if return_model:
        return result, model
    return result
