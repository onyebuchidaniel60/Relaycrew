import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
import { appConfig } from '../lib/config'

const sectionLinks = [
  { id: 'before', label: 'Before you start' },
  { id: 'faucet', label: 'Get test USDC' },
  { id: 'metamask', label: 'Add Arc Testnet' },
  { id: 'configure', label: 'Run locally' },
  { id: 'flow', label: 'Test the escrow flow' },
  { id: 'verify', label: 'Verify settlement' },
  { id: 'guardrails', label: 'Guardrail tests' },
  { id: 'public-data', label: 'Public data warning' },
  { id: 'risk', label: 'Risk and limits' },
  { id: 'contract', label: 'Contract and source' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
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

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-[3px] border border-line bg-paper-soft p-3 font-mono text-[10px] leading-5 text-ink">
      <code>{children}</code>
    </pre>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0">
      <dt className="text-[10px] text-muted">{label}</dt>
      <dd className="break-all text-right font-mono text-[10px] text-ink">{value}</dd>
    </div>
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
          eyebrow="Developer testing guide"
          title={<span className="block pt-3">Run the escrow flow on Arc Testnet.</span>}
          description="A practical, wallet-by-wallet checklist for testing a 2-stage pipeline with test USDC. The app is frontend-only; every state change is a real Arc transaction, and the contract is the source of truth."
          breadcrumb={
            <>
              <Link to="/">RelayCrew</Link> / Docs
            </>
          }
          action={<StatusPill tone="active">{appConfig.chain.name} guide</StatusPill>}
        />

        <div className="grid items-start gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rc-card rc-card-soft min-w-0 p-5 lg:sticky lg:top-4">
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

            <div className="mt-4 rounded-[3px] border border-line bg-paper-soft p-3">
              <p className="rc-eyebrow">Test wallets</p>
              <p className="mt-1 text-[10px] leading-5 text-muted">
                Use <strong className="text-ink">3 distinct wallets</strong>: one client and two
                providers. The contract rejects duplicate provider addresses and the client address.
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rc-button rc-button-primary rc-button-sm"
              >
                Open Circle Faucet ↗
              </a>
              <Link to="/create" className="rc-button rc-button-sm">
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

          <div className="min-w-0 space-y-3">
            <DocsSection id="before" number="01 · Before you start" title="Three wallets, one ordered relay.">
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
                    Keep enough test USDC for the full budget plus gas.
                  </p>
                </div>
                <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                  <span className="rc-eyebrow">Provider 1</span>
                  <strong className="mt-1 block text-[11px] text-ink">Delivers stage 1</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Submits a public HTTPS or IPFS deliverable URI for the active stage. Cannot
                    approve, reject, or change the pipeline.
                  </p>
                </div>
                <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                  <span className="rc-eyebrow">Provider 2</span>
                  <strong className="mt-1 block text-[11px] text-ink">Delivers stage 2</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Waits until stage 1 is approved, then submits the second deliverable. Must be a
                    different wallet from Provider 1 and the client.
                  </p>
                </div>
              </div>
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
                Stage durations are 900–604,800 seconds (15 minutes to 7 days) from activation. The
                create form uses Days and Hours selectors and converts the choice into seconds; the
                smallest selectable duration is one hour. Amounts use six-decimal USDC base units.
                The app requests the exact allowance, not an unlimited allowance, and there is no
                platform fee.
              </p>
              <div className="rc-warning">
                Provider addresses must be unique, nonzero, and different from the client. Stage
                order, providers, budgets, briefs, and durations are immutable after funding.
              </div>
            </DocsSection>

            <DocsSection id="faucet" number="02 · Get test USDC" title="Fund every test wallet from the Circle Faucet.">
              <p>
                Arc Testnet uses USDC as its native gas token. You do not need ETH. Request test USDC
                for the client and both providers so each wallet can sign its own transaction.
              </p>
              <StepList
                items={[
                  {
                    title: 'Open the Circle Faucet',
                    body: 'Go to faucet.circle.com and connect or paste the wallet address you want to fund.',
                  },
                  {
                    title: 'Select Arc Testnet',
                    body: 'Choose Arc Testnet as the network and USDC as the token. The faucet issues test USDC only; it has no real value.',
                  },
                  {
                    title: 'Request USDC for each wallet',
                    body: 'Repeat for the client and both providers. The client needs at least the full pipeline budget plus a small gas buffer; providers need gas for their submit transaction.',
                  },
                  {
                    title: 'Confirm the balance',
                    body: 'Switch each wallet to Arc Testnet and confirm the USDC balance before creating the pipeline. The app will show a wrong-chain or insufficient-balance error if something is missing.',
                  },
                ]}
              />
              <p>
                Faucet: <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="rc-link">faucet.circle.com ↗</a>
                . Official Arc network reference:{' '}
                <a href="https://docs.arc.io/arc/references/connect-to-arc" target="_blank" rel="noopener noreferrer" className="rc-link">
                  docs.arc.io/arc/references/connect-to-arc ↗
                </a>
                .
              </p>
            </DocsSection>

            <DocsSection id="metamask" number="03 · Add Arc Testnet" title="Point MetaMask at the test network.">
              <p>
                Open MetaMask → <strong className="text-ink">Settings</strong> →{' '}
                <strong className="text-ink">Networks</strong> →{' '}
                <strong className="text-ink">Add network</strong> →{' '}
                <strong className="text-ink">Add a network manually</strong>, then enter:
              </p>
              <dl className="rounded-[3px] border border-line bg-paper-soft px-3">
                <Field label="Network name" value="Arc Testnet" />
                <Field label="New RPC URL" value="https://rpc.testnet.arc.io" />
                <Field label="Chain ID" value="5042002" />
                <Field label="Currency symbol" value="USDC" />
                <Field label="Block explorer URL" value="https://explorer.testnet.arc.io" />
              </dl>
              <p>
                Save and switch to Arc Testnet. Some wallets label the native gas token as ETH even
                when the underlying asset is USDC; the app reads the USDC ERC-20 interface at{' '}
                <span className="font-mono text-ink">0x3600000000000000000000000000000000000000</span>{' '}
                with 6 decimals.
              </p>
              <div className="rc-warning">
                The app disables writes when the connected wallet is on another chain. If the wrong
                network is selected, switch to Arc Testnet before signing anything.
              </div>
            </DocsSection>

            <DocsSection id="configure" number="04 · Run locally" title="Clone, configure, and start the app.">
              <p>
                The app has no backend. It reads the coordinator directly from Arc and writes through
                the connected wallet.
              </p>
              <CodeBlock>{`git clone https://github.com/onyebuchidaniel60/Relaycrew.git
cd Relaycrew
npm install
cp .env.example .env
npm run dev`}</CodeBlock>
              <p>
                Set the following values in <span className="font-mono text-ink">.env</span>. The
                checked-in example targets Arc Testnet and the reference deployment; replace the
                contract address with your own if you deployed a separate coordinator.
              </p>
              <CodeBlock>{`VITE_NETWORK_MODE=testnet
VITE_CHAIN_ID=5042002
VITE_RPC_URL=https://rpc.testnet.arc.io
VITE_EXPLORER_URL=https://explorer.testnet.arc.io
VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000
VITE_PIPELINE_CONTRACT_ADDRESS=0x...your_coordinator...
VITE_GITHUB_REPOSITORY_URL=https://github.com/you/your-repo`}</CodeBlock>
              <p>
                Run the gates before opening a pull request or deploying:
              </p>
              <CodeBlock>{`npm run typecheck
npm run lint
npm run build`}</CodeBlock>
              <div className="rc-warning">
                `VITE_*` values are public browser variables. Never put a private key, seed phrase, or
                deployer credential in `.env` values that begin with `VITE_`.
              </div>
            </DocsSection>

            <DocsSection id="flow" number="05 · Test the escrow flow" title="Client funds → Provider 1 submits → Client approves → Provider 2 submits → Client approves.">
              <StepList
                items={[
                  {
                    title: 'Client creates and funds a 2-stage pipeline',
                    body: 'Connect the client wallet on Arc Testnet. Open /create. Add two stages with distinct provider addresses, 1 USDC each, titles, public briefs, and durations. Review the 2 USDC total and the public-data warning, then approve the exact 2 USDC allowance and confirm the funding transaction.',
                  },
                  {
                    title: 'Confirm stage 1 is Active',
                    body: 'After a successful receipt, the app rereads the pipeline. Stage 1 should be Active and stage 2 should be Queued but funded. The parent escrow holds the full 2 USDC.',
                  },
                  {
                    title: 'Provider 1 submits work',
                    body: 'Switch to Provider 1, open the pipeline, and submit an https:// or ipfs:// deliverable URI before the work deadline. Only the assigned current provider can submit. Wait for the receipt; the stage becomes Submitted.',
                  },
                  {
                    title: 'Client approves stage 1',
                    body: 'Switch back to the client wallet and approve stage 1. The same transaction pays Provider 1 exactly 1 USDC and activates stage 2 for Provider 2. The app should show stage 1 Paid, stage 2 Active, and 1 USDC paid out.',
                  },
                  {
                    title: 'Provider 2 submits work',
                    body: 'Switch to Provider 2 and submit the second deliverable before its work deadline. The stage becomes Submitted and the 24-hour client review window starts.',
                  },
                  {
                    title: 'Client approves the final stage',
                    body: 'Switch back to the client and approve stage 2. The contract pays Provider 2 1 USDC and completes the pipeline. The final ledger should show Completed, 2 USDC paid, 0 refunded, and no remaining escrow.',
                  },
                ]}
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[3px] border border-forest-line bg-forest-soft p-3">
                  <span className="rc-eyebrow">After stage 1 approval</span>
                  <strong className="mt-1 block text-[11px] text-forest">Paid 1 · Active 2</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Provider 1 receives 1 USDC. Provider 2 is activated in the same transaction.
                  </p>
                </div>
                <div className="rounded-[3px] border border-forest-line bg-forest-soft p-3">
                  <span className="rc-eyebrow">After stage 2 approval</span>
                  <strong className="mt-1 block text-[11px] text-forest">Completed · 2 paid</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Provider 2 receives 1 USDC. The pipeline is Completed and no escrow remains.
                  </p>
                </div>
                <div className="rounded-[3px] border border-line bg-paper-soft p-3">
                  <span className="rc-eyebrow">After refresh</span>
                  <strong className="mt-1 block text-[11px] text-ink">Read the chain</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Reload the page. The pipeline should reconstruct the same state from Arc with no
                    local database or indexer.
                  </p>
                </div>
              </div>
              <div className="rc-warning">
                Do not treat a wallet prompt or pending hash as success. Wait for a successful receipt
                and confirm the on-chain state in the app and explorer.
              </div>
            </DocsSection>

            <DocsSection id="verify" number="06 · Verify settlement" title="Follow the money on the Arc explorer.">
              <StepList
                items={[
                  {
                    title: 'Open the transaction',
                    body: 'From the pipeline page or your wallet history, open the approval transaction in the Arc Testnet explorer. Confirm the status is Success and the block is final.',
                  },
                  {
                    title: 'Check Token transfers',
                    body: 'Open the Token transfers tab. The stage approval should show exactly 1 USDC moving from the coordinator to the current provider. The final approval should show the second 1 USDC transfer and no remaining escrow.',
                  },
                  {
                    title: 'Check the contract events',
                    body: 'The stage 1 approval emits StageReleased for stage 0 and StageHired for stage 1 in the same transaction. The final approval emits StageReleased for stage 1 and PipelineCompleted. If the contract is not verified, the explorer may show raw topics instead of decoded names; the token transfer is still the reliable money movement.',
                  },
                  {
                    title: 'Reconcile the pipeline',
                    body: 'The pipeline page should show total budget, paid out, refunded, current stage, and stage count from chain. A completed 2-stage pipeline reconciles to 2 USDC funded, 2 USDC paid, and 0 refunded.',
                  },
                ]}
              />
              <p>
                Explorer: <a href={appConfig.explorerUrl} target="_blank" rel="noopener noreferrer" className="rc-link">{appConfig.explorerUrl} ↗</a>
              </p>
            </DocsSection>

            <DocsSection id="guardrails" number="07 · Guardrail tests" title="Try the calls that should fail.">
              <p>
                A successful happy path is not enough. Test the permission and state checks with a
                separate pipeline so a failed attempt cannot disturb the completed one.
              </p>
              <dl className="grid gap-2 sm:grid-cols-2">
                {[
                  ['Non-provider submits', 'A wallet that is not the current provider should revert. Only the assigned provider can submit.'],
                  ['Non-client approves', 'A provider or outsider calling approve should revert with a client-only error.'],
                  ['Double approve', 'Approving an already-paid stage should revert. The pipeline has moved on.'],
                  ['Wrong stage', 'Approving a future or past stage index should revert with an invalid-stage error.'],
                  ['Early expiry', 'Expiry before the work or evaluation deadline should revert. Wait for the eligible deadline.'],
                  ['Wrong chain', 'Switch the wallet to another EVM network; the app should block writes and ask for Arc Testnet.'],
                  ['Refresh mid-flow', 'Reload after funding and after each approval. The page should reconstruct the same on-chain state.'],
                  ['Terminal pipeline', 'Completed, Rejected, and Expired pipelines should show no further actions.'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-[3px] border border-line bg-paper-soft p-3">
                    <dt className="text-[10px] font-bold text-ink">{title}</dt>
                    <dd className="mt-1 text-[10px] leading-5 text-muted">{body}</dd>
                  </div>
                ))}
              </dl>
            </DocsSection>

            <DocsSection id="public-data" number="08 · Public data warning" title="Everything on chain is permanent.">
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

            <DocsSection id="risk" number="09 · Risk and limits" title="The client decides. The contract enforces.">
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded-[3px] border border-forest-line bg-forest-soft p-3">
                  <span className="rc-eyebrow">Approve</span>
                  <strong className="mt-1 block text-[11px] text-forest">Pay and activate</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Pays the current provider and activates the next preassigned specialist in the
                    same transaction. The final approval completes the pipeline.
                  </p>
                </div>
                <div className="rounded-[3px] border border-rust-line bg-rust-soft p-3">
                  <span className="rc-eyebrow">Reject</span>
                  <strong className="mt-1 block text-[11px] text-rust">End and refund</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Ends the pipeline and returns all unpaid escrow to the client. The current
                    provider is not paid for that stage. Prior payouts are final.
                  </p>
                </div>
                <div className="rounded-[3px] border border-warm-line bg-warm-soft p-3">
                  <span className="rc-eyebrow">Expire</span>
                  <strong className="mt-1 block text-[11px] text-warm-ink">Permissionless refund</strong>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    After the work or evaluation deadline, anyone may trigger expiry. Unpaid escrow
                    goes to the client; the caller receives nothing.
                  </p>
                </div>
              </div>
              <p>
                Approval and rejection are irreversible. There is no arbitration, appeal, restart,
                skip, or partial payout. The client is the sole evaluator. Do not treat a wallet
                prompt or pending hash as success; wait for a successful receipt and confirm the
                on-chain state.
              </p>
              <div className="rc-warning">
                If the client does not evaluate a submitted stage within 24 hours, the pipeline can
                expire and the provider may remain unpaid for that work.
              </div>
              <p>
                RelayCrew is experimental, unaudited software. The contract has no owner role, admin
                withdrawal, upgrade path, or rescue function. Read the{' '}
                <Link to="/risk" className="rc-link">
                  risk notice
                </Link>{' '}
                and verify every recipient and exact amount before signing.
              </p>
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
                For a production fork, replace the reference coordinator and repository URL in your
                environment before deploying. Verify the contract source on the explorer and read
                the risk notice before using real funds.
              </p>
            </DocsSection>

            <DocsSection id="troubleshooting" number="11 · Troubleshooting" title="What to check before retrying.">
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
          </div>
        </div>
      </div>
    </div>
  )
}
