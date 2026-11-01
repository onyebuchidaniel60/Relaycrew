import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
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
    return <div className="rc-skeleton h-28" />
  }

  if (query.isError || !query.data) {
    return (
      <div className="rc-alert rc-alert-danger">
        <p>Pipeline #{pipelineId.toString()} could not be loaded.</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="rc-button rc-button-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
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
      className="rc-card rc-card-hover block p-4 no-underline sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
            Pipeline #{pipelineId.toString()}
          </p>
          <p className="mt-1.5 font-display text-xl font-medium tracking-[-0.04em] text-ink">
            {currentStage}
          </p>
          <p className="mt-1.5 text-[10px] text-muted">
            Client {shortAddress(pipeline.client)} · created {formatTimestamp(pipeline.createdAt)}
          </p>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {Array.from({ length: Number(pipeline.stageCount) }, (_, index) => {
              const current = Number(pipeline.currentStageIndex)
              const done = status !== 0 || index < current
              const active = status === 0 && index === current
              return (
                <span
                  key={index}
                  className={`h-1 w-8 rounded-full ${
                    done ? 'bg-forest' : active ? 'bg-forest/35' : 'bg-line'
                  }`}
                />
              )
            })}
          </div>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <StatusPill tone={statusTone(status)}>{pipelineStatusLabel(status)}</StatusPill>
          <p className="mt-2 font-mono text-sm font-medium text-ink">
            {formatUsdcDisplay(pipeline.totalBudget)} USDC
          </p>
          <p className="text-[9px] uppercase tracking-[0.08em] text-muted">Total budget</p>
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
    <div>
      <PageHeader
        eyebrow="Wallet view"
        title="My pipelines"
        description={`Pipelines where the connected wallet is the client or an assigned provider. Every amount and status is read from ${appConfig.networkLabel}.`}
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Pipelines
          </>
        }
        action={
          <Link to="/create" className="rc-button rc-button-primary rc-button-sm">
            Create pipeline
          </Link>
        }
      />

      {!appConfig.isValid ? (
        <div className="rc-alert rc-alert-danger mb-4" role="alert">
          Chain configuration is invalid. Pipeline reads are disabled.
        </div>
      ) : null}

      {!address ? (
        <div className="rc-card flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="rc-eyebrow">Wallet view</p>
            <h2 className="mt-2 font-display text-[28px] font-medium tracking-[-0.05em] text-ink">
              Connect to open your ledger.
            </h2>
            <p className="mt-2 max-w-[520px] text-[11px] leading-6 text-muted">
              RelayCrew reads the pipelines where your wallet is the client or an assigned provider.
              Connect a wallet from the header to continue.
            </p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-line-strong font-display text-2xl text-forest">
            ✳
          </div>
        </div>
      ) : idsQuery.isLoading ? (
        <div className="space-y-3">
          <div className="rc-skeleton h-28" />
          <div className="rc-skeleton h-28" />
        </div>
      ) : idsQuery.isError ? (
        <div className="rc-alert rc-alert-danger">
          <p>Could not read your pipeline IDs.</p>
          <button
            type="button"
            onClick={() => void idsQuery.refetch()}
            className="rc-button rc-button-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
          >
            Retry
          </button>
        </div>
      ) : pipelineIds.length === 0 ? (
        <div className="rc-card p-8 text-center">
          <p className="rc-eyebrow">Empty ledger</p>
          <h2 className="mt-2 font-display text-[30px] font-medium tracking-[-0.05em] text-ink">
            No pipelines found.
          </h2>
          <p className="mx-auto mt-2 max-w-[440px] text-[11px] leading-6 text-muted">
            Create a pipeline with this wallet, or connect the wallet assigned to an existing one.
          </p>
          <Link to="/create" className="rc-button rc-button-primary mt-5">
            Create a pipeline
          </Link>
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
