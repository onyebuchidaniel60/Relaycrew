import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { appConfig } from '../lib/config'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12" />
      <path d="M16 12h4v4h-4a2 2 0 0 1 0-4Z" />
    </svg>
  )
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const injectedConnector = connectors.find((connector) => connector.id === 'injected') ?? connectors[0]

  if (!appConfig.isValid) {
    return (
      <button
        type="button"
        disabled
        title={appConfig.configError ?? 'Chain configuration is invalid.'}
        className="btn btn-sm cursor-not-allowed opacity-50"
      >
        Connect wallet
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        title="Disconnect wallet"
        className="wallet-chip"
      >
        <WalletIcon />
        <span>{shortAddress(address)}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={!injectedConnector || isPending}
        onClick={() => {
          if (injectedConnector) {
            connect({ connector: injectedConnector })
          }
        }}
        className="btn btn-primary btn-sm"
      >
        {isPending ? 'Connecting…' : injectedConnector ? 'Connect wallet' : 'No wallet detected'}
      </button>
      {error ? (
        <span className="max-w-[220px] text-right text-[10px] leading-4 text-rust" role="alert">
          {error.message}
        </span>
      ) : null}
    </div>
  )
}
