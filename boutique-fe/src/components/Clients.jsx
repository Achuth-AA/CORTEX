import { useMemo, useState } from 'react'
import { inr, txStatus } from '../store.js'
import { useData } from '../dataContext.js'

const keyOf = (n) => n.trim().toLowerCase()

const displayDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function StatusChip({ status }) {
  return <span className={`chip chip-${status.toLowerCase()}`}>{status}</span>
}

function Clients({ onEdit, onNavigate }) {
  const { profiles, txs, ready, dbError, deleteProfile, deleteTx, updateTx } = useData()
  const [query, setQuery] = useState('')
  const [actionError, setActionError] = useState('')
  const [selectedKey, setSelectedKey] = useState(null)
  const [payFor, setPayFor] = useState(null)
  const [payAmt, setPayAmt] = useState('')

  const clients = useMemo(() => {
    const map = new Map()
    const ensure = (name, phone) => {
      const k = keyOf(name)
      if (!map.has(k)) {
        map.set(k, { key: k, name: name.trim(), phone: '', profiles: [], txs: [] })
      }
      const c = map.get(k)
      if (!c.phone && phone) c.phone = phone
      return c
    }
    profiles.forEach((p) => ensure(p.name, p.phone).profiles.push(p))
    txs.forEach((t) => ensure(t.client, t.phone).txs.push(t))
    return [...map.values()]
      .map((c) => ({
        ...c,
        garments: c.profiles.reduce((s, p) => s + p.garments.length, 0),
        billed: c.txs.reduce((s, t) => s + t.amount, 0),
        received: c.txs.reduce((s, t) => s + t.received, 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [profiles, txs])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? clients.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
      )
    : clients
  const selected = clients.find((c) => c.key === selectedKey)

  const removeProfile = async (id) => {
    const err = await deleteProfile(id)
    setActionError(err ? `Could not delete — ${err}` : '')
  }

  const removeTx = async (id) => {
    const err = await deleteTx(id)
    setActionError(err ? `Could not delete — ${err}` : '')
  }

  const recordPayment = async (t) => {
    const amt = parseFloat(payAmt)
    if (!(amt > 0)) return
    const err = await updateTx({
      ...t,
      received: Math.min(t.amount, t.received + amt),
    })
    setActionError(err ? `Could not record the payment — ${err}` : '')
    setPayFor(null)
    setPayAmt('')
  }

  return (
    <section className="section measure clients">
      <div className="measure-head">
        <p className="eyebrow">Atelier Directory</p>
        <h1>Clients</h1>
        <p className="measure-sub">
          Every client in one place — their measurements, their orders, and what
          is still due. Select a client to view and manage their records.
        </p>
      </div>

      {dbError && <p className="m-banner m-banner-error">{dbError}</p>}
      {actionError && <p className="m-banner m-banner-error">{actionError}</p>}

      {!ready ? (
        <p className="d-empty">Loading clients…</p>
      ) : !selected ? (
        <>
          <div className="c-search">
            <label className="sr-only" htmlFor="client-search">
              Search clients
            </label>
            <input
              id="client-search"
              type="search"
              placeholder="Search by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {clients.length === 0 ? (
            <div className="c-empty m-card">
              <p>No clients yet.</p>
              <p className="d-card-sub">
                Save a{' '}
                <button type="button" className="d-link" onClick={() => onNavigate('measurements')}>
                  measurement
                </button>{' '}
                or a{' '}
                <button type="button" className="d-link" onClick={() => onNavigate('transactions')}>
                  transaction
                </button>{' '}
                and the client will appear here automatically.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="c-empty m-card">
              <p>No clients match “{query}”.</p>
            </div>
          ) : (
            <ul className="c-list">
              {filtered.map((c) => (
                <li key={c.key}>
                  <button type="button" className="c-card" onClick={() => setSelectedKey(c.key)}>
                    <div className="c-card-id">
                      <strong>{c.name}</strong>
                      <span>{c.phone || 'No phone on record'}</span>
                    </div>
                    <div className="c-meta">
                      <span>
                        {c.garments} garment{c.garments === 1 ? '' : 's'}
                      </span>
                      <span>
                        {c.txs.length} transaction{c.txs.length === 1 ? '' : 's'}
                      </span>
                      {c.billed - c.received > 0 ? (
                        <span className="c-due">{inr(c.billed - c.received)} due</span>
                      ) : c.txs.length > 0 ? (
                        <span className="c-clear">Cleared</span>
                      ) : null}
                    </div>
                    <span className="c-open">View →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <button type="button" className="c-back" onClick={() => setSelectedKey(null)}>
            ← All Clients
          </button>

          <div className="m-card c-head">
            <div>
              <h2>{selected.name}</h2>
              <p className="d-card-sub">{selected.phone || 'No phone on record'}</p>
            </div>
            <div className="c-head-stats">
              <div>
                <span>Garments</span>
                <strong>{selected.garments}</strong>
              </div>
              <div>
                <span>Billed</span>
                <strong>{inr(selected.billed)}</strong>
              </div>
              <div>
                <span>Received</span>
                <strong>{inr(selected.received)}</strong>
              </div>
              <div>
                <span>Balance Due</span>
                <strong className={selected.billed - selected.received > 0 ? 'is-due' : ''}>
                  {inr(selected.billed - selected.received)}
                </strong>
              </div>
            </div>
          </div>

          <div className="c-section">
            <h2>Measurement Profiles</h2>
            {selected.profiles.length === 0 ? (
              <p className="d-empty">
                No measurements yet —{' '}
                <button type="button" className="d-link" onClick={() => onNavigate('measurements')}>
                  add one
                </button>
                .
              </p>
            ) : (
              <ul className="m-saved-list">
                {selected.profiles.map((r) => (
                  <li className="m-saved-card" key={r.id}>
                    <div className="m-saved-top">
                      <div>
                        <strong>Recorded {r.date}</strong>
                        <span>
                          {r.garments.length} garment{r.garments.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="c-actions">
                        <button
                          type="button"
                          className="m-edit"
                          onClick={() => onEdit('measurement', r.id)}
                        >
                          Edit
                        </button>
                        <button type="button" className="m-remove" onClick={() => removeProfile(r.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {r.garments.map((g, i) => (
                      <div className="m-saved-garment" key={i}>
                        <p className="m-saved-type">
                          {g.type}
                          <em>{g.mode === 'upload' ? 'Sheet uploaded' : 'Typed'}</em>
                        </p>
                        {g.mode === 'manual' ? (
                          <p className="m-saved-vals">
                            {Object.entries(g.values)
                              .map(([k, v]) => `${k} ${v}"`)
                              .join(' · ')}
                          </p>
                        ) : (
                          <p className="m-saved-vals">{g.fileNames.join(', ')}</p>
                        )}
                        {g.notes && <p className="m-saved-notes">“{g.notes}”</p>}
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="c-section">
            <h2>Transactions</h2>
            {selected.txs.length === 0 ? (
              <p className="d-empty">
                No transactions yet —{' '}
                <button type="button" className="d-link" onClick={() => onNavigate('transactions')}>
                  add one
                </button>
                .
              </p>
            ) : (
              <ul className="m-saved-list">
                {selected.txs.map((t) => (
                  <li className="m-saved-card" key={t.id}>
                    <div className="m-saved-top">
                      <div>
                        <strong>{t.item}</strong>
                        <span>{displayDate(t.date)} · {t.method}</span>
                      </div>
                      <div className="c-actions">
                        <button
                          type="button"
                          className="m-edit"
                          onClick={() => onEdit('transaction', t.id)}
                        >
                          Edit
                        </button>
                        <button type="button" className="m-remove" onClick={() => removeTx(t.id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="t-amounts">
                      <div>
                        <span>Total</span>
                        <strong>{inr(t.amount)}</strong>
                      </div>
                      <div>
                        <span>Received</span>
                        <strong>{inr(t.received)}</strong>
                      </div>
                      <div>
                        <span>Balance</span>
                        <strong>{inr(t.amount - t.received)}</strong>
                      </div>
                      <StatusChip status={txStatus(t)} />
                    </div>

                    {t.billNames.length > 0 && (
                      <p className="m-saved-vals">Bill attached: {t.billNames.join(', ')}</p>
                    )}
                    {t.notes && <p className="m-saved-notes">“{t.notes}”</p>}

                    {txStatus(t) !== 'Paid' &&
                      (payFor === t.id ? (
                        <div className="c-pay">
                          <label className="sr-only" htmlFor={`pay-${t.id}`}>
                            Payment amount
                          </label>
                          <input
                            id={`pay-${t.id}`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            placeholder={`Up to ${inr(t.amount - t.received)}`}
                            value={payAmt}
                            onChange={(e) => setPayAmt(e.target.value)}
                          />
                          <button type="button" className="btn btn-solid c-pay-btn" onClick={() => recordPayment(t)}>
                            Add Payment
                          </button>
                          <button
                            type="button"
                            className="m-remove"
                            onClick={() => {
                              setPayFor(null)
                              setPayAmt('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline c-pay-open"
                          onClick={() => {
                            setPayFor(t.id)
                            setPayAmt('')
                          }}
                        >
                          Record Payment
                        </button>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default Clients
