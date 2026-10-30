import { isAddress, type Address } from 'viem'
import { arcTestnet } from './chain'

const networkMode = import.meta.env.VITE_NETWORK_MODE?.trim() ?? ''
const rawChainId = import.meta.env.VITE_CHAIN_ID?.trim() ?? ''
const configuredChainId = Number(rawChainId)
const rawRpcUrl = import.meta.env.VITE_RPC_URL?.trim() ?? ''
const rawExplorerUrl = import.meta.env.VITE_EXPLORER_URL?.trim() ?? ''
const rawUsdcAddress = import.meta.env.VITE_USDC_ADDRESS?.trim() ?? ''
const rawPipelineAddress = import.meta.env.VITE_PIPELINE_CONTRACT_ADDRESS?.trim() ?? ''
const githubUrl = import.meta.env.VITE_GITHUB_REPOSITORY_URL?.trim() ?? ''

const errors: string[] = []

if (networkMode !== 'testnet') {
  errors.push('VITE_NETWORK_MODE must be "testnet" for this Preview.')
}
if (configuredChainId !== arcTestnet.id) {
  errors.push(`VITE_CHAIN_ID must be ${arcTestnet.id} for this Preview.`)
}
if (!rawRpcUrl) {
  errors.push('VITE_RPC_URL is missing.')
}
if (!rawExplorerUrl) {
  errors.push('VITE_EXPLORER_URL is missing.')
}
if (!rawUsdcAddress || !isAddress(rawUsdcAddress)) {
  errors.push('VITE_USDC_ADDRESS is missing or invalid.')
}
if (rawPipelineAddress && !isAddress(rawPipelineAddress)) {
  errors.push('VITE_PIPELINE_CONTRACT_ADDRESS is invalid.')
}

export const appConfig = {
  networkMode: networkMode || 'unknown',
  chain: arcTestnet,
  expectedChainId: arcTestnet.id,
  rpcUrl: rawRpcUrl || arcTestnet.rpcUrls.default.http[0],
  explorerUrl: rawExplorerUrl || arcTestnet.blockExplorers.default.url,
  usdcAddress: isAddress(rawUsdcAddress) ? (rawUsdcAddress as Address) : undefined,
  pipelineAddress: isAddress(rawPipelineAddress) ? (rawPipelineAddress as Address) : undefined,
  githubUrl: githubUrl || undefined,
  configError: errors.length > 0 ? errors.join(' ') : null,
  isValid: errors.length === 0,
}
