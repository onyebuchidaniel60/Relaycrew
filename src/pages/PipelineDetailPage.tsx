import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConfirmDialog } from '../components/ConfirmDialog'
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

function ExternalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function shortDeliverable(uri: string) {
  return uri.length > 42 ? `${uri.slice(0, 39)}…` : uri
}

function StageTimelineItem({ pipelineId, index }: { pipelineId: bigint; index: number }) {
  const query = usePipelineStage(pipelineId, BigInt(index))

  if (query.isLoading) {
    return (
      <li className="relay-item" aria-busy="true">
        <span className="relay-node animate-pulse" aria-hidden="true">
          …
        </span>
        <div className="relay-main">
          <div className="rc-skeleton h-4 w-24" />
          <div className="rc-skeleton mt-2 h-6 w-56 max-w-full" />
          <div className="rc-skeleton mt-2 h-3 w-40" />
        </div>
        <span className="sr-only">Loading stage {index + 1}</span>
      </li>
    )
  }

  if (query.isError || !query.data) {
    return (
      <li className="relay-item">
        <span className="relay-node border-rust-line bg-rust-soft text-rust" aria-hidden="true">
          !
        </span>
        <div className="relay-main">
          <p className="text-[11px] text-rust">Stage {index + 1} could not be loaded.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="btn btn-outline btn-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
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
      ? 'done'
      : status === 1 || status === 2
        ? 'active'
        : status === 4
          ? 'is-rejected'
          : status === 5
            ? 'is-expired'
            : ''

  return (
    <li className={`relay-item ${itemClass}`.trim()}>
      <span className="relay-node" aria-hidden="true">
        {status === 3 ? <CheckIcon /> : String(index + 1).padStart(2, '0')}
      </span>
      <div className="relay-main">
        <div className="relay-topline">
          <span className="stage-label">Stage {String(index + 1).padStart(2, '0')}</span>
          <StatusPill tone={stageTone(status)}>{stageStatusLabel(status)}</StatusPill>
        </div>
        <h3>{stage.title}</h3>
        <div className="relay-agent">
          <span className="agent-name">{shortAddress(stage.provider)}</span>
          <span className="agent-dot" aria-hidden="true" />
          <span>{formatDuration(Number(stage.durationSeconds))} work window</span>
        </div>

        {status === 2 ? (
          <div className="active-stage-box">
            <div className="box-head">
              <span>Submitted deliverable</span>
              <strong>Client review</strong>
            </div>
            <p className="brief-quote">“{stage.brief}”</p>
            <div className="deliverable-row">
              <div className="deliverable-file">
                <span className="file-icon" aria-hidden="true">
                  <FileIcon />
                </span>
                <div>
                  <strong>
                    {stage.deliverableURI
                      ? shortDeliverable(stage.deliverableURI)
                      : 'Deliverable reference'}
                  </strong>
                  <small>
                    {safeUri ? 'Public HTTPS or IPFS reference' : 'Stored reference · not linked'}
                  </small>
                </div>
              </div>
              {safeUri ? (
                <a
                  className="deliverable-link"
                  href={stage.deliverableURI}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open deliverable
                  <ExternalIcon />
                </a>
              ) : null}
            </div>
            <div className="relay-meta">
              <span>Evaluation closes {formatTimestamp(stage.evaluationDeadline)}</span>
              <span>Review window · 24 hours</span>
            </div>
          </div>
        ) : (
          <p className="relay-desc">{stage.brief}</p>
        )}

        <div className="relay-meta">
          <span>
            {status === 2 ? 'Submitted' : 'Work deadline'}{' '}
            {formatTimestamp(status === 2 ? stage.submittedAt : stage.dueAt)}
          </span>
          <span>Provider {shortAddress(stage.provider)}</span>
          {stage.deliverableURI && status !== 2 ? (
            <span>
              Deliverable{' '}
              {safeUri ? (
                <a
                  href={stage.deliverableURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rc-link"
                >
                  {shortDeliverable(stage.deliverableURI)} ↗
                </a>
              ) : (
                stage.deliverableURI
              )}
            </span>
          ) : null}
        </div>
      </div>
      <div className="relay-amount">
        {formatUsdcDisplay(stage.budget)} USDC
        <small className={status === 3 ? 'is-paid' : status === 1 || status === 2 ? 'is-active' : ''}>
          {status === 3 ? 'Paid in full' : stageStatusLabel(status)}
        </small>
      </div>
    </li>
  )
}

function StageLedgerRow({ pipelineId, index }: { pipelineId: bigint; index: number }) {
  const query = usePipelineStage(pipelineId, BigInt(index))

  if (query.isLoading) {
    return (
      <tr>
        <td colSpan={5} className="text-[10px] text-muted">
          Loading stage {index + 1}…
        </td>
      </tr>
    )
  }

  if (query.isError || !query.data) {
    return (
      <tr>
        <td colSpan={5}>
          <span className="text-[10px] text-rust">Stage {index + 1} could not be loaded.</span>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="btn btn-outline btn-sm ml-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
          >
            Retry
          </button>
        </td>
      </tr>
    )
  }

  const stage = query.data
  const status = Number(stage.status)
  const safeUri =
    stage.deliverableURI.startsWith('https://') || stage.deliverableURI.startsWith('ipfs://')
  const amountLabel =
    status === 3
      ? 'Paid'
      : status === 4
        ? 'Rejected'
        : status === 5
          ? 'Expired'
          : 'Unpaid'

  return (
    <tr>
      <td className="ledger-stage-cell">
        <div className="ledger-stage">
          <span
            className={`stage-mark ${status === 3 ? '' : 'bg-rust-soft text-rust'}`.trim()}
            aria-hidden="true"
          >
            {status === 3 ? <CheckIcon className="h-3 w-3" /> : String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <strong>{stage.title}</strong>
            <small>Stage {String(index + 1).padStart(2, '0')}</small>
          </div>
        </div>
      </td>
      <td className="ledger-agent-cell">
        <div className="ledger-agent">
          {shortAddress(stage.provider)}
          <small>Provider</small>
        </div>
      </td>
      <td className="ledger-deliverable-cell">
        <div className="ledger-deliverable">
          {stage.deliverableURI ? (
            safeUri ? (
              <a href={stage.deliverableURI} target="_blank" rel="noopener noreferrer">
                {shortDeliverable(stage.deliverableURI)}
                <ExternalIcon />
              </a>
            ) : (
              <span>{shortDeliverable(stage.deliverableURI)}</span>
            )
          ) : (
            <span>—</span>
          )}
          <small>{stageStatusLabel(status)}</small>
        </div>
      </td>
      <td className="ledger-date-cell">
        <span className="ledger-date">
          {Number(stage.submittedAt) > 0 ? formatTimestamp(stage.submittedAt) : '—'}
        </span>
      </td>
      <td className="ledger-amount-cell">
        <div className="ledger-amount">
          {formatUsdcDisplay(stage.budget)} USDC
          <small className={status === 3 ? '' : 'is-unpaid'}>{amountLabel}</small>
        </div>
      </td>
    </tr>
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
      <div className="app-main">
        <div className="wrap">
          <p className="breadcrumb">
            <Link to="/">RelayCrew</Link>
            <span className="slash">/</span>
            <Link to="/pipelines">Pipelines</Link>
          </p>
          <header className="app-head">
            <div>
              <h1>Pipeline not found.</h1>
              <p className="app-sub">
                <span>The pipeline ID in this URL is invalid.</span>
              </p>
            </div>
          </header>
          <Link className="btn btn-outline mt-5" to="/pipelines">
            Back to my pipelines
          </Link>
        </div>
      </div>
    )
  }

  if (summaryQuery.isLoading) {
    return (
      <div className="app-main">
        <div className="wrap">
          <div className="rc-skeleton mt-4 h-4 w-48" />
          <div className="rc-skeleton mt-4 h-[86px]" />
          <div className="rc-skeleton mt-3 h-[110px]" />
          <div className="rc-skeleton mt-3 h-[380px]" />
        </div>
      </div>
    )
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div className="app-main">
        <div className="wrap">
          <p className="breadcrumb">
            <Link to="/">RelayCrew</Link>
            <span className="slash">/</span>
            <Link to="/pipelines">Pipelines</Link>
            <span className="slash">/</span>#{pipelineId.toString()}
          </p>
          <header className="app-head">
            <div>
              <h1>Pipeline #{pipelineId.toString()}</h1>
              <p className="app-sub">
                <span>This pipeline could not be read from {appConfig.networkLabel}.</span>
              </p>
            </div>
          </header>
          <div className="rc-alert rc-alert-danger mt-5">
            <p>Failed to load data. The pipeline may not exist, or the RPC read failed.</p>
            <button
              type="button"
              onClick={() => void summaryQuery.refetch()}
              className="btn btn-outline btn-sm mt-2 border-rust-line bg-paper text-rust hover:bg-rust-soft"
            >
              Retry
            </button>
          </div>
          <Link className="btn btn-outline mt-4" to="/pipelines">
            Back to my pipelines
          </Link>
        </div>
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
  const remainingAfterRelease =
    currentStage && remaining > currentStage.budget ? remaining - currentStage.budget : 0n
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
  const releasedStages = status === 1 ? stageCount : Math.min(currentIndex ?? 0, stageCount)
  const releasedPercent =
    stageCount > 0 ? Math.max(0, Math.min(100, Math.round((releasedStages * 100) / stageCount))) : 0
  const deadlineWindowSeconds =
    stageStatus === 2 ? 86_400 : Number(currentStage?.durationSeconds ?? 0)
  const deadlinePercent =
    deadlineWindowSeconds > 0 && deadlineSecondsRemaining !== undefined
      ? Math.max(0, Math.min(100, Math.round((deadlineSecondsRemaining / deadlineWindowSeconds) * 100)))
      : 0

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
    actionTitle = `Switch to ${appConfig.networkLabel}`
    actionPill = 'Blocked'
    actionTone = 'warm'
  } else if (canReview) {
    actionEyebrow = 'Client review'
    actionTitle = 'Review the handoff.'
    actionPill = 'Open'
    actionTone = 'submitted'
  } else if (canSubmit) {
    actionEyebrow = 'Provider action'
    actionTitle = 'Submit the deliverable.'
    actionPill = 'Active'
    actionTone = 'active'
  } else if (canExpire) {
    actionEyebrow = 'Deadline elapsed'
    actionTitle = 'Expire the pipeline.'
    actionPill = 'Available'
    actionTone = 'warm'
  } else if (active && isCurrentProvider && stageStatus === 1 && workDeadlinePassed) {
    actionEyebrow = 'Deadline elapsed'
    actionTitle = 'Work deadline passed.'
    actionPill = 'Expiry available'
    actionTone = 'warm'
  } else if (active && stageStatus === 2 && !isClient) {
    actionEyebrow = 'Client review'
    actionTitle = 'Evaluation pending.'
    actionPill = 'Waiting'
    actionTone = 'submitted'
  } else if (active && stageStatus === 1 && isClient) {
    actionEyebrow = 'Provider action'
    actionTitle = 'Submission pending.'
    actionPill = 'Waiting'
    actionTone = 'active'
  }

  const viewerRole = !address
    ? 'Read only'
    : isClient
      ? 'Client'
      : isCurrentProvider
        ? 'Provider'
        : 'Observer'
  const title = active
    ? (currentStage?.title ?? `Stage ${stageNumber}`)
    : `Pipeline #${pipelineId.toString()}`

  const timeline = (
    <section className="panel timeline-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Stage timeline</p>
          <h2>The relay, in order.</h2>
        </div>
        <div className="panel-note">
          {stageCount} stages · {active ? '1 active' : 'closed'}
          <br />
          Contract is the source of truth
        </div>
      </div>

      <ol className="timeline">
        {Array.from({ length: stageCount }, (_, index) => (
          <StageTimelineItem key={index} pipelineId={pipelineId} index={index} />
        ))}
      </ol>

      {active ? (
        <div className="timeline-footnote">
          <InfoIcon />
          <span>
            The client is the sole evaluator. Approval pays the current provider and{' '}
            {isFinal ? 'completes the pipeline' : `activates ${nextStage?.title ?? 'the next specialist'}`}{' '}
            in the same transaction. Rejection ends the pipeline and refunds{' '}
            <strong>{formatUsdcDisplay(remaining)} USDC</strong>.
          </span>
        </div>
      ) : null}
    </section>
  )

  return (
    <div className="app-main">
      <div className="wrap">
        <p className="breadcrumb">
          <Link to="/">RelayCrew</Link>
          <span className="slash">/</span>
          <Link to="/pipelines">Pipelines</Link>
          <span className="slash">/</span>#{pipelineId.toString()}
          {terminal ? <> · {pipelineStatusLabel(status)}</> : null}
        </p>

        <header className="app-head">
          <div>
            <div className="status-row">
              <StatusPill tone={statusTone(status)}>{pipelineStatusLabel(status)}</StatusPill>
              {active && currentStage ? (
                <StatusPill tone={stageTone(stageStatus ?? 0)}>
                  Stage {String(stageNumber).padStart(2, '0')} · {stageStatusLabel(stageStatus ?? 0)}
                </StatusPill>
              ) : terminal ? (
                <StatusPill tone="active">
                  {releasedStages} of {stageCount} stages paid
                </StatusPill>
              ) : null}
              <span className="chip">
                <span className="dot" aria-hidden="true" />
                Client · {shortAddress(summary.client)}
              </span>
            </div>
            <h1>{title}</h1>
            <p className="app-sub">
              <span>Pipeline #{pipelineId.toString()}</span>
              {active ? <span>Stage {stageNumber} of {stageCount}</span> : null}
              <span>{formatUsdcDisplay(summary.totalBudget)} USDC escrow</span>
              <span>Created {formatTimestamp(summary.createdAt)}</span>
              {terminal ? <span>Finished {formatTimestamp(summary.finishedAt)}</span> : null}
              <span>{appConfig.networkLabel}</span>
            </p>
          </div>
          <div className="app-head-actions">
            <Link className="btn btn-outline btn-sm" to="/pipelines">
              Back to pipelines
            </Link>
          </div>
        </header>

        <section className="money-band" aria-label={terminal ? 'Settlement summary' : 'Pipeline money summary'}>
          <div className="money-cell">
            <span>Total budget</span>
            <strong>{formatUsdcDisplay(summary.totalBudget)} USDC</strong>
            <small>Funded {formatTimestamp(summary.createdAt)}</small>
          </div>
          <div className="money-cell">
            <span>Paid out</span>
            <strong>{formatUsdcDisplay(summary.paidOut)} USDC</strong>
            <small>
              {releasedStages} of {stageCount} stages released
            </small>
          </div>
          <div className="money-cell">
            <span>{terminal ? 'Refunded' : 'Remaining escrow'}</span>
            <strong>
              {formatUsdcDisplay(terminal ? summary.refundedAmount : remaining)} USDC
            </strong>
            <small>
              {terminal
                ? summary.refundedAmount > 0n
                  ? 'Returned to client'
                  : 'No unpaid balance'
                : 'Reserved for remaining stages'}
            </small>
          </div>
          <div className="money-cell">
            <span>{terminal ? 'Finished' : 'Refund if rejected'}</span>
            <strong>
              {terminal ? formatTimestamp(summary.finishedAt) : `${formatUsdcDisplay(remaining)} USDC`}
            </strong>
            <small>{terminal ? 'No further actions' : 'Current stage is unpaid'}</small>
          </div>
          <div className="money-rail" aria-hidden="true">
            <span className="released" style={{ width: `${releasedPercent}%` }} />
            <span
              className={terminal && summary.refundedAmount > 0n ? 'refunded' : 'in-escrow'}
              style={{ width: `${100 - releasedPercent}%` }}
            />
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
            Wrong Network: Please switch to {appConfig.networkLabel} before acting.
          </div>
        ) : null}

        {terminal ? (
          <div className="ledger-grid">
            <section className="panel ledger-panel">
              <div className="ledger-head">
                <p className="eyebrow">Settlement ledger</p>
                <h2>The final account.</h2>
                <p>
                  {status === 1
                    ? 'Every stage approved. Every payout released in order. No balance remains in the parent escrow.'
                    : 'The relay stopped. Prior payouts remain final; the unpaid balance was returned to the client.'}
                </p>
                <span className="ledger-stamp">{pipelineStatusLabel(status)}</span>
              </div>

              <table className="ledger-table">
                <thead>
                  <tr>
                    <th scope="col">Stage</th>
                    <th scope="col">Specialist</th>
                    <th scope="col">Deliverable</th>
                    <th scope="col">Submitted</th>
                    <th scope="col" className="amount-col">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: stageCount }, (_, index) => (
                    <StageLedgerRow key={index} pipelineId={pipelineId} index={index} />
                  ))}
                </tbody>
              </table>

              <div className="ledger-total">
                <span>Total paid to specialists</span>
                <strong>{formatUsdcDisplay(summary.paidOut)} USDC</strong>
              </div>

              <div className="reconcile">
                <div className="reconcile-cell">
                  <span>Funded</span>
                  <strong>{formatUsdcDisplay(summary.totalBudget)}</strong>
                </div>
                <div className="reconcile-cell">
                  <span>Paid</span>
                  <strong>{formatUsdcDisplay(summary.paidOut)}</strong>
                </div>
                <div className="reconcile-cell">
                  <span>Refunded</span>
                  <strong>{formatUsdcDisplay(summary.refundedAmount)}</strong>
                </div>
                <div className="reconcile-cell">
                  <span>Platform fee</span>
                  <strong>0.00</strong>
                </div>
              </div>

              <p className="ledger-note">
                <CheckIcon />
                No balance remains in the parent escrow. Previous payouts are irreversible. No
                further actions are available for this pipeline.
              </p>
            </section>

            <aside className="panel record-panel">
              <p className="eyebrow no-rule">On-chain record</p>
              <h2>{appConfig.networkLabel}</h2>

              <div className="record-rows">
                <div className="record-row">
                  <span>Pipeline</span>
                  <strong>#{pipelineId.toString()}</strong>
                </div>
                <div className="record-row">
                  <span>Client</span>
                  <strong>{shortAddress(summary.client)}</strong>
                </div>
                <div className="record-row">
                  <span>Contract</span>
                  <strong>
                    {appConfig.pipelineAddress
                      ? shortAddress(appConfig.pipelineAddress)
                      : 'Not configured'}
                  </strong>
                </div>
                <div className="record-row">
                  <span>Created</span>
                  <strong>{formatTimestamp(summary.createdAt)}</strong>
                </div>
                <div className="record-row">
                  <span>Completed</span>
                  <strong>{formatTimestamp(summary.finishedAt)}</strong>
                </div>
                <div className="record-row">
                  <span>Stages</span>
                  <strong>
                    {releasedStages} paid · {stageCount} total
                  </strong>
                </div>
                <div className="record-row">
                  <span>Settlement</span>
                  <strong>USDC · 6 decimals</strong>
                </div>
              </div>

              <div className="record-outcome">
                <span>Outcome</span>
                <strong>
                  {status === 1 ? 'Paid in full.' : status === 2 ? 'Rejected.' : 'Expired.'}
                </strong>
                <p>
                  {releasedStages} approvals ·{' '}
                  {summary.refundedAmount > 0n ? 'refund issued' : '0 refunds'} · 0.00 fee
                </p>
              </div>

              <div className="record-actions">
                {appConfig.pipelineAddress ? (
                  <a
                    className="btn btn-primary"
                    href={`${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open contract in Explorer
                    <ExternalIcon />
                  </a>
                ) : null}
                <Link className="btn btn-outline" to="/pipelines">
                  Back to pipelines
                </Link>
              </div>

              <p className="record-note">
                The contract is the source of truth. Refresh to reread on-chain state. No transaction
                hash is fabricated in this interface.
              </p>

              <div className="record-variant">
                <strong>Terminal state.</strong> A rejection or eligible expiry uses the same ledger,
                with the unpaid balance returned to the client instead of paid to the remaining
                specialists.
              </div>
            </aside>
          </div>
        ) : (
          <div className="detail-grid">
            {timeline}

            <aside className="action-panel">
              <div className="action-head">
                <div>
                  <p className="eyebrow no-rule">{actionEyebrow}</p>
                  <h2>{actionTitle}</h2>
                </div>
                <div className="text-right">
                  <StatusPill tone={actionTone}>{actionPill}</StatusPill>
                  <span className="action-client-note mt-1.5 block">
                    {viewerRole}
                    <br />
                    {currentStage ? `Stage ${String(stageNumber).padStart(2, '0')}` : 'Read only'}
                  </span>
                </div>
              </div>

              {activeDeadline !== undefined ? (
                <div className="deadline-box">
                  <div className="deadline-head">
                    <span>{stageStatus === 1 ? 'Work window' : 'Evaluation window'}</span>
                    <span className="deadline-close">{formatTimestamp(activeDeadline)}</span>
                  </div>
                  <strong className="deadline-value">
                    {deadlineSecondsRemaining !== undefined && deadlineSecondsRemaining > 0
                      ? formatCountdown(deadlineSecondsRemaining)
                      : 'Deadline passed'}
                  </strong>
                  <div className="deadline-bar">
                    <i style={{ width: `${deadlinePercent}%` }} />
                  </div>
                  <small>
                    {stageStatus === 2
                      ? `Submitted ${formatTimestamp(currentStage?.submittedAt)}. After the deadline, anyone may expire the pipeline.`
                      : `Work deadline ${formatTimestamp(activeDeadline)}. After it passes, anyone may expire the pipeline.`}
                  </small>
                </div>
              ) : null}

              {currentStage ? (
                <div className="action-deliverable">
                  <span className="deliverable-label">
                    {stageStatus === 2 ? 'Deliverable submitted' : 'Current stage'}
                  </span>
                  <strong>{currentStage.title}</strong>
                  <p>
                    {shortAddress(currentStage.provider)} · stage{' '}
                    {String(stageNumber).padStart(2, '0')} ·{' '}
                    {currentStage.deliverableURI ? 'public URI on-chain' : 'awaiting deliverable'}
                  </p>
                </div>
              ) : null}

              {canSubmit ? (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="eyebrow">Provider deliverable</p>
                  <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                    Submit stage {stageNumber}
                  </h3>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Your URI is public and permanent. The app will not fetch or embed its contents.
                  </p>
                  <label className="field-label mt-3" htmlFor="deliverable-uri">
                    Deliverable URI
                  </label>
                  <input
                    id="deliverable-uri"
                    value={deliverableUri}
                    onChange={(event) => setDeliverableUri(event.target.value)}
                    placeholder="https://… or ipfs://…"
                    className="input mono mt-1"
                  />
                  <div className="mt-1 flex items-center justify-between gap-3 text-[9px] text-muted">
                    <span>{byteLength(deliverableUri.trim())}/256 bytes</span>
                    {uriProblem ? <span className="text-right text-rust">{uriProblem}</span> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!deliverableUri.trim() || Boolean(uriProblem)}
                    className="btn btn-primary btn-block mt-3"
                  >
                    Submit stage
                  </button>
                </div>
              ) : null}

              <div className="action-lines">
                {currentStage ? (
                  <>
                    <div className="action-line">
                      <span>
                        Release to {shortAddress(currentStage.provider)}
                        <small>Current specialist</small>
                      </span>
                      <strong>{formatUsdcDisplay(currentStage.budget)} USDC</strong>
                    </div>
                    <div className="action-line">
                      <span>
                        Activate next
                        <small>{nextHireText}</small>
                      </span>
                      <strong>Same tx</strong>
                    </div>
                    <div className="action-line">
                      <span>
                        Remaining after release
                        <small>Reserved for unpaid stages</small>
                      </span>
                      <strong>{formatUsdcDisplay(remainingAfterRelease)} USDC</strong>
                    </div>
                    <div className="action-line">
                      <span>
                        Refund if rejected
                        <small>All unpaid stages</small>
                      </span>
                      <strong>{formatUsdcDisplay(remaining)} USDC</strong>
                    </div>
                  </>
                ) : null}
              </div>

              {currentStage ? (
                <div className="action-total">
                  <span>Immediate payout on approval</span>
                  <strong>{formatUsdcDisplay(currentStage.budget)} USDC</strong>
                </div>
              ) : null}

              {canReview && currentStage ? (
                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={() => setPendingAction('approve')}
                    className="btn btn-primary"
                  >
                    <CheckIcon />
                    Approve &amp; pay {formatUsdcDisplay(currentStage.budget)} USDC
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction('reject')}
                    className="btn btn-reject"
                  >
                    Reject &amp; refund {formatUsdcDisplay(remaining)} USDC
                  </button>
                </div>
              ) : null}

              {canExpire ? (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="eyebrow">Permissionless expiry</p>
                  <h3 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                    The deadline has elapsed.
                  </h3>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    Anyone may expire this pipeline. The refund recipient is fixed to the client:{' '}
                    {shortAddress(summary.client)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPendingAction('expire')}
                    disabled={!guard.isWriteEnabled}
                    className="btn btn-outline mt-2 w-full border-warm-line text-warm-ink"
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
                  No action is available for this wallet right now. The contract remains the source
                  of truth; refresh to reread the latest state.
                </div>
              ) : null}

              <p className="action-note">
                <strong>Both decisions are irreversible.</strong> Approval and activation share one
                transaction. The confirmation repeats the recipient and exact amount before signing.
              </p>
              <p className="action-foot">
                The client is the sole evaluator. No dispute mechanism. Refresh after every receipt.
              </p>
              {appConfig.pipelineAddress ? (
                <p className="action-foot" style={{ marginTop: 8 }}>
                  <a
                    className="text-link"
                    href={`${appConfig.explorerUrl}/address/${appConfig.pipelineAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 8.5 }}
                  >
                    View coordinator contract
                    <ExternalIcon />
                  </a>
                </p>
              ) : null}
            </aside>
          </div>
        )}

        <Link className="btn btn-outline btn-sm mt-5" to="/pipelines">
          Back to my pipelines
        </Link>
      </div>

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
