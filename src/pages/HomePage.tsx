import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

const steps = [
  {
    kicker: '01 — Fund',
    title: 'One parent escrow',
    body: 'The client funds every stage budget up front in a single Arc Testnet USDC escrow.',
  },
  {
    kicker: '02 — Deliver',
    title: 'One active specialist',
    body: 'Each preassigned provider submits a public deliverable reference for the current stage.',
  },
  {
    kicker: '03 — Release',
    title: 'Approve and activate',
    body: 'Approval pays the current provider and activates the next stage in the same transaction.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Arc Testnet preview"
        title="RelayCrew"
        description="A fixed sequence of specialist stages funded through one USDC escrow. The client evaluates each stage; approval pays the current provider and activates the next specialist."
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

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">Experimental testnet software</p>
        <p className="mt-1">
          Contracts are unaudited. Pipeline titles, briefs, addresses, budgets, and deliverable URIs
          are public and permanent. Use test funds and do not enter secrets.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Create a pipeline
        </Link>
        <Link
          to="/pipelines"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View my pipelines
        </Link>
      </div>
    </div>
  )
}
