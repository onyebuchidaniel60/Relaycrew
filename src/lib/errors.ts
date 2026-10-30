import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem'

const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  ZeroAddress: 'A required address is zero.',
  UnknownPipeline: 'Pipeline not found.',
  InvalidStageCount: 'A pipeline must have between 2 and 5 stages.',
  InvalidProvider: 'Each stage needs a valid provider address that is not the client.',
  DuplicateProvider: 'Provider addresses must be unique within a pipeline.',
  InvalidBudget: 'Each stage budget must be at least 1 USDC.',
  InvalidTotalBudget: 'The total pipeline budget cannot exceed 100 USDC.',
  InvalidTitle: 'Each stage title must be between 1 and 64 bytes.',
  InvalidBrief: 'Each stage brief must be between 1 and 240 bytes.',
  InvalidDuration: 'Each stage duration must be between 900 and 604,800 seconds.',
  InvalidURI: 'Enter a 9–256 byte https:// or ipfs:// deliverable URI.',
  PipelineNotActive: 'This pipeline is no longer active.',
  InvalidStageIndex: 'This is not the current stage.',
  StageNotActive: 'This stage is not active.',
  StageNotSubmitted: 'This stage has not been submitted.',
  InvalidStageStatus: 'This action is not available for the current stage status.',
  NotClient: 'Only the pipeline client can perform this action.',
  NotProvider: 'Only the assigned provider can submit this stage.',
  WorkDeadlinePassed: 'The stage work deadline has passed.',
  EvaluationDeadlinePassed: 'The evaluation deadline has passed.',
  NotExpired: 'This pipeline cannot be expired yet.',
  SafeERC20FailedOperation: 'The USDC transfer failed.',
  ReentrancyGuardReentrantCall: 'The transaction was blocked by the reentrancy guard.',
}

export function getUserErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    const reverted = error.walk((candidate) => candidate instanceof ContractFunctionRevertedError)
    if (reverted instanceof ContractFunctionRevertedError) {
      const errorName = reverted.data?.errorName
      if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
        return CONTRACT_ERROR_MESSAGES[errorName]
      }
    }

    if (error.walk((candidate) => candidate instanceof UserRejectedRequestError)) {
      return 'Transaction cancelled by user.'
    }

    return error.shortMessage || error.message
  }

  const message = error instanceof Error ? error.message : String(error)
  for (const [name, friendly] of Object.entries(CONTRACT_ERROR_MESSAGES)) {
    if (message.includes(name)) return friendly
  }
  if (/user rejected|rejected the request|denied transaction|cancelled by user/i.test(message)) {
    return 'Transaction cancelled by user.'
  }

  return message || 'Transaction failed. Please try again.'
}
