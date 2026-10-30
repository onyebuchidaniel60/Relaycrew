import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function DocsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reference"
        title="Documentation"
        description="Structural placeholder for the final user and operator documentation."
      />

      <PlaceholderPanel title="Documentation Placeholder">
        <p>
          Full documentation will be added in a later phase. It will cover the pipeline lifecycle,
          USDC amounts, stage deadlines, public data warnings, and the Arc Testnet versus Arc
          Mainnet distinction.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>How to create and fund a pipeline</li>
          <li>How providers submit and clients evaluate</li>
          <li>How rejection and expiry refunds work</li>
          <li>What data is public and permanent</li>
        </ul>
      </PlaceholderPanel>
    </div>
  )
}
