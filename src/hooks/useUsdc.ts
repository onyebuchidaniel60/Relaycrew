import { useReadContract, useWriteContract } from 'wagmi'
import type { Address } from 'viem'
import { appConfig } from '../lib/config'
import { usdcAbi } from '../lib/usdc'

const usdcAddress = appConfig.usdcAddress

export function useUsdcBalance(owner?: Address) {
  return useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: owner === undefined ? undefined : [owner],
    chainId: appConfig.expectedChainId,
    query: { enabled: Boolean(usdcAddress && owner && appConfig.isValid) },
  })
}

export function useUsdcAllowance(owner?: Address, spender?: Address) {
  return useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: 'allowance',
    args: owner === undefined || spender === undefined ? undefined : [owner, spender],
    chainId: appConfig.expectedChainId,
    query: { enabled: Boolean(usdcAddress && owner && spender && appConfig.isValid) },
  })
}

export function useApproveUsdc() {
  const { writeContractAsync } = useWriteContract()

  return (spender: Address, amount: bigint) => {
    if (!usdcAddress) throw new Error('USDC address is not configured.')
    return writeContractAsync({
      address: usdcAddress,
      abi: usdcAbi,
      functionName: 'approve',
      args: [spender, amount],
      chainId: appConfig.expectedChainId,
    })
  }
}
