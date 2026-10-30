import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { appConfig } from '../lib/config'

const risks = [
  {
    title: 'Experimental and unaudited',
    body: 'RelayCrew is a hackathon prototype. The contract has been implemented and deployed to Arc Testnet, but it has not been independently audited. Treat every interaction as experimental software and do not risk funds you cannot afford to lose.',
  },
  {
    title: 'USDC transfers are irreversible',
    body: 'Approval pays the current provider immediately. Rejection or permitted expiry returns only the unpaid remainder to the client. Previous payouts cannot be reversed by RelayCrew, the client, the operator, or the contract.',
  },
  {
    title: 'The client is the sole evaluator',
    body: 'There is no arbitration, appeal, independent quality review, or dispute mechanism. The client alone decides whether to approve or reject a submitted stage. Do not rely on fairness guarantees or third-party intervention.',
  },
  {
    title: 'Evaluator non-response causes expiry and refund',
    body: 'If the client does not approve or reject within 24 hours after a submission, the evaluation deadline passes. Any wallet can then expire the pipeline. All unpaid escrow is refunded to the client, and the provider may remain unpaid for the submitted work.',
  },
  {
    title: 'Public and permanent data',
    body: 'Provider addresses, titles, briefs, budgets, deliverable URIs, and transaction data are public on chain and permanent. Never enter secrets, personal data, credentials, confidential instructions, or private document URLs.',
  },
  {
    title: 'No admin rescue or upgrade',
    body: 'The contract has no owner role, admin withdrawal, rescue function, pause, or upgrade path. An incorrect provider address, stage order, or budget cannot be edited after funding, and a completed payout cannot be reversed.',
  },
]

const outcomes = [
  ['Client approves', 'The provider is paid and the next specialist becomes active in the same transaction. Final approval completes the pipeline.'],
  ['Client rejects', 'The pipeline ends. The current provider is not paid for that stage; all unpaid escrow returns to the client.'],
  ['Client misses the 24h review', 'The evaluation deadline passes. Anyone may expire the pipeline; unpaid escrow returns to the client.'],
  ['Provider misses the work deadline', 'The work deadline passes. Anyone may expire the pipeline; unpaid escrow returns to the client.'],
]

export function RiskPage() {
  const contractHref = appConfig.pipelineAddress
    ? `${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`
    : undefined

  return (
    <div>
      <PageHeader
        eyebrow="Important"
        title="Risk notice"
        description="Escrow for Agent Workflows. Read these limitations before creating or funding a pipeline. The client is the sole evaluator, transfers are irreversible, and on-chain data is public."
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Risk notice
          </>
        }
        action={<StatusPill tone="warm">Read before funding</StatusPill>}
      />

      <div className="rc-alert rc-alert-warm mb-3">
        <strong className="font-semibold">Arc Testnet preview.</strong> This build uses test USDC
        only. No mainnet deployment or real-USDC transaction is authorized by this preview. Do not
        send real funds to this app.
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <section className="rc-card p-5 sm:p-6">
            <p className="rc-eyebrow">Before you sign</p>
            <h2 className="mt-2 font-display text-[30px] font-medium leading-none tracking-[-0.05em] text-ink">
              Check the money and the roles.
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Network', 'The wallet is on Arc Testnet, chain 5042002. The app blocks writes on another chain.'],
                ['Recipients', 'Every provider address and stage order is correct. They cannot be changed after funding.'],
                ['Amounts', 'The exact total is within the 1–100 USDC pipeline bounds and each stage is at least 1 USDC.'],
                ['Data', 'Everyone accepts that titles, briefs, addresses, budgets, and deliverable URIs are public and permanent.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-2 border-t border-line pt-3">
                  <span aria-hidden="true" className="mt-0.5 text-forest">
                    ✓
                  </span>
                  <div>
                    <strong className="block text-[10px] font-bold text-ink">{title}</strong>
                    <span className="mt-0.5 block text-[10px] leading-5 text-muted">{body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            {risks.map((risk, index) => (
              <section key={risk.title} className="rc-card p-5 sm:p-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[9px] text-sage">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-display text-xl font-medium leading-tight tracking-[-0.035em] text-ink">
                    {risk.title}
                  </h2>
                </div>
                <p className="mt-2 text-[11px] leading-6 text-muted">{risk.body}</p>
              </section>
            ))}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <div className="rc-card rc-card-soft p-5">
            <p className="rc-eyebrow">What happens if…</p>
            <dl className="mt-3 grid gap-3">
              {outcomes.map(([title, body]) => (
                <div key={title} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <dt className="text-[10px] font-bold text-ink">{title}</dt>
                  <dd className="mt-1 text-[10px] leading-5 text-muted">{body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rc-warning">
            If a stage is rejected or expired, the refund recipient is fixed to the client. The
            caller of an expiry never receives the refund.
          </div>

          {contractHref ? (
            <div className="rc-card p-5">
              <p className="rc-eyebrow">Inspect the contract</p>
              <p className="mt-2 break-all font-mono text-[9px] leading-5 text-ink">
                {appConfig.pipelineAddress}
              </p>
              <a
                href={contractHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rc-link mt-2 inline-block text-[10px]"
              >
                Arc Testnet Explorer ↗
              </a>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Link to="/docs" className="rc-button rc-button-sm">
              Read the user guide
            </Link>
            <Link to="/create" className="rc-button rc-button-primary rc-button-sm">
              Create a pipeline
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
