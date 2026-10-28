# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-28  
**Status:** Blueprint completed; implementation has not started. This file is the initial truthful state, not evidence of a deployed product.

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

**Phase 0 — planning/documentation complete; Phase 1 not started.**

## URLs and deployments

- Arc Studio project URL: **NOT YET CREATED OR VERIFIED**.
- GitHub repository URL: **NOT YET CREATED OR VERIFIED**.
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
- In-repository README and `docs/` materials must be copied/maintained when repository is created.
- Documentation route must be `/docs` and home-footer link must work.
- Public GitHub URL is unknown until repository exists. Do not invent the URL. Footer GitHub link remains pending until the real public repository is confirmed.
- No dead links, inert controls, unexplained placeholders, or unverified claims may remain in the final UI.

## Safety and deployment constraints

- No mainnet deployment or real-USDC transaction without explicit operator authorization.
- Keep Preview on testnet only; never include deployment key in Vercel or client bundle.
- Use exact allowance, low-value mainnet demo, verified contract/token addresses, and controlled/consenting provider wallets.
- Contract is unaudited experimental software and must include a risk notice.

## Known issues/blockers

1. Arc Studio project/repo/preview not yet created.
2. Need check compatibility of Arc Studio's generated frontend with the selected React/TypeScript/Vite architecture before modifying generated code; if materially incompatible, stop and ask operator.
3. Contract implementation, tests, and exported-source parity remain unverified.
4. No mainnet deployment/transaction authorization.
5. Need urgently resolve hackathon deadline/timezone discrepancy from the actual submission form and confirm required form fields.

## Single next task

**Pre-Phase-1 task — repository/Arc Studio inspection only; no modifications:** read the source-of-truth documents, inspect the working directory/repository and any existing Arc Studio project, and report the framework, dependencies, package scripts, entry points, build/test/deploy commands, Git state, generated-file constraints, and compatibility with the fixed React + TypeScript + Vite + wagmi/viem plan. Do not create/edit/delete files, install or upgrade dependencies, change configuration, or deploy during this inspection task. If no application repository or Arc Studio-generated project exists yet, report that accurately and distinguish it from an architecture incompatibility; inventory the available blueprint files and state what access/workspace is missing. If a generated project exists but is materially incompatible with the fixed plan, describe the exact conflict and STOP for operator direction; do not migrate frameworks. If the existing environment is compatible—or the only app code is not yet created—report the inspection findings and STOP.

**Next implementation task after the inspection report is accepted:** Phase 1 only—establish the navigable skeletal shell for `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and not-found; use temporary styling and clearly marked nonfunctional placeholders; force Preview to Arc Testnet; deploy to a stable Vercel Preview; report the exact URL, deployed commit, visible/incomplete areas, tests, and blockers; commit and STOP. Do not start core contract implementation until the skeletal preview is accepted.
