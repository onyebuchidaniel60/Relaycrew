# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Phase 8.5 complete and deployed to the Arc Testnet Preview. The operator-authorized changes are implemented: the testnet contract now allows up to 10 stages, the create form uses Days/Hours selectors and an optional attachment URL, the app has a Dark Warm Editorial theme, and the official tagline is “Escrow for Agent Workflows.” Phase 9 (Mainnet release) has not started and requires explicit operator authorization. Mainnet remains unauthorized.

## Project

- **Working name:** RelayCrew.
- **Tagline:** Escrow for Agent Workflows.
- **Concept:** a client funds one parent USDC escrow for a fixed linear sequence of specialist wallet addresses. Approval pays the current provider and atomically activates the next stage. Final approval completes the pipeline; rejection or eligible expiry returns unpaid funds.
- **Hackathon:** Arc Microgrants: Built with Arc Studio.
- **Deadline discrepancy — verify immediately:** the prior handoff recorded 2026-11-02 04:59 UTC. An Eventbrite listing mirrored from the organizer shows a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT despite US Pacific daylight time ending at 2:00 AM that date; the displayed local-time conversion may be ambiguous by one hour. The official DoraHacks page returned HTTP 405 in automated verification. Plan for **2026-11-01 20:59 WAT (Africa/Lagos)** as the conservative cutoff until the actual submission form confirms the timestamp. Re-check judging weights and required artifacts manually.

## Source-of-truth files

Read before any implementation:
1. `PROJECT_SPEC.md`
2. `ARCHITECTURE.md`
3. `IMPLEMENTATION_PLAN.md`
4. `AGENTS.md`
5. This file
6. `docs/DECISIONS.md`, `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md`, `docs/DESIGN_DECISIONS.md` and any relevant docs before the corresponding phase.

Workflow reference supplied by operator: `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`.

## Fixed decisions and Phase 8.5 authorization

- Orchestrator: on-chain `PipelineCoordinator`, no off-chain event listener.
- Topology: one parent escrow and per-stage records; no nested child contracts.
- Evaluator: client for every stage.
- Stage list/provider addresses/budgets/order/briefs/durations immutable at funding.
- All budgets funded upfront; each approval pays current stage and activates next in the same transaction.
- Rejection/expiry refunds all unspent funds to client; prior payouts are final.
- 2–10 stages, minimum 1 USDC per stage, total maximum 100 USDC; 6-decimal USDC ERC-20 units; stage work deadline 15 minutes–7 days; 24-hour evaluation window.
- Operator explicitly authorized the Phase 8.5 deviations on 2026-10-30: `MAX_STAGES` raised from 5 to 10, Light/Dark theme toggle, Days/Hours duration selector, optional attachment URL appended to the public brief, and the pitch change. This is recorded in `docs/DECISIONS.md` (D-23) and `ARCHITECTURE.md`.
- No marketplace, runtime AI, backend, database, indexer, queue, admin panel, fee, arbitration, reputation, or dynamic routing.
- Arc Studio is required for contracts, tests and app. Its documented deploy path targets Arc Testnet; mainnet deployment requires a manual export/deploy step after approval.
- Preview must use Arc Testnet only; Production must use Arc Mainnet only after operator authorization.
- Final visual direction: **approved 2026-10-30** — “Warm Editorial Escrow”; Phase 7 implementation complete, Phase 8 content/completeness complete, Phase 8.5 dark theme extension complete.

## Current phase

**Phase 8.5 complete — architecture-limit, form-UX, tagline, and dark-mode updates.** The contract is redeployed to Arc Testnet, the frontend and docs are updated, and the new Preview is verified. Phase 9 has not started.

## URLs and deployments

- Arc Studio contract app: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`**; workspace `https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`. CLI reports this workspace as “React TypeScript Vite Tailwind Starter”; it contains the current `contracts/PipelineCoordinator.sol` and the new deployment record. A separate app `c389a695-4df7-4d8f-9e25-6003a8d54f06` (“Relay Crew Communication Platform”) contains an older `RelayCrew.sol` and is not the current contract.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public; default branch `main`).
- Vercel Preview URL: **https://relaycrew-1gp6xbcd6-uhhh2.vercel.app** (Preview target; Vercel Deployment Protection enabled).
- Preview deployed commit: **`4bb066302f17ca6b1c025bafd80beffa37eed57b`** — deployment created from the tagline working tree; deployed CSS/JS asset hashes match the local production build of the commit. Vercel CLI did not attach Git metadata to this deployment.
- Repository Phase 8.5 implementation commit: **`cdadaab0348c83a063d24e06305a1a0fca46e300`** (`feat: implement phase 8.5 architecture updates and dark mode`).
- Tagline update commit: **`4bb066302f17ca6b1c025bafd80beffa37eed57b`** (`chore: update product tagline`).
- Vercel deployment ID: **`dpl_3XDUsqQn1A1SzEcFajVGxoZTsudg`**.
- Production URL: **NOT DEPLOYED — no production deployment retained**.
- Contract: **`contracts/PipelineCoordinator.sol`** — full sequential escrow/milestone-hiring logic; `MAX_STAGES = 10`.
- ABI wiring: **`src/lib/contracts.ts`** uses the Arc Testnet address below and the tested ABI.
- Testnet contract address: **`0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`**.
- Testnet deployment tx: **`0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`**.
- Testnet explorer: **https://explorer.testnet.arc.io/address/0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070**.
- Previous 5-stage testnet contract (superseded): `0x85bbf546b09d990959de0672c273b56400f84f05`; tx `0xf1b0d68678eb16faa2e072204e8ac0a9da5177efba95c72eefa119f0f9c75122`.
- Mainnet contract address: **NOT DEPLOYED**.
- Mainnet transaction hashes: **NONE — no transactions executed**.
- Video walkthrough: **NOT RECORDED**.
- Builder profile URL for submission: use actual operator-supplied or verified URL; do not invent.

## Phase 8.5 completed work

- **Contract:** `MAX_STAGES` changed from 5 to 10. The maximum total budget remains 100 USDC, per-stage minimum remains 1 USDC, and no other contract logic changed.
- **Contract tests:** added `testMaxStagesIsTen`, `testCreateTenStages`, extended the stage-count success test to 10 stages, and changed the invalid-count case to 11 stages. Arc Studio `forge test`: **31 passed, 0 failed, 0 skipped**.
- **Deployment:** updated `PipelineCoordinator` deployed to Arc Testnet with the official USDC ERC-20 interface (`0x3600000000000000000000000000000000000000`). On-chain reads confirm `MAX_STAGES() = 10` and `usdc()` returns the official interface.
- **Dark mode:** Tailwind `darkMode: 'class'`; CSS-variable token layer for warm charcoal/ivory surfaces; header Light/Dark toggle with locally stored preference and no FOUC script; `dark:` variants in the shell, Home, Create, logo, transaction toast, and error states. Light theme remains the default and the approved “Warm Editorial Escrow” design is preserved.
- **Duration UX:** raw-seconds input replaced with Days (0–7) and Hours (0–23) selectors. The form displays the converted seconds and blocks durations outside 15 minutes–7 days. Because the selectors are hour-granular, the minimum selectable duration is 1 hour.
- **Attachment URL:** optional per-stage `https://` or `ipfs://` input. When filled, the stored brief becomes `brief\n\nAttachment: <url>`, preserving the contract's 1–240 byte limit. The form validates the scheme and combined byte count. The app does not fetch or embed the URL.
- **Copy/tagline:** Home, Header, Footer, `/docs`, `/risk`, page metadata, README and architecture docs now use “Escrow for Agent Workflows.”
- **Documentation:** updated AGENTS, ARCHITECTURE, PROJECT_SPEC, IMPLEMENTATION_PLAN, MASTER_BLUEPRINT, README, CONTRACT_INTERFACE, DECISIONS, DEPLOYMENT, DESIGN_DECISIONS, REQUIREMENT_MATRIX, SECURITY and USER_GUIDE for the new limit and UX. Mainnet remains explicitly unauthorized.

## Tests/evidence

- `npm run typecheck` — **PASS**.
- `npm run lint` — **PASS** (oxlint, no warnings reported).
- `npm run build` — **PASS** — Vite 6.4.5, 1803 modules; CSS `39.50 kB` (8.78 kB gzip); JS `655.63 kB` (197.16 kB gzip); chunk-size warning only.
- Arc Studio contract tests — **31 passed, 0 failed, 0 skipped**; deployment performed after the test run.
- On-chain verification via Arc Testnet RPC — `MAX_STAGES()` returned `10`; `usdc()` returned `0x3600000000000000000000000000000000000000`.
- Local headless Chromium checks — verified the new title and tagline in the Header, Home hero, Footer, `/docs`, and `/risk`; rechecked light/dark toggle and persistence, 10-stage add limit, Days/Hours conversion, attachment byte counter, invalid `ftp://` attachment validation, and 390px layout. **0 console errors; 0 horizontal overflow.**
- Deployed Preview verification — all main routes (`/`, `/create`, `/pipelines`, `/pipelines/42`, `/docs`, `/risk`), `/favicon.svg`, and `/images/og-relaycrew.png` returned HTTP 200 through `vercel curl`.
- Deployed assets match local production build — `index-ejCG_4Ie.js` and `index-DY5BfSuP.css`. Deployed HTML contains the new title, metadata, tagline, theme-color variants and theme bootstrap script; deployed JS contains the new contract address, tagline, dark-mode key, attachment field, 2–10 limit and MAX_STAGES references.
- Prior functional evidence retained: Phase 4/5 allowance, create/list/detail/submit/approve/reject/expire flows and edge states were implemented and previously accepted by the operator. No live create/submit/approve transaction was executed against the new 10-stage contract in this phase.

## Design approval and implementation record

- Final aesthetic: **APPROVED** — “Warm Editorial Escrow,” 2026-10-30; Dark Warm Editorial extension **AUTHORIZED** 2026-10-30.
- Design references: **OPERATOR-SUPPLIED** — `docs/references/reference 1.webp` and `docs/references/reference 2.jpg`.
- Approved mockup set: `mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `mobile.html`, `styles.css`.
- Phase 7 implementation: tokens, shell, Home, Create, Pipelines, Detail, terminal ledgers, confirmation dialog, favicon and editorial SVGs.
- Phase 8 additions: complete `/docs` and `/risk`, metadata/Open Graph, verified footer destinations, README/docs accuracy pass.
- Phase 8.5 additions: dark theme token layer and toggle, Days/Hours duration UI, optional attachment URL, 2–10 limit copy, and pitch update. The light theme and approved layout remain unchanged.
- Imagery: original warm editorial SVGs at `public/images/relay-hero.svg` and `public/images/relay-panel.svg`; favicon at `public/favicon.svg`; OG card `public/images/og-relaycrew.png`. No licensed photography was copied.
- Recorded deviations: SVG imagery instead of photography; Google Fonts delivery for Fraunces/Manrope/IBM Plex Mono; exact trimmed amount display retained; accessible in-app confirmation dialog; mobile nav remains visible as a compact second header row; duration selectors are hour-granular; dark theme is a CSS-variable adaptation rather than a separate design set.
- Behavior freeze in Phase 8.5: no contract call, ABI field, address, validation rule, role check, allowance rule, state transition, or security control changed beyond `MAX_STAGES`. The new attachment field is stored inside the existing brief, not a new contract argument.
- Full record: `docs/DESIGN_DECISIONS.md` and `docs/DECISIONS.md`.

## Documentation/footer state

- `/docs` and `/risk` are complete, real routes with no placeholder claims.
- Footer Documentation resolves to `/docs`; Risk notice resolves to `/risk`.
- GitHub footer destination is the verified public repository configured in `VITE_GITHUB_REPOSITORY_URL` and `.env.example`.
- Contract footer destination uses the new verified testnet address in the official Arc Testnet Explorer.
- External destinations were checked with HTTP 200; internal routes and documentation anchors were checked in headless Chromium.
- Root `README.md` includes the live Testnet contract address, current Preview URL/deployed commit, project summary, limits, setup commands, and safety notes.

## Safety and deployment constraints

- No mainnet deployment or real-USDC transaction without explicit operator authorization.
- Preview is Arc Testnet only; no deployer key or signing key is in the client bundle.
- No secrets were added to the repository or deployed bundle in Phase 8.5.
- Contract remains unaudited experimental software with the risk notice visible.
- Vercel Deployment Protection remains enabled; use `vercel curl` or an authorized browser session to inspect the Preview.
- Phase 9 must not begin without explicit operator authorization for mainnet deployment and a specific low-value transaction.

## Known issues/blockers

1. The new 10-stage contract has contract-test coverage and on-chain constant verification, but no live create → submit → approve → reject/expire journey has been executed against it in this phase. The operator should smoke-test it on Testnet before any mainnet discussion.
2. The duration selectors are hour-granular, so the minimum selectable duration is 1 hour even though the contract accepts 15 minutes. This is a deliberate UI limitation of the Days/Hours request, recorded as a deviation.
3. The attachment URL is appended to the brief and must fit the combined 240-byte contract limit; a long brief plus a long URL is rejected by the form.
4. A real injected-wallet transaction flow was not exercised in Phase 8.5 automation; a mock/headless browser verified UI states only. No transaction was sent by the browser.
5. The frontend bundle is 655.63 kB (197.16 kB gzip) and Vite reports a chunk-size warning; code splitting is deferred.
6. Circle DCW key provisioning previously failed, so testnet deployments used Arc Studio’s shared platform deployer. The contract has no owner/admin role, so that wallet has no special authority; recorded as an operational fallback.
7. Vercel Deployment Protection is enabled; the Preview requires Vercel authentication or a protection bypass.
8. Vercel CLI did not attach Git metadata to the deployment. The deployed source commit is identified by the tagline commit `4bb0663…` plus matching local/deployed CSS and JS asset hashes. Re-verify if the deployment is replaced.
9. Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
10. No mainnet deployment/transaction authorization.
11. The previous 5-stage contract remains deployed and immutable at `0x85bbf…f05`, but the app and docs point to the new 10-stage contract. Do not send new pipeline activity to the old address.

## Single next task

**Operator review of the Phase 8.5 Testnet Preview, then an explicit Phase 9 authorization decision.** Smoke-test the new contract with a small Testnet pipeline (including a 10-stage creation if desired), verify the new address and transaction links, and confirm the dark-mode/duration/attachment UX. Do not deploy to Mainnet or execute real-USDC transactions without separate, specific operator authorization.
