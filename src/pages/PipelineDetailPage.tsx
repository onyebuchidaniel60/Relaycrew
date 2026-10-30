import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { PageHeader } from '../components/PageHeader'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { useNow } from '../hooks/useNow'
import {
  usePipelineStage,
  usePipelineSummary,
  usePipelineWrites,
} from '../hooks/usePipelineContract'
import { useTxRunner } from '../hooks/useTxRunner'
import { formatUsdcDisplay } from '../lib/amounts'
import { appConfig } from '../lib/config'
import {
  formatDuration,
  formatTimestamp,
  isTerminalPipeline,
  pipelineStatusLabel,
  shortAddress,
  stageStatusLabel,
  stageTone,
  statusTone,
} from '../lib/pipelineDisplay'
import { byteLength, validateDeliverableUri } from '../lib/validation'

function StageTimelineItem({ pipelineId, index }: { pipelineId: bigint; index: number }) {
  const query = usePipelineStage(pipelineId, BigInt(index))

  if (query.isLoading) {
    return <li className="ml-1 border-l border-slate-200 pb-6 pl-6 text-sm text-slate-500">Loading stage…</li>
  }

  if (query.isError || !query.data) {
    return (
      <li className="ml-1 border-l border-red-200 pb-6 pl-6 text-sm text-red-700">
        Stage {index + 1} could not be loaded.
      </li>
    )
  }

  const stage = query.data
  const status = Number(stage.status)
  const safeUri =
    stage.deliverableURI.startsWith('https://') || stage.deliverableURI.startsWith('ipfs://')

  return (
    <li className="relative ml-1 border-l border-slate-200 pb-6 pl-6 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-900"
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stage {index + 1}</p>
          <h3 className="text-lg font-semibold text-slate-900">{stage.title}</h3>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${stageTone(status)}`}>
          {stageStatusLabel(status)}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-600">{stage.brief}</p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</dt>
          <dd className="font-mono text-slate-800">{shortAddress(stage.provider)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget</dt>
          <dd className="text-slate-800">{formatUsdcDisplay(stage.budget)} USDC</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</dt>
          <dd className="text-slate-800">{formatDuration(Number(stage.durationSeconds))}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Work deadline</dt>
          <dd className="text-slate-800">{formatTimestamp(stage.dueAt)}</dd>
        </div>
        {status === 2 || status === 3 ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</dt>
            <dd className="text-slate-800">{formatTimestamp(stage.submittedAt)}</dd>
          </div>
        ) : null}
        {status === 2 ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Evaluation deadline
            </dt>
            <dd className="text-slate-800">{formatTimestamp(stage.evaluationDeadline)}</dd>
          </div>
        ) : null}
      </dl>

      {stage.deliverableURI ? (
        <p className="mt-3 text-sm">
          <span className="font-semibold text-slate-700">Deliverable: </span>
          {safeUri ? (
            <a
              href={stage.deliverableURI}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-sky-700 underline underline-offset-2"
            >
              {stage.deliverableURI}
            </a>
          ) : (
            <span className="break-all text-slate-600">{stage.deliverableURI}</span>
          )}
        </p>
      ) : null}
    </li>
  )
}

export function PipelineDetailPage() {
  const { id: idParam } = useParams<{ id: string }>()
  const pipelineId =
    idParam && /^\d+$/.test(idParam) && BigInt(idParam) > 0n ? BigInt(idParam) : undefined

  const summaryQuery = usePipelineSummary(pipelineId)
  const summary = summaryQuery.data
  const currentIndex = summary ? Number(summary.currentStageIndex) : undefined
  const currentStageQuery = usePipelineStage(
    pipelineId,
    currentIndex === undefined ? undefined : BigInt(currentIndex),
  )
  const currentStage = currentStageQuery.data
  const nextIndex =
    summary && currentIndex !== undefined && currentIndex + 1 < Number(summary.stageCount)
      ? currentIndex + 1
      : undefined
  const nextStageQuery = usePipelineStage(
    pipelineId,
    nextIndex === undefined ? undefined : BigInt(nextIndex),
  )
  const nextStage = nextStageQuery.data

  const { address } = useAccount()
  const guard = useNetworkGuard()
  const now = useNow()
  const { run } = useTxRunner()
  const writes = usePipelineWrites()
  const [deliverableUri, setDeliverableUri] = useState('')

  if (!pipelineId) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Pipeline"
          title="Pipeline not found"
          description="The pipeline ID in this URL is invalid."
        />
        <Link to="/pipelines" className="text-sm font-semibold text-sky-700 underline">
          Back to My Pipelines
        </Link>
      </div>
    )
  }

  if (summaryQuery.isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Pipeline"
          title={`Pipeline #${pipelineId.toString()}`}
          description="This pipeline could not be read from Arc Testnet."
        />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p>The pipeline may not exist, or the RPC read failed.</p>
          <button
            type="button"
            onClick={() => void summaryQuery.refetch()}
            className="mt-2 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
        <Link to="/pipelines" className="text-sm font-semibold text-sky-700 underline">
          Back to My Pipelines
        </Link>
      </div>
    )
  }

  const status = Number(summary.status)
  const stageStatus = currentStage ? Number(currentStage.status) : undefined
  const active = status === 0
  const terminal = isTerminalPipeline(status)
  const isClient = Boolean(address && summary.client.toLowerCase() === address.toLowerCase())
  const isCurrentProvider = Boolean(
    address && currentStage && currentStage.provider.toLowerCase() === address.toLowerCase(),
  )
  const workDeadlinePassed = Boolean(currentStage && now >= Number(currentStage.dueAt))
  const evaluationDeadlinePassed = Boolean(
    currentStage && now >= Number(currentStage.evaluationDeadline),
  )
  const canExpire =
    active &&
    ((stageStatus === 1 && workDeadlinePassed) ||
      (stageStatus === 2 && evaluationDeadlinePassed))
  const isFinal = currentIndex !== undefined && currentIndex + 1 >= Number(summary.stageCount)
  const nextReady = isFinal || Boolean(nextStage)
  const canReview =
    active &&
    isClient &&
    stageStatus === 2 &&
    !evaluationDeadlinePassed &&
    nextReady &&
    guard.isWriteEnabled
  const canSubmit =
    active &&
    isCurrentProvider &&
    stageStatus === 1 &&
    !workDeadlinePassed &&
    guard.isWriteEnabled
  const remaining = summary.totalBudget - summary.paidOut - summary.refundedAmount
  const uriProblem = deliverableUri.trim() ? validateDeliverableUri(deliverableUri) : null

  const submit = async () => {
    if (!pipelineId || currentIndex === undefined || !currentStage || !canSubmit) return
    if (uriProblem) return

    const receipt = await run('Submit stage', () =>
      writes.submitStage(pipelineId, BigInt(currentIndex), deliverableUri.trim()),
    )
    if (receipt) setDeliverableUri('')
  }

  const approve = async () => {
    if (!pipelineId || currentIndex === undefined || !currentStage || !canReview) return

    const payout = `${formatUsdcDisplay(currentStage.budget)} USDC to ${shortAddress(currentStage.provider)}`
    const next = isFinal
      ? 'This is the final stage; the pipeline will complete.'
      : `Next: ${shortAddress(nextStage?.provider ?? '')} receives ${formatUsdcDisplay(
          nextStage?.budget ?? 0n,
        )} USDC.`
    if (!window.confirm(`Approve stage ${currentIndex + 1}? This pays ${payout}. ${next} This action is irreversible.`)) {
      return
    }

    await run('Approve stage', () => writes.approveStage(pipelineId, BigInt(currentIndex)))
  }

  const reject = async () => {
    if (!pipelineId || currentIndex === undefined || !currentStage || !canReview) return

    const message = `Reject stage ${currentIndex + 1}? This ends the pipeline and refunds ${formatUsdcDisplay(
      remaining,
    )} USDC to ${shortAddress(summary.client)}. This action is irreversible.`
    if (!window.confirm(message)) return

    await run('Reject stage', () => writes.rejectStage(pipelineId, BigInt(currentIndex)))
  }

  const expire = async () => {
    if (!pipelineId || !canExpire) return

    const message = `Expire this pipeline? ${formatUsdcDisplay(
      remaining,
    )} USDC will be refunded to the client ${shortAddress(summary.client)}. This action is irreversible.`
    if (!window.confirm(message)) return

    await run('Expire pipeline', () => writes.expirePipeline(pipelineId))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow={`Pipeline #${pipelineId.toString()}`}
          title={active ? `Stage ${(currentIndex ?? 0) + 1} active` : pipelineStatusLabel(status)}
          description={`Client ${shortAddress(summary.client)} · created ${formatTimestamp(summary.createdAt)}`}
        />
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusTone(status)}`}>
          {pipelineStatusLabel(status)}
        </span>
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total budget</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatUsdcDisplay(summary.totalBudget)} USDC
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid out</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatUsdcDisplay(summary.paidOut)} USDC
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Refunded</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatUsdcDisplay(summary.refundedAmount)} USDC
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {terminal ? 'Finished' : 'Remaining escrow'}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {terminal
              ? formatTimestamp(summary.finishedAt)
              : `${formatUsdcDisplay(remaining)} USDC`}
          </p>
        </div>
      </section>

      {!appConfig.isValid ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Chain configuration is invalid. Actions are disabled.
        </div>
      ) : null}

      {!terminal && !address ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Connect a wallet to submit, evaluate, or expire this pipeline.
        </div>
      ) : null}

      {!terminal && address && guard.isWrongNetwork ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900" role="alert">
          Wrong Network: Please switch to Arc Testnet before acting.
        </div>
      ) : null}

      {terminal ? (
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700">
          This pipeline is terminal. No further actions are available.
        </div>
      ) : null}

      {canSubmit ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Submit your deliverable</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your URI is public and permanent. The app will not fetch or embed its contents.
          </p>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Deliverable URI
            <input
              value={deliverableUri}
              onChange={(event) => setDeliverableUri(event.target.value)}
              placeholder="https://… or ipfs://…"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{byteLength(deliverableUri.trim())}/256 bytes</span>
            {uriProblem ? <span className="text-red-700">{uriProblem}</span> : null}
          </div>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!deliverableUri.trim() || Boolean(uriProblem)}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit stage
          </button>
        </section>
      ) : null}

      {active && isCurrentProvider && stageStatus === 1 && workDeadlinePassed ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          The work deadline has passed. The pipeline can now be expired by anyone.
        </div>
      ) : null}

      {active && stageStatus === 2 && !isClient ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Waiting for the client to evaluate the submitted stage.
        </div>
      ) : null}

      {active && stageStatus === 1 && isClient ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Waiting for the current provider to submit. The client can review after submission.
        </div>
      ) : null}

      {canReview && currentStage ? (
        <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Evaluate submitted stage</h2>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="font-semibold">Payout:</span>{' '}
              {formatUsdcDisplay(currentStage.budget)} USDC to {shortAddress(currentStage.provider)}
            </p>
            <p>
              <span className="font-semibold">Next:</span>{' '}
              {isFinal
                ? 'Final stage — pipeline completes.'
                : `${shortAddress(nextStage?.provider ?? '')} gets ${formatUsdcDisplay(
                    nextStage?.budget ?? 0n,
                  )} USDC`}
            </p>
            <p>
              <span className="font-semibold">Refund on reject:</span>{' '}
              {formatUsdcDisplay(remaining)} USDC to {shortAddress(summary.client)}
            </p>
            <p>
              <span className="font-semibold">Evaluation deadline:</span>{' '}
              {formatTimestamp(currentStage.evaluationDeadline)}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void approve()}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Approve & pay
            </button>
            <button
              type="button"
              onClick={() => void reject()}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
            >
              Reject & refund
            </button>
          </div>
        </section>
      ) : null}

      {canExpire ? (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-950">Pipeline deadline elapsed</h2>
          <p className="mt-1 text-sm text-amber-900">
            Anyone may expire this pipeline. The refund recipient is fixed to the client:{' '}
            {shortAddress(summary.client)}.
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-950">
            Refund: {formatUsdcDisplay(remaining)} USDC
          </p>
          <button
            type="button"
            onClick={() => void expire()}
            disabled={!guard.isWriteEnabled}
            className="mt-4 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Expire Pipeline
          </button>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Stage timeline</h2>
        <ol className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {Array.from({ length: Number(summary.stageCount) }, (_, index) => (
            <StageTimelineItem key={index} pipelineId={pipelineId} index={index} />
          ))}
        </ol>
      </section>

      <Link to="/pipelines" className="text-sm font-semibold text-sky-700 underline">
        Back to My Pipelines
      </Link>
    </div>
  )
}
