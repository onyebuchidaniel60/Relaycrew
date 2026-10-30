import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function CreatePipelinePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client action"
        title="Create Pipeline"
        description="Structural placeholder for the future create-and-fund flow. Wallet connection and USDC actions are disabled in this preview."
      />

      <PlaceholderPanel title="Create Pipeline Form Placeholder">
        <p>
          The final form will define 2–5 ordered stages with provider wallets, titles, public
          briefs, budgets, and durations.
        </p>
      </PlaceholderPanel>

      <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <fieldset disabled className="space-y-4 opacity-70">
          <legend className="text-sm font-semibold text-slate-900">
            Pipeline fields (disabled placeholder)
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Client wallet
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="Connect wallet in a later phase"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Pipeline title
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="Research → Analysis → Writing"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Stage 1 provider
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="0x…"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Stage 1 budget (USDC)
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="1.00"
              />
            </label>
          </div>
        </fieldset>
        <p className="mt-4 text-xs text-slate-500">
          This form is not connected to a wallet or contract. It does not submit anything.
        </p>
      </form>
    </div>
  )
}
