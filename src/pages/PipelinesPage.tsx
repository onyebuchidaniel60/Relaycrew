import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { PageHeader } from '../components/PageHeader'
import { usePipelineSummary, useUserPipelineIds } from '../hooks/usePipelineContract'
import { formatUsdcDisplay } from '../lib/amounts'
import { appConfig } from '../lib/config'
import {
  formatTimestamp,
  pipelineStatusLabel,
  shortAddress,
  statusTone,
} from '../lib/pipelineDisplay'

function PipelineRow({ pipelineId }: { pipelineId: bigint }) {
  const query = usePipelineSummary(pipelineId)

  if (query.isLoading) {
    return <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <p>Pipeline #{pipelineId.toString()} could not be loaded.</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-2 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    )
  }

  const pipeline = query.data
  const status = Number(pipeline.status)
  const currentStage =
    status === 0
      ? `Stage ${Number(pipeline.currentStageIndex) + 1} of ${Number(pipeline.stageCount)}`
      : pipelineStatusLabel(status)

  return (
    <Link
      to={`/pipelines/${pipelineId.toString()}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-400"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pipeline #{pipelineId.toString()}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{currentStage}</p>
          <p className="mt-1 text-sm text-slate-600">
            Client {shortAddress(pipeline.client)} · created {formatTimestamp(pipeline.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(status)}`}>
            {pipelineStatusLabel(status)}
          </span>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatUsdcDisplay(pipeline.totalBudget)} USDC
          </p>
          <p className="text-xs text-slate-500">Total budget</p>
        </div>
      </div>
    </Link>
  )
}

export function PipelinesPage() {
  const { address } = useAccount()
  const idsQuery = useUserPipelineIds(address)
  const pipelineIds = idsQuery.data ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Wallet view"
          title="My Pipelines"
          description="Pipelines where the connected wallet is the client or an assigned provider."
        />
        <Link
          to="/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Create pipeline
        </Link>
      </div>

      {!appConfig.isValid ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Chain configuration is invalid. Pipeline reads are disabled.
        </div>
      ) : null}

      {!address ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Connect a wallet to view your pipelines.
        </div>
      ) : idsQuery.isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      ) : idsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p>Could not read your pipeline IDs.</p>
          <button
            type="button"
            onClick={() => void idsQuery.refetch()}
            className="mt-2 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : pipelineIds.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          <p className="font-semibold text-slate-800">No pipelines found.</p>
          <p className="mt-1">Create a pipeline or connect the wallet assigned to an existing one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pipelineIds.map((pipelineId) => (
            <PipelineRow key={pipelineId.toString()} pipelineId={pipelineId} />
          ))}
        </div>
      )}
    </div>
  )
}
