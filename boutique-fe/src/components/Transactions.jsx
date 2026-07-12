import { useEffect, useRef, useState } from 'react'
import FileDrop from './FileDrop.jsx'
import { PAYMENT_METHODS, inr, txStatus } from '../store.js'
import { useData } from '../dataContext.js'

const emptyForm = () => ({
  client: '',
  phone: '',
  item: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  received: '',
  method: PAYMENT_METHODS[0],
  notes: '',
})

const displayDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function StatusChip({ status }) {
  return <span className={`chip chip-${status.toLowerCase()}`}>{status}</span>
}

const formFromRecord = (t) => ({
  client: t.client,
  phone: t.phone,
  item: t.item,
  date: t.date,
  amount: String(t.amount),
  received: t.received ? String(t.received) : '',
  method: t.method,
  notes: t.notes,
})

function Transactions({ editId = null, onDone = null }) {
  const { txs, ready, dbError, addTx, updateTx, deleteTx } = useData()
  const [initial] = useState(() =>
    editId ? (txs.find((t) => t.id === editId) ?? null) : null,
  )
  const [form, setForm] = useState(() => (initial ? formFromRecord(initial) : emptyForm()))
  const [files, setFiles] = useState([])
  const [existingBills, setExistingBills] = useState(() => initial?.billNames ?? [])
  const [editingId, setEditingId] = useState(initial?.id ?? null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const successTimer = useRef(null)

  useEffect(() => () => clearTimeout(successTimer.current), [])

  const beginEdit = (t) => {
    setEditingId(t.id)
    setError('')
    setForm(formFromRecord(t))
    setExistingBills(t.billNames ?? [])
    setFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
    setExistingBills([])
    setFiles([])
    setError('')
  }

  const patch = (p) => {
    setError('')
    setForm((f) => ({ ...f, ...p }))
  }

  const save = async (e) => {
    e.preventDefault()
    if (saving) return
    const amount = parseFloat(form.amount)
    const received = form.received === '' ? 0 : parseFloat(form.received)
    if (!form.client.trim()) return setError('Please enter the client name.')
    if (!form.item.trim()) return setError('Please describe the garment or service.')
    if (!(amount > 0)) return setError('Please enter a valid total amount.')
    if (received < 0 || received > amount)
      return setError('Amount received cannot exceed the total amount.')

    const record = {
      id: editingId ?? crypto.randomUUID(),
      client: form.client.trim(),
      phone: form.phone.trim(),
      item: form.item.trim(),
      date: form.date,
      amount,
      received,
      method: form.method,
      notes: form.notes.trim(),
      billNames: [...existingBills, ...files.map((f) => f.name)],
    }

    setSaving(true)
    const errMsg = editingId ? await updateTx(record) : await addTx(record)
    setSaving(false)

    if (errMsg) {
      setError(`Could not save to the database — ${errMsg}`)
      return
    }

    files.forEach((f) => f.url && URL.revokeObjectURL(f.url))

    if (editingId && onDone) {
      onDone()
      return
    }
    setSuccess(
      editingId
        ? `Transaction updated for ${record.client} — ${inr(record.amount)}.`
        : `Transaction saved for ${record.client} — ${inr(record.amount)}.`,
    )
    resetForm()
    clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccess(''), 5000)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const billed = txs.reduce((s, t) => s + t.amount, 0)
  const receivedTotal = txs.reduce((s, t) => s + t.received, 0)

  return (
    <section className="section measure">
      <div className="measure-head">
        <p className="eyebrow">Atelier Ledger</p>
        <h1>Transactions</h1>
        <p className="measure-sub">
          Record each order&apos;s billing — enter the details below, and attach a
          photo of the bill if you have one. Attaching a bill is optional.
        </p>
      </div>

      {dbError && <p className="m-banner m-banner-error">{dbError}</p>}
      {editingId && (
        <p className="m-banner m-banner-success">
          Editing {form.client ? `${form.client}'s` : 'a'} transaction — saving
          will update the existing record.
        </p>
      )}
      {success && <p className="m-banner m-banner-success">✦ {success}</p>}
      {error && <p className="m-banner m-banner-error">{error}</p>}

      <form className="measure-form" onSubmit={save} noValidate>
        <div className="m-card">
          <h2 className="m-card-title">Transaction Details</h2>
          <div className="m-grid m-grid-client">
            <label className="m-field">
              <span>Client Name *</span>
              <input
                type="text"
                value={form.client}
                placeholder="e.g. Ananya Sharma"
                onChange={(e) => patch({ client: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Phone</span>
              <input
                type="tel"
                inputMode="tel"
                value={form.phone}
                placeholder="+91 98xxxxxx00"
                onChange={(e) => patch({ phone: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Garment / Service *</span>
              <input
                type="text"
                value={form.item}
                placeholder="e.g. Bridal lehenga stitching"
                onChange={(e) => patch({ item: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => patch({ date: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Total Amount (₹) *</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="e.g. 4500"
                value={form.amount}
                onChange={(e) => patch({ amount: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Amount Received (₹)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0 if pending"
                value={form.received}
                onChange={(e) => patch({ received: e.target.value })}
              />
            </label>
            <label className="m-field">
              <span>Payment Method</span>
              <select
                value={form.method}
                onChange={(e) => patch({ method: e.target.value })}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="m-field">
              <span>Notes (optional)</span>
              <input
                type="text"
                value={form.notes}
                placeholder="e.g. Balance on delivery"
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </label>
          </div>

          <div className="m-field">
            <span>Attach Bill (optional)</span>
            {existingBills.length > 0 && (
              <ul className="m-files m-files-existing">
                {existingBills.map((name) => (
                  <li key={name}>
                    <span className="m-file-icon">FILE</span>
                    <span className="m-file-name">{name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() => setExistingBills((cur) => cur.filter((n) => n !== name))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <FileDrop
              files={files}
              onAdd={(fs) => setFiles((cur) => [...cur, ...fs])}
              onRemove={(id) =>
                setFiles((cur) => {
                  const going = cur.find((f) => f.id === id)
                  if (going?.url) URL.revokeObjectURL(going.url)
                  return cur.filter((f) => f.id !== id)
                })
              }
              title="Drop the bill here, or tap to browse"
              hint="A photo of the bill or receipt — JPG, PNG or PDF"
            />
          </div>
        </div>

        <div className="m-actions">
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Transaction' : 'Save Transaction'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => (onDone ? onDone() : resetForm())}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {!ready ? (
        <p className="d-empty">Loading records…</p>
      ) : (
      <div className="m-saved">
        <div className="m-saved-head">
          <h2>Recent Transactions</h2>
          <p>Synced live with your Supabase database.</p>
        </div>

        {txs.length === 0 && (
          <p className="d-empty">No transactions yet — your first one will appear here.</p>
        )}

          <div className="t-summary">
            <div>
              <span>Total Billed</span>
              <strong>{inr(billed)}</strong>
            </div>
            <div>
              <span>Received</span>
              <strong>{inr(receivedTotal)}</strong>
            </div>
            <div>
              <span>Outstanding</span>
              <strong>{inr(billed - receivedTotal)}</strong>
            </div>
          </div>

          <ul className="m-saved-list">
            {txs.map((t) => (
              <li className="m-saved-card" key={t.id}>
                <div className="m-saved-top">
                  <div>
                    <strong>{t.client}</strong>
                    <span>
                      {t.item} · {displayDate(t.date)}
                      {t.phone ? ` · ${t.phone}` : ''}
                    </span>
                  </div>
                  <div className="c-actions">
                    <button type="button" className="m-edit" onClick={() => beginEdit(t)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="m-remove"
                      onClick={async () => {
                        const err = await deleteTx(t.id)
                        if (err) setError(`Could not delete — ${err}`)
                      }}
                    >
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
                  <div>
                    <span>Method</span>
                    <strong>{t.method}</strong>
                  </div>
                  <StatusChip status={txStatus(t)} />
                </div>

                {t.billNames.length > 0 && (
                  <p className="m-saved-vals">Bill attached: {t.billNames.join(', ')}</p>
                )}
                {t.notes && <p className="m-saved-notes">“{t.notes}”</p>}
              </li>
            ))}
          </ul>
      </div>
      )}
    </section>
  )
}

export default Transactions
