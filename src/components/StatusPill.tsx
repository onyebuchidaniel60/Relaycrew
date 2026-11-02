import type { ReactNode } from 'react'
import type { StatusTone } from '../lib/pipelineDisplay'

type StatusPillProps = {
  tone?: StatusTone
  children: ReactNode
  dot?: boolean
  className?: string
}

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'chip',
  active: 'chip chip-active',
  submitted: 'chip chip-submitted',
  complete: 'chip chip-complete',
  danger: 'chip chip-refund',
  warm: 'chip chip-submitted',
}

export function StatusPill({ tone = 'neutral', children, dot = true, className = '' }: StatusPillProps) {
  return (
    <span className={`${TONE_CLASSES[tone]} ${className}`.trim()}>
      {dot ? <span className="dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
