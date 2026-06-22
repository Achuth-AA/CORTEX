export default function ChartTooltip({ active, payload, label, labelName, fmt }) {
  if (!active || !payload || !payload.length) return null
  const format = fmt || ((v) => v)
  return (
    <div
      style={{
        background: '#0d1119',
        border: '1px solid #303a50',
        borderRadius: 8,
        padding: '8px 11px',
        fontSize: 12,
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
      }}
    >
      {label !== undefined && (
        <div style={{ color: '#97a3b6', marginBottom: 5 }}>
          {labelName ? `${labelName}: ` : ''}
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '1px 0' }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 2,
              background: p.color || p.stroke || p.fill,
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#cfd7e3' }}>{p.name}</span>
          <span style={{ marginLeft: 'auto', color: '#e6ebf2', fontWeight: 600 }}>
            {format(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
