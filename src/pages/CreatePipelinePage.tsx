import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { isAddress, parseEventLogs, type Address, type Hash } from 'viem'
import { PageHeader } from '../components/PageHeader'
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
  budget: string
  duration: string
}

let draftSequence = 0

function newDraft(): StageDraft {
  draftSequence += 1
  return {
    id: `stage-${draftSequence}`,
    provider: '',
    title: '',
    brief: '',
    budget: '1',
    duration: '86400',
  }
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
      const briefBytes = byteLength(brief)
      if (briefBytes < 1 || briefBytes > 240) {
        problems.push(`${prefix} brief must be 1–240 bytes.`)
      }

      const durationText = stage.duration.trim()
      const duration = Number(durationText)
      if (!/^\d+$/.test(durationText) || !Number.isSafeInteger(duration)) {
        problems.push(`${prefix} duration must be a whole number of seconds.`)
      } else if (duration < 900 || duration > 604_800) {
        problems.push(`${prefix} duration must be between 900 and 604,800 seconds.`)
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

      if (isAddress(provider) && budget >= MIN_STAGE_BUDGET) {
        parsedStages.push({
          provider: provider as Address,
          budget,
          title,
          brief,
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

  const updateStage = (id: string, patch: Partial<StageDraft>) => {
    setStages((current) => current.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage)))
  }

  const addStage = () => {
    if (stages.length < 5) setStages((current) => [...current, newDraft()])
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
    <div>
      <PageHeader
        eyebrow="Client action"
        title="Create a pipeline"
        description="Define a fixed sequence of 2–5 specialist agents and fund the full budget in one parent escrow. Every amount is exact; every stage is public."
        breadcrumb={
          <>
            <Link to="/">RelayCrew</Link> / Create pipeline
          </>
        }
        action={<StatusPill tone={draftTone}>{draftLabel}</StatusPill>}
      />

      <div className="grid items-start gap-3 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="rc-card rc-card-soft p-5 lg:sticky lg:top-4">
          <p className="rc-eyebrow">Relay setup</p>
          <h2 className="mt-2 font-display text-[23px] font-medium leading-[1.05] tracking-[-0.045em] text-ink">
            The right sequence, funded once.
          </h2>

          <div className="mt-4 grid gap-1">
            <div className={`rc-step ${address ? 'rc-step-done' : 'rc-step-current'}`}>
              <span className="rc-step-marker">{address ? '✓' : '1'}</span>
              <div>
                <strong>Client wallet</strong>
                <span>{address ? shortAddress(address) : 'Connect to identify the client'}</span>
              </div>
            </div>
            <div
              className={`rc-step ${
                stageStepDone ? 'rc-step-done' : address ? 'rc-step-current' : ''
              }`.trim()}
            >
              <span className="rc-step-marker">{stageStepDone ? '✓' : '2'}</span>
              <div>
                <strong>Stages & budgets</strong>
                <span>{stages.length} stage drafts · 2–5 allowed</span>
              </div>
            </div>
            <div
              className={`rc-step ${
                allowanceStepDone ? 'rc-step-done' : stageStepDone ? 'rc-step-current' : ''
              }`.trim()}
            >
              <span className="rc-step-marker">{allowanceStepDone ? '✓' : '3'}</span>
              <div>
                <strong>Exact allowance</strong>
                <span>
                  {allowance.data === undefined
                    ? 'Loading allowance…'
                    : allowanceStepDone
                      ? 'Covers the exact total'
                      : 'Set automatically on submit'}
                </span>
              </div>
            </div>
            <div
              className={`rc-step ${canSubmit && allowanceStepDone ? 'rc-step-current' : ''}`.trim()}
            >
              <span className="rc-step-marker">4</span>
              <div>
                <strong>Fund escrow</strong>
                <span>{canSubmit && allowanceStepDone ? 'Ready to fund' : 'One wallet flow'}</span>
              </div>
            </div>
          </div>

          <div className="rc-warning mt-4">
            Provider addresses, titles, briefs, budgets, and deliverable URIs are public and
            permanent. Do not enter secrets or confidential instructions.
          </div>
        </aside>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="min-w-0 space-y-4"
        >
          <div className="rc-card p-4">
            <div className="grid gap-3 text-[10px] sm:grid-cols-3">
              <div>
                <span className="rc-eyebrow">Client wallet</span>
                <span
                  className="mt-1 block truncate font-mono text-[10px] text-ink"
                  title={address ?? undefined}
                >
                  {address ? shortAddress(address) : 'Not connected'}
                </span>
              </div>
              <div>
                <span className="rc-eyebrow">USDC balance</span>
                <span className="mt-1 block font-mono text-[11px] text-ink">
                  {balance.data === undefined ? '—' : `${formatUsdcDisplay(balance.data)} USDC`}
                </span>
              </div>
              <div>
                <span className="rc-eyebrow">Current allowance</span>
                <span className="mt-1 block font-mono text-[11px] text-ink">
                  {allowance.data === undefined ? '—' : `${formatUsdcDisplay(allowance.data)} USDC`}
                </span>
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
                  className="rc-button rc-button-sm border-rust-line bg-paper text-rust hover:bg-rust-soft"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>

          <div className="rc-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="rc-eyebrow">Tell us about the relay</p>
                <h2 className="mt-1.5 font-display text-[28px] font-medium leading-none tracking-[-0.05em] text-ink">
                  Build the specialist chain.
                </h2>
                <p className="mt-2 max-w-[540px] text-[11px] leading-5 text-muted">
                  The client is the evaluator for every stage. Providers must be unique, nonzero,
                  and different from the client wallet.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={addStage}
                  disabled={stages.length >= 5}
                  className="rc-button rc-button-sm"
                >
                  + Add stage
                </button>
                <span className="text-[9px] text-muted">{stages.length} of 5 stages</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {stages.map((stage, index) => (
                <section key={stage.id} className="rounded-lg border border-line bg-[#fffefa] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-forest-line bg-forest-soft font-display text-[13px] text-forest">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[17px] font-medium tracking-[-0.03em] text-ink">
                          {stage.title.trim() || `Stage ${index + 1}`}
                        </h3>
                        <p className="rc-field-note">
                          Stage {index + 1} · {index === 0 ? 'active first' : `starts after stage ${index}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStage(stage.id)}
                      disabled={stages.length <= 2}
                      className="rc-button-text disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="rc-field-label sm:col-span-2">
                      Provider address
                      <input
                        value={stage.provider}
                        onChange={(event) => updateStage(stage.id, { provider: event.target.value })}
                        placeholder="0x…"
                        spellCheck={false}
                        className="rc-input mt-1.5 font-mono"
                      />
                    </label>

                    <label className="rc-field-label">
                      Budget (USDC)
                      <input
                        value={stage.budget}
                        onChange={(event) => updateStage(stage.id, { budget: event.target.value })}
                        inputMode="decimal"
                        placeholder="1.00"
                        className="rc-input mt-1.5 font-mono"
                      />
                      <span className="rc-field-note mt-1">Minimum 1 USDC per stage.</span>
                    </label>

                    <label className="rc-field-label">
                      Duration (seconds)
                      <input
                        value={stage.duration}
                        onChange={(event) => updateStage(stage.id, { duration: event.target.value })}
                        inputMode="numeric"
                        placeholder="86400"
                        className="rc-input mt-1.5 font-mono"
                      />
                      <span className="rc-field-note mt-1">900–604,800 seconds (15 minutes–7 days)</span>
                    </label>

                    <label className="rc-field-label sm:col-span-2">
                      Title
                      <input
                        value={stage.title}
                        onChange={(event) => updateStage(stage.id, { title: event.target.value })}
                        maxLength={64}
                        placeholder="Stage title"
                        className="rc-input mt-1.5"
                      />
                      <span className="rc-field-note mt-1">{byteLength(stage.title.trim())}/64 bytes</span>
                    </label>

                    <label className="rc-field-label sm:col-span-2">
                      Public brief
                      <textarea
                        value={stage.brief}
                        onChange={(event) => updateStage(stage.id, { brief: event.target.value })}
                        maxLength={240}
                        rows={3}
                        placeholder="What should this specialist deliver?"
                        className="rc-textarea mt-1.5"
                      />
                      <span className="rc-field-note mt-1">{byteLength(stage.brief.trim())}/240 bytes</span>
                    </label>
                  </div>
                </section>
              ))}
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
                Your wallet does not hold enough Arc Testnet USDC for this total.
              </p>
            ) : null}

            {noGasBalance ? (
              <p className="mt-4 text-[10px] font-semibold text-rust" role="alert">
                Your wallet needs Arc Testnet USDC for gas before it can submit transactions.
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
                    className="rc-button rc-button-sm border-warm-line bg-paper text-warm-ink"
                  >
                    {checkingPending ? 'Checking…' : 'Check receipt'}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="rc-funding-strip">
              <div className="rc-funding-total">
                <span>Total escrow</span>
                <strong>{totalDisplay} USDC</strong>
              </div>
              <p>
                Exact allowance only. One submit checks the allowance, approves the exact total if
                needed, then funds the pipeline. No platform fee.
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rc-button rc-button-primary w-full sm:w-auto"
              >
                {busy
                  ? 'Preparing transaction…'
                  : pendingCreateHash
                    ? 'Transaction pending — check receipt'
                    : `Create & fund pipeline${validation.totalBudget > 0n ? ` — ${totalDisplay} USDC` : ''}`}
              </button>
            </div>

            <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
              <div className="flex gap-2">
                <span className="font-mono text-[9px] text-sage">01</span>
                <div>
                  <strong className="block text-[10px] text-ink">Allowance check</strong>
                  <span className="block text-[9px] leading-4 text-muted">
                    Exact amount; reset first if needed
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-mono text-[9px] text-sage">02</span>
                <div>
                  <strong className="block text-[10px] text-ink">Fund escrow</strong>
                  <span className="block text-[9px] leading-4 text-muted">
                    One createPipeline call
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="font-mono text-[9px] text-sage">03</span>
                <div>
                  <strong className="block text-[10px] text-ink">First specialist active</strong>
                  <span className="block text-[9px] leading-4 text-muted">
                    Activated on-chain at funding
                  </span>
                </div>
              </div>
            </div>

            {!guard.isConnected ? (
              <p className="mt-4 text-[10px] text-muted">
                Connect a wallet to create and fund a pipeline.
              </p>
            ) : guard.isWrongNetwork ? (
              <p className="mt-4 text-[10px] font-semibold text-rust" role="alert">
                Switch your wallet to Arc Testnet before submitting.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}
