# ARISE — Graph Anomaly Detection Dashboard

A React (Vite) dashboard that visualizes results from the ARISE graph-anomaly-detection
pipeline. ARISE detects two anomaly types in attributed graphs: **topology** anomalies
(dense substructures of unrelated nodes, found via k-core substructure similarity) and
**attribute** anomalies (nodes whose features differ from their neighbors, scored by a
contrastively-trained GCN). The two signals are fused with a weight `alpha`.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Data

The dashboard is purely front-end. It reads result JSON at runtime from `public/data/`
(served at `./data/` relative to the app, so it works from any subdirectory):

- `public/data/index.json` — array of `{ slug, name, num_nodes, auc }` used by the dataset
  switcher.
- `public/data/<slug>.json` — the full result payload for each dataset.

These files are produced by the separate Python analysis pipeline. If they are missing or
still being written, the app shows a "Results are still being generated, refresh shortly"
message rather than failing.

## Sections

Overview, Method comparison, ROC & PR curves, Precision@K, Score distributions, Embedding
scatter (PCA), Alpha sweep, Training loss, Substructure explorer, and Top flagged nodes.

## Notes

- Built with `base: './'` so the compiled site works when served from a subdirectory.
- Dependencies are kept light: `react`, `react-dom`, and `recharts` only.
