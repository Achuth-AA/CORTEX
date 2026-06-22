import { useEffect, useMemo, useState } from 'react'
import { dataUrl } from './lib/format'
import Overview from './sections/Overview'
import Comparison from './sections/Comparison'
import Curves from './sections/Curves'
import PrecisionAtK from './sections/PrecisionAtK'
import ScoreDistributions from './sections/ScoreDistributions'
import Embedding from './sections/Embedding'
import AlphaSweep from './sections/AlphaSweep'
import TrainingLoss from './sections/TrainingLoss'
import Substructures from './sections/Substructures'
import Ablations from './sections/Ablations'
import TopNodes from './sections/TopNodes'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'curves', label: 'ROC & PR' },
  { id: 'precisionk', label: 'Precision@K' },
  { id: 'distributions', label: 'Distributions' },
  { id: 'embedding', label: 'Embedding' },
  { id: 'alpha', label: 'Alpha Sweep' },
  { id: 'loss', label: 'Training Loss' },
  { id: 'substructures', label: 'Substructures' },
  { id: 'ablations', label: 'Ablations' },
  { id: 'topnodes', label: 'Top Nodes' },
]

function Header({ index, slug, onSelect }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-title">ARISE — Graph Anomaly Detection Dashboard</div>
          <div className="brand-sub">Topology + Attribute anomaly detection results</div>
        </div>
      </div>
      <div className="switcher">
        <label htmlFor="ds">Dataset</label>
        <select
          id="ds"
          value={slug || ''}
          onChange={(e) => onSelect(e.target.value)}
          disabled={!index || index.length === 0}
        >
          {(index || []).map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name} ({d.num_nodes.toLocaleString('en-US')} nodes)
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}

function CenterState({ icon, spinner, title, sub }) {
  return (
    <div className="center-state">
      <div>
        {spinner ? <div className="spinner" /> : <div className="icon">{icon}</div>}
        <h2 style={{ margin: '0 0 6px' }}>{title}</h2>
        {sub && <p className="muted" style={{ maxWidth: 460, margin: '0 auto' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function App() {
  const [index, setIndex] = useState(null)
  const [indexErr, setIndexErr] = useState(null)
  const [slug, setSlug] = useState(null)

  const [data, setData] = useState(null)
  const [dataErr, setDataErr] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  const [tab, setTab] = useState('overview')

  // Load index.json once.
  useEffect(() => {
    let alive = true
    fetch(dataUrl('data/index.json'), { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`index.json ${r.status}`)
        return r.json()
      })
      .then((arr) => {
        if (!alive) return
        if (!Array.isArray(arr) || arr.length === 0) {
          setIndex([])
          return
        }
        setIndex(arr)
        setSlug((cur) => cur || arr[0].slug)
      })
      .catch((e) => {
        if (alive) setIndexErr(e.message || String(e))
      })
    return () => {
      alive = false
    }
  }, [])

  // Load selected dataset payload.
  useEffect(() => {
    if (!slug) return
    let alive = true
    setDataLoading(true)
    setDataErr(null)
    setData(null)
    fetch(dataUrl(`data/${slug}.json`), { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`${slug}.json ${r.status}`)
        return r.json()
      })
      .then((d) => {
        if (!alive) return
        setData(d)
        setDataLoading(false)
      })
      .catch((e) => {
        if (!alive) return
        setDataErr(e.message || String(e))
        setDataLoading(false)
      })
    return () => {
      alive = false
    }
  }, [slug])

  const handleSelect = (s) => {
    setSlug(s)
    setTab('overview')
    window.scrollTo({ top: 0 })
  }

  const scrollToTab = (id) => {
    setTab(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const generating = (
    <CenterState
      icon="⏳"
      title="Results are still being generated"
      sub="The analysis pipeline has not finished writing its output yet. Refresh shortly."
    />
  )

  let body
  if (indexErr) {
    body = generating
  } else if (index === null) {
    body = <CenterState spinner title="Loading datasets…" />
  } else if (index.length === 0) {
    body = generating
  } else if (dataErr) {
    body = (
      <CenterState
        icon="⏳"
        title="This dataset's results aren't ready"
        sub={`Could not load ${slug}.json yet (${dataErr}). It may still be generating — refresh shortly.`}
      />
    )
  } else if (dataLoading || !data) {
    body = <CenterState spinner title="Loading results…" />
  } else {
    body = (
      <div className="container">
        <Overview data={data} />
        <Comparison data={data} />
        <Curves data={data} />
        <PrecisionAtK data={data} />
        <ScoreDistributions data={data} />
        <Embedding data={data} />
        <AlphaSweep data={data} />
        <TrainingLoss data={data} />
        <Substructures data={data} />
        <Ablations data={data} />
        <TopNodes data={data} />
      </div>
    )
  }

  const showTabs = index && index.length > 0 && data && !dataLoading

  return (
    <>
      <Header index={index} slug={slug} onSelect={handleSelect} />
      {showTabs && (
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => scrollToTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
      {body}
    </>
  )
}
