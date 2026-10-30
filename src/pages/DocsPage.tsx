import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { appConfig } from '../lib/config'

const plannedContents = [
  {
    title: 'Create and fund',
    body: 'How the client defines 2–5 ordered stages, sets exact budgets, and funds one parent USDC escrow.',
  },
  {
    title: 'Submit and evaluate',
    body: 'How the active provider submits a public HTTPS or IPFS deliverable and the client reviews it.',
  },
  {
    title: 'Reject and expire',
    body: 'How rejection and eligible expiry end the pipeline and refund every unpaid stage to the client.',
  },
  {
    title: 'Public data',
    body: 'Why titles, briefs, addresses, budgets, and deliverable URIs are permanent and cannot be deleted.',
  },
  {
    title: 'Exact amounts',
    body: 'How 6-decimal USDC base units, exact allowances, and the 1–100 USDC limits work in practice.',
  },
  {
    title: 'Network safety',
    body: 'The Arc Testnet versus Arc Mainnet boundary, chain IDs, and the contract address used by this preview.',
  },
]

export function DocsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Reference"
        title="Documentation"
        description="The final user and operator guide is being completed in the next phase. This preview documents the current testnet behavior and its limits."
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Documentation
          </>
        }
        action={<StatusPill tone="warm">In progress</StatusPill>}
      />

      <div className="grid items-start gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rc-card p-5 sm:p-6">
          <p className="rc-eyebrow">Planned contents</p>
          <h2 className="mt-2 font-display text-[30px] font-medium leading-none tracking-[-0.05em] text-ink">
            What the guide will cover.
          </h2>
          <p className="mt-2 max-w-[580px] text-[11px] leading-6 text-muted">
            Until the full guide is published, the live app and the risk notice remain the source of
            truth for behavior in this preview.
          </p>

          <ul className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {plannedContents.map((item, index) => (
              <li key={item.title} className="border-t border-line pt-3">
                <span className="font-mono text-[9px] text-sage">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <strong className="mt-1 block font-display text-base font-medium tracking-[-0.025em] text-ink">
                  {item.title}
                </strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-3">
          <div className="rc-card rc-card-soft p-5">
            <p className="rc-eyebrow">Current preview</p>
            <ul className="mt-3 space-y-2 text-[10px] leading-5 text-muted">
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                Arc Testnet only, chain ID {appConfig.expectedChainId}.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                Test USDC only. No real funds are accepted by this preview.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                The contract is unaudited experimental software.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                The client is the sole evaluator; there is no dispute mechanism.
              </li>
            </ul>
          </div>

          <div className="rc-warning">
            Never enter secrets in a pipeline title, brief, or deliverable URI. On-chain data is
            public and permanent.
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/risk" className="rc-button rc-button-sm">
              Risk notice
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
