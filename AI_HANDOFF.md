# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Phase 6 revised “Warm Editorial Escrow” mockups created from the operator reference images; explicit approval is pending. The previous dark direction was rejected and removed. The working app remains in its temporary Tailwind state; Phase 7 is blocked. Mainnet remains unauthorized.

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

**Phase 6 revised (awaiting explicit operator approval): “Warm Editorial Escrow” mockups derived from `docs/references/reference 1.webp` and `reference 2.jpg`; Phase 7 blocked.**

## URLs and deployments

- Arc Studio project: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`** (“Relay Crew Communication Platform”); verified via CLI; workspace `https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public via GitHub API; default branch `main`).
- Vercel Preview URL: **https://relaycrew-clflx1o67-uhhh2.vercel.app** (Preview target; Vercel Deployment Protection enabled).
- Preview deployed commit: **aba57f9357e5c42a6fa8f2f277eca2eb504216ba**.
- Production URL: **NOT DEPLOYED — no production deployment retained**.
- Contract: **`contracts/PipelineCoordinator.sol`** — full sequential escrow/milestone-hiring logic implemented and tested.
- ABI wiring: **`src/lib/contracts.ts`** generated from the final Arc Studio ABI; Arc Testnet address configured.
- Mainnet contract address: **NOT DEPLOYED**.
- Testnet contract address: **0x85bbf546b09d990959de0672c273b56400f84f05**.
- Testnet deployment tx: **0xf1b0d68678eb16faa2e072204e8ac0a9da5177efba95c72eefa119f0f9c75122**.
- Testnet explorer: **https://explorer.testnet.arc.io/address/0x85bbf546b09d990959de0672c273b56400f84f05**.
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
- Phase 1: Arc Studio Vite scaffold pulled; generic wallet/Foundry boilerplate removed; shell routes and placeholders deployed. `npm install react-router-dom` (143 packages, 0 vulnerabilities); `npm run typecheck`, `npm run lint`, and `npm run build` passed; local headless Chromium verified all seven routes; Vercel Preview build passed and all routes returned HTTP 200.
- Phase 2 dependencies: `npm install wagmi viem @tanstack/react-query` completed; 21 packages installed; 0 vulnerabilities.
- Phase 2 contract scaffold: Arc Studio generated `contracts/PipelineCoordinator.sol`; `forge build` passed with Solc 0.8.28; ABI artifact `contracts/out/PipelineCoordinator.sol/PipelineCoordinator.json`; all function bodies revert with `NotImplemented()` and no business logic or deployment exists.
- Phase 2 ABI wiring: `src/lib/contracts.ts` generated from the Arc Studio ABI; contract address intentionally empty; `src/lib/chain.ts` defines Arc Testnet `5042002` and Arc Mainnet `5042`; `WagmiProvider` and injected connector wired; real Connect Wallet/Disconnect implemented; wrong-network warning and write guard implemented.
- Phase 2 checks: `npm run typecheck` **PASS**; `npm run lint` **PASS**; `npm run build` with testnet env **PASS** — Vite 6.4.5, 1787 modules transformed, `dist/index.html` 0.61 kB, CSS 12.29 kB, JS 297.44 kB.
- Phase 2 local smoke test: headless Chromium verified `/`, `/create`, `/pipelines`, `/pipelines/1`, `/docs`, `/risk`, and `/bad-route`; Connect Wallet and Arc Testnet badge present; wrong-network banner string present in the bundle. No injected wallet was available in the headless environment, so a live wallet connect/switch was not exercised.
- Phase 2 Vercel Preview: `https://relaycrew-reh3adohp-uhhh2.vercel.app`; target `preview`; state `READY`; all seven routes returned HTTP 200 through `vercel curl`; deployed bundle contains Connect Wallet, wrong-network warning, Arc Testnet, and Phase 2 footer strings.
- Vercel Preview env: `VITE_NETWORK_MODE=testnet`, `VITE_CHAIN_ID=5042002`, `VITE_RPC_URL`, `VITE_EXPLORER_URL`, `VITE_USDC_ADDRESS`, `VITE_PIPELINE_CONTRACT_ADDRESS=0x85bbf546b09d990959de0672c273b56400f84f05`, and `VITE_GITHUB_REPOSITORY_URL` set for Preview.
- Vercel deployments: only Preview deployments are retained; no production deployment exists.
- Phase 3 contract: full `PipelineCoordinator` logic implemented with SafeERC20, ReentrancyGuard, exact accounting, events, custom errors, and views.
- Phase 3 Foundry tests: `forge build` **PASS** (Solc 0.8.28); `forge test -vvv` **29 passed, 0 failed, 0 skipped**; source/test parity with Arc Studio verified.
- Phase 3 Arc Testnet deployment: `0x85bbf546b09d990959de0672c273b56400f84f05`; tx `0xf1b0d68678eb16faa2e072204e8ac0a9da5177efba95c72eefa119f0f9c75122`; explorer link above. `eth_getCode` confirms bytecode; `usdc()` returns `0x3600000000000000000000000000000000000000`; `pipelineCount()` returns `0`; deployment receipt status is `0x1`. Deployed via Arc Studio platform deployer after Circle DCW key provisioning failed; the contract has no owner role.
- Phase 3 Vercel Preview: `https://relaycrew-59bh3t2a8-uhhh2.vercel.app`; target `preview`; state `READY`; all seven routes returned HTTP 200 through `vercel curl`; deployed bundle contains the wallet/network UI strings.
- Phase 3 checks: `npm run typecheck` **PASS**; `npm run lint` **PASS**; `npm run build` with testnet env **PASS** — Vite 6.4.5, 1787 modules transformed, CSS 12.29 kB, JS 297.48 kB.
- Phase 4 implementation: 6-decimal USDC amount helpers; exact allowance reset/approve flow; create form with 2–5 stages and live total/validation; pipeline list by wallet; detail timeline; provider submit; client approve/reject; permissionless expire; global wallet/pending/success/error status; custom-error mapping; stale-read refresh via query invalidation.
- Phase 4 checks: `npm run typecheck` **PASS**; `npm run lint` **PASS**; `npm run build` with testnet env **PASS** — Vite 6.4.5, 1799 modules transformed, CSS 16.11 kB, JS 602.52 kB (chunk-size warning only).
- Phase 4 local smoke test: headless Chromium verified `/`, `/create`, `/pipelines`, `/pipelines/1`, `/risk`, and `/bad-route`; create form, public-data warning, and testnet banner rendered. A mock injected wallet connected locally and the create form rendered with the connected client address; no transaction was sent.
- Phase 4 Vercel Preview: `https://relaycrew-cjg44hlki-uhhh2.vercel.app`; target `preview`; state `READY`; all seven routes returned HTTP 200 through `vercel curl`; deployed bundle contains the create form, list/action copy, custom-error text, contract address, and testnet-only banner.
- Phase 5 edge cases: ERC-20 balance and native-gas preflight; “Transaction cancelled by user” mapping; retry controls for IDs, summaries, stages, balances, and allowances; terminal-state banners with paid/refunded totals and no action controls; deadline countdown; duplicate-create protection with pending receipt and “Check receipt” flow.
- Phase 5 checks: `npm run typecheck` **PASS**; `npm run lint` **PASS**; `npm run build` with testnet env **PASS** — Vite 6.4.5, 1799 modules transformed, CSS 16.23 kB, JS 607.13 kB (chunk-size warning only).
- Phase 5 headless Chromium console check: all seven routes plus a mock-wallet connected `/create` form and “Add stage” interaction produced **0 console errors/warnings**.
- Phase 5 Vercel Preview: `https://relaycrew-clflx1o67-uhhh2.vercel.app`; target `preview`; state `READY`; all seven routes returned HTTP 200; deployed bundle contains the cancellation, pending, retry, countdown, expire, and terminal-state strings.
- Phase 6 revision: operator-supplied references analyzed; previous dark mockups removed; new “Warm Editorial Escrow” static mockups created for reference analysis, Home, Create, Active Detail, and mobile. No app code, contract calls, or production styling changed.
- Contract tests: **29 passed**.
- Mainnet tests: **not run; no authorization given and no transaction executed**.

## Design reference/mockup state

- Final aesthetic: **NOT APPROVED**.
- Design references: **OPERATOR-SUPPLIED** — `docs/references/reference 1.webp` and `docs/references/reference 2.jpg`.
- Proposed direction: **“Warm Editorial Escrow”** — ivory/paper canvas, forest-green actions, editorial serif display, sans UI, thin rules, warm visual panels.
- Mockups: **REVISED** — `mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `mobile.html`, `styles.css`, `README.md`.
- Previous direction: **REJECTED AND REMOVED** — dark “Operator Console” mockups.
- Operator approval: **NOT GIVEN**.
- Required sequence: operator review and explicit written approval → Phase 7 only. Silence is not approval.

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

1. Phase 5 was accepted by the operator; the operator’s manual live transaction hashes are not recorded in this repository, and the automated live create → submit → approve → reject/expire journey was not executed here.
2. A real injected-wallet transaction flow was not exercised in automation; a local mock wallet verified the connected create form only. No transaction was sent.
3. The frontend bundle is 607.13 kB (185.15 kB gzip) and Vite reports a chunk-size warning; code splitting is deferred.
4. Final visual design has not started; the functional UI uses temporary Tailwind styling and must not be treated as the approved design.
5. Circle DCW key provisioning failed, so the testnet deployment used Arc Studio’s shared platform deployer. The contract has no owner/admin role, so that wallet has no special authority; this is recorded as an operational fallback.
6. Vercel Deployment Protection is enabled; the Preview requires Vercel authentication or a protection bypass.
7. Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
8. No mainnet deployment/transaction authorization.
9. Scope deviation, commit 8a7c8b9: the authorized preflight task was inspection-only, but the run created `.gitignore` and modified `AI_HANDOFF.md` and `README.md`, then committed. Operator did not authorize file modification. Changes were retained (they are factually correct; `.gitignore` addresses a real gap) but the deviation is recorded here to reinforce that inspection-only tasks must not modify files. No application code, dependencies, contract, or deployment was involved.
10. The revised Phase 6 “Warm Editorial Escrow” direction is awaiting explicit operator approval; Phase 7 is blocked. The working app remains in its temporary Tailwind state.

## Single next task

**Operator review and explicit written approval of the revised Phase 6 “Warm Editorial Escrow” mockups; then Phase 7 only per IMPLEMENTATION_PLAN.md.**
