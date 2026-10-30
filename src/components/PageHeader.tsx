import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: ReactNode
  description: ReactNode
  action?: ReactNode
  breadcrumb?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <header className="rc-page-head">
      <div className="max-w-[760px]">
        {breadcrumb ? <p className="rc-breadcrumb">{breadcrumb}</p> : null}
        <p className="rc-eyebrow">{eyebrow}</p>
        <h1 className="rc-page-title">{title}</h1>
        <p className="mt-4 max-w-[610px] text-[13px] leading-6 text-muted sm:text-sm sm:leading-7">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
