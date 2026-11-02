import { Link, useLocation } from 'react-router-dom'

export function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="app-main">
      <div className="wrap">
        <div className="panel overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden border border-line bg-paper-soft">
              <span className="font-display text-[clamp(5rem,13vw,8rem)] font-normal leading-none tracking-[-0.08em] text-forest/20">
                404
              </span>
              <span
                className="absolute bottom-4 left-4 font-mono text-[8px] uppercase tracking-[0.1em] text-muted"
                aria-hidden="true"
              >
                Route not found
              </span>
            </div>

            <div>
              <p className="eyebrow">404 · Off the relay</p>
              <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-normal leading-[0.98] tracking-[-0.06em] text-ink">
                This route is not part of the relay.
              </h1>
              <p className="mt-3 max-w-[520px] text-[11px] leading-6 text-muted">
                No route matches{' '}
                <span className="break-all border border-line bg-paper-soft px-2 py-1 font-mono text-[10px] text-ink">
                  {pathname}
                </span>
                . Use the header navigation or return to a known page.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link className="btn btn-primary" to="/">
                  Return home
                </Link>
                <Link className="btn btn-outline" to="/pipelines">
                  My pipelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
