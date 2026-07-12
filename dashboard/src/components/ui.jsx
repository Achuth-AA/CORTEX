export const fmtInt = (n) => n.toLocaleString('en-IN')
export const fmtCr = (n) => `₹${n} Cr`

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-card rounded-3xl border border-black/5 shadow-[0_1px_2px_rgba(11,11,11,0.04)] ${className}`}>
      {children}
    </div>
  )
}

export function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-[13px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  )
}

export function KpiCard({ label, value, sub, dark = false, icon }) {
  if (dark) {
    return (
      <div className="rounded-3xl p-6 text-white shadow-lg shadow-brand-900/20 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 relative overflow-hidden">
        <div className="absolute -right-6 -top-8 w-32 h-32 rounded-full bg-brand-500/15 blur-sm" />
        <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-brand-500/20" />
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-white/80">{label}</p>
          {icon && <span className="w-8 h-8 grid place-items-center rounded-full bg-white/10 text-[15px]">{icon}</span>}
        </div>
        <p className="text-[34px] leading-tight font-semibold mt-3">{value}</p>
        {sub && (
          <p className="text-[12px] text-brand-200 mt-2 inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[11px] font-semibold">✓</span>
            {sub}
          </p>
        )}
      </div>
    )
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-secondary">{label}</p>
        {icon && <span className="w-8 h-8 grid place-items-center rounded-full border border-hairline text-[15px]">{icon}</span>}
      </div>
      <p className="text-[34px] leading-tight font-semibold mt-3 text-ink">{value}</p>
      {sub && <p className="text-[12px] text-ink-muted mt-2">{sub}</p>}
    </Card>
  )
}

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white rounded-xl px-3.5 py-2.5 shadow-xl text-[12px]">
      {label !== undefined && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="font-semibold">{formatter ? formatter(p.value, p.name) : p.value.toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  )
}

export const axisStyle = { fontSize: 11, fill: '#898781' }
export const gridStroke = '#e1e0d9'
export const SERIES = { green: '#1baf7a', blue: '#2a78d6', yellow: '#eda100', violet: '#4a3aa7', greenDark: '#0e6b4b' }
