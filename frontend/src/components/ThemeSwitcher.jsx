import { useTheme } from '../hooks/useTheme'
export default function ThemeSwitcher() {
  const { themes, activeTheme, applyTheme } = useTheme()
  return (
    <div className="theme-switcher">
      <span className="theme-label">Thème</span>
      {themes.map(theme => (
        <button
          key={theme._id}
          className={`theme-dot ${
            activeTheme?._id === theme._id ? 'active' : ''
          }`
}
          style={{ background: theme.primaryColor }}
          onClick={() => applyTheme(theme)}
          title={theme.name}
          aria-label={`Thème ${theme.name}`}
        />
      ))}
    </div>
  )
}