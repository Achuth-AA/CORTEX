# HouseIQ — Hyderabad Housing Data Dashboard

React + Vite + Tailwind CSS v4 + Recharts dashboard for the cleaned housing dataset.

## Run it

```bash
cd dashboard
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
```

## Tabs

| Tab | Contents |
|---|---|
| **Dashboard** | KPI cards + market visuals from `datasets/housedata_clean.csv` (price distribution, BHK mix, top localities, price by BHK, listings over time, status/furnishing share, ₹/sqft spread) |
| **Raw vs Clean** | Before/after comparison with `datasets/All_Merged_Updated(in).csv` — rows, missingness by column, category cleanup, price distribution overlay, defect table |
| **Cleaning Pipeline** | The 8 cleaning steps with rows in/out and reasoning, row funnel, imputation method shoot-out, quality-flag summary |

## Data

Charts read precomputed aggregates from `src/data/stats.json` (generated from the two
CSVs — the 30 MB raw files are never shipped to the browser). To refresh the numbers
after re-running the cleaning pipeline, regenerate `stats.json`.
