type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className = 'wordmark-mark' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path d="M3 19 14 10l12 4L37 4" />
      <circle cx="3" cy="19" r="2.2" />
      <circle cx="14" cy="10" r="2.2" />
      <circle cx="26" cy="14" r="2.2" />
      <circle cx="37" cy="4" r="2.2" />
    </svg>
  )
}
