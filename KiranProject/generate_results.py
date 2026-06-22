"""Run ARISE on the benchmark datasets and export dashboard JSON.

Outputs:
  dashboard/public/data/<dataset>.json   -- full payload per dataset
  dashboard/public/data/index.json       -- list of available datasets
  results/<dataset>.json                 -- copy for notebooks / inspection
"""

from __future__ import annotations

import argparse
import json
import os

import numpy as np

from arise import ablation as ab
from arise.data import PAPER_INJECTION, inject_anomalies, load_dataset, load_synthetic
from arise.export import build_dashboard_payload
from arise.pipeline import node_embeddings, normalize_features, run_arise

DASH_DIR = os.path.join("dashboard", "public", "data")
RES_DIR = "results"


# Per-dataset training config (epochs / lr) tuned for this CPU reimplementation.
DATASET_CFG = {
    "Synthetic": dict(epochs=100, lr=1e-3),
    "Cora": dict(epochs=60, lr=0.003),
    "CiteSeer": dict(epochs=60, lr=0.003),
}


def run_one(name: str, epochs: int | None, seed: int = 42, with_ablations: bool = True):
    if name == "Synthetic":
        clean = load_synthetic(num_nodes=1500, num_communities=6, num_features=100)
        inj = dict(num_cliques=8, clique_size=15, num_attribute=120, k_candidates=50)
    else:
        clean = load_dataset(name.lower())
        inj = PAPER_INJECTION.get(clean.name, PAPER_INJECTION["Cora"])
    graph = inject_anomalies(clean, seed=seed, **inj)

    cfg = DATASET_CFG.get(name, dict(epochs=100, lr=1e-3))
    ep = epochs if epochs is not None else cfg["epochs"]

    print(f"\n=== {name} ===")
    print(graph.summary())
    result, model = run_arise(graph, alpha=0.8, epochs=ep, lr=cfg["lr"],
                              weight_decay=1e-5, batch_size=300, attr_rounds=4, seed=seed,
                              return_model=True, verbose=True)
    payload = build_dashboard_payload(graph, result, model=model)

    if with_ablations:
        payload["ablations"] = compute_ablations(clean, graph, result, model, inj, cfg, seed)
    return payload


def compute_ablations(clean, graph, result, model, inj, cfg, seed):
    """Reproduce the paper's ablation studies (Tables VI-VIII, X / Fig. 8)."""
    print("[ablation] computing substructure / score / fusion / imbalance studies ...")
    emb = node_embeddings(normalize_features(graph), model)
    norm_t = np.asarray(result["scores"]["topology_norm"])
    norm_a = np.asarray(result["scores"]["attribute_norm"])
    labels = np.asarray(result["labels"])

    total = inj["num_cliques"] * inj["clique_size"] + inj["num_attribute"]
    imbalance = ab.imbalance_alpha_analysis(
        clean, total_anomalies=total, clique_size=inj["clique_size"],
        epochs=cfg["epochs"], lr=cfg["lr"], seed=seed, verbose=True,
    )
    return {
        "substructure_detector": ab.substructure_detector_ablation(graph, emb),
        "score_component": ab.score_component_ablation(graph, emb),
        "fusion_strategy": ab.fusion_strategy_ablation(labels, norm_t, norm_a, alpha=0.8),
        "imbalance_alpha": imbalance,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--datasets", nargs="+", default=["Cora", "Synthetic"])
    ap.add_argument("--epochs", type=int, default=None,
                    help="override per-dataset epochs (default uses DATASET_CFG)")
    ap.add_argument("--no-ablations", action="store_true",
                    help="skip the ablation studies (faster)")
    args = ap.parse_args()

    os.makedirs(DASH_DIR, exist_ok=True)
    os.makedirs(RES_DIR, exist_ok=True)

    index = []
    for name in args.datasets:
        payload = run_one(name, epochs=args.epochs, with_ablations=not args.no_ablations)
        slug = name.lower()
        for d in (DASH_DIR, RES_DIR):
            with open(os.path.join(d, f"{slug}.json"), "w") as f:
                json.dump(payload, f)
        index.append({
            "slug": slug,
            "name": payload["dataset"]["name"],
            "num_nodes": payload["dataset"]["num_nodes"],
            "auc": payload["metrics"]["overall"]["auc"],
        })
        print(f"  -> wrote {slug}.json  (AUC={index[-1]['auc']})")

    with open(os.path.join(DASH_DIR, "index.json"), "w") as f:
        json.dump(index, f, indent=2)
    print("\nAll done. Datasets:", [i["slug"] for i in index])


if __name__ == "__main__":
    main()
