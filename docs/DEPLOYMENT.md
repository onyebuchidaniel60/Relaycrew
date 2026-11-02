# Deployment Guide

**Arc Mainnet is live.** The operator explicitly authorized the mainnet deployment and a low-value real-USDC demonstration. Mainnet transactions are irreversible. Before any further mainnet action, re-verify the chain, contract, token, recipient, amount, and allowance.

## Current deployments

### Production — Arc Mainnet

- Network: **Arc Mainnet**, chain ID `5042`.
- Production URL: **https://relaycrew-omega.vercel.app**.
- Deployment ID: `dpl_4FB9YFD8RbFYEnPahRs8bSXUuXQ1`.
- Deployment URL: `https://relaycrew-rom2qwkni-uhhh2.vercel.app`.
- Coordinator contract: **`0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`**.
- Deployment tx: **`0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e`**.
- Block: `29054729`; gas used `2,236,465`; effective gas price `21 gwei`; gas cost `0.046965765 USDC`.
- Constructor argument: official USDC ERC-20 interface `0x3600000000000000000000000000000000000000`.
- On-chain verification: `usdc()` returns the official interface; `MAX_STAGES()` returns `10`; `pipelineCount()` returned `0` after deployment and `1` after the E2E; deployed code is `9,992` bytes.
- Explorer: https://explorer.arc.io/address/0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114.
- **Mainnet E2E completed 2026-11-02.** Pipeline #1 is `Completed`: 2 stages, 2 USDC total, 2 USDC paid, 0 refunded.
  - Create/fund: `0x12b1b81d4b34eeb00cb857f6fea615351429767597285d51dc354d528ced5361`.
  - Stage 1 approve: `0xfddd46b6b322a1f3b66efc4b99626e862d2bfd7d7a12c0f0306a422b5cbc9e62`.
  - Stage 2 approve: `0x2f1929bb583352c8f2c6c7e1231acdad777e17227ab4be9f4563aaebd849785b`.
  - Stage 1 submit: `0x258a289db9777afe19748b9ad56c974f3cb340de3c1265c65b0d04101a984193`; Stage 2 submit: `0xb35c318e500f712ad3c0be7ca15c292e71ca243b638823f0e6974f6ad22bff0f`.
  - The operator-supplied “create/fund” hash `0x45bdd556522a82dda088855bf92cbf99f87a135be702a436a57fe693a41a8e55` is the USDC allowance approval, not the pipeline creation.

### Preview — Arc Testnet

- Network: **Arc Testnet**, chain ID `5042002`; test USDC only.
- Preview URL: **https://relaycrew-1gp6xbcd6-uhhh2.vercel.app** (Deployment Protection enabled).
- Preview deployed source commit: `4bb066302f17ca6b1c025bafd80beffa37eed57b`; deployment ID `dpl_3XDUsqQn1A1SzEcFajVGxoZTsudg`.
- Coordinator contract: `0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070` (`MAX_STAGES = 10`).
- Testnet deployment tx: `0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`.
- Arc Testnet Explorer: https://explorer.testnet.arc.io/address/0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070.
- Previous 5-stage testnet contract (superseded): `0x85bbf546b09d990959de0672c273b56400f84f05`.

## Network configuration

| Setting | Arc Testnet (Preview) | Arc Mainnet (Production) |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| Native gas currency | USDC | USDC |
| USDC ERC-20 interface | `0x3600000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` |
| Token precision for escrow | 6 decimals | 6 decimals |

Official values were rechecked against https://docs.arc.io/arc/references/contract-addresses and https://docs.arc.io/arc/references/connect-to-arc on 2026-11-01. The ERC-20 interface uses 6 decimals; native gas representation uses 18 decimals. Do not mix them.

The server-side build guard in `vite.config.ts` fails a Vercel Preview build if it is not Arc Testnet and fails a Vercel Production build if it is not Arc Mainnet with chain `5042` and a valid contract address.

## Mainnet deployment record

- Source: `contracts/PipelineCoordinator.sol`.
- Arc Studio App ID: `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`.
- Exact Arc Studio compile artifact exported from the workspace; not committed.
- Compiler: `0.8.28+commit.7893614a`; optimizer enabled, 200 runs; EVM `cancun`.
- Source keccak: `0x32485699eec5a9e958b418f867b47ef8378a972a7ab1bfeb86c9cae75a770b72` — matches the artifact metadata.
- ABI: 58 entries, matched against `src/lib/contracts.ts`.
- Creation bytecode keccak: `0x833f16c07942bdab254a58c5820f336fff9a988c4443005f74cd7e1bd6b8eaa0`.
- Constructor: `PipelineCoordinator(0x3600000000000000000000000000000000000000)`.
- Deployer: `0x6B24827a732f7e8CD35c56F50E3418a05A0Ee054` (nonce 0; local-only key).
- Deployment method: `scripts/deploy-mainnet.mjs` with the exported Arc Studio artifact; direct CREATE, signed locally with viem.
- Evidence record: `deployments/arc-mainnet.json`.

The script performs a preflight only by default. It prints the deployer, chain ID, USDC argument, nonce, predicted contract address, gas estimate, fee cap, and worst-case cost. It requires `--confirm` to sign and broadcast, never prints the private key, and verifies the deployed code and immutable token address after the receipt.

## Arc Studio workflow

1. Open the real Arc Studio project and record its project URL.
2. Build and test the contract/app within Arc Studio as required by the hackathon.
3. Export the tested source and compile artifact; record the source commit, compiler version, and dependency lock.
4. Verify exported source/ABI/compiler parity.
5. Arc Studio's automated deploy flow targets Arc Testnet. Mainnet deployment is manual from the exported tested artifact after explicit operator authorization.

Never use an unverified ERC-8183 testnet address on mainnet. RelayCrew uses its own linear pipeline contract and does not claim ERC-8183 compliance.

## Vercel environments

### Preview (Arc Testnet only)

- `VITE_NETWORK_MODE=testnet`
- `VITE_CHAIN_ID=5042002`
- `VITE_RPC_URL=https://rpc.testnet.arc.io`
- `VITE_EXPLORER_URL=https://explorer.testnet.arc.io`
- `VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000`
- `VITE_PIPELINE_CONTRACT_ADDRESS=0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`
- `VITE_GITHUB_REPOSITORY_URL=https://github.com/onyebuchidaniel60/Relaycrew`

No deployer keys or private credentials. Keep the Preview URL updated after each verified phase.

### Production (Arc Mainnet)

- `VITE_NETWORK_MODE=mainnet`
- `VITE_CHAIN_ID=5042`
- `VITE_RPC_URL=https://rpc.mainnet.arc.io`
- `VITE_EXPLORER_URL=https://explorer.arc.io`
- `VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000`
- `VITE_PIPELINE_CONTRACT_ADDRESS=0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`
- `VITE_GITHUB_REPOSITORY_URL=https://github.com/onyebuchidaniel60/Relaycrew`

Never set `DEPLOYER_PRIVATE_KEY` in Vercel. Users sign app transactions with their own wallets.

## Contract deployment safety checklist

- [x] Official Arc chain ID and RPC rechecked.
- [x] Official USDC ERC-20 address and 6 decimals rechecked.
- [x] Contract source and compiler match the tested Arc Studio export.
- [x] No compile warnings remain unexplained.
- [x] Complete contract tests passed in Arc Studio (31/31).
- [x] Constructor token argument reviewed.
- [x] Deployment wallet is dedicated and low-value; key is local-only.
- [x] Operator explicitly approved the mainnet deployment and the low-value E2E plan.
- [x] Contract deployment transaction, address, compiler, and dependency data recorded.
- [x] Read `usdc()` and verified the correct token address.
- [x] Mainnet app env set to chain 5042 and the verified contract address.
- [ ] Test pipeline budgets and provider addresses reviewed before signing (operator E2E).
- [ ] `StageReleased`, next `StageHired`, USDC Transfer events, and balances confirmed on Explorer (operator E2E).
- [x] Actual contract address and deployment transaction written to README, docs, and handoff.

## Environment variables

Frontend public build variables:

- `VITE_NETWORK_MODE`
- `VITE_CHAIN_ID`
- `VITE_RPC_URL`
- `VITE_EXPLORER_URL`
- `VITE_USDC_ADDRESS`
- `VITE_PIPELINE_CONTRACT_ADDRESS`
- `VITE_GITHUB_REPOSITORY_URL`

Local deploy-only variables:

- `DEPLOYER_PRIVATE_KEY` — secret; never committed or used in frontend/Vercel.
- `ARC_MAINNET_RPC_URL` — optional local deployment URL.
- `ARC_TESTNET_RPC_URL` — optional local test deployment URL.
- `ARTIFACT_PATH` — optional path to the exported Arc Studio compile artifact.

Do not invent contract addresses or external links. Use "not yet deployed/verified" until real values exist.

## Release and rollback

The contract is immutable/non-upgradeable and has no generic admin withdrawal. A deployment cannot be casually rolled back; if a critical bug appears, stop directing users to it and communicate the issue. Do not add a rushed rescue method. Frontend deployment can be rolled back to a prior verified Vercel build, but chain transactions remain permanent.

## Post-deploy smoke test

Production was smoke-tested on 2026-11-01:

- `/`, `/create`, `/pipelines`, `/pipelines/42`, `/docs`, `/risk`, `/favicon.svg`, and `/images/og-relaycrew.png` returned HTTP 200.
- Headless Chromium rendered `Arc Mainnet` and real-USDC notices on the main routes.
- No configuration-error banner appeared.
- The deployed JS asset `index-eXZt2eAI.js` matched the local mainnet build's SHA-256 exactly.
- The deployed bundle contains the mainnet contract address and official USDC address.

Still required: the operator's browser-wallet E2E pipeline and Explorer reconciliation. Record the actual create/submit/approve transaction hashes in README and `AI_HANDOFF.md` after execution.
