import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

const steps = [
  {
    kicker: '01 — Fund',
    title: 'One parent escrow',
    body: 'The client will fund every stage budget up front in a single Arc Testnet USDC escrow.',
  },
  {
    kicker: '02 — Deliver',
    title: 'One active specialist',
    body: 'Each preassigned provider will submit a public deliverable reference for the current stage.',
  },
  {
    kicker: '03 — Release',
    title: 'Approve and activate',
    body: 'Approval will pay the current provider and activate the next stage in the same transaction.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Phase 1 preview"
        title="RelayCrew"
        description="A fixed sequence of specialist stages funded through one Arc Testnet USDC escrow. This shell establishes navigation and structure only."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {step.kicker}
            </p>
            <h2 className="mt-2 font-semibold text-slate-900">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
          </div>
        ))}
      </div>

      <PlaceholderPanel title="Home Placeholder">
        <p>
          The final home screen will explain the product, network mode, and the complete pipeline
          lifecycle. No live pipeline data is loaded in Phase 1.
        </p>
      </PlaceholderPanel>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Open Create placeholder
        </Link>
        <Link
          to="/pipelines"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open Pipelines placeholder
        </Link>
      </div>
    </div>
  )
}
