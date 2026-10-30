import type { ReactNode } from 'react'
import type { StatusTone } from '../lib/pipelineDisplay'

type StatusPillProps = {
  tone?: StatusTone
  children: ReactNode
  dot?: boolean
  className?: string
}

export function StatusPill({ tone = 'neutral', children, dot = true, className = '' }: StatusPillProps) {
  return (
    <span className={`rc-pill rc-pill-${tone} ${className}`.trim()}>
      {dot ? <span className="rc-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
