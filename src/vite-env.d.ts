/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK_MODE?: string
  readonly VITE_CHAIN_ID?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_EXPLORER_URL?: string
  readonly VITE_USDC_ADDRESS?: string
  readonly VITE_PIPELINE_CONTRACT_ADDRESS?: string
  readonly VITE_GITHUB_REPOSITORY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
