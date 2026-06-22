"""Evaluation metrics used in the ARISE paper (Section V-A4)."""

from __future__ import annotations

import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score


def auc(labels: np.ndarray, scores: np.ndarray) -> float:
    """Area under the ROC curve."""
    return float(roc_auc_score(labels, scores))


def auprc(labels: np.ndarray, scores: np.ndarray) -> float:
    """Area under the precision-recall curve (average precision)."""
    return float(average_precision_score(labels, scores))


def precision_at_k(labels: np.ndarray, scores: np.ndarray, k: int) -> float:
    """Proportion of true anomalies among the top-k highest scored nodes."""
    k = min(k, len(scores))
    top = np.argsort(-scores)[:k]
    return float(labels[top].sum() / k)


def precision_at_k_curve(labels: np.ndarray, scores: np.ndarray, ks: list[int]) -> list[float]:
    return [precision_at_k(labels, scores, k) for k in ks]


def evaluate(labels: np.ndarray, scores: np.ndarray, ks: list[int] | None = None) -> dict:
    ks = ks or [50, 100, 150, 200, 300]
    return {
        "auc": round(auc(labels, scores), 4),
        "auprc": round(auprc(labels, scores), 4),
        "precision_at_k": {int(k): round(precision_at_k(labels, scores, k), 4) for k in ks},
    }
