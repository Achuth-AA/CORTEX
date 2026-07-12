import { useEffect, useRef, useState } from 'react'
import { GARMENT_TYPES } from '../data.js'
import { useData } from '../dataContext.js'
import FileDrop from './FileDrop.jsx'

const typeOf = (id) => GARMENT_TYPES.find((t) => t.id === id)

const newGarment = () => ({
  id: crypto.randomUUID(),
  type: GARMENT_TYPES[0].id,
  mode: 'manual',
  values: {},
  files: [],
  existingFiles: [],
  notes: '',
})

const garmentsFromRecord = (r) =>
  r.garments.map((g) => ({
    id: crypto.randomUUID(),
    type:
      g.typeId ??
      (GARMENT_TYPES.find((t) => t.label === g.type)?.id ?? GARMENT_TYPES[0].id),
    mode: g.mode,
    values: { ...g.values },
    files: [],
    existingFiles: g.fileNames ?? [],
    notes: g.notes ?? '',
  }))

function Measurements({ editId = null, onDone = null }) {
  const { profiles, ready, dbError, addProfile, updateProfile, deleteProfile } = useData()
  const [initial] = useState(() =>
    editId ? (profiles.find((r) => r.id === editId) ?? null) : null,
  )
  const [client, setClient] = useState(() =>
    initial ? { name: initial.name, phone: initial.phone } : { name: '', phone: '' },
  )
  const [garments, setGarments] = useState(() =>
    initial ? garmentsFromRecord(initial) : [newGarment()],
  )
  const [editingId, setEditingId] = useState(initial?.id ?? null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const successTimer = useRef(null)

  useEffect(() => () => clearTimeout(successTimer.current), [])

  const beginEdit = (r) => {
    setEditingId(r.id)
    setError('')
    setClient({ name: r.name, phone: r.phone })
    setGarments(garmentsFromRecord(r))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setClient({ name: '', phone: '' })
    setGarments([newGarment()])
    setError('')
  }

  const patchGarment = (id, patch) => {
    setError('')
    setGarments((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  const setValue = (g, field, value) =>
    patchGarment(g.id, { values: { ...g.values, [field]: value } })

  const changeType = (g, type) => patchGarment(g.id, { type, values: {} })

  const removeFile = (g, fileId) => {
    const file = g.files.find((f) => f.id === fileId)
    if (file?.url) URL.revokeObjectURL(file.url)
    patchGarment(g.id, { files: g.files.filter((f) => f.id !== fileId) })
  }

  const removeGarment = (id) => {
    setGarments((gs) => {
      const going = gs.find((g) => g.id === id)
      going?.files.forEach((f) => f.url && URL.revokeObjectURL(f.url))
      return gs.filter((g) => g.id !== id)
    })
  }

  const save = async (e) => {
    e.preventDefault()
    if (saving) return
    if (!client.name.trim()) {
      setError('Please enter the client name.')
      return
    }
    for (const [i, g] of garments.entries()) {
      const filled = Object.values(g.values).some((v) => String(v).trim())
      if (g.mode === 'manual' && !filled) {
        setError(`Garment ${i + 1}: enter at least one measurement.`)
        return
      }
      if (g.mode === 'upload' && g.files.length + g.existingFiles.length === 0) {
        setError(`Garment ${i + 1}: upload at least one measurement sheet.`)
        return
      }
    }

    const record = {
      id: editingId ?? crypto.randomUUID(),
      name: client.name.trim(),
      phone: client.phone.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      garments: garments.map((g) => ({
        type: typeOf(g.type).label,
        typeId: g.type,
        mode: g.mode,
        values: Object.fromEntries(
          Object.entries(g.values).filter(([, v]) => String(v).trim()),
        ),
        fileNames: [...g.existingFiles, ...g.files.map((f) => f.name)],
        notes: g.notes.trim(),
      })),
    }

    setSaving(true)
    let errMsg
    if (editingId) {
      const original = profiles.find((r) => r.id === editingId)
      errMsg = await updateProfile({ ...record, date: original?.date ?? record.date })
    } else {
      errMsg = await addProfile(record)
    }
    setSaving(false)

    if (errMsg) {
      setError(`Could not save to the database — ${errMsg}`)
      return
    }

    garments.forEach((g) => g.files.forEach((f) => f.url && URL.revokeObjectURL(f.url)))

    if (editingId && onDone) {
      onDone()
      return
    }
    setSuccess(
      editingId
        ? `Measurements updated for ${record.name}.`
        : `Measurements saved for ${record.name}.`,
    )
    setError('')
    clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccess(''), 5000)
    resetForm()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="section measure">
      <div className="measure-head">
        <p className="eyebrow">Atelier Services</p>
        <h1>Measurements</h1>
        <p className="measure-sub">
          Record a client&apos;s measurements for one or more garments — type them
          in, or upload a photo of the measurement sheet. All measurements are in
          inches.
        </p>
      </div>

      {editingId && (
        <p className="m-banner m-banner-success">
          Editing {client.name ? `${client.name}'s` : 'a'} saved profile — saving
          will update the existing record.
        </p>
      )}
      {dbError && <p className="m-banner m-banner-error">{dbError}</p>}
      {success && <p className="m-banner m-banner-success">✦ {success}</p>}
      {error && <p className="m-banner m-banner-error">{error}</p>}

      <form className="measure-form" onSubmit={save} noValidate>
        <div className="m-card">
          <h2 className="m-card-title">Client Details</h2>
          <div className="m-grid m-grid-client">
            <label className="m-field">
              <span>Client Name *</span>
              <input
                type="text"
                value={client.name}
                placeholder="e.g. Ananya Sharma"
                onChange={(e) => {
                  setError('')
                  setClient({ ...client, name: e.target.value })
                }}
              />
            </label>
            <label className="m-field">
              <span>Phone</span>
              <input
                type="tel"
                inputMode="tel"
                value={client.phone}
                placeholder="+91 98xxxxxx00"
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </label>
          </div>
        </div>

        {garments.map((g, i) => {
          const type = typeOf(g.type)
          return (
            <div className="m-card" key={g.id}>
              <div className="m-card-head">
                <h2 className="m-card-title">Garment {i + 1}</h2>
                {garments.length > 1 && (
                  <button
                    type="button"
                    className="m-remove"
                    onClick={() => removeGarment(g.id)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="m-grid m-grid-client">
                <label className="m-field">
                  <span>Garment Type</span>
                  <select value={g.type} onChange={(e) => changeType(g, e.target.value)}>
                    {GARMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="m-field">
                  <span>How would you like to add measurements?</span>
                  <div className="m-toggle" role="tablist">
                    <button
                      type="button"
                      className={g.mode === 'manual' ? 'is-active' : ''}
                      onClick={() => patchGarment(g.id, { mode: 'manual' })}
                    >
                      Type Them In
                    </button>
                    <button
                      type="button"
                      className={g.mode === 'upload' ? 'is-active' : ''}
                      onClick={() => patchGarment(g.id, { mode: 'upload' })}
                    >
                      Upload Sheet
                    </button>
                  </div>
                </div>
              </div>

              {g.mode === 'manual' ? (
                <div className="m-grid m-grid-fields">
                  {type.fields.map((field) => (
                    <label className="m-field" key={field}>
                      <span>{field}</span>
                      <div className="m-unit">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.25"
                          placeholder="0.0"
                          value={g.values[field] ?? ''}
                          onChange={(e) => setValue(g, field, e.target.value)}
                        />
                        <em>in</em>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  {g.existingFiles.length > 0 && (
                    <ul className="m-files m-files-existing">
                      {g.existingFiles.map((name) => (
                        <li key={name}>
                          <span className="m-file-icon">FILE</span>
                          <span className="m-file-name">{name}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${name}`}
                            onClick={() =>
                              patchGarment(g.id, {
                                existingFiles: g.existingFiles.filter((n) => n !== name),
                              })
                            }
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <FileDrop
                    files={g.files}
                    onAdd={(fs) => patchGarment(g.id, { files: [...g.files, ...fs] })}
                    onRemove={(fileId) => removeFile(g, fileId)}
                    title="Drop the measurement sheet here, or tap to browse"
                    hint="A photo of the handwritten sheet works — JPG, PNG or PDF"
                  />
                </div>
              )}

              <label className="m-field m-notes">
                <span>Notes (optional)</span>
                <textarea
                  rows="2"
                  placeholder="e.g. Princess cut, lining required, deliver before Nov 12"
                  value={g.notes}
                  onChange={(e) => patchGarment(g.id, { notes: e.target.value })}
                />
              </label>
            </div>
          )
        })}

        <div className="m-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setGarments((gs) => [...gs, newGarment()])}
          >
            + Add Another Garment
          </button>
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Measurements' : 'Save Measurements'}
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

      {ready && profiles.length > 0 && (
        <div className="m-saved">
          <div className="m-saved-head">
            <h2>Saved Profiles</h2>
            <p>Synced live with your Supabase database.</p>
          </div>
          <ul className="m-saved-list">
            {profiles.map((r) => (
              <li className="m-saved-card" key={r.id}>
                <div className="m-saved-top">
                  <div>
                    <strong>{r.name}</strong>
                    <span>
                      {r.phone ? `${r.phone} · ` : ''}
                      {r.date}
                    </span>
                  </div>
                  <div className="c-actions">
                    <button type="button" className="m-edit" onClick={() => beginEdit(r)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="m-remove"
                      onClick={async () => {
                        const err = await deleteProfile(r.id)
                        if (err) setError(`Could not delete — ${err}`)
                      }}
                    >
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
        </div>
      )}
    </section>
  )
}

export default Measurements
