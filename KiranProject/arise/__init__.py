"""ARISE: Graph Anomaly Detection on Attributed Networks via Substructure Awareness.

Clean PyTorch reimplementation of Duan et al., IEEE TNNLS 2024.
"""

from .data import (
    AttributedGraph,
    PAPER_INJECTION,
    inject_anomalies,
    load_cora,
    load_dataset,
    load_synthetic,
)
from .metrics import auc, auprc, evaluate, precision_at_k
from .model import ARISEContrastive, build_subgraphs
from .pipeline import (
    attribute_anomaly_scores,
    node_embeddings,
    run_arise,
    train_contrastive,
)
from .topology import detect_substructures, topology_anomaly_scores
from . import ablation

__all__ = [
    "AttributedGraph",
    "PAPER_INJECTION",
    "load_dataset",
    "load_cora",
    "load_synthetic",
    "inject_anomalies",
    "ARISEContrastive",
    "build_subgraphs",
    "train_contrastive",
    "attribute_anomaly_scores",
    "node_embeddings",
    "run_arise",
    "detect_substructures",
    "topology_anomaly_scores",
    "auc",
    "auprc",
    "evaluate",
    "precision_at_k",
    "ablation",
]
