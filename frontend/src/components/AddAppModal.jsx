import { useState } from 'react'
import api from '../services/api'

const isElectron = window?.electronAPI?.isElectron === true

export default function AddAppModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name:       '',
    launchUrl:  '',
    iconUrl:    '',
    exePath:    '',
    isLocalApp: false,
  })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Ouvre l'explorateur Windows ──────────────────────
  const handlePickFile = async () => {
    if (!isElectron) return
    try {
      const file = await window.electronAPI.pickFile()
      if (!file) return
      setForm({
        name:       file.name,
        exePath:    file.exePath,
        launchUrl:  '',
        iconUrl:    '',
        isLocalApp: true,
      })
    } catch (err) {
      console.error('Erreur sélection fichier :', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    if (!form.exePath && !form.launchUrl) {
      setError('Choisissez un fichier ou entrez une URL')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/apps', {
        name:       form.name,
        launchUrl:  form.launchUrl,
        iconUrl:    form.iconUrl,
        exePath:    form.exePath,
        isLocalApp: form.isLocalApp,
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Ajouter une application</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>

          {/* Bouton parcourir — Electron seulement */}
          {isElectron && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePickFile}
              style={{ width: '100%' }}
            >
               Parcourir — choisir un .exe
            </button>
          )}

          {/* Chemin sélectionné */}
          {form.exePath && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(108,99,255,0.08)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              wordBreak: 'break-all'
            }}>
               {form.exePath}
            </div>
          )}

          {/* Séparateur */}
          {isElectron && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--color-border)'
              }} />
              <span style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)'
              }}>
                ou entrez manuellement
              </span>
              <hr style={{
                flex: 1,
                border: 'none',
                borderTop: '1px solid var(--color-border)'
              }} />
            </div>
          )}

          <input
            placeholder="Nom de l'application *"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />

          {!form.exePath && (
            <input
              placeholder="URL de lancement (ex: https://notion.so)"
              value={form.launchUrl}
              onChange={e => set('launchUrl', e.target.value)}
            />
          )}

          <input
            placeholder="URL de l'icône (optionnel)"
            value={form.iconUrl}
            onChange={e => set('iconUrl', e.target.value)}
          />

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-text-muted)'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}