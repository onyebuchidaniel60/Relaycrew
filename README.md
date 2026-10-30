# RelayCrew

**RelayCrew is a working-name project for the Arc Microgrants: Built with Arc Studio hackathon.** It coordinates a fixed sequence of specialist stages using one parent-funded Arc USDC escrow. Approving a submitted stage pays the current provider and activates the next preassigned specialist in the same on-chain transaction.

> Experimental hackathon software. The planned contract is not independently audited. USDC transfers are irreversible, task metadata is public, and the client is the only evaluator. Do not use sensitive tasks or more money than you can afford to lose.

## Current status

The Phase 1 React + TypeScript + Vite shell is implemented locally. Contract integration, wallet actions, deployments beyond the shell, and functional tests are not yet implemented.

- Public GitHub repository: **verified** at https://github.com/onyebuchidaniel60/Relaycrew.
- Arc Studio project: **verified** via CLI (App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`); scaffold pulled and frontend shell established.
- Vercel Preview: **deployment in progress**; the exact URL will be recorded after the first successful preview deploy.
- Testnet/Mainnet contract address: not yet deployed.
- Mainnet transaction hashes: not yet executed/verified.
- Final visual design: not approved.

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

1. Client defines 2–5 stages, with distinct provider wallets, titles, public briefs, fixed budgets and durations.
2. Client grants an exact USDC allowance and funds the total budget.
3. First stage becomes Active; later stages are Queued but budget-reserved in the same escrow.
4. Provider submits a public HTTPS/IPFS deliverable reference.
5. Client approves or rejects. Approval pays the active provider and activates the next stage in one transaction. Final approval completes the pipeline.
6. Rejection or eligible expiry refunds unpaid escrow to the client. Previous payouts cannot be reversed.

## Fixed design limits

- Arc Mainnet: chain ID `5042`; RPC `https://rpc.mainnet.arc.io`; explorer `https://explorer.arc.io`.
- Arc Testnet: chain ID `5042002`; RPC `https://rpc.testnet.arc.io`; explorer `https://explorer.testnet.arc.io`.
- USDC ERC-20 interface: `0x3600000000000000000000000000000000000000`, 6 decimals per current official Arc docs. Reverify before deployment.
- Stage count: 2–5.
- Per-stage minimum: 1 USDC. Per-pipeline maximum: 100 USDC.
- Stage work period: 15 minutes–7 days from activation. Evaluation period: 24 hours.
- Preview uses Arc Testnet only. Mainnet deployment/payment requires explicit operator authorization.
- No backend/database/runtime AI/marketplace/reputation/arbitration/fees.

## Developer setup

Available commands for the Phase 1 app (verified locally with Node.js v24.22.1 and npm 11.19.1):

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

`npm run build` runs the TypeScript check and builds the Vite app into `dist/`.

Local testnet configuration: copy `.env.example` to `.env` and keep `VITE_NETWORK_MODE=testnet`. `.env` is ignored by Git. The Vercel Preview must use the same Arc Testnet values; never place deployer keys or private credentials in Vercel or client variables.

Route inventory: `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and the not-found route.

## Environment safety

Frontend build variables are public and begin with `VITE_`: network mode, chain ID, RPC, explorer, USDC address, deployed coordinator address and actual public GitHub repository URL. Never place a private key, seed phrase, Circle secret or deployer credential in client variables.

`DEPLOYER_PRIVATE_KEY` is local-only and must never be committed, logged, sent to the frontend, placed in Vercel or pasted into Arc Studio prompts/screenshots. App users sign transactions in their own wallet.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/SECURITY.md`](docs/SECURITY.md).

## Documentation and links

The final app must include a working `/docs` route and a home-page footer Documentation link to it. A GitHub footer link must point to the actual public repository once verified. Do not guess or fabricate the repository URL. If the repository is private or disclosure becomes inappropriate, stop and obtain operator approval for an alternative instead of exposing it silently.

## Hackathon evidence

Before submission, record the real Arc Studio project URL, live app URL, mainnet contract address(es), at least one real mainnet USDC transaction hash and explorer link, public repository URL, video walkthrough, short project description, and actual builder profile URL. **Deadline warning (unresolved):** the previous handoff says 2026-11-02 04:59 UTC, while an Eventbrite listing mirrored from the organizer displays a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT despite Pacific daylight time ending that date. The direct official page returned HTTP 405 in automated verification. Use **2026-11-01 20:59 WAT** as the conservative planning cutoff and verify the actual submission form; do not rely on the later estimate.
