import { useState } from 'react'

const isElectron = window?.electronAPI?.isElectron === true
const isMongoId  = (id) => /^[a-f0-9]{24}$/.test(String(id))

export default function AppCard({ app, onLaunch, onToggleFav, onHide }) {
  const [hovered, setHovered] = useState(false)

  const handleLaunch = () => {
    if (app.isLocalApp && app.exePath && isElectron) {
      window.electronAPI.launchExe(app.exePath)
      return
    }
    if (app.launchUrl) {
      if (onLaunch) onLaunch(app._id)
      window.open(app.launchUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleFav = (e) => {
    e.stopPropagation()
    if (onToggleFav && isMongoId(app._id)) onToggleFav(app._id)
  }

  const handleHide = (e) => {
    e.stopPropagation()
    if (onHide && isMongoId(app._id)) onHide(app._id)
  }

  const canAct = isMongoId(app._id)

  return (
    <div
      className={`app-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleLaunch}
      role="button"
      tabIndex={0}
      title={app.name}
    >
      {app.isPinned && <span className="pin-badge">★</span>}
      {app.isLocalApp && (
        <span className="local-badge" title="Application Windows">💻</span>
      )}

      <img
        src={app.iconUrl || '/default-icon.png'}
        alt={app.name}
        className="app-icon"
        onError={e => { e.target.src = '/default-icon.png' }}
      />

      <span className="app-name">{app.name}</span>

      {hovered && canAct && (
        <div className="card-actions">
          <button className="action-btn pin" onClick={handleFav}>
            {app.isPinned ? '★ Retirer' : '★ Épingler'}
          </button>
          <button className="action-btn hide" onClick={handleHide}>
             Masquer
          </button>
        </div>
      )}
    </div>
  )
}