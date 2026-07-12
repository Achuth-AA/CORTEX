import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell } from 'recharts'
import stats from '../data/stats.json'
import { Card, ChartCard, ChartTooltip, axisStyle, gridStroke, SERIES, fmtInt } from '../components/ui.jsx'

const START = 93621

export default function Pipeline() {
  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-[12.5px] text-ink-secondary font-medium">Rows in</p>
          <p className="text-[28px] font-semibold mt-1">{fmtInt(START)}</p>
          <p className="text-[11px] text-ink-muted mt-1">raw scraped listings</p>
        </Card>
        <Card className="p-5">
          <p className="text-[12.5px] text-ink-secondary font-medium">Rows out</p>
          <p className="text-[28px] font-semibold mt-1 text-brand-700">{fmtInt(62047)}</p>
          <p className="text-[11px] text-ink-muted mt-1">66.3% retained — losses are duplicates & broken targets only</p>
        </Card>
        <Card className="p-5">
          <p className="text-[12.5px] text-ink-secondary font-medium">Validation</p>
          <p className="text-[28px] font-semibold mt-1">{stats.validation.passed}/{stats.validation.checks}</p>
          <p className="text-[11px] text-ink-muted mt-1">automated checks passed</p>
        </Card>
        <Card className="p-5">
          <p className="text-[12.5px] text-ink-secondary font-medium">Missing values</p>
          <p className="text-[28px] font-semibold mt-1 text-brand-700">0</p>
          <p className="text-[11px] text-ink-muted mt-1">in every feature column</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* Pipeline stepper */}
        <Card className="lg:col-span-3 p-6">
          <h3 className="text-[15px] font-semibold mb-1">The Eight Steps</h3>
          <p className="text-[13px] text-ink-muted mb-6">
            Rule: repair or impute whenever possible — drop a row only when it's a duplicate or its price is unusable.
          </p>

          <div className="relative">
            <div className="absolute left-[17px] top-4 bottom-4 w-px bg-hairline" />
            <div className="space-y-2">
              {stats.pipeline.map((s) => (
                <div key={s.step} className="relative flex gap-4 group">
                  <div
                    className={`relative z-10 w-9 h-9 shrink-0 rounded-full grid place-items-center text-[13px] font-bold ring-4 ring-card ${
                      s.lost > 0 ? 'bg-brand-800 text-white' : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="rounded-2xl border border-hairline group-hover:border-brand-200 group-hover:bg-brand-50/40 transition-colors p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[13.5px] font-semibold">{s.title}</h4>
                        <span className="ml-auto flex items-center gap-1.5">
                          {s.lost > 0 ? (
                            <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200/70 rounded-full px-2.5 py-0.5">
                              −{fmtInt(s.lost)} rows
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200/70 rounded-full px-2.5 py-0.5">
                              0 rows lost
                            </span>
                          )}
                          <span className="text-[11px] text-ink-muted tabular-nums">→ {fmtInt(s.out)}</span>
                        </span>
                      </div>
                      <p className="text-[12.5px] text-ink-secondary mt-1.5 leading-relaxed">{s.what}</p>
                      <p className="text-[11.5px] text-ink-muted mt-1 leading-relaxed">
                        <span className="font-semibold text-ink-secondary">Why: </span>{s.why}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Row funnel */}
          <ChartCard title="Rows Through the Pipeline" subtitle="Where the 33% went — all of it duplicates or broken targets">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={[
                  { stage: 'Raw', rows: 93621 },
                  { stage: 'After dedupe', rows: 66478 },
                  { stage: 'Valid target', rows: 63076 },
                  { stage: 'Final', rows: 62047 },
                ]}
                margin={{ top: 20, right: 8, left: -14, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis dataKey="stage" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                <Bar dataKey="rows" name="Rows" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  <LabelList dataKey="rows" position="top" formatter={(v) => `${(v / 1000).toFixed(0)}K`} style={{ fontSize: 11, fill: '#52514e', fontWeight: 600 }} />
                  {[0, 1, 2, 3].map((i) => (
                    <Cell key={i} fill={i === 3 ? SERIES.green : '#b9dfc7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Imputation comparison */}
          <ChartCard title="Imputation Shoot-out" subtitle="Reconstruction error on 10% hidden values — lower is better">
            <div className="space-y-3 mt-1">
              {stats.imputeComparison.map((m) => (
                <div key={m.method} className="flex items-center gap-3">
                  <span className={`w-32 text-[12.5px] ${m.chosen ? 'font-bold text-brand-800' : 'font-medium text-ink-secondary'}`}>
                    {m.method}
                  </span>
                  <div className="flex-1 h-5 rounded-md bg-black/[0.035] overflow-hidden">
                    <div
                      className={`h-full rounded-md ${m.chosen ? 'bg-gradient-to-r from-brand-500 to-brand-700' : 'bg-[#c3c2b7]'}`}
                      style={{ width: `${(m.error / 1.0) * 100}%` }}
                    />
                  </div>
                  <span className={`w-12 text-right text-[12.5px] tabular-nums ${m.chosen ? 'font-bold text-brand-800' : 'font-semibold text-ink-muted'}`}>
                    {m.error}
                  </span>
                  {m.chosen && (
                    <span className="text-[10.5px] font-bold text-white bg-brand-700 rounded-full px-2 py-0.5">CHOSEN</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-muted mt-4 leading-relaxed">
              MICE predicts each column from all the others — structural fields explain each other, so it beats
              per-group medians. KNN was both least accurate and too slow at 80K+ rows.
            </p>
          </ChartCard>

          {/* Quality flags */}
          <ChartCard title="Quality Flags Kept as Features" subtitle="Contradictions are flagged, not deleted — filter Flag = 0 for the strictest set">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={stats.flagCounts} layout="vertical" margin={{ top: 0, right: 52, left: 22, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} hide />
                <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fill: '#52514e' }} width={125} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                <Bar dataKey="count" name="Flagged rows" fill={SERIES.yellow} radius={[0, 4, 4, 0]} maxBarSize={16}>
                  <LabelList dataKey="count" position="right" formatter={fmtInt} style={{ fontSize: 11, fill: '#52514e', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="rounded-2xl bg-brand-50 border border-brand-200/60 p-3.5 mt-2">
              <p className="text-[12px] text-brand-800">
                <span className="font-semibold">83% of rows carry zero flags</span> — that strict subset (51,516 rows)
                is the highest-quality training set.
              </p>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
