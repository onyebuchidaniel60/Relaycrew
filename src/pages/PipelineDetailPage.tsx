import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PlaceholderPanel } from '../components/PlaceholderPanel'

export function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Public record"
        title="Pipeline Detail"
        description="Structural placeholder for the future pipeline summary, stage timeline, and role-aware actions."
      />

      <PlaceholderPanel title="Pipeline Detail Placeholder">
        <p>
          Pipeline ID from route:{' '}
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
            {id ?? 'unknown'}
          </span>
        </p>
        <p>
          Summary, stage status, deadlines, deliverable references, and transaction links will be
          added after contract integration.
        </p>
      </PlaceholderPanel>
    </div>
  )
}
