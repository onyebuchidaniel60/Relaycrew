import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { isAddress, parseEventLogs, type Address, type Hash } from 'viem'
import { StatusPill } from '../components/StatusPill'
import { useTxStatus } from '../context/TxStatusContext'
import { useNetworkGuard } from '../hooks/useNetworkGuard'
import { usePipelineWrites, type StageInput } from '../hooks/usePipelineContract'
import { useApproveUsdc, useUsdcAllowance, useUsdcBalance } from '../hooks/useUsdc'
import { useTxRunner } from '../hooks/useTxRunner'
import {
  MAX_PIPELINE_BUDGET,
  MIN_STAGE_BUDGET,
  formatUsdcDisplay,
  parseUsdc,
} from '../lib/amounts'
import { appConfig } from '../lib/config'
import { pipelineCoordinatorAbi, pipelineCoordinatorAddress } from '../lib/contracts'
import { shortAddress, type StatusTone } from '../lib/pipelineDisplay'
import { usdcAbi } from '../lib/usdc'
import { byteLength } from '../lib/validation'

type StageDraft = {
  id: string
  provider: string
  title: string
  brief: string
  attachmentUrl: string
  budget: string
  durationDays: string
  durationHours: string
}

const MAX_STAGES = 10
const SECONDS_PER_HOUR = 3_600
const SECONDS_PER_DAY = 86_400
const MIN_DURATION_SECONDS = 900
const MAX_DURATION_SECONDS = 604_800

let draftSequence = 0

function newDraft(): StageDraft {
  draftSequence += 1
  return {
    id: `stage-${draftSequence}`,
    provider: '',
    title: '',
    brief: '',
    attachmentUrl: '',
    budget: '1',
    durationDays: '1',
    durationHours: '0',
  }
}

function stageDurationSeconds(days: string, hours: string) {
  return Number(days) * SECONDS_PER_DAY + Number(hours) * SECONDS_PER_HOUR
}

function formatStageDuration(days: string, hours: string) {
  const dayCount = Number(days)
  const hourCount = Number(hours)
  const parts: string[] = []
  if (dayCount > 0) parts.push(`${dayCount} ${dayCount === 1 ? 'day' : 'days'}`)
  if (hourCount > 0) parts.push(`${hourCount} ${hourCount === 1 ? 'hour' : 'hours'}`)
  return parts.length > 0 ? parts.join(' ') : 'not set'
}

function buildStoredBrief(brief: string, attachmentUrl: string) {
  const cleanBrief = brief.trim()
  const cleanAttachment = attachmentUrl.trim()
  return [cleanBrief, cleanAttachment ? `Attachment: ${cleanAttachment}` : '']
    .filter(Boolean)
    .join('\n\n')
}

function formatDraftBudget(value: string) {
  try {
    return formatUsdcDisplay(parseUsdc(value))
  } catch {
    return '—'
  }
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

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function CreatePipelinePage() {
  const navigate = useNavigate()
  const publicClient = usePublicClient({ chainId: appConfig.expectedChainId })
  const { address } = useAccount()
  const guard = useNetworkGuard()
  const balance = useUsdcBalance(address)
  const nativeBalance = useBalance({
    address,
    chainId: appConfig.expectedChainId,
    query: { enabled: Boolean(address) },
  })
  const allowance = useUsdcAllowance(address, pipelineCoordinatorAddress)
  const approveUsdc = useApproveUsdc()
  const writes = usePipelineWrites()
  const { fail, run } = useTxRunner()
  const { setStatus } = useTxStatus()

  const [stages, setStages] = useState<StageDraft[]>(() => [newDraft(), newDraft()])
  const [busy, setBusy] = useState(false)
  const [pendingCreateHash, setPendingCreateHash] = useState<Hash>()
  const [checkingPending, setCheckingPending] = useState(false)

  const validation = useMemo(() => {
    const problems: string[] = []
    const parsedStages: StageInput[] = []
    const seenProviders = new Set<string>()
    let totalBudget = 0n

    stages.forEach((stage, index) => {
      const prefix = `Stage ${index + 1}:`
      const provider = stage.provider.trim()
      const title = stage.title.trim()
      const brief = stage.brief.trim()
      const attachmentUrl = stage.attachmentUrl.trim()
      const storedBrief = buildStoredBrief(brief, attachmentUrl)

      if (!isAddress(provider)) {
        problems.push(`${prefix} enter a valid provider address.`)
      } else {
        const normalized = provider.toLowerCase()
        if (address && normalized === address.toLowerCase()) {
          problems.push(`${prefix} the provider cannot be the connected client wallet.`)
        }
        if (seenProviders.has(normalized)) {
          problems.push(`${prefix} provider address is duplicated.`)
        }
        seenProviders.add(normalized)
      }

      const titleBytes = byteLength(title)
      if (titleBytes < 1 || titleBytes > 64) {
        problems.push(`${prefix} title must be 1–64 bytes.`)
      }
      if (attachmentUrl && !/^(https:\/\/|ipfs:\/\/)/i.test(attachmentUrl)) {
        problems.push(`${prefix} attachment URL must start with https:// or ipfs://.`)
      }

      const briefBytes = byteLength(storedBrief)
      if (briefBytes < 1 || briefBytes > 240) {
        problems.push(
          `${prefix} brief plus optional attachment must be 1–240 bytes when stored on-chain.`,
        )
      }

      const duration = stageDurationSeconds(stage.durationDays, stage.durationHours)
      let durationIsValid = false
      if (
        !/^\d+$/.test(stage.durationDays) ||
        !/^\d+$/.test(stage.durationHours) ||
        Number(stage.durationHours) > 23
      ) {
        problems.push(`${prefix} choose a whole number of days and 0–23 hours.`)
      } else if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS) {
        problems.push(`${prefix} duration must be between 15 minutes and 7 days.`)
      } else {
        durationIsValid = true
      }

      let budget = 0n
      try {
        budget = parseUsdc(stage.budget)
        if (budget < MIN_STAGE_BUDGET) {
          problems.push(`${prefix} budget must be at least 1 USDC.`)
        }
      } catch (error) {
        problems.push(`${prefix} ${error instanceof Error ? error.message : 'enter a valid USDC budget.'}`)
      }

      if (isAddress(provider) && budget >= MIN_STAGE_BUDGET && durationIsValid) {
        parsedStages.push({
          provider: provider as Address,
          budget,
          title,
          brief: storedBrief,
          durationSeconds: duration,
        })
      }
      totalBudget += budget
    })

    if (totalBudget > MAX_PIPELINE_BUDGET) {
      problems.push('The total budget cannot exceed 100 USDC.')
    }
    if (!address) {
      problems.push('Connect a wallet to identify the pipeline client.')
    }

    return { problems, parsedStages, totalBudget }
  }, [address, stages])

  const insufficientBalance =
    balance.data !== undefined && balance.data < validation.totalBudget
  const noGasBalance = nativeBalance.data !== undefined && nativeBalance.data.value === 0n
  const walletDataReady = balance.data !== undefined && nativeBalance.data !== undefined
  const canSubmit =
    validation.problems.length === 0 &&
    validation.parsedStages.length === stages.length &&
    Boolean(address) &&
    guard.isWriteEnabled &&
    walletDataReady &&
    !busy &&
    !insufficientBalance &&
    !noGasBalance &&
    !pendingCreateHash

  const totalDisplay = formatUsdcDisplay(validation.totalBudget)
  const stageStepDone = Boolean(address) && validation.problems.length === 0
  const allowanceStepDone =
    stageStepDone &&
    validation.totalBudget > 0n &&
    allowance.data !== undefined &&
    allowance.data === validation.totalBudget
  const draftTone: StatusTone = !address
    ? 'neutral'
    : validation.problems.length > 0
      ? 'warm'
      : 'active'
  const draftLabel = !address
    ? 'Wallet required'
    : validation.problems.length > 0
      ? 'Draft needs attention'
      : `${stages.length} stages · valid`

  const briefReady = stages.every(
    (stage) => stage.title.trim().length > 0 && stage.brief.trim().length > 0,
  )
  const normalizedProviders = stages.map((stage) => stage.provider.trim().toLowerCase())
  const crewReady = stages.every((stage, index) => {
    const provider = stage.provider.trim()
    if (!isAddress(provider)) return false
    if (address && provider.toLowerCase() === address.toLowerCase()) return false
    return normalizedProviders.filter((value) => value === normalizedProviders[index]).length === 1
  })
  const termsReady = validation.problems.length === 0
  const steps = [
    {
      number: briefReady ? '✓' : '01',
      title: 'Brief',
      body: briefReady ? `${stages.length} stage briefs` : 'Titles & public briefs',
      state: briefReady ? 'done' : 'active',
    },
    {
      number: briefReady && crewReady ? '✓' : '02',
      title: 'Crew',
      body: briefReady && crewReady ? `${stages.length} specialists assigned` : 'Provider addresses',
      state: briefReady && crewReady ? 'done' : briefReady ? 'active' : '',
    },
    {
      number: termsReady ? '✓' : '03',
      title: 'Terms',
      body: termsReady ? 'Budgets & deadlines valid' : 'Budgets & deadlines',
      state: termsReady ? 'done' : briefReady && crewReady ? 'active' : '',
    },
    {
      number: allowanceStepDone ? '✓' : '04',
      title: 'Review',
      body: allowanceStepDone ? 'Allowance covers total' : 'Allowance & funding',
      state: allowanceStepDone ? 'done' : termsReady ? 'active' : '',
    },
  ] as const
  const budgetPercent =
    validation.totalBudget >= MAX_PIPELINE_BUDGET
      ? 100
      : Number((validation.totalBudget * 100n) / MAX_PIPELINE_BUDGET)

  const updateStage = (id: string, patch: Partial<StageDraft>) => {
    setStages((current) => current.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage)))
  }

  const addStage = () => {
    if (stages.length < MAX_STAGES) setStages((current) => [...current, newDraft()])
  }

  const removeStage = (id: string) => {
    if (stages.length > 2) setStages((current) => current.filter((stage) => stage.id !== id))
  }

  const submit = async () => {
    if (!canSubmit || !address || !publicClient || !appConfig.usdcAddress) return
    setBusy(true)

    try {
      const total = validation.totalBudget
      let currentAllowance = await publicClient.readContract({
        address: appConfig.usdcAddress,
        abi: usdcAbi,
        functionName: 'allowance',
        args: [address, pipelineCoordinatorAddress],
      })

      if (currentAllowance !== total) {
        if (currentAllowance > 0n) {
          const reset = await run('Reset USDC allowance', () =>
            approveUsdc(pipelineCoordinatorAddress, 0n),
          )
          if (!reset) return
        }

        const approval = await run('Approve exact USDC amount', () =>
          approveUsdc(pipelineCoordinatorAddress, total),
        )
        if (!approval) return

        currentAllowance = await publicClient.readContract({
          address: appConfig.usdcAddress,
          abi: usdcAbi,
          functionName: 'allowance',
          args: [address, pipelineCoordinatorAddress],
        })
      }

      if (currentAllowance < total) {
        fail(new Error('USDC allowance is still insufficient after approval.'))
        return
      }

      await publicClient.simulateContract({
        address: pipelineCoordinatorAddress,
        abi: pipelineCoordinatorAbi,
        functionName: 'createPipeline',
        args: [validation.parsedStages],
        account: address,
      })

      let submittedHash: Hash | undefined
      const receipt = await run(
        'Create and fund pipeline',
        () => writes.createPipeline(validation.parsedStages),
        (hash) => {
          submittedHash = hash
          setPendingCreateHash(hash)
        },
      )

      if (!receipt) {
        if (submittedHash) {
          setStatus({
            phase: 'pending',
            message:
              'Create transaction submitted. Do not submit again; check your wallet or Arc Explorer for the receipt.',
            hash: submittedHash,
          })
        }
        return
      }

      const created = parseEventLogs({
        abi: pipelineCoordinatorAbi,
        eventName: 'PipelineCreated',
        logs: receipt.logs,
      })
      const pipelineId = created[0]?.args.pipelineId
      if (pipelineId === undefined) {
        fail(new Error('Pipeline created, but the PipelineCreated event was not found. Check the explorer before retrying.'))
        return
      }

      setPendingCreateHash(undefined)
      navigate(`/pipelines/${pipelineId.toString()}`)
    } catch (error) {
      fail(error)
    } finally {
      setBusy(false)
    }
  }

  const checkPendingReceipt = async () => {
    if (!pendingCreateHash || !publicClient) return
    setCheckingPending(true)

    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: pendingCreateHash })
      if (receipt.status !== 'success') {
        setPendingCreateHash(undefined)
        fail(new Error('The create transaction reverted. You may review the form and try again.'))
        return
      }

      const created = parseEventLogs({
        abi: pipelineCoordinatorAbi,
        eventName: 'PipelineCreated',
        logs: receipt.logs,
      })
      const pipelineId = created[0]?.args.pipelineId
      if (pipelineId === undefined) {
        fail(new Error('The receipt was found, but the PipelineCreated event was missing. Check Arc Explorer.'))
        return
      }

      setPendingCreateHash(undefined)
      navigate(`/pipelines/${pipelineId.toString()}`)
    } catch {
      setStatus({
        phase: 'pending',
        message:
          'Receipt not found yet. Check your wallet or Arc Explorer; do not submit the pipeline again.',
        hash: pendingCreateHash,
      })
    } finally {
      setCheckingPending(false)
    }
  }

  return (
    <div className="app-main">
      <div className="wrap">
        <p className="breadcrumb">
          <Link to="/">RelayCrew</Link>
          <span className="slash">/</span>
          <Link to="/pipelines">Pipelines</Link>
          <span className="slash">/</span>New pipeline
        </p>

        <header className="app-head">
          <div>
            <div className="status-row">
              <StatusPill tone={draftTone}>{draftLabel}</StatusPill>
              <span className="chip">
                <span className="dot" aria-hidden="true" />
                Client · {address ? shortAddress(address) : 'not connected'}
              </span>
            </div>
            <h1>Create a pipeline.</h1>
            <p className="app-sub">
              <span>Define the crew, set the terms, fund once</span>
              <span>2–10 stages</span>
              <span>100.00 USDC maximum</span>
            </p>
          </div>
          <div className="app-head-actions">
            <Link className="btn btn-outline btn-sm" to="/pipelines">
              Back to pipelines
            </Link>
          </div>
        </header>

        <ol className="stepper" aria-label="Create pipeline progress">
          {steps.map((step, index) => (
            <li key={step.title} className={`step ${step.state}`.trim()}>
              <div className="step-top">
                <span className="step-no">{step.number}</span>
                <span>Step {String(index + 1).padStart(2, '0')}</span>
              </div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="create-grid">
          <form
            id="create-pipeline-form"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
            className="panel form-panel"
          >
            <div className="form-head">
              <div>
                <p className="eyebrow">Pipeline terms</p>
                <h2>Set the terms.</h2>
                <p>
                  Each stage has an exact budget and a work deadline. The total is reserved now.
                  Amounts, order, providers and briefs become immutable when the pipeline is funded.
                </p>
              </div>
              <div className="form-head-count">
                {stages.length} stages
                <br />
                {totalDisplay} USDC
              </div>
            </div>

            <div className="pipeline-context">
              <div>
                <p className="context-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                  Public relay · stored on-chain
                </p>
                <div className="context-meta">
                  <span>{stages.length} specialists</span>
                  <span>Public briefs</span>
                  <span>{appConfig.networkLabel}</span>
                </div>
              </div>
              <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                Client is sole evaluator
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 border border-line bg-paper-soft sm:grid-cols-3">
              <div className="border-b border-line px-4 py-3 sm:border-b-0 sm:border-r">
                <span className="block font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
                  Client wallet
                </span>
                <strong
                  className="mt-1 block truncate font-mono text-[10px] font-medium text-ink"
                  title={address ?? undefined}
                >
                  {address ? shortAddress(address) : 'Not connected'}
                </strong>
              </div>
              <div className="border-b border-line px-4 py-3 sm:border-b-0 sm:border-r">
                <span className="block font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
                  USDC balance
                </span>
                <strong className="mt-1 block font-mono text-[10px] font-medium text-ink">
                  {balance.data === undefined ? '—' : `${formatUsdcDisplay(balance.data)} USDC`}
                </strong>
              </div>
              <div className="px-4 py-3">
                <span className="block font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
                  Current allowance
                </span>
                <strong className="mt-1 block font-mono text-[10px] font-medium text-ink">
                  {allowance.data === undefined ? '—' : `${formatUsdcDisplay(allowance.data)} USDC`}
                </strong>
              </div>
            </div>

            {balance.isError || nativeBalance.isError ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-[10px] text-rust">
                <span>Failed to load wallet data.</span>
                <button
                  type="button"
                  onClick={() => {
                    void balance.refetch()
                    void nativeBalance.refetch()
                  }}
                  className="btn btn-outline btn-sm border-rust-line bg-paper text-rust hover:bg-rust-soft"
                >
                  Retry
                </button>
              </div>
            ) : null}

            <div className="term-list">
              {stages.map((stage, index) => (
                <article key={stage.id} className={`term-card ${index === 0 ? 'is-open' : ''}`.trim()}>
                  <div className="term-top">
                    <div className="term-id">
                      <span className="stage-no">{String(index + 1).padStart(2, '0')}</span>
                      <div className="min-w-0 flex-1">
                        <label className="field-label" htmlFor={`stage-title-${stage.id}`}>
                          Stage title
                        </label>
                        <input
                          id={`stage-title-${stage.id}`}
                          value={stage.title}
                          onChange={(event) => updateStage(stage.id, { title: event.target.value })}
                          maxLength={64}
                          placeholder="Stage title"
                          className="input mt-1"
                        />
                        <p>
                          <span className="agent-dot" />
                          {isAddress(stage.provider.trim())
                            ? shortAddress(stage.provider.trim())
                            : 'Provider not set'}{' '}
                          · {byteLength(stage.title.trim())}/64 bytes
                        </p>
                      </div>
                    </div>

                    <div className="term-fields">
                      <div className="field">
                        <label htmlFor={`stage-budget-${stage.id}`}>Budget</label>
                        <div className="input-affix">
                          <input
                            id={`stage-budget-${stage.id}`}
                            value={stage.budget}
                            onChange={(event) =>
                              updateStage(stage.id, { budget: event.target.value })
                            }
                            inputMode="decimal"
                            placeholder="1.00"
                            className="input"
                          />
                          <span className="suffix">USDC</span>
                        </div>
                      </div>
                    </div>

                    <div className="term-fields">
                      <div className="field">
                        <span className="field-label">Work duration</span>
                        <div className="duration-grid" style={{ marginTop: 5 }}>
                          <select
                            value={stage.durationDays}
                            onChange={(event) =>
                              updateStage(stage.id, { durationDays: event.target.value })
                            }
                            aria-label={`Stage ${index + 1} duration days`}
                            className="input"
                          >
                            {Array.from({ length: 8 }, (_, value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                          <span className="unit">d</span>
                          <select
                            value={stage.durationHours}
                            onChange={(event) =>
                              updateStage(stage.id, { durationHours: event.target.value })
                            }
                            aria-label={`Stage ${index + 1} duration hours`}
                            className="input"
                          >
                            {Array.from({ length: 24 }, (_, value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="term-note">
                      <span>
                        Starts {index === 0 ? 'at funding' : `after stage ${index}`} · 24h review
                        after submission
                      </span>
                      <span>
                        {formatStageDuration(stage.durationDays, stage.durationHours)} ·{' '}
                        {stageDurationSeconds(stage.durationDays, stage.durationHours)}s ·{' '}
                        <button
                          type="button"
                          onClick={() => removeStage(stage.id)}
                          disabled={stages.length <= 2}
                          className="link-button"
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="term-brief">
                    <div className="brief-label">
                      <span>Public brief</span>
                      <span>
                        {byteLength(buildStoredBrief(stage.brief, stage.attachmentUrl))}/240 bytes
                      </span>
                    </div>
                    <textarea
                      value={stage.brief}
                      onChange={(event) => updateStage(stage.id, { brief: event.target.value })}
                      maxLength={240}
                      rows={3}
                      placeholder="What should this specialist deliver?"
                      className="input mt-2"
                      aria-label={`Stage ${index + 1} public brief`}
                    />
                    <div className="brief-extra">
                      <div className="field">
                        <label htmlFor={`stage-provider-${stage.id}`}>Provider address</label>
                        <input
                          id={`stage-provider-${stage.id}`}
                          value={stage.provider}
                          onChange={(event) =>
                            updateStage(stage.id, { provider: event.target.value })
                          }
                          placeholder="0x…"
                          spellCheck={false}
                          className="input mono"
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`stage-attachment-${stage.id}`}>
                          Attachment URL{' '}
                          <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                        </label>
                        <input
                          id={`stage-attachment-${stage.id}`}
                          value={stage.attachmentUrl}
                          onChange={(event) =>
                            updateStage(stage.id, { attachmentUrl: event.target.value })
                          }
                          inputMode="url"
                          spellCheck={false}
                          placeholder="https://… or ipfs://…"
                          className="input mono"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <button
                type="button"
                onClick={addStage}
                disabled={stages.length >= MAX_STAGES}
                className="add-stage"
              >
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add another stage
                </span>
                <small>
                  {stages.length} of {MAX_STAGES} stages
                </small>
              </button>
            </div>

            {validation.problems.length > 0 ? (
              <div className="rc-alert rc-alert-danger mt-4" role="alert">
                <p className="font-semibold">Fix these before funding:</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {validation.problems.slice(0, 8).map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {insufficientBalance ? (
              <p className="mt-4 text-[10px] font-semibold text-rust" role="alert">
                Your wallet does not hold enough USDC on {appConfig.networkLabel} for this total.
              </p>
            ) : null}

            {noGasBalance ? (
              <p className="mt-4 text-[10px] font-semibold text-rust" role="alert">
                Your wallet needs USDC on {appConfig.networkLabel} for gas before it can submit
                transactions.
              </p>
            ) : null}

            {pendingCreateHash ? (
              <div className="rc-alert rc-alert-warm mt-4" role="alert">
                <p className="font-semibold">Transaction pending…</p>
                <p className="mt-1">
                  The create transaction was submitted, but the receipt is not confirmed yet. Do not
                  submit again. Check your wallet or Arc Explorer for the receipt.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={`${appConfig.explorerUrl}/tx/${pendingCreateHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rc-link text-[10px]"
                  >
                    View transaction ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => void checkPendingReceipt()}
                    disabled={checkingPending}
                    className="btn btn-outline btn-sm border-warm-line bg-paper text-warm-ink"
                  >
                    {checkingPending ? 'Checking…' : 'Check receipt'}
                  </button>
                </div>
              </div>
            ) : null}

            {!guard.isConnected ? (
              <p className="mt-4 text-[10px] text-muted">
                Connect a wallet to create and fund a pipeline.
              </p>
            ) : guard.isWrongNetwork ? (
              <p className="mt-4 text-[10px] font-semibold text-rust" role="alert">
                Switch your wallet to {appConfig.networkLabel} before submitting.
              </p>
            ) : null}

            <div className="form-foot">
              <div className="form-foot-left">
                <Link className="btn btn-outline btn-sm" to="/pipelines">
                  Back to pipelines
                </Link>
                <span className="form-foot-note">
                  Exact allowance set at funding · no unlimited approval
                </span>
              </div>
              <span className="form-foot-note">Fund from the escrow statement →</span>
            </div>
          </form>

          <aside className="summary-card" aria-labelledby="escrow-title">
            <div className="summary-head">
              <p className="eyebrow no-rule" id="escrow-title">
                Escrow statement
              </p>
              <StatusPill tone={draftTone}>{draftLabel}</StatusPill>
            </div>
            <h2 className="summary-title">
              Your pipeline,
              <br />
              funded once.
            </h2>
            <p className="summary-meta">
              {stages.length} specialists · {appConfig.networkLabel} · USDC
            </p>

            <div className="summary-rows">
              {stages.map((stage, index) => (
                <div className="summary-row" key={stage.id}>
                  <span>
                    {stage.title.trim() || `Stage ${index + 1}`}
                    <small>
                      {isAddress(stage.provider.trim())
                        ? shortAddress(stage.provider.trim())
                        : 'Provider not set'}
                    </small>
                  </span>
                  <strong>{formatDraftBudget(stage.budget)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-limit">
              <div className="limit-head">
                <span>{totalDisplay} of 100.00 max</span>
                <strong>{Math.max(0, Math.min(100, budgetPercent))}%</strong>
              </div>
              <div className="limit-track">
                <i style={{ width: `${Math.max(0, Math.min(100, budgetPercent))}%` }} />
              </div>
            </div>

            <div className="summary-total">
              <span>Total escrow</span>
              <strong>
                {totalDisplay} <small>USDC</small>
              </strong>
            </div>

            <div className="summary-check">
              <CheckIcon />
              <span>Exact allowance only. No unlimited approval; reset first if required.</span>
            </div>

            <div className="summary-actions">
              <button
                type="submit"
                form="create-pipeline-form"
                disabled={!canSubmit}
                className="btn btn-primary"
              >
                {busy
                  ? 'Preparing transaction…'
                  : pendingCreateHash
                    ? 'Transaction pending — check receipt'
                    : `Review & fund${validation.totalBudget > 0n ? ` — ${totalDisplay} USDC` : ''}`}
              </button>
              <Link className="btn btn-outline" to="/pipelines">
                Back to pipelines
              </Link>
            </div>

            <p className="summary-warning">
              <strong>Public &amp; permanent.</strong> Titles, briefs, provider addresses, and
              deliverable URIs are stored on-chain. Do not enter secrets.
            </p>
            <p className="summary-foot">
              <LockIcon />
              Wallet-signed · RelayCrew never holds a key · {validation.totalBudget.toString()} base
              units
            </p>
          </aside>
        </div>

        <section className="funding-sequence" aria-label="Funding sequence">
          <div className="funding-step">
            <span className="num">01</span>
            <div>
              <strong>Approve exact allowance</strong>
              <span>{totalDisplay} USDC · reset first if needed</span>
            </div>
          </div>
          <div className="funding-step">
            <span className="num">02</span>
            <div>
              <strong>Fund the parent escrow</strong>
              <span>One createPipeline transaction</span>
            </div>
          </div>
          <div className="funding-step">
            <span className="num">03</span>
            <div>
              <strong>First specialist activated</strong>
              <span>Stage 01 starts on-chain at funding</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
