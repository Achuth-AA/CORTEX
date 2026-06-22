# ARISE — Reimplementation + Interactive Dashboard

A clean, from-scratch implementation of the paper:

> **ARISE: Graph Anomaly Detection on Attributed Networks via Substructure Awareness**
> Jingcan Duan, Bin Xiao, Siwei Wang, Haifang Zhou, Xinwang Liu — *IEEE TNNLS* 35(12), 2024.
> Paper PDF in this folder · Official code: https://github.com/FelixDJC/ARISE

This project reimplements the full method in **PyTorch (CPU-friendly)**, exposes it
as a documented Python package + **Jupyter notebooks**, and ships a **React dashboard**
that visualises the results.

> The original repo depends on `DGL 0.4.1` (incompatible with modern Python). This is
> an independent reimplementation in plain PyTorch + SciPy + NetworkX, so it runs
> anywhere with no GPU.

---

## What ARISE does

Attributed networks contain two kinds of anomalies:

- **Topology anomalies** — a *group* of unrelated nodes that are densely interlinked
  (an unusually dense **substructure**). A *collective* pattern.
- **Attribute anomalies** — a node whose features differ from its neighbourhood.

ARISE has three parts (paper Algorithm 1):

1. **Topology module** — k-core *region proposal* finds dense substructures; the
   **average node-pair cosine similarity** of node embeddings inside each substructure
   gives the anomaly degree (low similarity ⇒ anomalous, score `= |C|·(1/d)`), averaged
   over multiple `k` rounds. *(Eq. 1-2, 8-9)*
2. **Attribute module** — a GCN **contrastive** network (CoLA-style node-vs-subgraph
   positive/negative pairs, masked anchor, Bilinear discriminator, BCE loss). Its score
   is `s_neg − s_pos`; its embeddings also feed the topology module. *(Eq. 3-7, 10-11)*
3. **Fusion** — `score = (1−α)·topology + α·attribute`, with `α = 0.8`. *(Eq. 12)*

---

## Repository layout

```
KiranProject/
├── arise/                     # the Python package (the actual implementation)
│   ├── data.py                #   loading + anomaly injection (Sec. V-A2)
│   ├── model.py               #   GCN contrastive net + subgraph sampling
│   ├── topology.py            #   k-core substructure topology module
│   ├── pipeline.py            #   training + scoring + fusion (Algorithm 1)
│   ├── metrics.py             #   AUC / AUPRC / Precision@K
│   ├── baselines.py           #   LOF / attribute-residual / random baselines
│   ├── ablation.py            #   ablation studies (Tables VI-VIII, X / Fig. 8)
│   └── export.py              #   builds the dashboard JSON payload
├── notebooks/                 # 5 executed notebooks implementing the paper
│   ├── 01_data_and_anomaly_injection.ipynb
│   ├── 02_attribute_anomaly_gcl.ipynb
│   ├── 03_topology_anomaly_substructure.ipynb
│   ├── 04_full_pipeline_and_evaluation.ipynb
│   ├── 05_visualizations_and_export.ipynb
│   └── 06_ablation_studies.ipynb
├── generate_results.py        # run ARISE on all datasets -> dashboard JSON
├── build_notebooks.py         # regenerates the notebooks from source
├── build_report.py            # generates the project report (.docx) + figures
├── build_ppt.py               # generates the 25-slide presentation (.pptx)
├── report/                    # ARISE_Project_Report.docx, ARISE_Presentation.pptx, figures/
├── results/                   # exported per-dataset JSON (inspection copy)
├── dashboard/                 # React (Vite) visualisation dashboard
└── requirements.txt
```

---

## Quick start

### 1. Python environment

```bash
pip install -r requirements.txt
# torch CPU wheel (if not already installed):
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### 2. Run the model / regenerate results

```bash
python generate_results.py --datasets Cora Synthetic
# writes dashboard/public/data/*.json and results/*.json
```

Or step through the notebooks:

```bash
jupyter lab notebooks/
```

### 3. Launch the dashboard

```bash
cd dashboard
npm install
npm run dev      # http://localhost:5173
# or: npm run build && npm run preview
```

The dashboard reads `dashboard/public/data/*.json` and offers a dataset switcher with
tabs for: Overview, Method Comparison, ROC & PR, Precision@K, Score Distributions,
PCA Embedding, Alpha Sweep, Training Loss, Substructure Explorer, **Ablations**, and
Top Flagged Nodes.

### Ablation studies (paper Sec. V-C/D)

`generate_results.py` runs (and the dashboard's **Ablations** tab / notebook `06` show):

- **Substructure detector** (Table VI) — k-core region proposal vs. Greedy Modularity,
  Label Propagation, Kernighan–Lin. k-core wins (topology AUC ≈ 1.0), confirming the
  substructure-aware design.
- **Score components** (Table VII) — averaging term in Eq. 2, node- vs. node-pair-count
  weighting in Eq. 9.
- **Fusion strategy** (Table VIII) — max / sum / weighted; weighted is most comprehensive.
- **Imbalanced ratios** (Table X / Fig. 8) — AUC vs. α as the topology:attribute anomaly
  ratio varies (9:1 … 1:9); the optimal α shifts toward 1 as attribute anomalies dominate.

Skip them for a faster run with `python generate_results.py --no-ablations`.

---

## Results (this reimplementation)

Injected anomalies follow the paper (Cora: 5×15 topology + 75 attribute). Numbers are a
single seeded run on CPU and sit within normal variance of the paper's reported values.

| Dataset       | Overall AUC | Overall AUPRC | Topology module on topology anomalies | Attribute module on attribute anomalies |
|---------------|:-----------:|:-------------:|:-------------------------------------:|:---------------------------------------:|
| Cora          | ~0.88       | ~0.55         | **1.00**                              | ~0.83                                   |
| Synthetic-SBM | ~0.94       | ~0.82         | **1.00**                              | ~0.85                                   |

The substructure-based topology module perfectly separates injected topology anomalies
(AUC 1.0), which is exactly the paper's central claim. ARISE (full) beats both ablations
(topology-only / attribute-only) and the classical baselines, and the α-sweep confirms
fusion at α≈0.8 is best — reproducing the paper's findings.

### Notes & differences from the original
- Datasets: **Cora** (downloaded + parsed from raw text) and a built-in **synthetic SBM**
  fallback. Other paper datasets can be added via `arise/data.py` (`PAPER_INJECTION`).
- Feature rows are L1-normalised before the GCN (standard CoLA preprocessing) — important
  for the attribute module on bag-of-words features.
- Baselines here are lightweight stand-ins for context, not the original authors' code.
