import { useTheme } from '../context/ThemeContext'

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16.5 12.1A6.6 6.6 0 0 1 7.9 3.5 7 7 0 1 0 16.5 12.1Z" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3.1" />
      <path d="M10 2.2v1.7M10 16.1v1.7M17.8 10h-1.7M3.9 10H2.2M15.5 4.5l-1.2 1.2M5.7 14.3l-1.2 1.2M15.5 15.5l-1.2-1.2M5.7 5.7 4.5 4.5" strokeLinecap="round" />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextLabel = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextLabel} mode`}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${nextLabel} mode`}
      className="btn btn-outline btn-sm"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      <span className="sr-only"> mode</span>
    </button>
  )
}
