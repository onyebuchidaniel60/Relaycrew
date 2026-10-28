# Deployment Guide

**Do not use this guide to deploy or transact on mainnet without explicit operator authorization.**

## Network configuration

| Setting | Arc Testnet (Preview) | Arc Mainnet (Production) |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| Native gas currency | USDC | USDC |
| USDC ERC-20 interface | `0x3600000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` |
| Token precision for escrow | 6 decimals | 6 decimals |

Always reverify these values against the official Arc network and contract-address documentation before deployment. The ERC-20 interface uses 6 decimals; native gas token representation uses 18 decimals. Do not mix them.

## Arc Studio workflow

1. Open the real Arc Studio project and record its project URL.
2. Build and test the contract/app within Arc Studio as required by the hackathon.
3. Export the tested source and record the source commit, compiler version and dependency lock.
4. Verify exported source/ABI matches the version tested in Arc Studio.
5. Arc Studio documentation states its deploy flow targets Arc Testnet. Use a separate manual mainnet deployment for the exported tested source only after explicit operator authorization.

Never use an unverified ERC-8183 testnet address on mainnet. RelayCrew uses its own linear pipeline contract and does not claim ERC-8183 compliance.

## Vercel environments

### Preview (required early, Phase 1)

- Set `VITE_NETWORK_MODE=testnet`.
- Set `VITE_CHAIN_ID=5042002`.
- Set RPC/explorer/USDC values for Arc Testnet.
- Set `VITE_PIPELINE_CONTRACT_ADDRESS` only after a verified testnet deployment exists; before that, writes stay disabled.
- No deployer keys or private credentials.
- Keep this URL updated after each verified phase and record exact URL plus deployed commit in `AI_HANDOFF.md`.

### Production (only after authorization)

- Set `VITE_NETWORK_MODE=mainnet` and `VITE_CHAIN_ID=5042`.
- Use only the verified mainnet contract address and official mainnet RPC/explorer.
- Set the actual public GitHub repo URL after confirming the repository is public.
- Never set `DEPLOYER_PRIVATE_KEY` in Vercel. Users sign app transactions with their own wallets.
- Do not promote Production until mainnet contract and transfer evidence are verified and operator authorizes it.

## Contract deployment safety checklist

- [ ] Official Arc chain ID and RPC rechecked.
- [ ] Official USDC ERC-20 address and 6 decimals rechecked.
- [ ] Contract source and compiler match tested Arc Studio export.
- [ ] No compile warnings remain unexplained.
- [ ] Complete contract tests passed.
- [ ] Constructor token argument reviewed.
- [ ] Deployment wallet is dedicated and low-value; key is local-only.
- [ ] Operator has explicitly approved mainnet deployment and a specific low-value transaction.
- [ ] Contract deployment transaction, address, compiler/dependency data recorded.
- [ ] Read `usdc()` and verify correct token address.
- [ ] Mainnet app env is set to chain 5042 and verified contract address.
- [ ] Test pipeline has budgets and provider addresses reviewed before signing.
- [ ] `StageReleased`, next `StageHired`, USDC Transfer events and balances confirmed on Explorer.
- [ ] Actual contract address and transaction hashes written to README, docs and handoff.

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

Do not invent contract addresses or external links. Use “not yet deployed/verified” until real values exist.

## Release and rollback

The contract is immutable/non-upgradeable and has no generic admin withdrawal. A deployment cannot be casually rolled back; if a critical bug appears, stop directing users to it and communicate the issue. Do not add a rushed rescue method. Frontend deployment can be rolled back to a prior verified Vercel build, but chain transactions remain permanent.

## Post-deploy smoke test

Open the actual Production URL in a fresh browser, verify the chain badge, connect a wallet, inspect contract address, confirm empty/live data behavior, run a deliberately low-value approved pipeline test with controlled/consenting provider addresses, and inspect transaction links on `https://explorer.arc.io`. Record actual results and commit in `AI_HANDOFF.md`.
