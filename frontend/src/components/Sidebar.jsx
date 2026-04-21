import { NavLink } from 'react-router-dom'

const NAV = [
  { path: '/',          label: 'Toutes les apps', icon: '▦' },
  { path: '/favorites', label: 'Favoris',          icon: '★' },
  { path: '/settings',  label: 'Paramètres',       icon: '⚙' },
]

export default function Sidebar({ categories = [] }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {categories.length > 0 && (
        <div className="sidebar-categories">
          <span className="section-label">Catégories</span>
          {categories.map(cat => (
            <div key={cat._id} className="cat-item">
              <span
                className="cat-dot"
                style={{ background: cat.color }}
              />
              {cat.name}
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}