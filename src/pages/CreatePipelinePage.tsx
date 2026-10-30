import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useBalance, usePublicClient } from 'wagmi'
import { isAddress, parseEventLogs, type Address, type Hash } from 'viem'
import { PageHeader } from '../components/PageHeader'
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client action"
        title="Create Pipeline"
        description="Define a fixed sequence of 2–5 specialist stages and fund the full USDC budget in one escrow."
      />

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Public and permanent data warning</p>
        <p className="mt-1">
          Provider addresses, titles, briefs, budgets, and deliverable URIs are public and permanent
          on Arc. Do not include secrets, personal data, or confidential instructions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            Client wallet: <span className="font-mono">{address ?? 'not connected'}</span>
          </span>
          <span>
            USDC balance:{' '}
            <span className="font-semibold text-slate-900">
              {balance.data === undefined ? '—' : `${formatUsdcDisplay(balance.data)} USDC`}
            </span>
          </span>
          <span>
            Current allowance:{' '}
            <span className="font-semibold text-slate-900">
              {allowance.data === undefined ? '—' : `${formatUsdcDisplay(allowance.data)} USDC`}
            </span>
          </span>
        </div>
        {balance.isError || nativeBalance.isError ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-red-800">
            <span>Failed to load wallet data.</span>
            <button
              type="button"
              onClick={() => {
                void balance.refetch()
                void nativeBalance.refetch()
              }}
              className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
        className="space-y-5"
      >
        {stages.map((stage, index) => (
          <section key={stage.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Stage {index + 1}</h2>
              <button
                type="button"
                onClick={() => removeStage(stage.id)}
                disabled={stages.length <= 2}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove stage
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Provider address
                <input
                  value={stage.provider}
                  onChange={(event) => updateStage(stage.id, { provider: event.target.value })}
                  placeholder="0x…"
                  spellCheck={false}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Budget (USDC)
                <input
                  value={stage.budget}
                  onChange={(event) => updateStage(stage.id, { budget: event.target.value })}
                  inputMode="decimal"
                  placeholder="1.00"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Title
                <input
                  value={stage.title}
                  onChange={(event) => updateStage(stage.id, { title: event.target.value })}
                  maxLength={64}
                  placeholder="Stage title"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  {byteLength(stage.title.trim())}/64 bytes
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Public brief
                <textarea
                  value={stage.brief}
                  onChange={(event) => updateStage(stage.id, { brief: event.target.value })}
                  maxLength={240}
                  rows={3}
                  placeholder="What should this specialist deliver?"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  {byteLength(stage.brief.trim())}/240 bytes
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Duration (seconds)
                <input
                  value={stage.duration}
                  onChange={(event) => updateStage(stage.id, { duration: event.target.value })}
                  inputMode="numeric"
                  placeholder="86400"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  900–604,800 seconds (15 minutes–7 days)
                </span>
              </label>
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addStage}
            disabled={stages.length >= 5}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add stage
          </button>
          <span className="text-sm text-slate-500">{stages.length} of 5 stages</span>
        </div>

        <section className="rounded-2xl border border-slate-300 bg-slate-900 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Total escrow</p>
              <p className="mt-1 text-2xl font-bold">{formatUsdcDisplay(validation.totalBudget)} USDC</p>
            </div>
            <p className="max-w-md text-sm text-slate-300">
              The exact total is approved and transferred once. No platform fee. The contract
              revalidates every limit on-chain.
            </p>
          </div>
        </section>

        {validation.problems.length > 0 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
            <p className="font-semibold">Fix these before funding:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validation.problems.slice(0, 8).map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {insufficientBalance ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Your wallet does not hold enough Arc Testnet USDC for this total.
          </p>
        ) : null}

        {noGasBalance ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Your wallet needs Arc Testnet USDC for gas before it can submit transactions.
          </p>
        ) : null}

        {pendingCreateHash ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="alert">
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
                className="font-semibold underline underline-offset-2"
              >
                View transaction
              </a>
              <button
                type="button"
                onClick={() => void checkPendingReceipt()}
                disabled={checkingPending}
                className="rounded-md border border-amber-400 bg-white px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
              >
                {checkingPending ? 'Checking…' : 'Check receipt'}
              </button>
            </div>
          </div>
        ) : null}

        {!guard.isConnected ? (
          <p className="text-sm text-slate-600">Connect a wallet to create and fund a pipeline.</p>
        ) : guard.isWrongNetwork ? (
          <p className="text-sm font-semibold text-red-700">
            Switch your wallet to Arc Testnet before submitting.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? 'Preparing transaction…'
            : pendingCreateHash
              ? 'Transaction pending — check receipt above'
              : `Create & fund pipeline${validation.totalBudget > 0n ? ` — ${formatUsdcDisplay(validation.totalBudget)} USDC` : ''}`}
        </button>
      </form>
    </div>
  )
}
