import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSwitchChain } from 'wagmi'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { arcTestnet } from '../lib/chain'
import { appConfig } from '../lib/config'
import { ConnectWalletButton } from './ConnectWalletButton'
import { LogoMark } from './LogoMark'
import { ThemeToggle } from './ThemeToggle'
import { TxStatusToast } from './TxStatusToast'

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
      className={`rc-pill ${isTestnet ? 'rc-pill-active' : 'rc-pill-warm'}`}
    >
      <span className="rc-dot" aria-hidden="true" />
      {isTestnet ? 'Arc Testnet' : 'Network config error'}
    </span>
  )
}

export function AppShell() {
  const { configError, isWrongNetwork } = useNetworkGuard()
  const { error: switchError, isPending: isSwitching, switchChain } = useSwitchChain()

  return (
    <div className="flex min-h-screen flex-col">
      <div className="rc-preview-bar" role="note">
        <p className="rc-shell py-2">Arc Testnet preview — test USDC only · no real funds</p>
      </div>

      {configError ? (
        <div className="border-b border-rust-line bg-rust-soft" role="alert">
          <p className="rc-shell py-2 text-center text-[11px] font-semibold text-[#6f3021] dark:text-[#f0b5a2]">
            Configuration error: {configError} Wallet actions are disabled.
          </p>
        </div>
      ) : null}

      {isWrongNetwork ? (
        <div className="border-b border-rust-line bg-rust-soft" role="alert">
          <div className="rc-shell flex flex-col gap-2 py-2 text-[11px] font-semibold text-[#6f3021] dark:text-[#f0b5a2] sm:flex-row sm:items-center sm:justify-between">
            <span>Wrong Network: Please switch to Arc Testnet</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: arcTestnet.id })}
                className="rc-button rc-button-sm border-rust-line bg-paper text-rust hover:bg-rust-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitching ? 'Switching…' : 'Switch to Arc Testnet'}
              </button>
              {switchError ? (
                <span className="text-[10px] font-normal">{switchError.message}</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-line/80 bg-canvas/80 backdrop-blur-sm dark:border-line dark:bg-canvas/90">
        <div className="rc-shell flex min-h-[76px] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <Link to="/" className="flex items-center gap-2.5 text-ink">
            <LogoMark className="h-9 w-9 shrink-0" />
            <span>
              <span className="block font-display text-[23px] font-medium leading-none tracking-[-0.04em]">
                RelayCrew
              </span>
              <span className="mt-1 block max-w-[230px] text-[8px] font-bold uppercase leading-[1.35] tracking-[0.14em] text-muted">
                Escrow for Agent Workflows
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 border-t border-line/70 pt-3 lg:order-none lg:w-auto lg:flex-1 lg:justify-center lg:border-0 lg:pt-0"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rc-nav-link ${isActive ? 'rc-nav-link-active' : ''}`.trim()
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <NetworkBadge />
            </span>
            <ThemeToggle />
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="rc-app flex-1 pb-14 pt-1 sm:pt-3">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-canvas/60 dark:border-line dark:bg-canvas-deep/80">
        <div className="rc-shell flex flex-col gap-5 py-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-ink">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-xl font-medium tracking-[-0.04em]">RelayCrew</span>
            </Link>
            <p className="mt-2 max-w-sm text-[10px] leading-5 text-muted">
              Escrow for Agent Workflows. One parent escrow, a fixed specialist relay, and
              experimental Arc Testnet software.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-ink-soft">
            <Link to="/docs" className="transition-colors hover:text-forest">
              Documentation
            </Link>
            <Link to="/risk" className="transition-colors hover:text-forest">
              Risk notice
            </Link>
            {appConfig.githubUrl ? (
              <a
                href={appConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="RelayCrew public source repository"
                aria-label="RelayCrew public source repository (opens in a new tab)"
                className="transition-colors hover:text-forest"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {appConfig.pipelineAddress ? (
              <a
                href={`${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View the RelayCrew contract on Arc Testnet Explorer"
                aria-label="View the RelayCrew contract on Arc Testnet Explorer (opens in a new tab)"
                className="transition-colors hover:text-forest"
              >
                Contract <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </nav>
        </div>
        <div className="border-t border-line/70">
          <div className="rc-shell flex flex-col gap-2 py-4 text-[8px] uppercase tracking-[0.08em] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>Arc Testnet · chain {appConfig.expectedChainId}</p>
            <p>No platform fee · client is sole evaluator</p>
          </div>
        </div>
      </footer>

      <TxStatusToast />
    </div>
  )
}
