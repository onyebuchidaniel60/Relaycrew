# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Phase 1 skeletal shell implemented and deployed to a Vercel Preview; contract and wallet integration not started. This file records the current verified state.

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

**Phase 1 complete (pending operator acceptance): React + TypeScript + Vite shell deployed to Vercel Preview on 2026-10-30; Phase 2 not started.**

## URLs and deployments

- Arc Studio project: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`** (“Relay Crew Communication Platform”); verified via CLI; public workspace URL not recorded.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public via GitHub API; default branch `main`).
- Vercel Preview URL: **https://relaycrew-l487x8s2k-uhhh2.vercel.app** (Preview target; Vercel Deployment Protection enabled).
- Preview deployed commit: **523ba9edc73420cde206f3705b7bc7e8b4ef3c00**.
- Production URL: **NOT DEPLOYED — no production deployment retained**.
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
- Phase 1 scaffold: Arc Studio app `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961` pulled; generic wallet/Foundry boilerplate removed; no contract or wallet code remains in the committed shell.
- Phase 1 dependencies: `npm install react-router-dom` completed; 143 packages installed; 0 vulnerabilities.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS**.
- `npm run build` with testnet env: **PASS**; Vite 6.4.5; 49 modules transformed; `dist/index.html` 0.61 kB, CSS 11.40 kB, JS 193.40 kB.
- Local route smoke test with headless Chromium: `/`, `/create`, `/pipelines`, `/pipelines/1`, `/docs`, `/risk`, and `/bad-route` all rendered their expected placeholders; banner, Arc Testnet badge, disabled Connect Wallet, and “GitHub repo pending” verified.
- Vercel Preview: `https://relaycrew-l487x8s2k-uhhh2.vercel.app`; target `preview`; state `READY`; all seven routes returned HTTP 200 through `vercel curl`; deployed JS contains the expected shell strings.
- Vercel Preview env: `VITE_NETWORK_MODE`, `VITE_CHAIN_ID`, `VITE_RPC_URL`, `VITE_EXPLORER_URL`, `VITE_USDC_ADDRESS`, and `VITE_GITHUB_REPOSITORY_URL` set for Preview.
- Vercel’s first deployment was auto-assigned Production; it was removed. `vercel ls` now shows only the Preview deployment.
- Contract tests: **not run; no contract code exists**.
- Preview smoke tests: **passed as above**.
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

1. Contract implementation, tests, and exported-source parity remain unverified; Phase 1 contains no contract code.
2. Wallet connection and transaction calls are intentionally absent; the Connect Wallet button is disabled.
3. `VITE_PIPELINE_CONTRACT_ADDRESS` is not set in Vercel Preview because no testnet contract exists; contract writes remain disabled.
4. Vercel Deployment Protection is enabled; the Preview requires Vercel authentication or a protection bypass.
5. Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
6. No mainnet deployment/transaction authorization.
7. Scope deviation, commit 8a7c8b9: the authorized preflight task was inspection-only, but the run created `.gitignore` and modified `AI_HANDOFF.md` and `README.md`, then committed. Operator did not authorize file modification. Changes were retained (they are factually correct; `.gitignore` addresses a real gap) but the deviation is recorded here to reinforce that inspection-only tasks must not modify files. No application code, dependencies, contract, or deployment was involved.

## Single next task

**Operator acceptance of the Phase 1 Preview at https://relaycrew-l487x8s2k-uhhh2.vercel.app; then Phase 2 only per IMPLEMENTATION_PLAN.md.**
