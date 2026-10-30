import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { appConfig } from '../lib/config'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
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
        className="rc-button rc-button-sm cursor-not-allowed opacity-50"
      >
        Connect Wallet
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        title="Disconnect wallet"
        className="rc-button rc-button-soft rc-button-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden="true" />
        <span className="font-mono">{shortAddress(address)}</span>
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
        className="rc-button rc-button-primary rc-button-sm"
      >
        {isPending ? 'Connecting…' : injectedConnector ? 'Connect Wallet' : 'No wallet detected'}
      </button>
      {error ? (
        <span className="max-w-[220px] text-right text-[10px] leading-4 text-rust" role="alert">
          {error.message}
        </span>
      ) : null}
    </div>
  )
}
