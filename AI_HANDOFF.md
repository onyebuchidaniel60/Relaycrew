# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Phase 7 complete and deployed. The operator-approved “Warm Editorial Escrow” visual system is applied to the working Arc Testnet app. No contract, transaction, state-machine, or security behavior changed. Phase 8 has not started. Mainnet remains unauthorized.

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
6. `docs/DECISIONS.md`, `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md`, `docs/DESIGN_DECISIONS.md` and any relevant docs before the corresponding phase.

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
- Final visual direction: **approved 2026-10-30** — “Warm Editorial Escrow”; Phase 7 implementation complete.

## Current phase

**Phase 7 complete — implement approved final UI.** The approved visual system is deployed on the Arc Testnet Preview. Phase 8 (frontend and documentation completeness) is the next task and has not started.

## URLs and deployments

- Arc Studio project: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`** (“Relay Crew Communication Platform”); verified via CLI; workspace `https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public via GitHub API; default branch `main`).
- Vercel Preview URL: **https://relaycrew-kl661uga9-uhhh2.vercel.app** (Preview target; Vercel Deployment Protection enabled).
- Preview deployed commit: **9f23d9cfe9a2927003ed9a3c63ac6894f0447ffd** — deployment created from a clean tree at this commit; deployed JS/CSS asset hashes match the local production build of the same commit. Vercel CLI did not attach Git metadata to this deployment.
- Repository Phase 7 commit: **9f23d9cfe9a2927003ed9a3c63ac6894f0447ffd** (implementation commit; this handoff update is a docs-only commit on top).
- Vercel deployment ID: **dpl_44YZmjAvVMYVfymJSgwJCMEPSZKZ**.
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

## Design approval and implementation record

- Final aesthetic: **APPROVED** — “Warm Editorial Escrow,” 2026-10-30.
- Design references: **OPERATOR-SUPPLIED** — `docs/references/reference 1.webp` and `docs/references/reference 2.jpg`.
- Approved mockup set: `mockups/index.html`, `home.html`, `create.html`, `pipeline-active.html`, `mobile.html`, `styles.css`.
- Approval text recorded: “The ‘Warm Editorial Escrow’ mockups were reviewed and explicitly APPROVED.” (operator instruction, 2026-10-30).
- Implementation: Phase 7 applied the tokens and layouts to the working app. Tokens live in `tailwind.config.js` and `src/index.css`; new components are `LogoMark`, `StatusPill`, and `ConfirmDialog`.
- Imagery: original warm editorial SVGs at `public/images/relay-hero.svg` and `public/images/relay-panel.svg`; favicon at `public/favicon.svg`. No licensed photography was copied.
- Recorded deviations: SVG imagery instead of photography; Google Fonts delivery for Fraunces/Manrope/IBM Plex Mono; existing exact trimmed amount display retained; browser-native `window.confirm` replaced by an accessible in-app confirmation dialog with identical guards and values; mobile nav remains visible as a compact second header row.
- Behavior freeze: no contract call, ABI, address, validation, role check, allowance rule, state transition, or security control changed.
- Full record: `docs/DESIGN_DECISIONS.md`.

## Phase 7 completed work

- Global shell: editorial header, relay mark, network badge, wallet control, testnet preview strip, warm wrong-network/configuration alerts, and footer links.
- Home: split editorial hero, warm visual panel, illustrative stage cards explicitly labeled “not live data,” protocol-constraint stats, relay explanation, inspection panel, risk callout.
- Create: setup checklist, wallet/balance/allowance summary, stage editors, byte counters, exact total strip, public-data warning, and the unchanged single wallet flow.
- Pipelines: wallet-view ledger rows, status pills, exact budget amounts, loading/error/empty/not-connected states.
- Pipeline detail: current-agent title, money summary, stage rail with active/paid/submitted/rejected markers, countdown, payout/recipient/next-hire/refund panel, provider submit form, client review controls, permissionless expiry, and terminal ledger.
- Terminal states: Completed, Rejected, and Expired show reconciled total/paid/refunded/finished values and no action controls.
- Confirmation dialogs: accessible native `<dialog>` for approve, reject, and expire; repeats exact recipient, payout, next hire, and refund; Escape/cancel/backdrop close without sending a transaction.
- Accessibility/polish: visible forest focus ring on inputs, `:focus-visible` outlines, labelled inputs, keyboard-operable native dialog, reduced-motion handling, card/button transitions, paper shadows, mono-font amount fields, mobile layouts at 390px.
- Assets/metadata: favicon, page title/description, theme color, updated `/docs`, `/risk`, and 404 styling.

## Tests/evidence

- Phase 7 typecheck: `npm run typecheck` **PASS**.
- Phase 7 lint: `npm run lint` **PASS** (oxlint, no warnings reported).
- Phase 7 production build: `npm run build` **PASS** — Vite 6.4.5, 1801 modules; CSS 34.46 kB (7.88 kB gzip); JS 632.92 kB (191.81 kB gzip); chunk-size warning only.
- Phase 7 visual verification: headless Chromium at 1440px and 390px; Home, Create, Pipelines, Detail, Docs, Risk, 404; active client-review state, provider-submit state, Completed/Rejected settlement ledgers, wrong-network state, and approve confirmation dialog.
- Connected-state verification used a temporary local mock injected wallet and mocked Arc JSON-RPC; no transaction was signed or sent and no test-only harness was committed.
- Browser checks: **0 console errors** across tested routes/states; **0px horizontal overflow** at 1440px and 390px; all tested create/detail inputs have associated labels; focus test confirmed forest border `rgb(23, 61, 44)` plus 3px green focus shadow after transition; dialog recipient full address present and Escape closes the dialog.
- Deployed Preview verification: Vercel state **READY**; all seven routes returned HTTP 200 through `vercel curl` (`/`, `/create`, `/pipelines`, `/pipelines/1`, `/docs`, `/risk`, `/not-a-route`).
- Deployed bundle parity: deployed `index-7J2Jg7ay.css` and `index-D7BqpU9Q.js` match the local production build of commit `9f23d9c…`; deployed JS contains the new design copy, “Settlement ledger,” “Irreversible on-chain action,” the public GitHub URL, and the verified contract address; deployed CSS contains the approved palette, Fraunces/Manrope/IBM Plex Mono, and dialog styles.
- Prior functional evidence retained: contract tests **29 passed, 0 failed**; Phase 4/5 allowance, create/list/detail/submit/approve/reject/expire flows and edge states were implemented and previously accepted by the operator.
- Mainnet tests: **not run; no authorization given and no transaction executed**.

## Design reference/mockup state

- Final aesthetic: **APPROVED** (2026-10-30).
- References: operator-supplied images in `docs/references/`.
- Mockups: **APPROVED** — `mockups/` retained as the design record.
- Previous direction: **REJECTED AND REMOVED** — dark “Operator Console” mockups.
- Implementation deviations recorded in `docs/DESIGN_DECISIONS.md`.
- Phase 8 may not change the approved design direction; it finishes documentation, link integrity, accessibility, and release-facing completeness only.

## Documentation/footer state

- Root `README.md` and `docs/` materials are present; Phase 8 owns the complete user/operator documentation pass.
- `/docs` is styled and clearly marked “In progress” with planned contents; it is **not** presented as complete documentation.
- Home/footer Documentation link resolves to `/docs`; Risk notice resolves to `/risk`.
- GitHub footer link uses `VITE_GITHUB_REPOSITORY_URL`; the configured public URL appears in the deployed bundle. Full deployed link crawl remains Phase 8 work.
- Contract footer link uses the verified testnet address and explorer base.
- No dead links, inert controls, `href="#"`, or unexplained placeholders were introduced in Phase 7; the `/docs` placeholder is explicitly labeled.

## Safety and deployment constraints

- No mainnet deployment or real-USDC transaction without explicit operator authorization.
- Preview is Arc Testnet only; no deployer key or signing key is in the client bundle.
- No secrets were added to the repository or deployed bundle in Phase 7.
- Contract remains unaudited experimental software with the risk notice visible.
- Vercel Deployment Protection remains enabled; use `vercel curl` or an authorized browser session to inspect the Preview.

## Known issues/blockers

1. Phase 5 was accepted by the operator; the operator’s manual live transaction hashes are not recorded in this repository, and the automated live create → submit → approve → reject/expire journey was not executed here.
2. A real injected-wallet transaction flow was not exercised in Phase 7 automation; a mock wallet/RPC verified UI states only. No transaction was sent.
3. The frontend bundle is 632.92 kB (191.81 kB gzip) and Vite reports a chunk-size warning; code splitting is deferred.
4. `/docs` remains an explicitly labeled Phase 8 placeholder; the full user/operator guide and link audit are incomplete.
5. Circle DCW key provisioning failed, so the testnet deployment used Arc Studio’s shared platform deployer. The contract has no owner/admin role, so that wallet has no special authority; recorded as an operational fallback.
6. Vercel Deployment Protection is enabled; the Preview requires Vercel authentication or a protection bypass.
7. Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
8. No mainnet deployment/transaction authorization.
9. Scope deviation, commit 8a7c8b9: the authorized preflight task was inspection-only, but the run created `.gitignore` and modified `AI_HANDOFF.md` and `README.md`, then committed. Operator did not authorize file modification. Changes were retained (they are factually correct; `.gitignore` addresses a real gap) but the deviation is recorded to reinforce that inspection-only tasks must not modify files.
10. The Vercel CLI deployment does not carry attached Git metadata. The deployed source commit is identified by the clean tree at `9f23d9c…` plus matching local/deployed CSS and JS asset hashes. Re-verify if the deployment is replaced.
11. The in-app confirmation dialog replaced browser-native `window.confirm`; this is recorded as a visual/interaction deviation. The same guard, exact values, and irreversible-action warning are preserved, and no contract call was changed.

## Single next task

**Phase 8 only per `IMPLEMENTATION_PLAN.md`: complete the frontend/documentation release pass — real `/docs` and `/risk` content, metadata/favicon checks, link crawl, accessibility and responsive verification, and the actual public GitHub/footer destinations. Do not start Phase 9 or any mainnet action.**
