import { useEffect, useState } from 'react'

export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
