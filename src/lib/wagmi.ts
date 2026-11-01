import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arcMainnet, arcTestnet } from './chain'
import { appConfig } from './config'

const chains = appConfig.isMainnet
  ? ([arcMainnet, arcTestnet] as const)
  : ([arcTestnet, arcMainnet] as const)

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(
      appConfig.expectedChainId === arcTestnet.id
        ? appConfig.rpcUrl
        : arcTestnet.rpcUrls.default.http[0],
    ),
    [arcMainnet.id]: http(
      appConfig.expectedChainId === arcMainnet.id
        ? appConfig.rpcUrl
        : arcMainnet.rpcUrls.default.http[0],
    ),
  },
  ssr: false,
})
