import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function PipelinesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Wallet view"
        title="My Pipelines"
        description="Structural placeholder for the future connected-wallet pipeline list."
      />

      <PlaceholderPanel title="Pipeline List Placeholder">
        <p>
          Connected-wallet pipeline history will appear here after contract integration. No
          pipelines are loaded in this preview.
        </p>
      </PlaceholderPanel>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-700">No pipelines loaded</p>
        <p className="mt-1 text-sm text-slate-500">
          Wallet connection and on-chain reads are not enabled yet.
        </p>
      </div>
    </div>
  )
}
