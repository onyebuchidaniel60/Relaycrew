import { isAddress, type Address } from 'viem'
import { arcMainnet, arcTestnet } from './chain'
import { pipelineCoordinatorAddresses } from './contracts'

export const ARC_USDC_ADDRESS: Address = '0x3600000000000000000000000000000000000000'

const networkMode = import.meta.env.VITE_NETWORK_MODE?.trim() ?? ''
const rawChainId = import.meta.env.VITE_CHAIN_ID?.trim() ?? ''
const configuredChainId = Number(rawChainId)
const rawRpcUrl = import.meta.env.VITE_RPC_URL?.trim() ?? ''
const rawExplorerUrl = import.meta.env.VITE_EXPLORER_URL?.trim() ?? ''
const rawUsdcAddress = import.meta.env.VITE_USDC_ADDRESS?.trim() ?? ''
const rawPipelineAddress = import.meta.env.VITE_PIPELINE_CONTRACT_ADDRESS?.trim() ?? ''
const githubUrl = import.meta.env.VITE_GITHUB_REPOSITORY_URL?.trim() ?? ''

const expectedChain =
  networkMode === 'mainnet' ? arcMainnet : networkMode === 'testnet' ? arcTestnet : null

const errors: string[] = []

if (!expectedChain) {
  errors.push('VITE_NETWORK_MODE must be "testnet" or "mainnet".')
}

if (expectedChain && configuredChainId !== expectedChain.id) {
  errors.push(
    `VITE_CHAIN_ID must be ${expectedChain.id} when VITE_NETWORK_MODE is "${networkMode}".`,
  )
}

if (!rawRpcUrl) {
  errors.push('VITE_RPC_URL is missing.')
}
if (!rawExplorerUrl) {
  errors.push('VITE_EXPLORER_URL is missing.')
}
if (!rawUsdcAddress || !isAddress(rawUsdcAddress)) {
  errors.push('VITE_USDC_ADDRESS is missing or invalid.')
} else if (rawUsdcAddress.toLowerCase() !== ARC_USDC_ADDRESS.toLowerCase()) {
  errors.push(`VITE_USDC_ADDRESS must be the official Arc USDC interface ${ARC_USDC_ADDRESS}.`)
}
if (rawPipelineAddress && !isAddress(rawPipelineAddress)) {
  errors.push('VITE_PIPELINE_CONTRACT_ADDRESS is invalid.')
}

const configuredPipelineAddress = isAddress(rawPipelineAddress)
  ? (rawPipelineAddress as Address)
  : undefined
const mappedPipelineAddress = expectedChain
  ? (pipelineCoordinatorAddresses[expectedChain.id] as Address | undefined)
  : undefined
const pipelineAddress = configuredPipelineAddress ?? mappedPipelineAddress

if (networkMode === 'mainnet' && !pipelineAddress) {
  errors.push('VITE_PIPELINE_CONTRACT_ADDRESS is required for an Arc Mainnet build.')
}

const chain = expectedChain ?? arcTestnet

export const appConfig = {
  networkMode: networkMode || 'unknown',
  chain,
  expectedChainId: expectedChain?.id ?? arcTestnet.id,
  isMainnet: expectedChain?.id === arcMainnet.id,
  isTestnet: expectedChain?.id === arcTestnet.id,
  networkLabel: expectedChain?.name ?? 'Unsupported network',
  explorerName: expectedChain?.blockExplorers?.default.name ?? 'Block explorer',
  rpcUrl: rawRpcUrl || chain.rpcUrls.default.http[0],
  explorerUrl: rawExplorerUrl || chain.blockExplorers?.default.url || '',
  usdcAddress: isAddress(rawUsdcAddress) ? (rawUsdcAddress as Address) : undefined,
  pipelineAddress,
  githubUrl: githubUrl || undefined,
  configError: errors.length > 0 ? errors.join(' ') : null,
  isValid: errors.length === 0,
}
