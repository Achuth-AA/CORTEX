export const fmt3 = (v) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : Number(v).toFixed(3)

export const fmt2 = (v) =>
  v === null || v === undefined || Number.isNaN(v) ? '—' : Number(v).toFixed(2)

export const fmtInt = (v) =>
  v === null || v === undefined || Number.isNaN(v)
    ? '—'
    : Number(v).toLocaleString('en-US')

export const dataUrl = (path) => import.meta.env.BASE_URL + path

export const COLORS = {
  normal: '#64748b',
  topology: '#f43f5e',
  attribute: '#f59e0b',
  accent: '#5b8cff',
  accent2: '#38bdf8',
  good: '#34d399',
  warm: '#f97316',
  warm2: '#fbbf24',
}

// stable color palette for comparison methods / ROC-PR series
export const METHOD_COLORS = {
  'ARISE (full)': '#5b8cff',
  'ARISE (attr-only)': '#f59e0b',
  'ARISE (topo-only)': '#f43f5e',
  LOF: '#34d399',
  AttrResidual: '#a78bfa',
  Random: '#64748b',
}

export const seriesColor = (name, i = 0) => {
  if (METHOD_COLORS[name]) return METHOD_COLORS[name]
  const palette = ['#5b8cff', '#34d399', '#f59e0b', '#a78bfa', '#f43f5e', '#38bdf8']
  return palette[i % palette.length]
}
