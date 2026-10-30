import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type TxPhase = 'wallet' | 'pending' | 'success' | 'error'

export type TxStatus = {
  phase: TxPhase
  message: string
  hash?: string
} | null

type TxStatusContextValue = {
  status: TxStatus
  setStatus: (status: TxStatus) => void
  clear: () => void
}

const TxStatusContext = createContext<TxStatusContextValue | undefined>(undefined)

export function TxStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatusState] = useState<TxStatus>(null)
  const setStatus = useCallback((next: TxStatus) => setStatusState(next), [])
  const clear = useCallback(() => setStatusState(null), [])
  const value = useMemo(() => ({ status, setStatus, clear }), [status, setStatus, clear])

  return <TxStatusContext.Provider value={value}>{children}</TxStatusContext.Provider>
}

export function useTxStatus() {
  const context = useContext(TxStatusContext)
  if (!context) throw new Error('useTxStatus must be used inside TxStatusProvider.')
  return context
}
