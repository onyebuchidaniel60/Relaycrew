import type { ReactNode } from 'react'

type PlaceholderPanelProps = {
  title: string
  children: ReactNode
}

export function PlaceholderPanel({ title, children }: PlaceholderPanelProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Placeholder
      </span>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  )
}
