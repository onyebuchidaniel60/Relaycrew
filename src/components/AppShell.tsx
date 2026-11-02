import { Link, NavLink, Outlet } from 'react-router-dom'
import { useSwitchChain } from 'wagmi'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { appConfig } from '../lib/config'
import { ConnectWalletButton } from './ConnectWalletButton'
import { LogoMark } from './LogoMark'
import { ThemeToggle } from './ThemeToggle'
import { TxStatusToast } from './TxStatusToast'

const navItems = [
  { to: '/', label: 'Product', end: true },
  { to: '/create', label: 'Create' },
  { to: '/pipelines', label: 'Pipelines' },
  { to: '/docs', label: 'Docs' },
  { to: '/risk', label: 'Risk' },
]

function NetworkBadge() {
  const isReady = appConfig.isValid

  return (
    <span
      className="network-chip"
      title={`Chain ID ${appConfig.expectedChainId}`}
      aria-label={`Network: ${isReady ? appConfig.networkLabel : 'configuration error'}`}
    >
      {isReady ? appConfig.networkLabel : 'Config error'}
    </span>
  )
}

export function AppShell() {
  const { configError, isWrongNetwork } = useNetworkGuard()
  const { error: switchError, isPending: isSwitching, switchChain } = useSwitchChain()

  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="review-strip" role="note">
        <div className="wrap">
          <span className="strip-left">
            <span className="strip-dot" aria-hidden="true" />
            {appConfig.isMainnet
              ? 'Arc Mainnet · real USDC'
              : 'Arc Testnet preview · test USDC only'}
          </span>
          <span className="strip-right">
            {appConfig.isMainnet
              ? 'Verify every transaction before signing'
              : 'Wallet actions require Arc Testnet'}
          </span>
        </div>
      </div>

      {configError ? (
        <div className="border-b border-rust-line bg-rust-soft" role="alert">
          <p className="wrap py-2 text-center text-[11px] font-semibold text-rust">
            Configuration error: {configError} Wallet actions are disabled.
          </p>
        </div>
      ) : null}

      {isWrongNetwork ? (
        <div className="border-b border-rust-line bg-rust-soft" role="alert">
          <div className="wrap flex flex-col gap-2 py-2 text-[11px] font-semibold text-rust sm:flex-row sm:items-center sm:justify-between">
            <span>Wrong Network: Please switch to {appConfig.networkLabel}</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: appConfig.expectedChainId })}
                className="btn btn-outline btn-sm border-rust-line bg-paper text-rust hover:bg-rust-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitching ? 'Switching…' : `Switch to ${appConfig.networkLabel}`}
              </button>
              {switchError ? (
                <span className="text-[10px] font-normal">{switchError.message}</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <header className="site-head">
        <div className="wrap head-inner">
          <Link className="wordmark" to="/" aria-label="RelayCrew home">
            <LogoMark />
            <span>
              RelayCrew
              <small>Escrow for agent workflows</small>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="head-actions">
            <span className="hidden sm:inline-flex">
              <NetworkBadge />
            </span>
            <ThemeToggle />
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="site-foot">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <Link className="wordmark" to="/" aria-label="RelayCrew home">
                <LogoMark />
                <span>
                  RelayCrew
                  <small>Escrow for agent workflows</small>
                </span>
              </Link>
              <p>A fixed sequence of specialist agents, funded once and settled in order.</p>
              <span className="foot-network">
                {appConfig.networkLabel} · USDC · chain {appConfig.expectedChainId}
              </span>
            </div>

            <div className="foot-col">
              <h3>Product</h3>
              <Link to="/">Product overview</Link>
              <Link to="/create">Create a pipeline</Link>
              <Link to="/pipelines">My pipelines</Link>
            </div>

            <div className="foot-col">
              <h3>Protocol</h3>
              <Link to="/docs">Documentation</Link>
              <Link to="/risk">Risk notice</Link>
              {appConfig.githubUrl ? (
                <a
                  href={appConfig.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="RelayCrew public source repository"
                  aria-label="RelayCrew public source repository (opens in a new tab)"
                >
                  Source repository <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>

            <div className="foot-col">
              <h3>Record</h3>
              {appConfig.pipelineAddress ? (
                <a
                  href={`${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View the RelayCrew contract on ${appConfig.explorerName}`}
                  aria-label={`View the RelayCrew contract on ${appConfig.explorerName} (opens in a new tab)`}
                >
                  Coordinator contract <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span>Contract · not configured</span>
              )}
              <span>Network · {appConfig.networkLabel}</span>
              <span>Settlement · USDC · 6 decimals</span>
              <span>Fee · 0.00</span>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 RelayCrew · Escrow for Agent Workflows</span>
            <span className="foot-legal">
              <span>No platform fee</span>
              <span>Client is sole evaluator</span>
              <span>Experimental software</span>
            </span>
          </div>
        </div>
      </footer>

      <TxStatusToast />
    </div>
  )
}
