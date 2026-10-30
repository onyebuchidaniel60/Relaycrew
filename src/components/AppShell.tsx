import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/create', label: 'Create' },
  { to: '/pipelines', label: 'Pipelines' },
  { to: '/docs', label: 'Docs' },
  { to: '/risk', label: 'Risk' },
]

function NetworkBadge() {
  const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isTestnet
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${isTestnet ? 'bg-emerald-500' : 'bg-amber-500'}`}
      />
      {isTestnet ? 'Arc Testnet' : 'Network not configured'}
    </span>
  )
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="border-b border-amber-300 bg-amber-100">
        <p
          className="mx-auto w-full max-w-5xl px-4 py-2 text-center text-sm font-semibold text-amber-950"
          role="note"
        >
          Preview shell — on-chain actions not connected yet
        </p>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-900">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
              >
                RC
              </span>
              <span className="text-lg font-bold tracking-tight">RelayCrew</span>
            </Link>
            <NetworkBadge />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              disabled
              title="Wallet connection is not enabled in the Phase 1 preview."
              className="cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-400"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>RelayCrew — Phase 1 preview shell.</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
            <Link
              to="/docs"
              className="font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              Documentation
            </Link>
            <Link
              to="/risk"
              className="font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              Risk Notice
            </Link>
            <span className="text-slate-400">GitHub repo pending</span>
          </nav>
        </div>
      </footer>
    </div>
  )
}
