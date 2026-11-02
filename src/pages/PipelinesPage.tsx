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
    return <div className="rc-skeleton h-[112px]" />
  }

  if (query.isError || !query.data) {
    return (
      <div className="rc-alert rc-alert-danger">
        <p>Pipeline #{pipelineId.toString()} could not be loaded.</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="btn btn-outline btn-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
        >
          Retry
        </button>
      </div>
    )
  }

  const pipeline = query.data
  const status = Number(pipeline.status)
  const stageCount = Number(pipeline.stageCount)
  const currentIndex = Number(pipeline.currentStageIndex)
  const currentStage =
    status === 0 ? `Stage ${currentIndex + 1} of ${stageCount}` : pipelineStatusLabel(status)

  return (
    <Link
      to={`/pipelines/${pipelineId.toString()}`}
      className="panel grid gap-5 p-5 no-underline transition-colors hover:border-line-strong sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6"
    >
      <div className="min-w-0">
        <p className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">
          Pipeline #{pipelineId.toString()}
        </p>
        <p className="mt-1.5 font-display text-[26px] font-normal leading-none tracking-[-0.045em] text-ink">
          {currentStage}
        </p>
        <p className="mt-2 font-mono text-[8px] leading-5 text-muted">
          Client {shortAddress(pipeline.client)} · created {formatTimestamp(pipeline.createdAt)}
        </p>
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {Array.from({ length: stageCount }, (_, index) => {
            const done = status !== 0 || index < currentIndex
            const active = status === 0 && index === currentIndex
            return (
              <span
                key={index}
                className={`h-[3px] w-8 ${
                  done ? 'bg-forest' : active ? 'bg-amber' : 'bg-line'
                }`}
              />
            )
          })}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
        <StatusPill tone={statusTone(status)}>{pipelineStatusLabel(status)}</StatusPill>
        <div className="text-right">
          <p className="font-mono text-sm font-medium text-ink">
            {formatUsdcDisplay(pipeline.totalBudget)} USDC
          </p>
          <p className="font-mono text-[7.5px] uppercase tracking-[0.07em] text-muted">
            Total budget
          </p>
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
    <div className="app-main">
      <div className="wrap">
        <PageHeader
          eyebrow="Wallet ledger"
          title="My pipelines"
          description={`Pipelines where the connected wallet is the client or an assigned provider. Every amount and status is read from ${appConfig.networkLabel}.`}
          breadcrumb={
            <>
              <Link to="/">RelayCrew</Link>
              <span className="slash">/</span> Pipelines
            </>
          }
          action={
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="active">{appConfig.networkLabel}</StatusPill>
              <Link className="btn btn-primary btn-sm" to="/create">
                Create pipeline
              </Link>
            </div>
          }
        />

        {!appConfig.isValid ? (
          <div className="rc-alert rc-alert-danger mb-4 mt-4" role="alert">
            Chain configuration is invalid. Pipeline reads are disabled.
          </div>
        ) : null}

        {!address ? (
          <section className="panel mt-5 p-8 text-center sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-line-strong font-display text-2xl text-forest">
              ✳
            </div>
            <p className="eyebrow mt-5 justify-center">Wallet view</p>
            <h2 className="mt-2 font-display text-[34px] font-normal leading-none tracking-[-0.05em] text-ink">
              Connect to open your ledger.
            </h2>
            <p className="mx-auto mt-3 max-w-[480px] text-[11px] leading-6 text-muted">
              RelayCrew reads the pipelines where your wallet is the client or an assigned provider.
              Connect a wallet from the header to continue.
            </p>
          </section>
        ) : idsQuery.isLoading ? (
          <div className="mt-5 grid gap-3">
            <div className="rc-skeleton h-[112px]" />
            <div className="rc-skeleton h-[112px]" />
          </div>
        ) : idsQuery.isError ? (
          <div className="rc-alert rc-alert-danger mt-5">
            <p>Could not read your pipeline IDs.</p>
            <button
              type="button"
              onClick={() => void idsQuery.refetch()}
              className="btn btn-outline btn-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
            >
              Retry
            </button>
          </div>
        ) : pipelineIds.length === 0 ? (
          <section className="panel mt-5 p-8 text-center sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-line-strong font-display text-2xl text-forest">
              00
            </div>
            <p className="eyebrow mt-5 justify-center">Empty ledger</p>
            <h2 className="mt-2 font-display text-[34px] font-normal leading-none tracking-[-0.05em] text-ink">
              No pipelines found.
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-[11px] leading-6 text-muted">
              Create a pipeline with this wallet, or connect the wallet assigned to an existing one.
            </p>
            <Link className="btn btn-primary mt-5" to="/create">
              Create a pipeline
            </Link>
          </section>
        ) : (
          <div className="mt-5 grid gap-3">
            {pipelineIds.map((pipelineId) => (
              <PipelineRow key={pipelineId.toString()} pipelineId={pipelineId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
