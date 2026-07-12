import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
} from 'recharts'
import stats from '../data/stats.json'
import { Card, ChartCard, ChartTooltip, axisStyle, gridStroke, SERIES, fmtInt } from '../components/ui.jsx'

const RAW = '#898781'
const CLEAN = SERIES.green

function CompareStat({ label, raw, clean, note }) {
  return (
    <Card className="p-5">
      <p className="text-[12.5px] font-medium text-ink-secondary">{label}</p>
      <div className="flex items-end gap-3 mt-2.5">
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-ink-muted">Raw</p>
          <p className="text-[20px] font-semibold text-ink-muted line-through decoration-2 decoration-red-300/70">{raw}</p>
        </div>
        <span className="text-ink-muted mb-1.5">→</span>
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-brand-600 font-semibold">Clean</p>
          <p className="text-[24px] font-semibold text-brand-700">{clean}</p>
        </div>
      </div>
      {note && <p className="text-[11px] text-ink-muted mt-2">{note}</p>}
    </Card>
  )
}

export default function Compare() {
  const c = stats.compareKpi
  return (
    <div className="space-y-4">
      {/* Compare KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <CompareStat label="Rows" raw={fmtInt(c.rawRows)} clean={fmtInt(c.cleanRows)} note="duplicates & unusable prices removed" />
        <CompareStat label="Avg. missing values" raw={`${c.rawMissingPct}%`} clean="0%" note="every gap repaired or imputed" />
        <CompareStat label="Max area (sqft)" raw="301M" clean={fmtInt(c.cleanMaxArea)} note="impossible values bounded" />
        <CompareStat label="Max ₹/sqft" raw="₹77 Cr" clean={`₹${(c.cleanMaxPPS / 100000).toFixed(1)} L`} note="corrupt derived values recomputed" />
      </div>

      {/* Missing values per column */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCard title="Missing Values by Column" subtitle="% missing in the raw scrape — all are 0% after cleaning" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={330}>
            <BarChart data={stats.missingByCol} layout="vertical" margin={{ top: 0, right: 46, left: 12, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={gridStroke} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <YAxis type="category" dataKey="col" tick={{ ...axisStyle, fill: '#52514e' }} width={128} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
              <Bar dataKey="raw" name="Raw (missing %)" fill={RAW} radius={[0, 4, 4, 0]} maxBarSize={14}>
                <LabelList dataKey="raw" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 10.5, fill: '#52514e', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11.5px] text-brand-700 font-medium mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500" /> Clean dataset: 0% missing in every column
          </p>
        </ChartCard>

        {/* Category cleanup */}
        <ChartCard title="Category Cleanup" subtitle="Distinct values per column — spelling chaos collapsed" className="lg:col-span-2">
          <div className="space-y-3 mt-1">
            {stats.categoryCleanup.map((r) => (
              <div key={r.col} className="flex items-center gap-3">
                <span className="w-40 text-[12px] font-medium text-ink-secondary truncate">{r.col}</span>
                <span className="text-[13px] font-semibold text-ink-muted tabular-nums w-10 text-right">{r.raw}</span>
                <div className="flex-1 h-1.5 rounded-full bg-black/[0.05] relative">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500" style={{ width: `${Math.max((r.clean / r.raw) * 100, 4)}%` }} />
                </div>
                <span className="text-[13px] font-bold text-brand-700 tabular-nums w-8">{r.clean}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-brand-50 border border-brand-200/60 p-4">
            <p className="text-[12px] text-brand-800 leading-relaxed">
              <span className="font-semibold">Example:</span> Construction_Status had 71 spellings
              ("Ready to Move", "Ready To Move", "Ready to move", possession dates…) — now 4 clean values.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Price distribution compare + inconsistency table */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCard title="Price Distribution — Raw vs Clean" subtitle="Share of listings per price bucket (%)" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.priceDistCompare} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="bucket" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="raw" name="Raw" fill={RAW} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="clean" name="Clean" fill={CLEAN} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11.5px] text-ink-muted mt-1">
            The clean distribution shifts slightly up-market: rent rows disguised as ₹10K "sales" were removed from the low end.
          </p>
        </ChartCard>

        <ChartCard title="Defects: Before → After" subtitle="Known data problems, counted in each dataset" className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-hairline mt-1">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-black/[0.03] text-left">
                  <th className="px-3.5 py-2.5 font-semibold text-ink-secondary">Defect</th>
                  <th className="px-2 py-2.5 font-semibold text-ink-secondary text-right">Raw</th>
                  <th className="px-3.5 py-2.5 font-semibold text-brand-700 text-right">Clean</th>
                </tr>
              </thead>
              <tbody>
                {stats.inconsistencies.map((r, i) => (
                  <tr key={r.name} className={i % 2 ? 'bg-black/[0.015]' : ''}>
                    <td className="px-3.5 py-2.5 text-ink-secondary">{r.name}</td>
                    <td className="px-2 py-2.5 text-right font-semibold tabular-nums">{fmtInt(r.raw)}</td>
                    <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-brand-700">
                      {r.clean === 0 ? '0 ✓' : fmtInt(r.clean)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">
            "Missing pincode" in the clean set means marked <span className="font-mono">Unknown</span> — no coordinates
            available to geo-match those listings.
          </p>
        </ChartCard>
      </div>
    </div>
  )
}
