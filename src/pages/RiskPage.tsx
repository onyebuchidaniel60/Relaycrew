import { PageHeader } from '../components/PageHeader'

export function RiskPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Important"
        title="Risk Notice"
        description="Read these limitations before creating or funding a pipeline."
      />

      <section className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
        <div>
          <h2 className="font-semibold">Experimental and unaudited</h2>
          <p className="mt-1">
            RelayCrew is a hackathon prototype. The contract has not been independently audited.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Irreversible USDC transfers</h2>
          <p className="mt-1">
            Approval pays the current provider immediately. Rejection or permitted expiry returns
            only the unpaid remainder to the client. Previous payouts cannot be reversed.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">The client is the sole evaluator</h2>
          <p className="mt-1">
            There is no arbitration, appeal, or dispute mechanism. If the client misses the 24-hour
            review window after a submission, the pipeline can expire and the provider may remain
            unpaid.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Public and permanent data</h2>
          <p className="mt-1">
            Provider addresses, titles, briefs, budgets, and deliverable URIs are public on-chain.
            Never include secrets, personal data, or confidential instructions.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Testnet only</h2>
          <p className="mt-1">
            This Phase 4 preview connects to Arc Testnet and can move test USDC through the deployed
            contract. Do not use mainnet funds or production keys.
          </p>
        </div>
      </section>
    </div>
  )
}
