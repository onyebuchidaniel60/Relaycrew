#!/usr/bin/env node
/**
 * Manual Arc Mainnet deployment for PipelineCoordinator.
 *
 * Requires the exact Arc Studio compile artifact at
 * contracts/out/PipelineCoordinator.sol/PipelineCoordinator.json
 * (or ARTIFACT_PATH). The artifact is intentionally not committed.
 *
 * Usage:
 *   node scripts/deploy-mainnet.mjs            # preflight only, no signature
 *   node scripts/deploy-mainnet.mjs --confirm  # sign and broadcast
 *
 * The private key is read from .env (DEPLOYER_PRIVATE_KEY) and is never printed.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { privateKeyToAccount } from 'viem/accounts'
import {
  createPublicClient,
  http,
  encodeDeployData,
  getContractAddress,
  formatUnits,
  formatGwei,
  keccak256,
  toHex,
} from 'viem'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const USDC = '0x3600000000000000000000000000000000000000'
const EXPECTED_CHAIN_ID = 5042
const RPC = process.env.ARC_MAINNET_RPC_URL || 'https://rpc.mainnet.arc.io'
const ARTIFACT =
  process.env.ARTIFACT_PATH ||
  path.join(ROOT, 'contracts', 'out', 'PipelineCoordinator.sol', 'PipelineCoordinator.json')
const CONFIRM = process.argv.includes('--confirm')

function readEnv(file) {
  if (!fs.existsSync(file)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]
      }),
  )
}

const env = { ...readEnv(path.join(ROOT, '.env')), ...process.env }
let pk = env.DEPLOYER_PRIVATE_KEY
if (!pk) throw new Error('DEPLOYER_PRIVATE_KEY is missing from .env')
if (!pk.startsWith('0x')) pk = `0x${pk}`
if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) throw new Error('DEPLOYER_PRIVATE_KEY is malformed')

if (!fs.existsSync(ARTIFACT)) {
  throw new Error(
    `Artifact not found at ${ARTIFACT}. Export it from Arc Studio (contracts/out/PipelineCoordinator.sol/PipelineCoordinator.json) or set ARTIFACT_PATH.`,
  )
}

const account = privateKeyToAccount(pk)
const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'))
const source = fs.readFileSync(path.join(ROOT, 'contracts', 'PipelineCoordinator.sol'))
const sourceHash = keccak256(toHex(source))
const artifactHash = artifact.metadata.sources['contracts/PipelineCoordinator.sol'].keccak256
if (sourceHash !== artifactHash) throw new Error('Source/artifact hash mismatch')
if (!artifact.abi.some((x) => x.type === 'constructor')) throw new Error('Constructor ABI missing')

const data = encodeDeployData({
  abi: artifact.abi,
  bytecode: `0x${artifact.bytecode.object.replace(/^0x/, '')}`,
  args: [USDC],
})

const client = createPublicClient({ transport: http(RPC) })
const chainId = await client.getChainId()
if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Wrong chain: ${chainId}`)

const nonce = await client.getTransactionCount({ address: account.address, blockTag: 'pending' })
const predicted = getContractAddress({ from: account.address, nonce: BigInt(nonce) })
const balance = await client.getBalance({ address: account.address })
const gasEstimate = await client.estimateGas({ account: account.address, data, value: 0n })
const gasLimit = (gasEstimate * 120n) / 100n
const maxFeePerGas = 25_000_000_000n
const maxPriorityFeePerGas = 1_000_000_000n

if (balance < gasLimit * maxFeePerGas) throw new Error('Insufficient balance for worst-case gas')

console.log('=== PREFLIGHT ===')
console.log('deployer:', account.address)
console.log('chainId:', chainId)
console.log('nonce:', nonce)
console.log('constructorUsdc:', USDC)
console.log('predictedContract:', predicted)
console.log('gasEstimate:', gasEstimate.toString())
console.log('gasLimit:', gasLimit.toString())
console.log('maxFeePerGasGwei:', formatGwei(maxFeePerGas))
console.log('maxPriorityFeePerGasGwei:', formatGwei(maxPriorityFeePerGas))
console.log('worstCaseCostUsdc:', formatUnits(gasLimit * maxFeePerGas, 18))
console.log('balanceUsdc:', formatUnits(balance, 18))

if (!CONFIRM) {
  console.log('=== PREFLIGHT ONLY ===')
  console.log('No transaction signed. Re-run with --confirm to broadcast.')
  process.exit(0)
}

const signed = await account.signTransaction({
  chainId: EXPECTED_CHAIN_ID,
  nonce,
  data,
  value: 0n,
  gas: gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  type: 'eip1559',
})

console.log('=== BROADCASTING ===')
const hash = await client.sendRawTransaction({ serializedTransaction: signed })
console.log('txHash:', hash)

const receipt = await client.waitForTransactionReceipt({ hash, timeout: 120_000 })
console.log('=== RECEIPT ===')
console.log('status:', receipt.status)
console.log('blockNumber:', receipt.blockNumber.toString())
console.log('contractAddress:', receipt.contractAddress)
console.log('gasUsed:', receipt.gasUsed.toString())
console.log(
  'effectiveGasPriceGwei:',
  receipt.effectiveGasPrice ? formatGwei(receipt.effectiveGasPrice) : 'n/a',
)
console.log(
  'gasCostUsdc:',
  receipt.effectiveGasPrice
    ? formatUnits(receipt.gasUsed * receipt.effectiveGasPrice, 18)
    : 'n/a',
)

if (receipt.status !== 'success') throw new Error('Deployment transaction reverted')
if (receipt.contractAddress?.toLowerCase() !== predicted.toLowerCase()) {
  throw new Error(`Deployed address ${receipt.contractAddress} does not match predicted ${predicted}`)
}

const code = await client.getBytecode({ address: predicted })
if (!code || code === '0x') throw new Error('No code at the predicted address')

const read = async (functionName) =>
  client.readContract({ address: predicted, abi: artifact.abi, functionName })

const deployedUsdc = await read('usdc')
const maxStages = await read('MAX_STAGES')
const pipelineCount = await read('pipelineCount')
console.log('=== ON-CHAIN VERIFICATION ===')
console.log('codeBytes:', (code.length - 2) / 2)
console.log('usdc():', deployedUsdc)
console.log('MAX_STAGES():', maxStages.toString())
console.log('pipelineCount():', pipelineCount.toString())

if (deployedUsdc.toLowerCase() !== USDC.toLowerCase()) throw new Error('usdc() mismatch')
if (maxStages !== 10n) throw new Error('MAX_STAGES mismatch')

const evidence = {
  chainId,
  deployer: account.address,
  nonce,
  constructorUsdc: USDC,
  contractAddress: predicted,
  txHash: hash,
  blockNumber: receipt.blockNumber.toString(),
  gasUsed: receipt.gasUsed.toString(),
  effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
  gasCostUsdc: receipt.effectiveGasPrice
    ? formatUnits(receipt.gasUsed * receipt.effectiveGasPrice, 18)
    : null,
  codeBytes: (code.length - 2) / 2,
  usdc: deployedUsdc,
  maxStages: maxStages.toString(),
  pipelineCount: pipelineCount.toString(),
  sourceKeccak: sourceHash,
  bytecodeKeccak: keccak256(artifact.bytecode.object),
  compiler: artifact.metadata.compiler.version,
}

const evidenceDir = path.join(ROOT, 'deployments')
fs.mkdirSync(evidenceDir, { recursive: true })
fs.writeFileSync(
  path.join(evidenceDir, 'arc-mainnet.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
)
console.log('evidence written to deployments/arc-mainnet.json')
