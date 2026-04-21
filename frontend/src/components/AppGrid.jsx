import AppCard from './AppCard'

export default function AppGrid({ apps, onLaunch, onToggleFav, onHide }) {
  if (!apps?.length) {
    return (
      <div className="empty-state">
        <p>Aucune application trouvée.</p>
        <p>Ajoutez votre première application !</p>
      </div>
    )
  }

  return (
    <div className="app-grid">
      {apps.map(app => (
        <AppCard
          key={app._id}
          app={app}
          onLaunch={onLaunch}
          onToggleFav={onToggleFav}
          onHide={onHide}
        />
      ))}
    </div>
  )
}