import { useTxStatus } from '../context/TxStatusContext'
import { appConfig } from '../lib/config'

const PHASE_LABELS = {
  wallet: 'Wallet Prompt',
  pending: 'Pending',
  success: 'Success',
  error: 'Error',
} as const

const PHASE_STYLES = {
  wallet: 'border-line-strong bg-paper text-ink',
  pending: 'border-warm-line bg-warm-soft text-warm-ink',
  success: 'border-forest-line bg-forest-soft text-forest',
  error: 'border-rust-line bg-rust-soft text-[#6f3021] dark:text-[#f0b5a2]',
} as const

export function TxStatusToast() {
  const { status, clear } = useTxStatus()
  if (!status) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-[3px] border p-4 shadow-paper-hover ${PHASE_STYLES[status.phase]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em]">{PHASE_LABELS[status.phase]}</p>
          <p className="mt-1 break-words text-[11px] leading-5">{status.message}</p>
          {status.hash ? (
            <a
              href={`${appConfig.explorerUrl}/tx/${status.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rc-link mt-2 inline-block text-[10px]"
            >
              View transaction ↗
            </a>
          ) : null}
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Dismiss transaction status"
          className="shrink-0 rounded-[2px] border border-current/30 px-2 py-1 text-[9px] font-semibold transition-colors hover:bg-paper/60"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
