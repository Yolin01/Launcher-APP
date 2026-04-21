import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { createTheme, updateTheme, deleteTheme } from '../services/themeService'
import { useNavigate } from 'react-router-dom'

const DEFAULT_FORM = {
  name: '',
  primaryColor: '#6C63FF',
  secondaryColor: '#FF6584',
  bgColor: '#F7F8FC',
  fontFamily: 'Inter',
  isDark: false
}

export default function SettingsPage() {
  const navigate = useNavigate()  // ← manquait cette ligne
  const { themes, activeTheme, applyTheme, refreshThemes } = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [editing, setEditing] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (editing) {
      await updateTheme(editing, form)
      setEditing(null)
    } else {
      await createTheme(form)
    }
    setForm(DEFAULT_FORM)
    refreshThemes()
  }

  const handleEdit = (theme) => {
    setEditing(theme._id)
    setForm({
      name:           theme.name,
      primaryColor:   theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      bgColor:        theme.bgColor,
      fontFamily:     theme.fontFamily,
      isDark:         theme.isDark
    })
  }

  const handleDelete = async (id) => {
    await deleteTheme(id)
    refreshThemes()
  }

  return (
    <div className="settings-page">

      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '20px',
          padding: '0'
        }}
      >
        ← Retour au dashboard
      </button>

      <h2>{editing ? 'Modifier le thème' : 'Nouveau thème'}</h2>

      <div className="theme-form">
        <input
          type="text"
          placeholder="Nom du thème"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
        <label>
          Couleur primaire
          <input
            type="color"
            value={form.primaryColor}
            onChange={e => set('primaryColor', e.target.value)}
          />
        </label>
        <label>
          Couleur de fond
          <input
            type="color"
            value={form.bgColor}
            onChange={e => set('bgColor', e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.isDark}
            onChange={e => set('isDark', e.target.checked)}
          />
          Mode sombre
        </label>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handleSave}>
            {editing ? 'Mettre à jour' : 'Créer le thème'}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(DEFAULT_FORM) }}>
              Annuler
            </button>
          )}
        </div>
      </div>

      <h3>Mes thèmes</h3>
      <div className="theme-list">
        {themes.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Aucun thème créé. Créez votre premier thème ci-dessus !
          </p>
        )}
        {themes.map(t => (
          <div
            key={t._id}
            className={`theme-row ${activeTheme?._id === t._id ? 'active' : ''}`}
          >
            <span
              className="preview-dot"
              style={{ background: t.primaryColor }}
            />
            <span>{t.name}</span>
            <button onClick={() => applyTheme(t)}>Appliquer</button>
            <button onClick={() => handleEdit(t)}>Modifier</button>
            <button onClick={() => handleDelete(t._id)}>✕</button>
          </div>
        ))}
      </div>

    </div>
  )
}