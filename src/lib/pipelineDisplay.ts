const PIPELINE_STATUS_LABELS = ['Active', 'Completed', 'Rejected', 'Expired'] as const
const STAGE_STATUS_LABELS = ['Queued', 'Active', 'Submitted', 'Paid', 'Rejected', 'Expired'] as const

export function pipelineStatusLabel(status: number): string {
  return PIPELINE_STATUS_LABELS[status] ?? 'Unknown'
}

export function stageStatusLabel(status: number): string {
  return STAGE_STATUS_LABELS[status] ?? 'Unknown'
}

export function isTerminalPipeline(status: number): boolean {
  return status !== 0
}

export function formatTimestamp(timestamp: bigint | number | undefined): string {
  if (timestamp === undefined) return '—'
  const value = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  if (!value) return '—'
  return new Date(value * 1000).toLocaleString()
}

export function formatDuration(seconds: number): string {
  if (seconds % 86_400 === 0) {
    const days = seconds / 86_400
    return `${days} day${days === 1 ? '' : 's'}`
  }
  if (seconds % 3_600 === 0) {
    const hours = seconds / 3_600
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }
  if (seconds % 60 === 0) {
    const minutes = seconds / 60
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  return `${seconds} seconds`
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  const remainingSeconds = seconds % 60
  const clock = [hours, minutes, remainingSeconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
  return days > 0 ? `${days}d ${clock}` : clock
}

export function statusTone(status: number): string {
  switch (status) {
    case 0:
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 1:
      return 'border-slate-300 bg-slate-100 text-slate-700'
    case 2:
      return 'border-red-200 bg-red-50 text-red-800'
    case 3:
      return 'border-amber-200 bg-amber-50 text-amber-800'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function stageTone(status: number): string {
  switch (status) {
    case 0:
      return 'border-slate-200 bg-slate-50 text-slate-600'
    case 1:
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 2:
      return 'border-sky-200 bg-sky-50 text-sky-800'
    case 3:
      return 'border-slate-300 bg-slate-100 text-slate-700'
    case 4:
      return 'border-red-200 bg-red-50 text-red-800'
    case 5:
      return 'border-amber-200 bg-amber-50 text-amber-800'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}
