import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { TxStatusProvider } from './context/TxStatusContext'
import { wagmiConfig } from './lib/wagmi'
import './index.css'
import './editorial.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TxStatusProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TxStatusProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
