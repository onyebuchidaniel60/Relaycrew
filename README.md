# RelayCrew

**RelayCrew is an Agent Escrow Protocol for Project Execution on Pipelines.** It coordinates a fixed sequence of specialist stages using one parent-funded Arc USDC escrow. Approving a submitted stage pays the current provider and activates the next preassigned specialist in the same on-chain transaction. Built for the Arc Microgrants: Built with Arc Studio hackathon.

> Experimental hackathon software. The contract is not independently audited. USDC transfers are irreversible, task metadata is public, and the client is the only evaluator. Do not use sensitive tasks or more money than you can afford to lose.

## Current status

Phase 8.5 is complete: the testnet contract now supports up to 10 stages, the create form uses Days and Hours selectors with an optional attachment URL, and the approved “Warm Editorial Escrow” visual system has a Dark Warm Editorial theme. In-app documentation, risk content, metadata, footer destinations, and the repository documentation pass are in place. Phase 9 (Mainnet release) has not started and requires explicit operator authorization.

- Public GitHub repository: **verified** at https://github.com/onyebuchidaniel60/Relaycrew.
- Arc Studio project: **verified** via CLI (App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`); contract source and tests in `contracts/`.
- Vercel Preview: **https://relaycrew-egn5b8knn-uhhh2.vercel.app** (Arc Testnet only; Vercel Deployment Protection enabled). Deployed source commit: `1aa070906db8ad1617c929c8718d9ae19d028a36`; deployment ID `dpl_9HDcJ2bxCkdFX6XdPDYXPwik2e52`.
- Vercel Production: not deployed.
- Contract: `contracts/PipelineCoordinator.sol`; ABI/address in `src/lib/contracts.ts`.
- Live Testnet contract: **`0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`** on Arc Testnet (chain ID `5042002`), deployed with `MAX_STAGES = 10`. [Explorer](https://explorer.testnet.arc.io/address/0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070).
- Testnet deployment tx: `0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`.
- Previous 5-stage testnet contract (superseded): `0x85bbf546b09d990959de0672c273b56400f84f05`.
- Mainnet contract address: not deployed; no mainnet authorization.
- Mainnet transaction hashes: not yet executed/verified.
- Foundry tests: 31 passed, 0 failed in Arc Studio, including 10-stage creation and 11-stage rejection.
- Headless checks: 0 console errors across 18 route/viewport checks, loading/empty/error/terminal and wrong-network states, and connected mock-wallet flows; no horizontal overflow at 390/768/1440.
- External links verified: public GitHub repository and verified Arc Testnet Explorer contract URL both return HTTP 200.
- Live manual E2E: accepted by the operator; transaction hashes are not recorded in this repository.
- In-app docs: `/docs`; risk notice: `/risk`.
- Design mockups: `mockups/index.html`; operator references and the recorded approval are in `docs/DESIGN_DECISIONS.md`.
- Final visual design: approved 2026-10-30; “Warm Editorial Escrow” applied in Phase 7. Phase 8 documentation/link-completeness work is complete.

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
- Preview uses Arc Testnet only. Mainnet deployment/payment requires explicit operator authorization.
- No backend/database/runtime AI/marketplace/reputation/arbitration/fees.

## Developer setup

Available commands for the app (verified locally with Node.js v24.22.1 and npm 11.19.1):

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

`npm run build` runs the TypeScript check and builds the Vite app into `dist/`.

Contract: `contracts/PipelineCoordinator.sol` is implemented and tested in Arc Studio (Solc 0.8.28; 31 Foundry tests; `MAX_STAGES = 10`). The ABI and Arc Testnet address are in `src/lib/contracts.ts`. Arc Studio remains the contract build/test source; no local Foundry workflow is configured.

The frontend supports a light/dark theme toggle in the header. The dark theme uses warm charcoal surfaces and ivory text; the preference is stored locally in the browser and has no on-chain effect.

Preview deployment: `vercel deploy --environment preview` using the authenticated CLI. Do not run `vercel deploy --prod` for this phase.

Local testnet configuration: copy `.env.example` to `.env` and keep `VITE_NETWORK_MODE=testnet`. `.env` is ignored by Git. The Vercel Preview must use the same Arc Testnet values; never place deployer keys or private credentials in Vercel or client variables.

Route inventory: `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and the not-found route.

## Environment safety

Frontend build variables are public and begin with `VITE_`: network mode, chain ID, RPC, explorer, USDC address, deployed coordinator address and actual public GitHub repository URL. Never place a private key, seed phrase, Circle secret or deployer credential in client variables.

`DEPLOYER_PRIVATE_KEY` is local-only and must never be committed, logged, sent to the frontend, placed in Vercel or pasted into Arc Studio prompts/screenshots. App users sign transactions in their own wallet.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/SECURITY.md`](docs/SECURITY.md).

## Documentation and links

The app includes complete `/docs` and `/risk` routes inside the approved editorial shell. The footer Documentation link resolves to `/docs`, the Risk notice link resolves to `/risk`, the GitHub link resolves to the verified public repository configured through `VITE_GITHUB_REPOSITORY_URL`, and the Contract link opens the verified Arc Testnet address in the official explorer. The Phase 8 link/state audit checked the header, footer, documentation anchors, and external destinations.

Never replace these destinations with guessed URLs. If the repository is private, moved, or disclosure becomes inappropriate, stop and obtain operator approval for an alternative instead of exposing it silently.

## Hackathon evidence

Before submission, record the real Arc Studio project URL, live app URL, mainnet contract address(es), at least one real mainnet USDC transaction hash and explorer link, public repository URL, video walkthrough, short project description, and actual builder profile URL. **Deadline warning (unresolved):** the previous handoff says 2026-11-02 04:59 UTC, while an Eventbrite listing mirrored from the organizer displays a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT despite Pacific daylight time ending that date. The direct official page returned HTTP 405 in automated verification. Use **2026-11-01 20:59 WAT** as the conservative planning cutoff and verify the actual submission form; do not rely on the later estimate.
