import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, LabelList,
} from 'recharts'
import stats from '../data/stats.json'
import { Card, ChartCard, KpiCard, ChartTooltip, axisStyle, gridStroke, SERIES, fmtInt } from '../components/ui.jsx'

const DONUT = [SERIES.green, SERIES.blue, SERIES.yellow, SERIES.violet]

export default function Overview() {
  const k = stats.kpi
  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard dark label="Total Listings" value={fmtInt(k.rows)} sub={`${k.fullyConsistentPct}% fully consistent`} icon="🏠" />
        <KpiCard label="Median Price" value={`₹${k.medianPriceCr} Cr`} sub="half the market sits below this" icon="₹" />
        <KpiCard label="Median Area" value={`${fmtInt(k.medianArea)} sqft`} sub={`across ${fmtInt(k.localities)} localities`} icon="⌂" />
        <KpiCard label="Median ₹ / sqft" value={`₹${fmtInt(k.medianPPS)}`} sub="the core valuation metric" icon="◫" />
      </div>

      {/* Row: price distribution + BHK mix */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCard title="Price Distribution" subtitle="Listings by price bucket" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.priceDist} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="bucket" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
              <Bar dataKey="count" name="Listings" fill={SERIES.green} radius={[4, 4, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="BHK Mix" subtitle="Unit sizes in the market" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.bhkDist} layout="vertical" margin={{ top: 4, right: 58, left: -8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={gridStroke} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} hide />
              <YAxis type="category" dataKey="bhk" tick={{ ...axisStyle, fill: '#52514e' }} width={62} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
              <Bar dataKey="count" name="Listings" fill={SERIES.green} radius={[0, 4, 4, 0]} maxBarSize={20}>
                <LabelList dataKey="count" position="right" formatter={fmtInt} style={{ fontSize: 11, fill: '#52514e', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row: localities + median price by BHK */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCard title="Top Localities" subtitle="Most-listed areas, with median price" className="lg:col-span-3">
          <div className="space-y-2.5">
            {stats.topLocalities.map((l, i) => {
              const max = stats.topLocalities[0].count
              return (
                <div key={l.name} className="flex items-center gap-3 group">
                  <span className="w-5 text-[11px] text-ink-muted font-semibold">{i + 1}</span>
                  <span className="w-32 truncate text-[12.5px] font-medium text-ink-secondary">{l.name}</span>
                  <div className="flex-1 h-5 rounded-md bg-black/[0.035] overflow-hidden">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-brand-500 to-brand-600 group-hover:from-brand-600 group-hover:to-brand-700 transition-colors"
                      style={{ width: `${(l.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-[12px] font-semibold tabular-nums">{fmtInt(l.count)}</span>
                  <span className="w-20 text-right text-[11.5px] text-ink-muted tabular-nums">₹{l.medPrice} Cr med</span>
                </div>
              )
            })}
          </div>
        </ChartCard>

        <ChartCard title="Median Price by BHK" subtitle="How price scales with unit size" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.priceByBHK} margin={{ top: 22, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="bhk" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} label={{ value: 'BHK', position: 'insideBottomRight', offset: -2, style: { fontSize: 10, fill: '#898781' } }} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}Cr`} />
              <Tooltip content={<ChartTooltip formatter={(v) => `₹${v} Cr`} />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
              <Bar dataKey="medPrice" name="Median price" fill={SERIES.blue} radius={[4, 4, 0, 0]} maxBarSize={30}>
                <LabelList dataKey="medPrice" position="top" formatter={(v) => `₹${v}`} style={{ fontSize: 10.5, fill: '#52514e', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row: timeline + donuts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <ChartCard title="Listings Over Time" subtitle="Monthly listing volume (months with 100+ listings)" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.timeline} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="ym" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c3c2b7', strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="count" name="Listings" stroke={SERIES.green} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { title: 'Construction Status', data: stats.statusShare },
            { title: 'Furnishing', data: stats.furnishShare },
          ].map(({ title, data }) => {
            const total = data.reduce((s, d) => s + d.value, 0)
            return (
              <Card key={title} className="p-5">
                <h3 className="text-[13.5px] font-semibold mb-1">{title}</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={2} strokeWidth={2} stroke="#fcfcfb">
                      {data.map((_, i) => <Cell key={i} fill={DONUT[i % DONUT.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(v) => `${fmtInt(v)} (${((v / total) * 100).toFixed(1)}%)`} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {data.slice(0, 4).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT[i % DONUT.length] }} />
                      <span className="text-ink-secondary truncate">{d.name}</span>
                      <span className="ml-auto font-semibold tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Price per sqft distribution */}
      <ChartCard title="Price-per-Sqft Distribution" subtitle="₹/sqft buckets — the market's valuation spread">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.ppsDist} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={gridStroke} />
            <XAxis dataKey="bucket" tick={axisStyle} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
            <Bar dataKey="count" name="Listings" fill={SERIES.violet} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
