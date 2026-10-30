import { useReadContract, useWriteContract } from 'wagmi'
import type { Address } from 'viem'
import { appConfig } from '../lib/config'
import {
  isPipelineConfigured,
  pipelineCoordinatorAbi,
  pipelineCoordinatorAddress,
} from '../lib/contracts'
import { useNetworkGuard } from './useNetworkGuard'

const contractAddress: Address = pipelineCoordinatorAddress
const readsEnabled = isPipelineConfigured && appConfig.isValid

export type StageInput = {
  provider: Address
  budget: bigint
  title: string
  brief: string
  durationSeconds: number
}

export function usePipelineCount() {
  return useReadContract({
    address: contractAddress,
    abi: pipelineCoordinatorAbi,
    functionName: 'pipelineCount',
    chainId: appConfig.expectedChainId,
    query: { enabled: readsEnabled },
  })
}

export function usePipelineSummary(pipelineId?: bigint) {
  return useReadContract({
    address: contractAddress,
    abi: pipelineCoordinatorAbi,
    functionName: 'getPipelineSummary',
    args: pipelineId === undefined ? undefined : [pipelineId],
    chainId: appConfig.expectedChainId,
    query: { enabled: readsEnabled && pipelineId !== undefined },
  })
}

export function usePipelineStage(pipelineId?: bigint, stageIndex?: bigint) {
  return useReadContract({
    address: contractAddress,
    abi: pipelineCoordinatorAbi,
    functionName: 'getStage',
    args: pipelineId === undefined || stageIndex === undefined ? undefined : [pipelineId, stageIndex],
    chainId: appConfig.expectedChainId,
    query: { enabled: readsEnabled && pipelineId !== undefined && stageIndex !== undefined },
  })
}

export function useUserPipelineIds(user?: Address) {
  return useReadContract({
    address: contractAddress,
    abi: pipelineCoordinatorAbi,
    functionName: 'getUserPipelineIds',
    args: user === undefined ? undefined : [user],
    chainId: appConfig.expectedChainId,
    query: { enabled: readsEnabled && user !== undefined },
  })
}

export function usePipelineUsdc() {
  return useReadContract({
    address: contractAddress,
    abi: pipelineCoordinatorAbi,
    functionName: 'usdc',
    chainId: appConfig.expectedChainId,
    query: { enabled: readsEnabled },
  })
}

export function usePipelineWrites() {
  const { writeContractAsync, error, isPending } = useWriteContract()
  const network = useNetworkGuard()
  const canWrite = isPipelineConfigured && appConfig.isValid && network.isWriteEnabled

  const getAddress = () => {
    if (!pipelineCoordinatorAddress) {
      throw new Error('Pipeline contract address is not configured.')
    }
    return pipelineCoordinatorAddress
  }

  return {
    canWrite,
    error,
    isPending,
    createPipeline: (stages: StageInput[]) => {
      if (!canWrite) throw new Error('Wallet and network must be ready before writing.')
      return writeContractAsync({
        address: getAddress(),
        abi: pipelineCoordinatorAbi,
        functionName: 'createPipeline',
        args: [stages],
        chainId: appConfig.expectedChainId,
      })
    },
    submitStage: (pipelineId: bigint, stageIndex: bigint, deliverableURI: string) => {
      if (!canWrite) throw new Error('Wallet and network must be ready before writing.')
      return writeContractAsync({
        address: getAddress(),
        abi: pipelineCoordinatorAbi,
        functionName: 'submitStage',
        args: [pipelineId, stageIndex, deliverableURI],
        chainId: appConfig.expectedChainId,
      })
    },
    approveStage: (pipelineId: bigint, stageIndex: bigint) => {
      if (!canWrite) throw new Error('Wallet and network must be ready before writing.')
      return writeContractAsync({
        address: getAddress(),
        abi: pipelineCoordinatorAbi,
        functionName: 'approveStage',
        args: [pipelineId, stageIndex],
        chainId: appConfig.expectedChainId,
      })
    },
    rejectStage: (pipelineId: bigint, stageIndex: bigint) => {
      if (!canWrite) throw new Error('Wallet and network must be ready before writing.')
      return writeContractAsync({
        address: getAddress(),
        abi: pipelineCoordinatorAbi,
        functionName: 'rejectStage',
        args: [pipelineId, stageIndex],
        chainId: appConfig.expectedChainId,
      })
    },
    expirePipeline: (pipelineId: bigint) => {
      if (!canWrite) throw new Error('Wallet and network must be ready before writing.')
      return writeContractAsync({
        address: getAddress(),
        abi: pipelineCoordinatorAbi,
        functionName: 'expirePipeline',
        args: [pipelineId],
        chainId: appConfig.expectedChainId,
      })
    },
  }
}
