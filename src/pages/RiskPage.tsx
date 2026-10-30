import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

const risks = [
  {
    title: 'Experimental and unaudited',
    body: 'RelayCrew is a hackathon prototype. The contract has not been independently audited. Treat every interaction as experimental software.',
  },
  {
    title: 'Irreversible USDC transfers',
    body: 'Approval pays the current provider immediately. Rejection or permitted expiry returns only the unpaid remainder to the client. Previous payouts cannot be reversed.',
  },
  {
    title: 'The client is the sole evaluator',
    body: 'There is no arbitration, appeal, or dispute mechanism. If the client misses the 24-hour review window after a submission, the pipeline can expire and the provider may remain unpaid.',
  },
  {
    title: 'Public and permanent data',
    body: 'Provider addresses, titles, briefs, budgets, and deliverable URIs are public on-chain. Never include secrets, personal data, or confidential instructions.',
  },
  {
    title: 'Testnet only',
    body: 'This preview connects to Arc Testnet and can move test USDC through the deployed contract. Do not use mainnet funds or production keys.',
  },
]

export function RiskPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Important"
        title="Risk notice"
        description="Read these limitations before creating or funding a pipeline. The client is the sole evaluator and the contract is the source of truth."
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Risk notice
          </>
        }
      />

      <div className="rc-alert rc-alert-warm mb-3">
        <strong className="font-semibold">Testnet preview.</strong> This build uses Arc Testnet and
        test USDC only. No mainnet deployment or real-USDC transaction is authorized by this
        preview.
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {risks.map((risk, index) => (
          <section key={risk.title} className="rc-card p-5 sm:p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[9px] text-sage">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="font-display text-xl font-medium tracking-[-0.035em] text-ink">
                {risk.title}
              </h2>
            </div>
            <p className="mt-2 text-[11px] leading-6 text-muted">{risk.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link to="/docs" className="rc-button rc-button-sm">
          Documentation
        </Link>
        <Link to="/create" className="rc-button rc-button-primary rc-button-sm">
          Create a pipeline
        </Link>
      </div>
    </div>
  )
}
