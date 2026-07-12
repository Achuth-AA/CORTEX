import { useState } from 'react'
import Overview from './tabs/Overview.jsx'
import Compare from './tabs/Compare.jsx'
import Pipeline from './tabs/Pipeline.jsx'
import stats from './data/stats.json'

const TABS = [
  {
    id: 'overview', label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    title: 'Clean Data Overview',
    subtitle: 'KPIs and market patterns from the cleaned, model-ready dataset.',
  },
  {
    id: 'compare', label: 'Raw vs Clean',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" /><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        <path d="M12 2v20" strokeDasharray="3 3" />
      </svg>
    ),
    title: 'Raw vs Clean Comparison',
    subtitle: 'What the cleaning changed — side by side with the raw scrape.',
  },
  {
    id: 'pipeline', label: 'Cleaning Pipeline',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="5" cy="6" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="19" cy="18" r="2.2" />
        <path d="M7 7.5 10 10.5M14 13.5 17 16.5" />
      </svg>
    ),
    title: 'Data Cleaning Pipeline',
    subtitle: 'The eight steps that turned 93,621 scraped rows into a model-ready dataset.',
  },
]

export default function App() {
  const [tab, setTab] = useState('overview')
  const active = TABS.find((t) => t.id === tab)

  return (
    <div className="min-h-screen p-3 lg:p-5">
      <div className="max-w-[1440px] mx-auto flex gap-4">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-card rounded-3xl border border-black/5 p-5 sticky top-5 h-[calc(100vh-2.5rem)]">
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 grid place-items-center text-white font-bold text-[15px]">H</span>
            <div>
              <p className="font-bold text-[16px] tracking-tight">HouseIQ</p>
              <p className="text-[10.5px] text-ink-muted -mt-0.5">Hyderabad Housing Data</p>
            </div>
          </div>

          <p className="text-[10.5px] font-semibold tracking-[0.12em] text-ink-muted mt-8 mb-2 px-2">MENU</p>
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-brand-50 text-brand-800 border border-brand-200/70'
                    : 'text-ink-secondary hover:bg-black/[0.03] border border-transparent'
                }`}
              >
                <span className={tab === t.id ? 'text-brand-600' : 'text-ink-muted'}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 text-white p-4">
              <p className="text-[12.5px] font-semibold">Model-ready dataset</p>
              <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                {stats.kpi.rows.toLocaleString('en-IN')} listings · 0 missing values · all 22 validation checks passed
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-mono bg-white/10 rounded-lg px-2.5 py-1.5 truncate">
                housedata_clean.csv
              </div>
            </div>
            <p className="text-[10.5px] text-ink-muted text-center mt-3">Sources: NoBroker · MagicBricks · SquareYards · 99acres</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="bg-card rounded-3xl border border-black/5 px-6 py-5 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight">{active.title}</h1>
              <p className="text-[13px] text-ink-muted mt-0.5">{active.subtitle}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden md:inline-flex items-center gap-2 text-[12px] text-ink-secondary border border-hairline rounded-full px-3.5 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Snapshot · Jul 2026
              </span>
              <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-white bg-brand-800 hover:bg-brand-900 rounded-full px-4 py-2 cursor-default">
                {stats.kpi.rows.toLocaleString('en-IN')} listings
              </span>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 mt-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-2 rounded-xl text-[12.5px] font-medium ${
                  tab === t.id ? 'bg-brand-800 text-white' : 'bg-card text-ink-secondary border border-black/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === 'overview' && <Overview />}
            {tab === 'compare' && <Compare />}
            {tab === 'pipeline' && <Pipeline />}
          </div>
        </main>
      </div>
    </div>
  )
}
