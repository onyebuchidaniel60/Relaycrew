# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Blueprint completed; preflight inspection completed 2026-10-30; implementation has not started. This file is the current truthful state, not evidence of a deployed product.

## Project

- **Working name:** RelayCrew.
- **Concept:** Milestone Team Pipeline — a client funds one parent USDC escrow for a fixed sequence of specialist wallet addresses. Approval pays the current provider and atomically activates the next stage. Final approval pays the final provider and completes; rejection/expiry returns unpaid funds.
- **Hackathon:** Arc Microgrants: Built with Arc Studio.
- **Deadline discrepancy — verify immediately:** the prior handoff recorded 2026-11-02 04:59 UTC. An Eventbrite listing mirrored from the organizer shows a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT despite US Pacific daylight time ending at 2:00 AM that date; the displayed local-time conversion may be ambiguous by one hour. The official DoraHacks page returned HTTP 405 in automated verification. Plan for **2026-11-01 20:59 WAT (Africa/Lagos)** as the conservative cutoff until the actual submission form confirms the timestamp. Re-check judging weights and required artifacts manually.

## Source-of-truth files

Read before any implementation:
1. `PROJECT_SPEC.md`
2. `ARCHITECTURE.md`
3. `IMPLEMENTATION_PLAN.md`
4. `AGENTS.md`
5. This file
6. `docs/DECISIONS.md`, `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md` and any relevant docs before the corresponding phase.

Workflow reference supplied by operator: `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`.

## Fixed decisions

- Orchestrator: on-chain `PipelineCoordinator`, no off-chain event listener.
- Topology: one parent escrow and per-stage records; no nested child contracts.
- Evaluator: client for every stage.
- Stage list/provider addresses/budgets/order/briefs/durations immutable at funding.
- All budgets funded upfront; each approval pays current stage and activates next in the same transaction.
- Rejection/expiry refunds all unspent funds to client; prior payouts are final.
- 2–5 stages, minimum 1 USDC per stage, total maximum 100 USDC; 6-decimal USDC ERC-20 units; stage work deadline 15 minutes–7 days; 24-hour evaluation window.
- No marketplace, runtime AI, backend, database, indexer, queue, admin panel, fee, arbitration, reputation, or dynamic routing.
- Arc Studio is required for contracts, tests and app. Its documented deploy path targets Arc Testnet; mainnet deployment requires a manual export/deploy step after approval.
- Preview must use Arc Testnet only; Production must use Arc Mainnet only after operator authorization.
- Final UI design is not selected/approved. No final visual implementation before core E2E gate, reference-informed mockups, and explicit operator approval.

## Current phase

**Phase 0 complete; preflight inspection completed 2026-10-30; verdict NO APP PRESENT — INSPECTION ONLY; awaiting operator decisions before Phase 1.**

## URLs and deployments

- Arc Studio project URL: **NOT YET CREATED OR VERIFIED**.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public via GitHub API; default branch `main`; HEAD `8c12d5c7b230143e3f13bae2902cbea843fdcc75`; 16 Markdown files; no app code).
- Vercel Preview URL: **NOT YET DEPLOYED**.
- Preview deployed commit: **NOT YET DEPLOYED**.
- Production URL: **NOT DEPLOYED**.
- Mainnet contract address: **NOT DEPLOYED**.
- Testnet contract address: **NOT DEPLOYED**.
- Mainnet transaction hashes: **NONE — no transactions executed**.
- Video walkthrough: **NOT RECORDED**.
- Builder profile URL for submission: use actual operator-supplied or verified URL; do not invent.

## Confirmed research notes (as checked 2026-10-28)

- Arc Mainnet chain ID is 5042; official RPC `https://rpc.mainnet.arc.io`; explorer `https://explorer.arc.io`.
- Arc Testnet chain ID is 5042002; official RPC `https://rpc.testnet.arc.io`; explorer `https://explorer.testnet.arc.io`.
- Arc docs list the USDC ERC-20 interface at `0x3600000000000000000000000000000000000000` on both networks with 6 decimals. Verify again before deployment.
- Arc Studio docs state it deploys to Arc Testnet. Exported source must be deployed to mainnet manually after operator authorization.
- Arc official contract-address page lists ERC-8183 reference implementation on Arc Testnet; it does not list a mainnet implementation. Do not rely on or claim a mainnet ERC-8183 address.
- Official hackathon page fetch returned 405 during latest verification. Recheck deadline, judging weights and submission artifact list manually before submitting.

## Tests/evidence

- Blueprint/documentation consistency reviewed at planning stage.
- Preflight inspection 2026-10-30: Git working tree clean; 1 commit (`8c12d5c7b230143e3f13bae2902cbea843fdcc75`); public GitHub repository verified at `https://github.com/onyebuchidaniel60/Relaycrew` (default branch `main`; 16 Markdown files).
- Preflight environment: no package manifest, no contract source/ABI/tests, no build output, no Arc Studio project, no Vercel project.
- Application tests: **not run; no application code exists**.
- Contract tests: **not run; no contract code exists**.
- Preview smoke tests: **not run; no preview exists**.
- Mainnet tests: **not run; no authorization given and no transaction executed**.

## Design reference/mockup state

- Final aesthetic: **NOT SELECTED**.
- Design references: **NONE SUPPLIED/APPROVED YET**.
- Mockups: **NOT CREATED**.
- Operator approval: **NOT GIVEN**.
- Required sequence: finish core E2E on deployed testnet Preview → present references/candidates → create mockups → obtain explicit approval → implement final visual system.

## Documentation/footer state

- Root source-of-truth docs created in the blueprint package.
- In-repository README and `docs/` materials are present; maintain them.
- Documentation route must be `/docs` and home-footer link must work.
- Public GitHub repository verified at https://github.com/onyebuchidaniel60/Relaycrew. Footer GitHub link remains pending until the final UI exists and the link is verified on the deployed Preview.
- No dead links, inert controls, unexplained placeholders, or unverified claims may remain in the final UI.

## Safety and deployment constraints

- No mainnet deployment or real-USDC transaction without explicit operator authorization.
- Keep Preview on testnet only; never include deployment key in Vercel or client bundle.
- Use exact allowance, low-value mainnet demo, verified contract/token addresses, and controlled/consenting provider wallets.
- Contract is unaudited experimental software and must include a risk notice.

## Known issues/blockers

1. (a) Arc Studio project does not exist or is not linked; Phase 1 tasks 1–2 cannot execute until the operator provides an Arc Studio project URL/export or authorizes a documented deviation.
2. (b) Vercel project/access not yet provided.
3. (c) Documentation conflict: `AGENTS.md` §3 states "If a frontend exists (it does)", which is factually incorrect — no frontend exists. Per `AGENTS.md` §1, this conflict is reported, not silently resolved. Operator decision required: authorize a one-line correction to AGENTS.md, or record that the operative Phase 1 requirement stands and the parenthetical is treated as stale.
4. (d) Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
5. Compatibility of Arc Studio's generated frontend with the selected React/TypeScript/Vite architecture remains unverified until a Studio project/export exists; if materially incompatible, stop and ask operator.
6. Contract implementation, tests, and exported-source parity remain unverified.
7. No mainnet deployment/transaction authorization.
8. Scope deviation, commit 8a7c8b9: the authorized preflight task was inspection-only, but the run created `.gitignore` and modified `AI_HANDOFF.md` and `README.md`, then committed. Operator did not authorize file modification. Changes were retained (they are factually correct; `.gitignore` addresses a real gap) but the deviation is recorded here to reinforce that inspection-only tasks must not modify files. No application code, dependencies, contract, or deployment was involved.

## Single next task

**Phase 1 only, after operator answers the two remaining preconditions: (ii) Arc Studio path — export-and-inspect of an actual Arc Studio project vs operator-authorized local Vite scaffold — and (iii) Vercel project access confirmation. Do not start Phase 1 until both answers are recorded.**
