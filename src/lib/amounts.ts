import { formatUnits, parseUnits } from 'viem'

export const USDC_DECIMALS = 6
export const USDC_UNIT = 1_000_000n
export const MIN_STAGE_BUDGET = 1n * USDC_UNIT
export const MAX_PIPELINE_BUDGET = 100n * USDC_UNIT

export function parseUsdc(value: string): bigint {
  const normalized = value.trim()
  if (!/^\d+(\.\d{1,6})?$/.test(normalized)) {
    throw new Error('Enter a USDC amount with up to 6 decimal places.')
  }
  return parseUnits(normalized, USDC_DECIMALS)
}

export function formatUsdc(value: bigint): string {
  return formatUnits(value, USDC_DECIMALS)
}

export function formatUsdcDisplay(value: bigint): string {
  const formatted = formatUsdc(value)
  return formatted.includes('.') ? formatted.replace(/\.?0+$/, '') : formatted
}
