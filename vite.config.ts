import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const ARC_MAINNET_USDC = '0x3600000000000000000000000000000000000000'
const ARC_TESTNET_USDC = '0x3600000000000000000000000000000000000000'
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is required for this build.`)
  return value
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const env = (name: string) => process.env[name] ?? fileEnv[name]
  const vercelEnv = process.env.VERCEL_ENV
  const networkMode = env('VITE_NETWORK_MODE')?.trim()
  const chainId = env('VITE_CHAIN_ID')?.trim()
  const pipelineAddress = env('VITE_PIPELINE_CONTRACT_ADDRESS')?.trim()
  const usdcAddress = env('VITE_USDC_ADDRESS')?.trim().toLowerCase()

  if (vercelEnv === 'preview' && networkMode !== 'testnet') {
    throw new Error('Vercel Preview builds must use Arc Testnet (VITE_NETWORK_MODE=testnet).')
  }

  if (vercelEnv === 'production' && networkMode !== 'mainnet') {
    throw new Error('Vercel Production builds must use Arc Mainnet (VITE_NETWORK_MODE=mainnet).')
  }

  if (networkMode === 'mainnet') {
    if (chainId !== '5042') {
      throw new Error('Arc Mainnet builds require VITE_CHAIN_ID=5042.')
    }
    if (usdcAddress !== ARC_MAINNET_USDC) {
      throw new Error(`Arc Mainnet builds require the official USDC interface ${ARC_MAINNET_USDC}.`)
    }
    if (!ADDRESS_PATTERN.test(required('VITE_PIPELINE_CONTRACT_ADDRESS', pipelineAddress))) {
      throw new Error('VITE_PIPELINE_CONTRACT_ADDRESS must be a valid address for Arc Mainnet.')
    }
  }

  if (networkMode === 'testnet') {
    if (chainId !== '5042002') {
      throw new Error('Arc Testnet builds require VITE_CHAIN_ID=5042002.')
    }
    if (usdcAddress !== ARC_TESTNET_USDC) {
      throw new Error(`Arc Testnet builds require the official USDC interface ${ARC_TESTNET_USDC}.`)
    }
  }

  return {
    plugins: [react()],
  }
})
