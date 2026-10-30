import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="404"
        title="Page not found"
        description="This route is not part of the Phase 4 preview."
      />

      <PlaceholderPanel title="Not Found">
        <p>
          No route matches{' '}
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
            {pathname}
          </span>
          .
        </p>
        <p>Use the navigation above or return to the home placeholder.</p>
      </PlaceholderPanel>

      <Link
        to="/"
        className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Return home
      </Link>
    </div>
  )
}
