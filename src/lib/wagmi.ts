import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arcMainnet, arcTestnet } from './chain'
import { appConfig } from './config'

export const wagmiConfig = createConfig({
  chains: [arcTestnet, arcMainnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(appConfig.rpcUrl),
    [arcMainnet.id]: http(arcMainnet.rpcUrls.default.http[0]),
  },
  ssr: false,
})
