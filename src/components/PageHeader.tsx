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
    <header className="app-head">
      <div>
        {breadcrumb ? <p className="breadcrumb">{breadcrumb}</p> : null}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="app-sub">
          <span>{description}</span>
        </p>
      </div>
      {action ? <div className="app-head-actions">{action}</div> : null}
    </header>
  )
}
