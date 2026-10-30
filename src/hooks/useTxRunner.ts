import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import type { Hash, TransactionReceipt } from 'viem'
import { useTxStatus } from '../context/TxStatusContext'
import { appConfig } from '../lib/config'
import { getUserErrorMessage } from '../lib/errors'

export function useTxRunner() {
  const publicClient = usePublicClient({ chainId: appConfig.expectedChainId })
  const queryClient = useQueryClient()
  const { setStatus } = useTxStatus()

  const fail = useCallback(
    (error: unknown) => {
      setStatus({ phase: 'error', message: getUserErrorMessage(error) })
    },
    [setStatus],
  )

  const run = useCallback(
    async (label: string, action: () => Promise<Hash>): Promise<TransactionReceipt | undefined> => {
      setStatus({ phase: 'wallet', message: `Confirm ${label} in your wallet…` })

      try {
        const hash = await action()
        setStatus({ phase: 'pending', message: `${label} submitted. Waiting for confirmation…`, hash })

        if (!publicClient) throw new Error('Arc Testnet RPC client is unavailable.')

        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status !== 'success') throw new Error('Transaction reverted.')

        await queryClient.invalidateQueries()
        setStatus({ phase: 'success', message: `${label} confirmed.`, hash })
        return receipt
      } catch (error) {
        fail(error)
        return undefined
      }
    },
    [fail, publicClient, queryClient, setStatus],
  )

  return { fail, run }
}
