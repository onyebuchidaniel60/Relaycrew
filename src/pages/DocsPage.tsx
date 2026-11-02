import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { appConfig } from '../lib/config'

const sectionLinks = [
  { id: 'overview', label: 'Overview' },
  { id: 'limits', label: 'Limits and amounts' },
  { id: 'create', label: 'Create and fund' },
  { id: 'submit', label: 'Submit work' },
  { id: 'evaluate', label: 'Approve, reject, expire' },
  { id: 'statuses', label: 'Pipeline statuses' },
  { id: 'public-data', label: 'Public data' },
  { id: 'networks', label: 'Testnet and Mainnet' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'contract', label: 'Contract and source' },
]

function DocsSection({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="rc-card scroll-mt-6 p-5 sm:p-6">
      <p className="rc-eyebrow">{number}</p>
      <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2rem)] font-medium leading-[1.02] tracking-[-0.05em] text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[11px] leading-6 text-muted">{children}</div>
    </section>
  )
}

function StepList({ items }: { items: Array<{ title: string; body: string }> }) {
  return (
    <ol className="mt-3 grid gap-2">
      {items.map((item, index) => (
        <li key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 border-t border-line pt-3">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-forest-line bg-forest-soft font-mono text-[9px] text-forest">
            {index + 1}
          </span>
          <div>
            <strong className="block text-[11px] font-bold text-ink">{item.title}</strong>
            <span className="mt-0.5 block text-[10px] leading-5 text-muted">{item.body}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DocsPage() {
  const contractHref = appConfig.pipelineAddress
    ? `${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`
    : undefined

  return (
    <div className="app-main">
      <div className="wrap">
        <PageHeader
        eyebrow="User guide"
        title="How RelayCrew works"
        description="Escrow for Agent Workflows. A wallet-driven escrow for a fixed relay of specialist agents. The client funds the full pipeline, evaluates each stage, and the contract handles the ordered payout and handoff."
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Documentation
          </>
        }
        action={<StatusPill tone="active">{appConfig.chain.name} guide</StatusPill>}
      />

      <div className="grid items-start gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rc-card rc-card-soft p-5 lg:sticky lg:top-4">
          <p className="rc-eyebrow">On this page</p>
          <nav aria-label="Documentation sections" className="mt-3 grid gap-0.5">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-[2px] px-2 py-1.5 text-[10px] font-semibold text-muted transition-colors hover:bg-paper hover:text-forest"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <div className="rc-warning mt-4">
            {appConfig.isMainnet
              ? 'This build targets Arc Mainnet. Real USDC is at risk. Verify every transaction before signing.'
              : 'This build is an Arc Testnet preview. Use test USDC only. No real funds.'}
          </div>

          <div className="mt-4 grid gap-2">
            <Link to="/create" className="rc-button rc-button-primary rc-button-sm">
              Create a pipeline
            </Link>
            <Link to="/pipelines" className="rc-button rc-button-sm">
              View my pipelines
            </Link>
            <Link to="/risk" className="rc-button rc-button-sm">
              Read the risk notice
            </Link>
          </div>
        </aside>

        <div className="space-y-3">
          <DocsSection id="overview" number="01 · Overview" title="One escrow, one ordered relay.">
            <p>
              RelayCrew coordinates a fixed sequence of 2–10 specialist stages for one client. The
              client funds every stage budget up front in one parent USDC escrow. Each specialist is
              a wallet address controlled by a human freelancer, an agent, or a team. RelayCrew does
              not find providers, run AI agents, or judge work automatically.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Client</span>
                <strong className="mt-1 block text-[11px] text-ink">Funds and evaluates</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Creates the pipeline, approves or rejects each stage, and is the only evaluator.
                </p>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Provider</span>
                <strong className="mt-1 block text-[11px] text-ink">Delivers one stage</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Submits a public deliverable reference for the active stage. Cannot evaluate or
                  change terms.
                </p>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Observer</span>
                <strong className="mt-1 block text-[11px] text-ink">Inspects and expires</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Reads public state and may trigger expiry after an eligible deadline. Refunds
                  always go to the client.
                </p>
              </div>
            </div>
            <p>
              RelayCrew is not a marketplace, an AI runtime, or a dispute service. There is no
              provider discovery, reputation, arbitration, appeal, partial payout, platform fee, or
              admin rescue. The client is the sole evaluator.
            </p>
          </DocsSection>

          <DocsSection id="limits" number="02 · Limits and amounts" title="Exact budgets, exact bounds.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Stages</span>
                <strong className="mt-1 block font-display text-xl font-medium text-ink">2–10</strong>
                <span className="text-[9px] text-muted">fixed order</span>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Stage minimum</span>
                <strong className="mt-1 block font-mono text-lg font-medium text-ink">1 USDC</strong>
                <span className="text-[9px] text-muted">per stage</span>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Pipeline maximum</span>
                <strong className="mt-1 block font-mono text-lg font-medium text-ink">100 USDC</strong>
                <span className="text-[9px] text-muted">total budget</span>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Review window</span>
                <strong className="mt-1 block font-mono text-lg font-medium text-ink">24h</strong>
                <span className="text-[9px] text-muted">after submission</span>
              </div>
            </div>
            <p>
              Each stage duration is 900–604,800 seconds (15 minutes to 7 days) from activation.
              The create form uses Days and Hours selectors and converts the choice into seconds
              before sending it to the contract. Amounts use six-decimal USDC base units. The app
              requests the exact allowance, not an unlimited allowance, and there is no platform fee.
            </p>
            <div className="rc-warning">
              Provider addresses must be unique, nonzero, and different from the client. Stage order,
              providers, budgets, briefs, and durations are immutable after funding.
            </div>
          </DocsSection>

          <DocsSection id="create" number="03 · Create and fund" title="Commit the sequence once.">
            <StepList
              items={[
                {
                  title: `Connect a wallet on ${appConfig.networkLabel}`,
                  body: `Use the wallet control in the header. If the wallet is on another chain, switch to ${appConfig.networkLabel} before writing.`,
                },
                {
                  title: 'Add the stages in order',
                  body: 'For each stage, enter a unique provider address, title, public brief, budget of at least 1 USDC, and a duration using the Days and Hours selector. An optional attachment URL is appended to the public brief and stored on-chain.',
                },
                {
                  title: 'Review the total and public data',
                  body: 'Check every provider, the order, each budget, the exact total, and the public-data warning. This is the final chance to change the terms.',
                },
                {
                  title: 'Approve and fund',
                  body: 'Approve the exact USDC allowance if needed, then confirm the funding transaction. Wait for a successful receipt; the app rereads on-chain state.',
                },
              ]}
            />
            <p>
              All future stages are funded by the parent escrow at creation, but their state remains
              Queued until the prior stage is approved. A failed validation or transfer does not
              create a partial pipeline.
            </p>
          </DocsSection>

          <DocsSection id="submit" number="04 · Submit work" title="One active specialist at a time.">
            <StepList
              items={[
                {
                  title: 'Connect the assigned provider wallet',
                  body: 'Only the wallet assigned to the current stage can submit. The provider cannot approve, reject, or change the pipeline.',
                },
                {
                  title: 'Submit a public deliverable URI',
                  body: 'Use an https:// or ipfs:// reference before the work deadline. The URI is stored on chain; the app does not fetch or embed its contents.',
                },
                {
                  title: 'Wait for client evaluation',
                  body: 'The stage becomes Submitted. The client has 24 hours to approve or reject before the evaluation deadline.',
                },
              ]}
            />
            <p>
              Only submit links that are safe to make public. The host of a linked document may
              change or remove its contents after submission. RelayCrew does not download, proxy, or
              validate the referenced file.
            </p>
          </DocsSection>

          <DocsSection
            id="evaluate"
            number="05 · Approve, reject, expire"
            title="The client decides. The contract settles."
          >
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-[3px] border border-forest-line bg-forest-soft p-3">
                <span className="rc-eyebrow">Approve</span>
                <strong className="mt-1 block text-[11px] text-forest">Pay and activate</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Pays the current provider and activates the next preassigned specialist in the same
                  transaction. The final approval completes the pipeline.
                </p>
              </div>
              <div className="rounded-[3px] border border-rust-line bg-rust-soft p-3">
                <span className="rc-eyebrow">Reject</span>
                <strong className="mt-1 block text-[11px] text-rust">End and refund</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Ends the pipeline and returns all unpaid escrow to the client. The current provider
                  is not paid for that stage. Prior payouts are final.
                </p>
              </div>
              <div className="rounded-[3px] border border-warm-line bg-warm-soft p-3">
                <span className="rc-eyebrow">Expire</span>
                <strong className="mt-1 block text-[11px] text-warm-ink">Permissionless refund</strong>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  After the work or evaluation deadline, anyone may trigger expiry. Unpaid escrow goes
                  to the client; the caller receives nothing.
                </p>
              </div>
            </div>
            <p>
              Approval and rejection are irreversible. There is no arbitration, appeal, restart,
              skip, or partial payout. Do not treat a wallet prompt or pending hash as success; wait
              for a successful receipt and confirm the on-chain state.
            </p>
            <div className="rc-warning">
              If the client does not evaluate a submitted stage within 24 hours, the pipeline can
              expire and the provider may remain unpaid for that work.
            </div>
          </DocsSection>

          <DocsSection id="statuses" number="06 · Pipeline statuses" title="Read the ledger, not a promise.">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="active">Active</StatusPill>
              <StatusPill tone="complete">Completed</StatusPill>
              <StatusPill tone="danger">Rejected</StatusPill>
              <StatusPill tone="warm">Expired</StatusPill>
            </div>
            <p>
              Pipeline states are <strong className="text-ink">Active</strong>,{' '}
              <strong className="text-ink">Completed</strong>,{' '}
              <strong className="text-ink">Rejected</strong>, and{' '}
              <strong className="text-ink">Expired</strong>. Stage states are Queued, Active,
              Submitted, Paid, Rejected, and Expired.
            </p>
            <p>
              Completed means every stage was paid. Rejected and Expired are terminal: the remaining
              escrow was refunded to the client and no further action is available. Previous payouts
              cannot be reversed; a new task requires a new pipeline.
            </p>
          </DocsSection>

          <DocsSection id="public-data" number="07 · Public data" title="Everything on chain is permanent.">
            <p>
              Pipeline titles, briefs, provider addresses, budgets, deliverable URIs, and transaction
              data are public and permanent. An optional attachment URL is stored as part of the
              brief, so it is public and permanent too. None of this data can be made private or
              deleted by RelayCrew.
            </p>
            <div className="rc-warning">
              Never enter secrets, personal data, credentials, confidential task instructions, private
              document URLs, or anything you would not want permanently public.
            </div>
            <p>
              The app does not store task files. A linked document may remain publicly accessible and
              can change independently of the on-chain reference. Read the{' '}
              <Link to="/risk" className="rc-link">
                full risk notice
              </Link>{' '}
              before funding a pipeline.
            </p>
          </DocsSection>

          <DocsSection id="networks" number="08 · Testnet and Mainnet" title="Know which chain you are on.">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[3px] border border-forest-line bg-forest-soft p-3">
                <span className="rc-eyebrow">This build</span>
                <strong className="mt-1 block text-[11px] text-forest">
                  {appConfig.networkLabel}
                </strong>
                <dl className="mt-2 space-y-1 text-[10px]">
                  <div className="flex justify-between gap-3">
                    <dt>Chain ID</dt>
                    <dd className="font-mono text-ink">{appConfig.expectedChainId}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Funds</dt>
                    <dd className="text-ink">
                      {appConfig.isMainnet ? 'Real USDC' : 'Test USDC only'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Explorer</dt>
                    <dd className="text-right text-ink">{appConfig.explorerName}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <span className="rc-eyebrow">Other network</span>
                <strong className="mt-1 block text-[11px] text-ink">
                  {appConfig.isMainnet ? 'Arc Testnet' : 'Arc Mainnet'}
                </strong>
                <dl className="mt-2 space-y-1 text-[10px]">
                  <div className="flex justify-between gap-3">
                    <dt>Chain ID</dt>
                    <dd className="font-mono text-ink">{appConfig.isMainnet ? '5042002' : '5042'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Status</dt>
                    <dd className="text-right text-ink">
                      {appConfig.isMainnet ? 'Separate testnet preview' : 'Production network'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Funds</dt>
                    <dd className="text-ink">
                      {appConfig.isMainnet ? 'Test USDC only' : 'Real USDC'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <p>
              {appConfig.isMainnet
                ? 'This build is configured for Arc Mainnet. Every transaction uses real USDC and is irreversible. Verify the chain, contract address, provider addresses, and exact budget before signing.'
                : 'This build is configured for Arc Testnet. Do not send real USDC to this preview. A Mainnet transaction is separate and uses the production contract.'}
            </p>
          </DocsSection>

          <DocsSection id="troubleshooting" number="09 · Troubleshooting" title="What to check before retrying.">
            <dl className="grid gap-2 sm:grid-cols-2">
              {[
                [
                  'Wrong network',
                  `Switch to ${appConfig.networkLabel} before writing. The app disables writes on another chain.`,
                ],
                [
                  'Insufficient balance',
                  `Keep enough ${appConfig.isMainnet ? '' : 'test '}USDC for the full budget plus gas for every transaction.`,
                ],
                ['Wallet cancelled', 'Nothing was sent. Review the values and try again when ready.'],
                ['Pending or timed out', 'Do not resubmit pipeline creation. Check the wallet or explorer, then use the check-receipt action if shown.'],
                ['Permission error', 'Only the assigned current provider can submit; only the client can approve or reject.'],
                ['RPC unavailable', 'The displayed state may be stale. Retry the read and do not rely on stale amounts for money decisions.'],
                ['Terminal pipeline', 'Completed, Rejected, and Expired pipelines have no further actions. Create a new pipeline for new work.'],
                ['Invalid deliverable', 'Use an https:// or ipfs:// URI between 9 and 256 bytes. Only submit links safe to make public.'],
                ['Theme preference', 'Use the Light/Dark control in the header. The preference is stored in this browser only; it does not affect on-chain data.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[3px] border border-line bg-paper-soft p-3">
                  <dt className="text-[10px] font-bold text-ink">{title}</dt>
                  <dd className="mt-1 text-[10px] leading-5 text-muted">{body}</dd>
                </div>
              ))}
            </dl>
          </DocsSection>

          <DocsSection id="contract" number="10 · Contract and source" title="Inspect the deployed rail.">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[3px] border border-line bg-paper-soft p-3 sm:col-span-2">
                <dt className="rc-eyebrow">Coordinator contract · {appConfig.networkLabel}</dt>
                <dd className="mt-1 break-all font-mono text-[10px] text-ink">
                  {appConfig.pipelineAddress ?? 'Not configured in this build.'}
                </dd>
                {contractHref ? (
                  <a
                    href={contractHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rc-link mt-2 inline-block text-[10px]"
                  >
                    Open on {appConfig.explorerName} ↗
                  </a>
                ) : null}
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <dt className="rc-eyebrow">USDC ERC-20 interface</dt>
                <dd className="mt-1 break-all font-mono text-[10px] text-ink">
                  {appConfig.usdcAddress ?? 'Not configured in this build.'}
                </dd>
              </div>
              <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                <dt className="rc-eyebrow">Public source</dt>
                <dd className="mt-1 text-[10px] text-ink">
                  {appConfig.githubUrl ? (
                    <a
                      href={appConfig.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rc-link break-all"
                    >
                      {appConfig.githubUrl} ↗
                    </a>
                  ) : (
                    'Repository URL is not configured in this build.'
                  )}
                </dd>
              </div>
            </dl>
            <p>
              RelayCrew is experimental, unaudited software. The contract has no owner role, admin
              withdrawal, upgrade path, or rescue function. Read the{' '}
              <Link to="/risk" className="rc-link">
                risk notice
              </Link>{' '}
              and verify every recipient and exact amount before signing.
            </p>
          </DocsSection>
        </div>
      </div>
      </div>
    </div>
  )
}
