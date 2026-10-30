import { useTxStatus } from '../context/TxStatusContext'
import { appConfig } from '../lib/config'

const PHASE_LABELS = {
  wallet: 'Wallet Prompt',
  pending: 'Pending',
  success: 'Success',
  error: 'Error',
} as const

const PHASE_STYLES = {
  wallet: 'border-sky-300 bg-sky-50 text-sky-950',
  pending: 'border-amber-300 bg-amber-50 text-amber-950',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  error: 'border-red-300 bg-red-50 text-red-950',
} as const

export function TxStatusToast() {
  const { status, clear } = useTxStatus()
  if (!status) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border p-4 shadow-lg ${PHASE_STYLES[status.phase]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide">{PHASE_LABELS[status.phase]}</p>
          <p className="mt-1 break-words text-sm">{status.message}</p>
          {status.hash ? (
            <a
              href={`${appConfig.explorerUrl}/tx/${status.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
            >
              View transaction
            </a>
          ) : null}
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Dismiss transaction status"
          className="shrink-0 rounded-md border border-current/30 px-2 py-1 text-xs font-semibold hover:bg-white/50"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
