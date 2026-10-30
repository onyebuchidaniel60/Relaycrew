type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className = 'h-8 w-8' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <rect width="64" height="64" rx="14" className="fill-forest" />
      <path
        d="M17 47V31.5L32 18l15 13.5V47"
        fill="none"
        className="stroke-paper"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="47" r="4" className="fill-paper" />
      <circle cx="32" cy="18" r="4" className="fill-warm-soft" />
      <circle cx="47" cy="47" r="4" className="fill-paper" />
    </svg>
  )
}
