# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-11-02

**Status:** Phase 9 mainnet release remains live, and **Phase 7 UI polish is complete and deployed to Production**. On 2026-11-02 the operator explicitly approved the **“Warm Editorial Escrow, review 02”** mockups and authorized a visual-only implementation. The production frontend now uses the review-02 design system: Newsreader display, Instrument Sans UI, IBM Plex Mono ledger type, the ivory/forest/sage/clay palette, 2–3px radii, the editorial home dossier, four-step create rail and escrow statement, vertical stage relay with separated action panel, and terminal settlement ledger. No contract, state, accounting, permission, or security behavior changed. The operator's browser-wallet E2E pipeline has still **not** been executed, so no mainnet E2E transaction hashes exist. Do not fabricate them.

## Project

- **Working name:** RelayCrew.
- **Tagline:** Escrow for Agent Workflows.
- **Concept:** a client funds one parent USDC escrow for a fixed linear sequence of specialist wallet addresses. Approval pays the current provider and atomically activates the next stage. Final approval completes the pipeline; rejection or eligible expiry returns unpaid funds.
- **Hackathon:** Arc Microgrants: Built with Arc Studio.
- **Deadline discrepancy — verify immediately:** the prior handoff recorded 2026-11-02 04:59 UTC. An Eventbrite listing mirrored from the organizer shows a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT despite US Pacific daylight time ending at 2:00 AM that date; the displayed local-time conversion may be ambiguous by one hour. The official DoraHacks page returned HTTP 405 in automated verification. The conservative planning cutoff was **2026-11-01 20:59 WAT (Africa/Lagos)**, which has now passed while the later estimate has not. Verify the actual submission form manually before assuming eligibility.

## Source-of-truth files

Read before any implementation:
1. `PROJECT_SPEC.md`
2. `ARCHITECTURE.md`
3. `IMPLEMENTATION_PLAN.md`
4. `AGENTS.md`
5. This file
6. `docs/DECISIONS.md`, `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, `docs/DESIGN_DECISIONS.md` and any relevant docs before the corresponding phase.

Workflow reference supplied by operator: `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`.

## Fixed decisions and authorization

- Orchestrator: on-chain `PipelineCoordinator`, no off-chain event listener.
- Topology: one parent escrow and per-stage records; no nested child contracts.
- Evaluator: client for every stage.
- Stage list/provider addresses/budgets/order/briefs/durations immutable at funding.
- All budgets funded upfront; each approval pays current stage and activates next in the same transaction.
- Rejection/expiry refunds all unspent funds to client; prior payouts are final.
- 2–10 stages, minimum 1 USDC per stage, total maximum 100 USDC; 6-decimal USDC ERC-20 units; stage work deadline 15 minutes–7 days; 24-hour evaluation window.
- Phase 8.5 operator-authorized deviations (2026-10-30): `MAX_STAGES` 10, Light/Dark theme toggle, Days/Hours duration selector, optional attachment URL appended to the public brief, tagline update. Recorded in `docs/DECISIONS.md` (D-23, D-24).
- **Phase 9 authorization (2026-11-01):** operator explicitly authorized the Arc Mainnet deployment and a low-value real-USDC demonstration. Recorded in `docs/DECISIONS.md` (D-25) and `docs/DEPLOYMENT.md`.
- No marketplace, runtime AI, backend, database, indexer, queue, admin panel, fee, arbitration, reputation, or dynamic routing.
- Arc Studio is the contract/test source. Mainnet was manually deployed from the exact exported compile artifact after authorization.
- Preview remains Arc Testnet only; Production is Arc Mainnet. A build-time guard enforces both.

## Current phase

**Phase 7 UI Polish is complete on top of the live Phase 9 release.** The contract and Production app remain live on Arc Mainnet. The approved review-02 styling has been applied to the React shell, Home, Create, Pipelines, Pipeline Detail (active and terminal), Docs, Risk, not-found, and loading/error/empty states. The remaining release evidence is still the operator's real browser-wallet pipeline and its Explorer transaction hashes.

## URLs and deployments

- **Current UI commit (deployed): `068e16d4c97f0aaa01de1bd4f92885fc3b9ab2a9`** (`feat: apply stageshow refined ui to production app`).
- Previous release commit: `924440f450591353a593a903ef47ac238f610858` (`release: arc mainnet demo and submission evidence`).
- Arc Studio contract app: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`**; workspace `https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`. It contains the current `contracts/PipelineCoordinator.sol`, tests, and deployment records.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public; default branch `main`).
- **Production URL: https://relaycrew-omega.vercel.app** — Arc Mainnet, real USDC.
- **Design Review 02 visual system:** implemented in `src/editorial.css` and applied across `src/`; the approved static source remains in `mockups/` for reference. The review-02 mockups themselves were never deployed as a separate site.
- **Production deployment ID (current): `dpl_EaUHX549UAddLX8DsjZtAqHoYeg6`.**
- **Production deployment URL: `https://relaycrew-ggsabj0db-uhhh2.vercel.app`.**
- **Production UI source commit: `068e16d4c97f0aaa01de1bd4f92885fc3b9ab2a9`.** The Vercel CLI deployment was created from the committed UI source; this handoff/docs update follows in Git.
- Vercel Preview URL: **https://relaycrew-1gp6xbcd6-uhhh2.vercel.app** (Arc Testnet; Deployment Protection enabled).
- Preview deployed commit: `4bb066302f17ca6b1c025bafd80beffa37eed57b` (existing Phase 8.5 deployment; not rebuilt in this phase).
- **Mainnet contract: `0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`** (Arc Mainnet, chain ID `5042`).
- **Mainnet deployment tx: `0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e`** — block `29054729`; gas used `2,236,465`; effective gas price `21 gwei`; cost `0.046965765 USDC`.
- Mainnet explorer: https://explorer.arc.io/address/0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114.
- Mainnet E2E transaction hashes: **NONE — pending operator browser-wallet execution**.
- Testnet contract: `0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`; deployment tx `0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`.
- Previous 5-stage testnet contract (superseded): `0x85bbf546b09d990959de0672c273b56400f84f05`.
- Video walkthrough: **NOT RECORDED**.
- Builder profile URL for submission: use actual operator-supplied or verified URL; do not invent.

## Phase 9 completed work

### Mainnet deployment

- Official values rechecked on 2026-11-01 against `https://docs.arc.io/arc/references/contract-addresses` and `https://docs.arc.io/arc/references/connect-to-arc`: chain `5042`, RPC `https://rpc.mainnet.arc.io`, explorer `https://explorer.arc.io`, USDC ERC-20 interface `0x3600000000000000000000000000000000000000` with 6 decimals.
- Deployer: `0x6B24827a732f7e8CD35c56F50E3418a05A0Ee054`; nonce `0`; pre-deployment balance `3.609 USDC`.
- Deployment used the exact Arc Studio artifact, not a recompile: Solc `0.8.28+commit.7893614a`, optimizer 200 runs, EVM `cancun`.
- Source keccak `0x32485699eec5a9e958b418f867b47ef8378a972a7ab1bfeb86c9cae75a770b72` matched the artifact metadata.
- ABI parity: 58 entries matched `src/lib/contracts.ts`.
- Creation bytecode keccak: `0x833f16c07942bdab254a58c5820f336fff9a988c4443005f74cd7e1bd6b8eaa0`.
- Constructor USDC: `0x3600000000000000000000000000000000000000`.
- Pre-sign checkpoint printed the deployer, constructor argument, network, predicted address, gas estimate, fee cap, and worst-case cost; the operator explicitly confirmed proceeding.
- On-chain verification after receipt: code `9,992` bytes; `usdc()` = official interface; `MAX_STAGES()` = `10`; `pipelineCount()` = `0`.
- Deployer balance after deployment: `3.562034235 USDC`.

### Production frontend

- `src/lib/contracts.ts` now maps both verified addresses: Mainnet `0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`, Testnet `0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`.
- `src/lib/config.ts` supports both networks, validates the official USDC interface, selects the expected chain, and resolves the pipeline address with a fail-closed fallback.
- `vite.config.ts` now fails a Vercel Preview build unless it is Arc Testnet and fails a Vercel Production build unless it is Arc Mainnet with chain `5042`, the official USDC interface, and a valid contract address.
- Network-dependent UI copy was corrected across the shell, Home, Create, Pipelines, Detail, Docs, Risk, and transaction errors. Production no longer displays testnet-only labels or the old "mainnet not authorized" risk text.
- `src/lib/wagmi.ts` now assigns the configured RPC to the correct chain and puts the active chain first.
- Vercel Production env vars set: `VITE_NETWORK_MODE=mainnet`, `VITE_CHAIN_ID=5042`, `VITE_RPC_URL=https://rpc.mainnet.arc.io`, `VITE_EXPLORER_URL=https://explorer.arc.io`, `VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000`, `VITE_PIPELINE_CONTRACT_ADDRESS=0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`, `VITE_GITHUB_REPOSITORY_URL=https://github.com/onyebuchidaniel60/Relaycrew`.
- Preview env vars remain Arc Testnet.
- Added `scripts/deploy-mainnet.mjs` (preflight by default; `--confirm` to broadcast) and `deployments/arc-mainnet.json` evidence.

## Design Review 02 — approved and implemented (2026-11-02)

- **Operator request:** install the Stageshow skill by Benji Taylor, generate a new high-fidelity static HTML/CSS mockup set for Home, Create Pipeline, Active Pipeline, and Terminal Settlement, overwrite the previous `mockups/` set, commit as `docs: generate high-fidelity stageshow mockups`, push `main`, and stop for review.
- **Skill installation:** `.agents/skills/stageshow` and `skills-lock.json` were installed locally by `npx skills add benjitaylor/skills --skill stageshow`. They are intentionally not part of the mockup commit.
- **Direction:** “Warm Editorial Escrow, review 02” — warmer ivory paper, deeper forest, clay reserved for refusal/refund, 2–3px radii, Newsreader display + Instrument Sans UI + IBM Plex Mono ledger type. Paper artifacts replace generic dashboard cards.
- **Files:** `mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `pipeline-terminal.html`, `styles.css`, `README.md`, and `previews/*.webp`. The previous `mobile.html` was removed; every new page is responsive at 1440/1024/768/390.
- **Original scope:** static mockups only. The operator subsequently approved the direction and explicitly authorized Phase 7 UI polish; that implementation is now complete.
- **Accuracy:** illustrative data only; 4 stages summing to `64.00 USDC`; 2–10 stage limits, 1.00 USDC minimum, 100.00 USDC maximum, 24-hour evaluation window, 6-decimal base units, and zero platform fee are represented. No transaction hash or transaction URL is fabricated.
- **Approval status:** **APPROVED — 2026-11-02.** The operator reviewed the set and explicitly approved the “Warm Editorial Escrow, review 02” direction (Stageshow refined) as the premium visual system and authorized Phase 7 UI polish only. Recorded in `docs/DECISIONS.md` (D-27) and `docs/DESIGN_DECISIONS.md`.
- **Implementation status:** **COMPLETE and deployed.** `src/editorial.css` carries the review-02 component/layout system. Home, Create, Pipelines, Active Detail, Terminal Detail, Docs, Risk, not-found, and loading/error/empty states use the approved tokens and layouts. Dark Warm Editorial remains authorized and was remapped to the same hierarchy. No business logic, contract call, state transition, or security control changed.

## Tests/evidence

- `npm run typecheck` — **PASS**.
- `npm run lint` — **PASS** (oxlint, no warnings).
- Production build — **PASS**; Vite 6.4.5; 1804 modules; CSS `index-C3NTNPU2.css` `101.47 kB` (`19.73 kB` gzip); JS `673.98 kB` (`201.66 kB` gzip); the only warning is the pre-existing chunk-size warning.
- `src/editorial.css` is derived from the approved review-02 mockup stylesheet and contains the application integration and Dark Warm Editorial mappings.
- Arc Studio contract tests (prior Phase 8.5 evidence, source unchanged): **31 passed, 0 failed, 0 skipped**.
- Source/ABI/compiler parity — **MATCH** against the Arc Studio artifact.
- Mainnet on-chain reads via official RPC — `usdc()` official, `MAX_STAGES()` `10`, `pipelineCount()` `0`, code `9,992` bytes.
- Production route checks after the UI deployment — `/`, `/create`, `/pipelines`, `/pipelines/1`, `/docs`, `/risk`, `/favicon.svg`, `/images/og-relaycrew.png` all returned HTTP 200. Production assets served: `index-B-2Ii37S.js` and `index-C3NTNPU2.css`; the CSS hash matches the local build.
- Headless Chromium on Production — the new review-02 Home and Create screens render the mainnet strip, Arc Mainnet chip, Newsreader/Instrument Sans/IBM Plex Mono typography, ivory/forest/sage/clay tokens, and the four-step create rail. No configuration-error banner appears.
- Explorer links checked — contract and deployment tx both return HTTP 200.
- Contract E2E on Mainnet — **not executed**; pending operator.
- Design Review 02 static pages — `home.html`, `create.html`, `pipeline-active.html`, `pipeline-terminal.html`, and `index.html` returned HTTP 200 from the local static server; no console errors.
- Review-02 application responsive check — no horizontal overflow at 320, 360, 390, 768, 1024, or 1440 widths; the compact header keeps all five routes visible.
- Review-02 application state checks — local preview rendered loading, error, and not-found states; mocked read-only RPC data was used only to inspect active and terminal visuals, not as real transaction evidence. Mainnet payloads were not altered.
- Design Review 02 content check — illustrative totals reconcile (`12 + 18 + 14 + 20 = 64.00 USDC`); active payout/refund figures reconcile (`52.00 - 18.00 = 34.00` remaining); no real transaction hash is presented as evidence.
- Dark Warm Editorial check — Home and Create rendered correctly with the stored dark preference; colors, chips, buttons, and form surfaces remained legible.

## Design approval and implementation record

- Final aesthetic: **APPROVED** — “Warm Editorial Escrow, review 02,” 2026-11-02; the prior “Warm Editorial Escrow” direction and the Dark Warm Editorial extension remain part of the approved system.
- Design references: **OPERATOR-SUPPLIED** — `docs/references/reference 1.webp` and `docs/references/reference 2.jpg`.
- Previously approved mockup set: `mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `mobile.html`, `styles.css` (retained in Git history).
- **Current mockup set on disk:** Design Review 02 (`mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `pipeline-terminal.html`, `styles.css`, `README.md`, `previews/`). **APPROVED and IMPLEMENTED.**
- Phase 7 UI polish implemented the approved layout structures and exact tokens in `src/editorial.css`, `src/index.css`, and the React pages. Phase 9 did not change the visual direction; it only made network-dependent copy, labels, explorer links, and configuration accurate for Mainnet.
- Full record: `docs/DESIGN_DECISIONS.md` and `docs/DECISIONS.md`.

## Documentation/footer state

- `/docs` and `/risk` are complete, real routes with no placeholder claims.
- Footer Documentation resolves to `/docs`; Risk notice resolves to `/risk`.
- GitHub footer destination is the verified public repository configured in `VITE_GITHUB_REPOSITORY_URL`.
- Contract footer destination opens the active network's verified coordinator address in the official explorer (Production: Mainnet; Preview: Testnet).
- Root `README.md`, `AI_HANDOFF.md`, `PROJECT_SPEC.md`, `docs/DEPLOYMENT.md`, `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md`, `docs/USER_GUIDE.md`, `docs/DECISIONS.md`, `docs/DESIGN_DECISIONS.md`, `docs/REQUIREMENT_MATRIX.md`, and `docs/SOURCES.md` now record the Mainnet deployment and remaining operator evidence.

## Safety and deployment constraints

- Mainnet deployment and the low-value E2E demonstration were explicitly authorized by the operator on 2026-11-01. That authorization does not extend to unrelated mainnet activity.
- `DEPLOYER_PRIVATE_KEY` is local-only, ignored by Git, and was never printed, committed, or placed in Vercel/client code.
- The deployment script prints preflight details but redacts the key; it requires `--confirm` to sign.
- The contract is immutable, has no owner/admin role, no upgrade path, no rescue, and no fee.
- Production uses real USDC and displays irreversible-action warnings. Preview remains Arc Testnet only.
- No secrets were added to the repository or deployed bundle.
- Contract remains unaudited experimental software with the risk notice visible.

## Known issues/blockers

1. **Mainnet E2E has not run.** There are no mainnet create/submit/approve transaction hashes. The operator must execute the 2-stage, 1-USDC-per-stage browser-wallet journey and reconcile the Explorer events before calling the hackathon evidence complete.
2. If the conservative deadline (2026-11-01 20:59 WAT) was real, it has passed. The later estimate (2026-11-02 04:59 UTC) may still be valid, but the official submission form must be checked manually.
3. The video walkthrough and builder profile URL are still missing from the submission package.
4. The contract is unaudited; the client is the sole evaluator and there is no dispute mechanism.
5. The frontend bundle is about `674 kB` (`202 kB` gzip); CSS is `101 kB` (`20 kB` gzip). Vite reports the pre-existing chunk-size warning; code splitting is deferred.
6. Vercel CLI did not attach Git metadata to the production deployment. The deployed source is identified by the committed UI source (`068e16d4c97f0aaa01de1bd4f92885fc3b9ab2a9`) plus matching asset hashes.
7. The current production deployment is `dpl_EaUHX549UAddLX8DsjZtAqHoYeg6`; its CSS asset `index-C3NTNPU2.css` matches the local build. Because Vercel built with Production env, the JS asset differs from the local testnet build.
8. The duration selectors are hour-granular, so the minimum selectable duration is 1 hour even though the contract accepts 15 minutes. Deliberate UI limitation.
9. The optional attachment URL must fit the combined 240-byte brief limit.
10. Vercel Deployment Protection remains enabled for the Preview; Production returned HTTP 200 publicly in this check.
11. The review-02 implementation is visual-only and uses the approved static source as its CSS basis. No design approval remains pending. The separate Mainnet E2E evidence task is still outstanding.

## Single next task

**Operator reviews the new Production UI** at `https://relaycrew-omega.vercel.app` and confirms it matches the approved “Warm Editorial Escrow, review 02” mockups. The separate authorized low-value Mainnet E2E remains pending and is not part of this visual review.
