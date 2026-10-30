import { useAccount } from 'wagmi'
import { appConfig } from '../lib/config'

export function useNetworkGuard() {
  const { address, chainId, isConnected } = useAccount()
  const isWrongNetwork = isConnected && chainId !== appConfig.expectedChainId

  return {
    address,
    chainId,
    expectedChainId: appConfig.expectedChainId,
    isConnected,
    isWrongNetwork,
    isWriteEnabled: isConnected && !isWrongNetwork && appConfig.isValid,
    configError: appConfig.configError,
  }
}
