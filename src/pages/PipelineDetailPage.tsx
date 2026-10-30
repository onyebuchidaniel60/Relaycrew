import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageHeader } from '../components/PageHeader'
import { StatusPill } from '../components/StatusPill'
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
  formatCountdown,
  formatDuration,
  formatTimestamp,
  isTerminalPipeline,
  pipelineStatusLabel,
  shortAddress,
  stageStatusLabel,
  stageTone,
  statusTone,
  type StatusTone,
} from '../lib/pipelineDisplay'
import { byteLength, validateDeliverableUri } from '../lib/validation'

type PendingAction = 'approve' | 'reject' | 'expire'

function StageTimelineItem({ pipelineId, index }: { pipelineId: bigint; index: number }) {
  const query = usePipelineStage(pipelineId, BigInt(index))

  if (query.isLoading) {
    return (
      <li className="rc-timeline-item">
        <span className="rc-timeline-marker animate-pulse" aria-hidden="true">
          …
        </span>
        <div className="min-w-0 pt-2 text-[10px] text-muted">Loading stage…</div>
      </li>
    )
  }

  if (query.isError || !query.data) {
    return (
      <li className="rc-timeline-item">
        <span className="rc-timeline-marker border-rust-line bg-rust-soft text-rust" aria-hidden="true">
          !
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-rust">Stage {index + 1} could not be loaded.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rc-button rc-button-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
          >
            Retry
          </button>
        </div>
      </li>
    )
  }

  const stage = query.data
  const status = Number(stage.status)
  const safeUri =
    stage.deliverableURI.startsWith('https://') || stage.deliverableURI.startsWith('ipfs://')
  const itemClass =
    status === 3
      ? 'is-paid'
      : status === 1
        ? 'is-active'
        : status === 2
          ? 'is-submitted'
          : status === 4
            ? 'is-rejected'
            : status === 5
              ? 'is-expired'
              : ''

  return (
    <li className={`rc-timeline-item ${itemClass}`.trim()}>
      <span className="rc-timeline-marker" aria-hidden="true">
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="rc-eyebrow">Stage {index + 1}</p>
            <h3 className="mt-1 font-display text-lg font-medium tracking-[-0.035em] text-ink">
              {stage.title}
            </h3>
          </div>
          <StatusPill tone={stageTone(status)}>{stageStatusLabel(status)}</StatusPill>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-muted">{stage.brief}</p>

        <dl className="mt-3 grid gap-2 text-[10px] sm:grid-cols-2">
          <div>
            <dt className="rc-eyebrow">Provider</dt>
            <dd className="mt-0.5 truncate font-mono text-ink" title={stage.provider}>
              {shortAddress(stage.provider)}
            </dd>
          </div>
          <div>
            <dt className="rc-eyebrow">Budget</dt>
            <dd className="mt-0.5 font-mono text-ink">{formatUsdcDisplay(stage.budget)} USDC</dd>
          </div>
          <div>
            <dt className="rc-eyebrow">Duration</dt>
            <dd className="mt-0.5 text-ink">{formatDuration(Number(stage.durationSeconds))}</dd>
          </div>
          <div>
            <dt className="rc-eyebrow">Work deadline</dt>
            <dd className="mt-0.5 text-ink">{formatTimestamp(stage.dueAt)}</dd>
          </div>
          {Number(stage.submittedAt) > 0 ? (
            <div>
              <dt className="rc-eyebrow">Submitted</dt>
              <dd className="mt-0.5 text-ink">{formatTimestamp(stage.submittedAt)}</dd>
            </div>
          ) : null}
          {status === 2 ? (
            <div>
              <dt className="rc-eyebrow">Evaluation deadline</dt>
              <dd className="mt-0.5 text-ink">{formatTimestamp(stage.evaluationDeadline)}</dd>
            </div>
          ) : null}
        </dl>

        {stage.deliverableURI ? (
          <p className="mt-3 break-words text-[10px] leading-5">
            <span className="font-semibold text-ink-soft">Deliverable: </span>
            {safeUri ? (
              <a
                href={stage.deliverableURI}
                target="_blank"
                rel="noopener noreferrer"
                className="rc-link break-all"
              >
                {stage.deliverableURI} ↗
              </a>
            ) : (
              <span className="break-all text-muted">{stage.deliverableURI}</span>
            )}
          </p>
        ) : null}
      </div>

      <div className="rc-timeline-amount">
        {formatUsdcDisplay(stage.budget)} USDC
        <span className={status === 3 ? 'is-paid' : status === 1 ? 'is-active' : ''}>
          {stageStatusLabel(status)}
        </span>
      </div>
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
  const now = useNow(1000)
  const { run } = useTxRunner()
  const writes = usePipelineWrites()
  const [deliverableUri, setDeliverableUri] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  if (!pipelineId) {
    return (
      <div>
        <PageHeader
          eyebrow="Pipeline"
          title="Pipeline not found"
          description="The pipeline ID in this URL is invalid."
          breadcrumb={
            <>
              <Link to="/">RelayCrew</Link> / <Link to="/pipelines">Pipelines</Link>
            </>
          }
        />
        <Link to="/pipelines" className="rc-button">
          Back to my pipelines
        </Link>
      </div>
    )
  }

  if (summaryQuery.isLoading) {
    return (
      <div className="pt-6">
        <div className="rc-skeleton h-56" />
      </div>
    )
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div>
        <PageHeader
          eyebrow="Pipeline"
          title={`Pipeline #${pipelineId.toString()}`}
          description="This pipeline could not be read from Arc Testnet."
          breadcrumb={
            <>
              <Link to="/">RelayCrew</Link> / <Link to="/pipelines">Pipelines</Link> / #
              {pipelineId.toString()}
            </>
          }
        />
        <div className="rc-alert rc-alert-danger">
          <p>Failed to load data. The pipeline may not exist, or the RPC read failed.</p>
          <button
            type="button"
            onClick={() => void summaryQuery.refetch()}
            className="rc-button rc-button-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
          >
            Retry
          </button>
        </div>
        <Link to="/pipelines" className="rc-button mt-4">
          Back to my pipelines
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
  const activeDeadline =
    currentStage && stageStatus === 1
      ? Number(currentStage.dueAt)
      : currentStage && stageStatus === 2
        ? Number(currentStage.evaluationDeadline)
        : undefined
  const deadlineSecondsRemaining = activeDeadline === undefined ? undefined : activeDeadline - now
  const uriProblem = deliverableUri.trim() ? validateDeliverableUri(deliverableUri) : null
  const stageCount = Number(summary.stageCount)
  const stageNumber = (currentIndex ?? 0) + 1

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
    setPendingAction(null)

    await run('Approve stage', () => writes.approveStage(pipelineId, BigInt(currentIndex)))
  }

  const reject = async () => {
    if (!pipelineId || currentIndex === undefined || !currentStage || !canReview) return
    setPendingAction(null)

    await run('Reject stage', () => writes.rejectStage(pipelineId, BigInt(currentIndex)))
  }

  const expire = async () => {
    if (!pipelineId || !canExpire) return
    setPendingAction(null)

    await run('Expire pipeline', () => writes.expirePipeline(pipelineId))
  }

  const nextHireText = isFinal
    ? 'Final stage — pipeline completes'
    : nextStage
      ? `${nextStage.title} · ${formatUsdcDisplay(nextStage.budget)} USDC`
      : 'Loading next stage…'

  let actionEyebrow = 'Pipeline action'
  let actionTitle = 'No action available'
  let actionPill = 'Read only'
  let actionTone: StatusTone = 'neutral'

  if (!address) {
    actionEyebrow = 'Wallet'
    actionTitle = 'Connect to act'
    actionPill = 'Read only'
  } else if (guard.isWrongNetwork) {
    actionEyebrow = 'Network'
    actionTitle = 'Switch to Arc Testnet'
    actionPill = 'Blocked'
    actionTone = 'warm'
  } else if (canReview) {
    actionEyebrow = 'Client review'
    actionTitle = 'Approve or reject'
    actionPill = 'Open'
    actionTone = 'submitted'
  } else if (canSubmit) {
    actionEyebrow = 'Provider action'
    actionTitle = 'Submit deliverable'
    actionPill = 'Active'
    actionTone = 'active'
  } else if (canExpire) {
    actionEyebrow = 'Deadline elapsed'
    actionTitle = 'Expire pipeline'
    actionPill = 'Available'
    actionTone = 'warm'
  } else if (active && isCurrentProvider && stageStatus === 1 && workDeadlinePassed) {
    actionEyebrow = 'Deadline elapsed'
    actionTitle = 'Work deadline passed'
    actionPill = 'Expiry available'
    actionTone = 'warm'
  } else if (active && stageStatus === 2 && !isClient) {
    actionEyebrow = 'Client review'
    actionTitle = 'Evaluation pending'
    actionPill = 'Waiting'
    actionTone = 'submitted'
  } else if (active && stageStatus === 1 && isClient) {
    actionEyebrow = 'Provider action'
    actionTitle = 'Submission pending'
    actionPill = 'Waiting'
    actionTone = 'active'
  }

  const timeline = (
    <section className={`rc-card p-4 sm:p-5 ${terminal ? '' : 'order-last lg:order-none'}`.trim()}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="rc-eyebrow">Stage timeline</p>
          <h2 className="mt-1.5 font-display text-2xl font-medium tracking-[-0.045em] text-ink">
            The relay is the product
          </h2>
        </div>
        <StatusPill tone={active ? 'active' : statusTone(status)}>
          {active ? '1 active stage' : `${stageCount} stages`}
        </StatusPill>
      </div>

      <ol className="rc-timeline">
        {Array.from({ length: stageCount }, (_, index) => (
          <StageTimelineItem key={index} pipelineId={pipelineId} index={index} />
        ))}
      </ol>

      {active ? (
        <div className="rc-warning mt-5">
          The client is the sole evaluator. Approval pays the current provider and{' '}
          {isFinal ? 'completes the pipeline' : `activates ${nextStage?.title ?? 'the next specialist'}`}{' '}
          in the same transaction. Rejection ends the pipeline and refunds the remaining escrow.
        </div>
      ) : null}
    </section>
  )

  return (
    <div>
      <div className="pb-5 pt-1">
        <p className="rc-breadcrumb">
          <Link to="/">RelayCrew</Link> / <Link to="/pipelines">Pipelines</Link> / #
          {pipelineId.toString()}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-[780px]">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={statusTone(status)}>{pipelineStatusLabel(status)}</StatusPill>
              {active && currentStage ? (
                <StatusPill tone={stageTone(stageStatus ?? 0)}>
                  {stageStatusLabel(stageStatus ?? 0)} stage
                </StatusPill>
              ) : null}
              <StatusPill tone="neutral" dot={false} className="normal-case tracking-[0.04em]">
                Client {shortAddress(summary.client)}
              </StatusPill>
            </div>
            <h1 className="rc-page-title">
              {active
                ? (currentStage?.title ?? `Stage ${stageNumber}`)
                : pipelineStatusLabel(status)}
            </h1>
            <p className="mt-3 text-[11px] leading-6 text-muted">
              {active
                ? `Stage ${stageNumber} of ${stageCount} · created ${formatTimestamp(summary.createdAt)} · contract is the source of truth`
                : `Client ${shortAddress(summary.client)} · created ${formatTimestamp(summary.createdAt)} · finished ${formatTimestamp(summary.finishedAt)}`}
            </p>
          </div>
          <Link to="/pipelines" className="rc-button rc-button-sm">
            Back to pipelines
          </Link>
        </div>
      </div>

      <section className="rc-money-grid" aria-label="Pipeline money summary">
        <div className="rc-money-cell">
          <span>Total budget</span>
          <strong>{formatUsdcDisplay(summary.totalBudget)} USDC</strong>
        </div>
        <div className="rc-money-cell">
          <span>Paid out</span>
          <strong>{formatUsdcDisplay(summary.paidOut)} USDC</strong>
        </div>
        <div className="rc-money-cell">
          <span>Remaining escrow</span>
          <strong>{formatUsdcDisplay(remaining)} USDC</strong>
        </div>
        <div className="rc-money-cell">
          <span>{terminal ? 'Refunded to client' : 'Refund if rejected'}</span>
          <strong>
            {formatUsdcDisplay(terminal ? summary.refundedAmount : remaining)} USDC
          </strong>
        </div>
      </section>

      {!appConfig.isValid ? (
        <div className="rc-alert rc-alert-danger mt-4" role="alert">
          Chain configuration is invalid. Actions are disabled.
        </div>
      ) : null}

      {!terminal && !address ? (
        <div className="rc-alert rc-alert-info mt-4">
          Connect a wallet to submit, evaluate, or expire this pipeline.
        </div>
      ) : null}

      {!terminal && address && guard.isWrongNetwork ? (
        <div className="rc-alert rc-alert-danger mt-4" role="alert">
          Wrong Network: Please switch to Arc Testnet before acting.
        </div>
      ) : null}

      {terminal ? (
        <>
          <section className="rc-card mt-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="rc-eyebrow">Settlement ledger</p>
                <h2 className="mt-1.5 font-display text-[32px] font-medium leading-none tracking-[-0.05em] text-ink">
                  {pipelineStatusLabel(status)}
                </h2>
                <p className="mt-2 max-w-[620px] text-[11px] leading-5 text-muted">
                  {status === 1
                    ? `${formatUsdcDisplay(summary.totalBudget)} USDC was paid to the stage providers.`
                    : `${formatUsdcDisplay(summary.refundedAmount)} USDC was refunded to the client.`}
                </p>
              </div>
              <StatusPill tone={statusTone(status)}>{pipelineStatusLabel(status)}</StatusPill>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="rc-eyebrow">Total budget</dt>
                <dd className="mt-1 font-mono text-lg font-medium text-ink">
                  {formatUsdcDisplay(summary.totalBudget)} USDC
                </dd>
              </div>
              <div>
                <dt className="rc-eyebrow">Paid out</dt>
                <dd className="mt-1 font-mono text-lg font-medium text-ink">
                  {formatUsdcDisplay(summary.paidOut)} USDC
                </dd>
              </div>
              <div>
                <dt className="rc-eyebrow">Refunded</dt>
                <dd className="mt-1 font-mono text-lg font-medium text-ink">
                  {formatUsdcDisplay(summary.refundedAmount)} USDC
                </dd>
              </div>
              <div>
                <dt className="rc-eyebrow">Finished</dt>
                <dd className="mt-1 text-[11px] text-ink">{formatTimestamp(summary.finishedAt)}</dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-line pt-3 text-[10px] leading-5 text-muted">
              No further actions are available. Previous payouts are irreversible.
            </p>
          </section>

          <div className="mt-4">{timeline}</div>
        </>
      ) : (
        <div className="mt-4 grid items-start gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.72fr)]">
          {timeline}

          <aside className="rc-card rc-action-card order-first lg:order-none">
            <div className="rc-action-head">
              <div>
                <p className="rc-eyebrow">{actionEyebrow}</p>
                <h2>{actionTitle}</h2>
              </div>
              <StatusPill tone={actionTone}>{actionPill}</StatusPill>
            </div>

            {activeDeadline !== undefined ? (
              <div className="rc-countdown">
                <span>{stageStatus === 1 ? 'Work deadline' : 'Evaluation deadline'}</span>
                <strong>
                  {deadlineSecondsRemaining !== undefined && deadlineSecondsRemaining > 0
                    ? formatCountdown(deadlineSecondsRemaining)
                    : 'Deadline passed'}
                </strong>
              </div>
            ) : null}

            {currentStage ? (
              <>
                <div className="rc-action-amount">
                  <span>Payout on approval</span>
                  <strong>{formatUsdcDisplay(currentStage.budget)} USDC</strong>
                </div>
                <div className="rc-summary-line">
                  <span>Recipient</span>
                  <strong>{shortAddress(currentStage.provider)}</strong>
                </div>
                <div className="rc-summary-line">
                  <span>Next hire</span>
                  <strong>{nextHireText}</strong>
                </div>
                <div className="rc-summary-line">
                  <span>Refund if rejected</span>
                  <strong>{formatUsdcDisplay(remaining)} USDC</strong>
                </div>
                {activeDeadline !== undefined ? (
                  <div className="rc-summary-line">
                    <span>{stageStatus === 1 ? 'Work deadline' : 'Evaluation deadline'}</span>
                    <strong>{formatTimestamp(activeDeadline)}</strong>
                  </div>
                ) : null}
              </>
            ) : null}

            {canSubmit ? (
              <div className="rc-subcard">
                <p className="rc-eyebrow">Provider deliverable</p>
                <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                  Submit stage {stageNumber}
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Your URI is public and permanent. The app will not fetch or embed its contents.
                </p>
                <label className="rc-field-label mt-3">
                  Deliverable URI
                  <input
                    value={deliverableUri}
                    onChange={(event) => setDeliverableUri(event.target.value)}
                    placeholder="https://… or ipfs://…"
                    className="rc-input mt-1.5 font-mono"
                  />
                </label>
                <div className="mt-1 flex items-center justify-between gap-3 text-[9px] text-muted">
                  <span>{byteLength(deliverableUri.trim())}/256 bytes</span>
                  {uriProblem ? <span className="text-right text-rust">{uriProblem}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!deliverableUri.trim() || Boolean(uriProblem)}
                  className="rc-button rc-button-primary rc-button-block mt-3"
                >
                  Submit stage
                </button>
              </div>
            ) : null}

            {canReview && currentStage ? (
              <div className="rc-subcard">
                <p className="rc-eyebrow">Client decision</p>
                <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                  Approve or reject stage {stageNumber}
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Approval pays the current provider and {isFinal ? 'completes the pipeline' : 'activates the next specialist'}.
                  Rejection refunds the remaining escrow. Both actions are irreversible.
                </p>
                <button
                  type="button"
                  onClick={() => setPendingAction('approve')}
                  className="rc-button rc-button-primary rc-button-block mt-3"
                >
                  Approve &amp; pay {formatUsdcDisplay(currentStage.budget)} USDC
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAction('reject')}
                  className="rc-button rc-button-rust rc-button-block mt-2"
                >
                  Reject &amp; refund {formatUsdcDisplay(remaining)} USDC
                </button>
              </div>
            ) : null}

            {canExpire ? (
              <div className="rc-subcard">
                <p className="rc-eyebrow">Permissionless expiry</p>
                <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                  The deadline has elapsed.
                </h3>
                <p className="mt-1 text-[10px] leading-5 text-muted">
                  Anyone may expire this pipeline. The refund recipient is fixed to the client:{' '}
                  {shortAddress(summary.client)}.
                </p>
                <div className="rc-summary-line mt-3 border-t-0 pt-0">
                  <span>Refund</span>
                  <strong>{formatUsdcDisplay(remaining)} USDC</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAction('expire')}
                  disabled={!guard.isWriteEnabled}
                  className="rc-button rc-button-warm rc-button-block mt-2"
                >
                  Expire pipeline
                </button>
              </div>
            ) : null}

            {active && isCurrentProvider && stageStatus === 1 && workDeadlinePassed ? (
              <div className="rc-alert rc-alert-warm mt-4">
                The work deadline has passed. The pipeline can now be expired by anyone.
              </div>
            ) : null}

            {active && stageStatus === 2 && !isClient ? (
              <div className="rc-note mt-4">
                Waiting for the client to evaluate the submitted stage.
              </div>
            ) : null}

            {active && stageStatus === 1 && isClient ? (
              <div className="rc-note mt-4">
                Waiting for the current provider to submit. The client can review after submission.
              </div>
            ) : null}

            {active &&
            !canSubmit &&
            !canReview &&
            !canExpire &&
            address &&
            guard.isWriteEnabled &&
            !(stageStatus === 1 && isClient) &&
            !(stageStatus === 2 && !isClient) &&
            !(isCurrentProvider && stageStatus === 1 && workDeadlinePassed) ? (
              <div className="rc-note mt-4">
                No action is available for this wallet right now. The contract remains the source of
                truth; refresh to reread the latest state.
              </div>
            ) : null}

            <p className="mt-4 border-t border-line pt-3 text-[9px] leading-4 text-muted-light">
              The app never signs for you. The client is the sole evaluator; there is no dispute
              mechanism.
            </p>
          </aside>
        </div>
      )}

      <Link to="/pipelines" className="rc-button rc-button-sm mt-5">
        Back to my pipelines
      </Link>

      {pendingAction === 'approve' && currentStage ? (
        <ConfirmDialog
          title={`Approve stage ${stageNumber} and pay?`}
          description={
            <>
              This releases{' '}
              <span className="font-mono text-ink">
                {formatUsdcDisplay(currentStage.budget)} USDC
              </span>{' '}
              to the current provider and{' '}
              {isFinal
                ? 'completes the pipeline'
                : `activates ${nextStage?.title ?? 'the next stage'} for ${formatUsdcDisplay(
                    nextStage?.budget ?? 0n,
                  )} USDC`}{' '}
              in the same transaction. This action is irreversible.
            </>
          }
          details={[
            { label: 'Recipient', value: currentStage.provider },
            { label: 'Payout', value: `${formatUsdcDisplay(currentStage.budget)} USDC` },
            { label: 'Next hire', value: nextHireText },
            { label: 'Remaining escrow', value: `${formatUsdcDisplay(remaining)} USDC` },
          ]}
          confirmLabel={`Approve & pay ${formatUsdcDisplay(currentStage.budget)} USDC`}
          confirmTone="primary"
          note="The provider payout and the next-stage activation are one transaction. Previous payouts are final."
          onConfirm={() => void approve()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {pendingAction === 'reject' && currentStage ? (
        <ConfirmDialog
          title={`Reject stage ${stageNumber} and end the pipeline?`}
          description={
            <>
              This ends the pipeline and refunds{' '}
              <span className="font-mono text-ink">{formatUsdcDisplay(remaining)} USDC</span> to the
              client. The current provider is not paid for this stage. Previous payouts are final.
              This action is irreversible.
            </>
          }
          details={[
            { label: 'Refund recipient', value: summary.client },
            { label: 'Refund', value: `${formatUsdcDisplay(remaining)} USDC` },
            { label: 'Already paid out', value: `${formatUsdcDisplay(summary.paidOut)} USDC` },
            { label: 'Stage', value: `${stageNumber} of ${stageCount}` },
          ]}
          confirmLabel={`Reject & refund ${formatUsdcDisplay(remaining)} USDC`}
          confirmTone="danger"
          note="There is no appeal or arbitration path after rejection."
          onConfirm={() => void reject()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {pendingAction === 'expire' ? (
        <ConfirmDialog
          title="Expire this pipeline?"
          description={
            <>
              The deadline has elapsed. This refunds{' '}
              <span className="font-mono text-ink">{formatUsdcDisplay(remaining)} USDC</span> to the
              client and ends the pipeline. This action is irreversible.
            </>
          }
          details={[
            { label: 'Refund recipient', value: summary.client },
            { label: 'Refund', value: `${formatUsdcDisplay(remaining)} USDC` },
            { label: 'Deadline', value: formatTimestamp(activeDeadline) },
            { label: 'Caller', value: address ?? 'Not connected' },
          ]}
          confirmLabel={`Expire & refund ${formatUsdcDisplay(remaining)} USDC`}
          confirmTone="warm"
          note="Expiry is permissionless once the eligible deadline has passed. The recipient is fixed by the contract."
          onConfirm={() => void expire()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}
    </div>
  )
}
