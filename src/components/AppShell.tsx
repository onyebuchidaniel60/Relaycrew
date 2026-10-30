import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSwitchChain } from 'wagmi'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { arcTestnet } from '../lib/chain'
import { appConfig } from '../lib/config'
import { ConnectWalletButton } from './ConnectWalletButton'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/create', label: 'Create' },
  { to: '/pipelines', label: 'Pipelines' },
  { to: '/docs', label: 'Docs' },
  { to: '/risk', label: 'Risk' },
]

function NetworkBadge() {
  const isTestnet = appConfig.networkMode === 'testnet' && appConfig.isValid

  return (
    <span
      title={`Chain ID ${appConfig.expectedChainId}`}
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
      {isTestnet ? 'Arc Testnet' : 'Network config error'}
    </span>
  )
}

export function AppShell() {
  const { configError, isWrongNetwork } = useNetworkGuard()
  const { error: switchError, isPending: isSwitching, switchChain } = useSwitchChain()

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

      {configError ? (
        <div className="border-b border-red-300 bg-red-50" role="alert">
          <p className="mx-auto w-full max-w-5xl px-4 py-2 text-center text-sm font-semibold text-red-900">
            Configuration error: {configError} Wallet actions are disabled.
          </p>
        </div>
      ) : null}

      {isWrongNetwork ? (
        <div className="border-b border-red-300 bg-red-50" role="alert">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-2 text-sm font-semibold text-red-900 sm:flex-row sm:items-center sm:justify-between">
            <span>Wrong Network: Please switch to Arc Testnet</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: arcTestnet.id })}
                className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitching ? 'Switching…' : 'Switch to Arc Testnet'}
              </button>
              {switchError ? <span className="text-xs font-normal">{switchError.message}</span> : null}
            </div>
          </div>
        </div>
      ) : null}

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

            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>RelayCrew — Phase 2 foundation preview.</p>
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
