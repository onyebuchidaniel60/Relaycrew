# RelayCrew

**RelayCrew — Escrow for Agent Workflows.** It coordinates a fixed sequence of specialist stages using one parent-funded Arc USDC escrow. Approving a submitted stage pays the current provider and activates the next preassigned specialist in the same on-chain transaction. Built for the Arc Microgrants: Built with Arc Studio hackathon.

> Experimental hackathon software. The contract is not independently audited. USDC transfers are irreversible, task metadata is public, and the client is the only evaluator. Do not use sensitive tasks or more money than you can afford to lose.

## Current status

Phase 9 mainnet release is deployed. The operator explicitly authorized the Arc Mainnet deployment and a low-value real-USDC demonstration. The tested `PipelineCoordinator` is live on Arc Mainnet, and the production frontend is built with the mainnet chain, RPC, explorer, USDC interface, and contract address.

- Public GitHub repository: **verified** at https://github.com/onyebuchidaniel60/Relaycrew.
- Release commit: **`924440f450591353a593a903ef47ac238f610858`** (`release: arc mainnet demo and submission evidence`).
- Arc Studio project: **verified** via CLI (App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`); contract source and tests in `contracts/`.
- **Vercel Production: https://relaycrew-omega.vercel.app** (Arc Mainnet, chain ID `5042`; real USDC). Deployment ID `dpl_4FB9YFD8RbFYEnPahRs8bSXUuXQ1`; deployment URL `https://relaycrew-rom2qwkni-uhhh2.vercel.app`.
- Vercel Preview: **https://relaycrew-1gp6xbcd6-uhhh2.vercel.app** (Arc Testnet only; Vercel Deployment Protection enabled). Existing Preview deployment source commit `4bb066302f17ca6b1c025bafd80beffa37eed57b`.
- **Live Mainnet contract: `0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`** on Arc Mainnet (chain ID `5042`). [Explorer](https://explorer.arc.io/address/0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114).
- **Mainnet deployment tx: `0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e`** — block `29054729`; gas used `2,236,465`; gas cost `0.046965765 USDC`. [Explorer](https://explorer.arc.io/tx/0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e).
- Mainnet constructor argument: official USDC ERC-20 interface `0x3600000000000000000000000000000000000000`; on-chain `usdc()` returns the same address, `MAX_STAGES()` returns `10`, and `pipelineCount()` starts at `0`.
- Mainnet E2E transaction hashes: **pending operator execution**. The operator will run the 2-stage, $1-per-stage browser-wallet journey and record the create/approve/approve hashes. No E2E hashes are fabricated or claimed here.
- Testnet contract: **`0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`**, deployment tx `0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`. [Explorer](https://explorer.testnet.arc.io/address/0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070).
- Previous 5-stage testnet contract (superseded): `0x85bbf546b09d990959de0672c273b56400f84f05`.
- Foundry tests: 31 passed, 0 failed in Arc Studio, including 10-stage creation and 11-stage rejection.
- Production build: `npm run build` passed with mainnet env; deployed JS asset `index-eXZt2eAI.js` matches the local build SHA-256 exactly.
- Production smoke checks: `/`, `/create`, `/pipelines`, `/pipelines/42`, `/docs`, `/risk`, `/favicon.svg`, and `/images/og-relaycrew.png` returned HTTP 200; headless Chromium rendered the mainnet network badge and real-USDC notice.
- In-app docs: `/docs`; risk notice: `/risk`.
- Design mockups: `mockups/index.html`; operator references and the recorded approval are in `docs/DESIGN_DECISIONS.md`.
- Final visual design: approved 2026-10-30; “Warm Editorial Escrow” applied in Phase 7. Mainnet production configuration is network-aware and does not reuse testnet labels.

Never replace these entries with guessed URLs or fabricated evidence.

## Start here

Read the source-of-truth files in this order:

1. [`PROJECT_SPEC.md`](PROJECT_SPEC.md) — product behavior, roles, flows, requirements and acceptance criteria.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — fixed system/contract architecture, data and security.
3. [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) — phase-gated build sequence.
4. [`AGENTS.md`](AGENTS.md) — non-negotiable implementation rules.
5. [`AI_HANDOFF.md`](AI_HANDOFF.md) — current state and the one task to execute next.
6. [`MASTER_BLUEPRINT.md`](MASTER_BLUEPRINT.md) — full planning record, audit, sources and rationale.
7. [`docs/REQUIREMENT_MATRIX.md`](docs/REQUIREMENT_MATRIX.md) — feature-by-feature acceptance/edge-case matrix.

The workflow methodology supplied by the operator is included in this package as `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`. Preserve it in the repo and follow its inspect → small task → test → inspect/fix → commit → checkpoint → stop loop.

## Product behavior

1. Client defines 2–10 stages, with distinct provider wallets, titles, public briefs, fixed budgets and durations. The create form uses Days and Hours selectors and can append an optional https:// or ipfs:// attachment URL to the public brief.
2. Client grants an exact USDC allowance and funds the total budget.
3. First stage becomes Active; later stages are Queued but budget-reserved in the same escrow.
4. Provider submits a public HTTPS/IPFS deliverable reference.
5. Client approves or rejects. Approval pays the active provider and activates the next stage in one transaction. Final approval completes the pipeline.
6. Rejection or eligible expiry refunds unpaid escrow to the client. Previous payouts cannot be reversed.

## Fixed design limits

- Arc Mainnet: chain ID `5042`; RPC `https://rpc.mainnet.arc.io`; explorer `https://explorer.arc.io`.
- Arc Testnet: chain ID `5042002`; RPC `https://rpc.testnet.arc.io`; explorer `https://explorer.testnet.arc.io`.
- USDC ERC-20 interface: `0x3600000000000000000000000000000000000000`, 6 decimals per current official Arc docs. Reverify before deployment.
- Stage count: 2–10.
- Per-stage minimum: 1 USDC. Per-pipeline maximum: 100 USDC.
- Stage work period: 15 minutes–7 days from activation. Evaluation period: 24 hours.
- Preview uses Arc Testnet only. Mainnet deployment and real-USDC payment require specific operator authorization; the 2026-11-01 authorization covers the documented deployment and low-value E2E only.
- No backend/database/runtime AI/marketplace/reputation/arbitration/fees.

## Developer setup

Available commands for the app (verified locally with Node.js v26.13.0 and npm 11.20.0):

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

`npm run build` runs the TypeScript check and builds the Vite app into `dist/`.

Contract: `contracts/PipelineCoordinator.sol` is implemented and tested in Arc Studio (Solc 0.8.28; 31 Foundry tests; `MAX_STAGES = 10`). The ABI and both chain addresses are in `src/lib/contracts.ts`. Arc Studio remains the contract build/test source; the exported local Foundry workflow is not configured. The mainnet deployment used the exact Arc Studio compile artifact: source keccak `0x32485699eec5a9e958b418f867b47ef8378a972a7ab1bfeb86c9cae75a770b72`, creation code keccak `0x833f16c07942bdab254a58c5820f336fff9a988c4443005f74cd7e1bd6b8eaa0`, compiler `0.8.28+commit.7893614a`, optimizer 200, EVM `cancun`.

The frontend supports a light/dark theme toggle in the header. The dark theme uses warm charcoal surfaces and ivory text; the preference is stored locally in the browser and has no on-chain effect.

Production deployment: `vercel --prod` using the authenticated CLI and Production environment variables. Preview deployment: `vercel deploy` with the Preview environment; it remains Arc Testnet only.

Local configuration: copy `.env.example` to `.env` for Arc Testnet. For an Arc Mainnet build, set `VITE_NETWORK_MODE=mainnet`, `VITE_CHAIN_ID=5042`, the official mainnet RPC/explorer/USDC values, and the verified mainnet coordinator address. `.env` is ignored by Git. Never place deployer keys or private credentials in Vercel or client variables.

Mainnet deployment script: `node scripts/deploy-mainnet.mjs` reads `DEPLOYER_PRIVATE_KEY` from the local `.env`, verifies the Arc Studio source hash, checks chain `5042`, prints the unsigned transaction parameters, and broadcasts only after all guards pass. It does not print the key.

Route inventory: `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and the not-found route.

## Environment safety

Frontend build variables are public and begin with `VITE_`: network mode, chain ID, RPC, explorer, USDC address, deployed coordinator address and actual public GitHub repository URL. Never place a private key, seed phrase, Circle secret or deployer credential in client variables.

`DEPLOYER_PRIVATE_KEY` is local-only and must never be committed, logged, sent to the frontend, placed in Vercel or pasted into Arc Studio prompts/screenshots. App users sign transactions in their own wallet.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/SECURITY.md`](docs/SECURITY.md).

## Documentation and links

The app includes complete `/docs` and `/risk` routes inside the approved editorial shell. The footer Documentation link resolves to `/docs`, the Risk notice link resolves to `/risk`, the GitHub link resolves to the verified public repository configured through `VITE_GITHUB_REPOSITORY_URL`, and the Contract link opens the active network's verified coordinator address in the official explorer. Production opens the Mainnet address; Preview opens the Testnet address.

Never replace these destinations with guessed URLs. If the repository is private, moved, or disclosure becomes inappropriate, stop and obtain operator approval for an alternative instead of exposing it silently.

## Hackathon evidence

Completed:

- Arc Studio project: App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`.
- Live production app: https://relaycrew-omega.vercel.app.
- Mainnet contract: `0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`.
- Mainnet deployment transaction: `0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e`.
- Public source repository: https://github.com/onyebuchidaniel60/Relaycrew.

Still required from the operator before submission:

- Execute the authorized low-value Mainnet pipeline (2 stages, 1 USDC each) and record the create, Stage 1 approve, and Stage 2 approve transaction hashes.
- Record the video walkthrough showing the Arc Studio build and a real Mainnet transaction.
- Supply the actual builder profile URL.
- Confirm the final submission cutoff on the official form. The prior handoff recorded 2026-11-02 04:59 UTC; the Eventbrite mirror suggests an ambiguous Nov 1 Pacific window. The conservative planning cutoff was 2026-11-01 20:59 WAT; verify before submitting.
