import { useEffect, useId, useRef, type ReactNode } from 'react'

type ConfirmDetail = {
  label: string
  value: string
}

type ConfirmDialogProps = {
  title: string
  description: ReactNode
  details?: ConfirmDetail[]
  confirmLabel: string
  confirmTone?: 'primary' | 'danger' | 'warm'
  note?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

const TONE_CLASSES = {
  primary: 'rc-button-primary',
  danger: 'rc-button-rust',
  warm: 'rc-button-warm',
} as const

export function ConfirmDialog({
  title,
  description,
  details = [],
  confirmLabel,
  confirmTone = 'primary',
  note,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="rc-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="p-5 sm:p-6">
        <p className="rc-eyebrow">Irreversible on-chain action</p>
        <h2
          id={titleId}
          className="mt-2 font-display text-[clamp(1.65rem,4vw,2rem)] font-medium leading-[1.02] tracking-[-0.045em] text-ink"
        >
          {title}
        </h2>
        <div className="mt-3 text-[11px] leading-6 text-muted">{description}</div>

        {details.length > 0 ? (
          <dl className="mt-4 border-t border-line">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between gap-4 border-b border-line py-2 text-[10px]"
              >
                <dt className="text-muted">{detail.label}</dt>
                <dd className="text-right font-mono text-[9px] font-medium text-ink">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {note ? <div className="rc-warning mt-4">{note}</div> : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="rc-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`rc-button ${TONE_CLASSES[confirmTone]}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>

        <p className="mt-3 text-center text-[9px] leading-4 text-muted-light">
          The app never signs for you. Confirm the network, recipient, and exact amount in your
          wallet.
        </p>
      </div>
    </dialog>
  )
}
