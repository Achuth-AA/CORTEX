import { useState } from 'react'

function FileDrop({ files, onAdd, onRemove, title, hint }) {
  const [over, setOver] = useState(false)

  const add = (fileList) => {
    const mapped = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      isImage: f.type.startsWith('image/'),
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }))
    if (mapped.length) onAdd(mapped)
  }

  return (
    <div>
      <label
        className={`m-drop ${over ? 'is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          add(e.dataTransfer.files)
        }}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
        <strong>{title}</strong>
        <span>{hint}</span>
      </label>

      {files.length > 0 && (
        <ul className="m-files">
          {files.map((f) => (
            <li key={f.id}>
              {f.isImage ? (
                <img src={f.url} alt={f.name} />
              ) : (
                <span className="m-file-icon">PDF</span>
              )}
              <span className="m-file-name">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onRemove(f.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileDrop
