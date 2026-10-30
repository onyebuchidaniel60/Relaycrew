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
        className="cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-400"
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
        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
      >
        {shortAddress(address)}
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
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Connecting…' : injectedConnector ? 'Connect Wallet' : 'No wallet detected'}
      </button>
      {error ? (
        <span className="max-w-[220px] text-right text-xs text-red-600" role="alert">
          {error.message}
        </span>
      ) : null}
    </div>
  )
}
