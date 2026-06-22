"""ARISE attribute-anomaly module: a GCN-based contrastive network.

Follows the node vs. subgraph contrastive scheme of CoLA (paper Section IV-B2):

* For a target node ``v_i`` we sample a local subgraph via random walk.
* A **positive pair** is (v_i, its own subgraph); a **negative pair** is
  (v_i, another node's subgraph).
* Inside a subgraph the anchor row is **masked to 0** (Eq. masking note) so the
  discriminator cannot trivially match a node to itself.
* A 1-layer GCN encodes the subgraph; a mean Readout (Eq. 4) gives ``e_i``; the
  target embedding ``z_i = ReLU(x_i W)`` (Eq. 5, weight shared with the GCN);
  a Bilinear discriminator (Eq. 6) scores the pair; BCE loss (Eq. 7) trains it.

The trained per-node embedding ``z_i`` is reused by the topology module.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
import torch
import torch.nn as nn
import torch.nn.functional as F


# ---------------------------------------------------------------------------
# Subgraph sampling (random walk based, paper Section IV-B2a)
# ---------------------------------------------------------------------------


def build_subgraphs(adj: sp.csr_matrix, subgraph_size: int = 4, seed: int = 0) -> np.ndarray:
    """For every node, sample a fixed-size subgraph via a random walk.

    Returns an (n, subgraph_size) int array of node indices.  The anchor node
    is always placed at index 0.  Isolated / short walks are padded by repeating
    already-visited nodes.
    """
    rng = np.random.default_rng(seed)
    n = adj.shape[0]
    indptr, indices = adj.indptr, adj.indices
    subgraphs = np.zeros((n, subgraph_size), dtype=np.int64)

    for v in range(n):
        walk = [v]
        cur = v
        guard = 0
        while len(set(walk)) < subgraph_size and guard < subgraph_size * 20:
            guard += 1
            nbrs = indices[indptr[cur] : indptr[cur + 1]]
            if len(nbrs) == 0:
                cur = v  # restart from anchor
                continue
            cur = int(nbrs[rng.integers(len(nbrs))])
            if cur not in walk:
                walk.append(cur)
            if rng.random() < 0.1:  # restart probability
                cur = v
        # de-dup preserving order, anchor first
        seen, ordered = set(), []
        for x in walk:
            if x not in seen:
                seen.add(x)
                ordered.append(x)
        while len(ordered) < subgraph_size:
            ordered.append(ordered[len(ordered) % len(ordered)])
        subgraphs[v] = ordered[:subgraph_size]
    return subgraphs


def _normalized_subgraph_adj(adj: sp.csr_matrix, nodes: np.ndarray) -> np.ndarray:
    """Symmetric-normalised dense adjacency (with self loops) for a subgraph."""
    sub = adj[np.ix_(nodes, nodes)].toarray().astype(np.float32)
    sub = sub + np.eye(len(nodes), dtype=np.float32)  # self loops
    deg = sub.sum(1)
    d_inv_sqrt = np.zeros_like(deg)
    np.power(deg, -0.5, where=deg > 0, out=d_inv_sqrt)
    d_inv_sqrt[deg == 0] = 0.0
    return (d_inv_sqrt[:, None] * sub) * d_inv_sqrt[None, :]


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------


class ARISEContrastive(nn.Module):
    """1-layer GCN encoder + Bilinear discriminator."""

    def __init__(self, in_dim: int, hidden_dim: int = 64):
        super().__init__()
        self.weight = nn.Linear(in_dim, hidden_dim, bias=False)   # shared W (Eq. 3 & 5)
        self.bilinear = nn.Bilinear(hidden_dim, hidden_dim, 1, bias=False)  # Eq. 6
        self.hidden_dim = hidden_dim
        self.reset_parameters()

    def reset_parameters(self):
        nn.init.xavier_uniform_(self.weight.weight)
        nn.init.xavier_uniform_(self.bilinear.weight)

    def encode_subgraph(self, adj_norm: torch.Tensor, feats: torch.Tensor) -> torch.Tensor:
        """GCN layer + mean Readout.  adj_norm: (B,K,K), feats: (B,K,d) -> (B,h)."""
        h = self.weight(feats)               # (B,K,h)
        h = torch.bmm(adj_norm, h)           # neighbourhood aggregation
        h = F.relu(h)
        return h.mean(dim=1)                 # Readout (Eq. 4) -> (B,h)

    def encode_node(self, feats: torch.Tensor) -> torch.Tensor:
        """Target node embedding z_i = ReLU(x_i W) (Eq. 5)."""
        return F.relu(self.weight(feats))

    def forward(self, adj_norm, sub_feats, node_feats) -> torch.Tensor:
        e = self.encode_subgraph(adj_norm, sub_feats)   # (B,h)
        z = self.encode_node(node_feats)                # (B,h)
        score = torch.sigmoid(self.bilinear(z, e)).squeeze(-1)  # (B,)
        return score

    @torch.no_grad()
    def all_node_embeddings(self, node_feats: torch.Tensor) -> torch.Tensor:
        """z_i for every node, reused by the topology module."""
        return self.encode_node(node_feats)
