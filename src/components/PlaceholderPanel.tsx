import type { ReactNode } from 'react'

type PlaceholderPanelProps = {
  title: string
  children: ReactNode
}

export function PlaceholderPanel({ title, children }: PlaceholderPanelProps) {
  return (
    <section className="rc-card rc-card-soft p-6">
      <span className="rc-pill rc-pill-warm">
        <span className="rc-dot" aria-hidden="true" />
        Placeholder
      </span>
      <h2 className="mt-4 font-display text-2xl font-medium tracking-[-0.04em] text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-[11px] leading-6 text-muted">{children}</div>
    </section>
  )
}
