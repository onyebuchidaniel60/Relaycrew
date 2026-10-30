import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function RiskPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Important"
        title="Risk Notice"
        description="Structural placeholder for the final risk disclosures."
      />

      <PlaceholderPanel title="Risk Notice Placeholder">
        <p>
          RelayCrew is experimental and unaudited. USDC transfers are irreversible, task metadata
          is public, and the client is the sole evaluator. There is no dispute mechanism.
        </p>
        <p>
          This Phase 1 preview does not connect to a wallet, call a contract, or move funds. Do not
          use real funds with any future preview build.
        </p>
      </PlaceholderPanel>
    </div>
  )
}
