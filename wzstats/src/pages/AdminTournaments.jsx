import { useEffect, useState } from 'react'
import { fetchRows, insertRow, updateRows } from '../lib/supabaseRest'
import '../styles/AdminTournaments.css'

const TABLE_NAME = 'tournaments'

const INITIAL_FORM = {
  Name: '',
  SheetLink: '',
  TournamentType: '',
  TournamentHost: '',
  Format: '',
  PrizePool: '0',
  MatchPointThreshhold: '',
}

const selectColumns =
  'id,"Name","Sheet Link","Tournament Type","Tournament Host","Format","Prize Pool","Match Point Threshhold"'

function mapRowToForm(row) {
  return {
    Name: row?.Name ?? '',
    SheetLink: row?.['Sheet Link'] ?? '',
    TournamentType: row?.['Tournament Type'] ?? '',
    TournamentHost: row?.['Tournament Host'] ?? '',
    Format: row?.Format ?? '',
    PrizePool: String(row?.['Prize Pool'] ?? 0),
    MatchPointThreshhold: row?.['Match Point Threshhold'] == null ? '' : String(row['Match Point Threshhold']),
  }
}

function mapFormToPayload(form) {
  const parsedPrizePool = Number(form.PrizePool)
  const parsedThreshold = form.MatchPointThreshhold === '' ? null : Number(form.MatchPointThreshhold)

  return {
    Name: form.Name.trim() || null,
    'Sheet Link': form.SheetLink.trim() || null,
    'Tournament Type': form.TournamentType.trim() || null,
    'Tournament Host': form.TournamentHost.trim() || null,
    Format: form.Format.trim() || null,
    'Prize Pool': Number.isFinite(parsedPrizePool) ? parsedPrizePool : 0,
    'Match Point Threshhold': Number.isFinite(parsedThreshold) ? parsedThreshold : null,
  }
}

function AdminTournaments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(INITIAL_FORM)

  const loadRows = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchRows(TABLE_NAME, {
        select: selectColumns,
        order: { column: '"Name"', ascending: true },
      })
      setRows(Array.isArray(data) ? data : [])
    } catch (loadError) {
      setError(loadError.message || 'Failed to load tournaments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectExisting = (event) => {
    const selectedId = event.target.value
    setEditingId(selectedId)
    setSuccess('')
    setError('')

    if (!selectedId) {
      setForm(INITIAL_FORM)
      return
    }

    const selectedRow = rows.find((row) => row.id === selectedId)
    setForm(mapRowToForm(selectedRow))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const payload = mapFormToPayload(form)

    try {
      if (editingId) {
        const updated = await updateRows(TABLE_NAME, payload, { filters: { id: editingId } })
        if (!updated?.length) {
          throw new Error('No rows were updated. Check row-level permissions for updates.')
        }
        setSuccess('Tournament updated successfully.')
      } else {
        await insertRow(TABLE_NAME, payload)
        setSuccess('Tournament added successfully.')
      }

      await loadRows()

      if (!editingId) {
        setForm(INITIAL_FORM)
      }
    } catch (saveError) {
      setError(saveError.message || 'Failed to save tournament.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-tournaments">
      <header className="admin-tournaments__header">
        <h1>Admin: Tournaments</h1>
        <p>Add a new tournament or edit an existing tournament record.</p>
      </header>

      <form className="admin-tournaments__form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Editing</span>
          <select value={editingId} onChange={handleSelectExisting}>
            <option value="">Create New Tournament</option>
            {rows.map((row) => (
              <option key={row.id} value={row.id}>
                {row.Name || row.id}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Name</span>
          <input name="Name" value={form.Name} onChange={handleChange} placeholder="Tournament name" />
        </label>

        <label className="admin-field">
          <span>Sheet Link</span>
          <input
            name="SheetLink"
            value={form.SheetLink}
            onChange={handleChange}
            placeholder="https://docs.google.com/..."
          />
        </label>

        <label className="admin-field">
          <span>Tournament Type</span>
          <select name="TournamentType" value={form.TournamentType} onChange={handleChange}>
            <option value="">Select type</option>
            <option value="Major">Major</option>
            <option value="Scrim">Scrim</option>
            <option value="Fun">Fun</option>
          </select>
        </label>

        <label className="admin-field">
          <span>Tournament Host</span>
          <input name="TournamentHost" value={form.TournamentHost} onChange={handleChange} />
        </label>

        <label className="admin-field">
          <span>Format</span>
          <input name="Format" value={form.Format} onChange={handleChange} />
        </label>

        <label className="admin-field">
          <span>Prize Pool</span>
          <input
            name="PrizePool"
            value={form.PrizePool}
            onChange={handleChange}
            type="number"
            min="0"
            step="1"
          />
        </label>

        <label className="admin-field">
          <span>Match Point Threshhold</span>
          <input
            name="MatchPointThreshhold"
            value={form.MatchPointThreshhold}
            onChange={handleChange}
            type="number"
            min="0"
            step="1"
          />
        </label>

        <div className="admin-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Tournament' : 'Add Tournament'}
          </button>

          {editingId ? (
            <button
              type="button"
              className="admin-actions__secondary"
              onClick={() => {
                setEditingId('')
                setForm(INITIAL_FORM)
                setError('')
                setSuccess('')
              }}
            >
              Switch To Create
            </button>
          ) : null}
        </div>

        {error ? <p className="admin-message admin-message--error">{error}</p> : null}
        {success ? <p className="admin-message admin-message--success">{success}</p> : null}
      </form>

      <section className="admin-tournaments__list">
        <h2>Existing Tournaments</h2>
        {loading ? <p>Loading tournaments...</p> : null}
        {!loading && rows.length === 0 ? <p>No tournaments found.</p> : null}
        {!loading && rows.length > 0 ? (
          <ul>
            {rows.map((row) => (
              <li key={row.id}>
                <span>{row.Name || '(Unnamed tournament)'}</span>
                <code>{row.id}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </section>
  )
}

export default AdminTournaments
