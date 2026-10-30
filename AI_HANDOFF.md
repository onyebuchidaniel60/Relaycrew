# AI_HANDOFF.md — RelayCrew current project state

**Last updated:** 2026-10-30

**Status:** Phase 8 complete and deployed. The approved “Warm Editorial Escrow” app now includes complete `/docs` and `/risk` content, final metadata/Open Graph assets, verified footer destinations, release-facing documentation, and a clean link/state audit. No contract, transaction, state-machine, or security behavior changed. Phase 9 (Mainnet release) has not started and requires explicit operator authorization. Mainnet remains unauthorized.

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
- Final visual direction: **approved 2026-10-30** — “Warm Editorial Escrow”; Phase 7 implementation complete, Phase 8 content/completeness complete.

## Current phase

**Phase 8 complete — frontend and documentation completeness.** Real `/docs` and `/risk` content, metadata/Open Graph, footer link integrity, README/docs updates, responsive/accessibility checks, and the final release checklist are complete and deployed. Phase 9 has not started.

## URLs and deployments

- Arc Studio project: **App ID `9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`** (“Relay Crew Communication Platform”); verified via CLI; workspace `https://studio.arc.io/app/9ad3cdcd-b77f-4cd3-9b03-c6dbb9704961`.
- GitHub repository URL: **https://github.com/onyebuchidaniel60/Relaycrew** (verified public via GitHub API; default branch `main`; HTTP 200).
- Vercel Preview URL: **https://relaycrew-egn5b8knn-uhhh2.vercel.app** (Preview target; Vercel Deployment Protection enabled).
- Preview deployed commit: **1aa070906db8ad1617c929c8718d9ae19d028a36** — deployment created from a clean tree at this commit; deployed CSS/JS asset hashes match the local production build of the same commit. Vercel CLI did not attach Git metadata to this deployment.
- Repository Phase 8 commit: **1aa070906db8ad1617c929c8718d9ae19d028a36** (implementation commit; this handoff update is a docs-only commit on top).
- Vercel deployment ID: **dpl_9HDcJ2bxCkdFX6XdPDYXPwik2e52**.
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
- Phase 7 implementation: tokens, shell, Home, Create, Pipelines, Detail, terminal ledgers, confirmation dialog, favicon and editorial SVGs. Tokens live in `tailwind.config.js` and `src/index.css`; components include `LogoMark`, `StatusPill`, and `ConfirmDialog`.
- Phase 8 additions: complete `/docs` user guide, complete `/risk` notice, 1200×630 Open Graph card, SEO/OG/Twitter metadata, verified footer destinations, README/docs accuracy pass, and removal of the unused placeholder component.
- Imagery: original warm editorial SVGs at `public/images/relay-hero.svg` and `public/images/relay-panel.svg`; favicon at `public/favicon.svg`; OG card `public/images/og-relaycrew.png`. No licensed photography was copied.
- Recorded deviations: SVG imagery instead of photography; Google Fonts delivery for Fraunces/Manrope/IBM Plex Mono; existing exact trimmed amount display retained; browser-native `window.confirm` replaced by an accessible in-app confirmation dialog with identical guards and values; mobile nav remains visible as a compact second header row.
- Behavior freeze: no contract call, ABI, address, validation, role check, allowance rule, state transition, or security control changed in Phases 7–8.
- Full record: `docs/DESIGN_DECISIONS.md`.

## Phase 8 completed work

- **`/docs`:** real user guide with overview, roles, limits/exact amounts, create/fund, provider submission, approve/reject/expiry, statuses, public-data warning, Arc Testnet vs Mainnet, troubleshooting, contract/source details, and working section anchors.
- **`/risk`:** security-derived notices covering experimental/unaudited software, irreversible USDC, sole client evaluation, evaluator non-response causing expiry/refund, public/permanent data, and no admin rescue/upgrade.
- **Metadata:** title `RelayCrew | Agent Pipeline Escrow`, description, author/application metadata, theme color, favicon/mask icon, Open Graph/Twitter tags, and a real 1200×630 OG image.
- **Footer:** Documentation → `/docs`; Risk notice → `/risk`; GitHub → verified public repository from `VITE_GITHUB_REPOSITORY_URL`; Contract → verified Arc Testnet Explorer address. External links have descriptive labels and new-tab indicators.
- **Repository docs:** README, USER_GUIDE, SECURITY, DEPLOYMENT, CONTRACT_INTERFACE, DECISIONS, and DESIGN_DECISIONS updated for the implemented Testnet state. Root README now includes the live Testnet contract address and final deployment details.
- **Cleanup:** removed the unused `PlaceholderPanel` component; no unexplained “In progress” or “GitHub repo pending” text remains.
- **Behavior freeze:** no contract logic, account permissions, transaction calls, validation, allowance handling, or state transitions were changed.

## Tests/evidence

- Phase 8 typecheck: `npm run typecheck` **PASS**.
- Phase 8 lint: `npm run lint` **PASS** (oxlint, no warnings reported).
- Phase 8 production build: `npm run build` **PASS** — Vite 6.4.5, 1801 modules; CSS 34.81 kB (7.95 kB gzip); JS 650.98 kB (195.83 kB gzip); chunk-size warning only.
- Headless Chromium audit: 18 route/viewport checks across `/`, `/create`, `/pipelines`, `/pipelines/42`, `/docs`, `/risk`, and the not-found route at 1440/768/390; **0 horizontal overflow**, **0 bad anchors**, **0 missing documentation anchors**, **0 unnamed buttons**, **0 console errors**.
- State audit: loading skeleton visible; error state with Retry shown; empty wallet ledger shown; active client-review and provider-submit states shown; Completed/Rejected/Expired settlement ledgers shown with no action controls; wrong-network banner shown; approve dialog contains the full recipient address and closes on Escape.
- Accessibility checks: all 10 create-form inputs/textarea have associated labels; focus ring resolves to forest border `rgb(23, 61, 44)` and 3px green shadow; external links have accessible new-tab labels.
- External link checks: public GitHub repository returns HTTP 200 and is public with default branch `main`; verified Arc Testnet Explorer contract URL returns HTTP 200.
- Deployed Preview verification: Vercel state **READY**; all seven main routes plus `/images/og-relaycrew.png` and `/favicon.svg` returned HTTP 200 through `vercel curl`.
- Deployed metadata/assets: title and Open Graph tags present; OG image is a 1200×630 PNG and matches the local asset; deployed `index-D-uU7pOA.css` and `index-BMA_MorA.js` match the local production build of commit `1aa0709…`; deployed JS contains the new docs/risk content, GitHub URL, and verified contract address.
- Prior functional evidence retained: contract tests **29 passed, 0 failed**; Phase 4/5 allowance, create/list/detail/submit/approve/reject/expire flows and edge states were implemented and previously accepted by the operator.
- Mainnet tests: **not run; no authorization given and no transaction executed**.

## Design reference/mockup state

- Final aesthetic: **APPROVED** (2026-10-30).
- References: operator-supplied images in `docs/references/`.
- Mockups: **APPROVED** — `mockups/` retained as the design record.
- Previous direction: **REJECTED AND REMOVED** — dark “Operator Console” mockups.
- Phase 8 did not change the approved design direction or styling architecture; it completed content, metadata, links, and release-facing completeness.
- Full record: `docs/DESIGN_DECISIONS.md`.

## Documentation/footer state

- `/docs` and `/risk` are complete, real routes with no placeholder claims.
- Footer Documentation resolves to `/docs`; Risk notice resolves to `/risk`.
- GitHub footer destination is the verified public repository configured in `VITE_GITHUB_REPOSITORY_URL` and `.env.example`; it appears in the deployed bundle.
- Contract footer destination is the verified testnet address on the official Arc Testnet Explorer.
- External destinations were checked with HTTP 200; internal routes and documentation anchors were checked in headless Chromium.
- Root `README.md` includes the live Testnet contract address, current Preview URL/deployed commit, project summary, limits, setup commands, and safety notes.
- No dead links, inert controls, `href="#"`, unexplained placeholders, or fabricated URLs remain in the audited UI.

## Safety and deployment constraints

- No mainnet deployment or real-USDC transaction without explicit operator authorization.
- Preview is Arc Testnet only; no deployer key or signing key is in the client bundle.
- No secrets were added to the repository or deployed bundle in Phase 8.
- Contract remains unaudited experimental software with the risk notice visible.
- Vercel Deployment Protection remains enabled; use `vercel curl` or an authorized browser session to inspect the Preview.
- Phase 9 must not begin without explicit operator authorization for mainnet deployment and a specific low-value transaction.

## Known issues/blockers

1. Phase 5 was accepted by the operator; the operator’s manual live transaction hashes are not recorded in this repository, and the automated live create → submit → approve → reject/expire journey was not executed here.
2. A real injected-wallet transaction flow was not exercised in Phase 8 automation; a mock wallet/RPC verified UI states only. No transaction was sent.
3. The frontend bundle is 650.98 kB (195.83 kB gzip) and Vite reports a chunk-size warning; code splitting is deferred.
4. Circle DCW key provisioning failed, so the testnet deployment used Arc Studio’s shared platform deployer. The contract has no owner/admin role, so that wallet has no special authority; recorded as an operational fallback.
5. Vercel Deployment Protection is enabled; the Preview requires Vercel authentication or a protection bypass.
6. Deadline discrepancy still unresolved (2026-11-01 20:59 WAT vs 2026-11-02 04:59 UTC); requires confirmation from the official submission form.
7. No mainnet deployment/transaction authorization.
8. Scope deviation, commit 8a7c8b9: the authorized preflight task was inspection-only, but the run created `.gitignore` and modified `AI_HANDOFF.md` and `README.md`, then committed. Operator did not authorize file modification. Changes were retained (they are factually correct; `.gitignore` addresses a real gap) but the deviation is recorded to reinforce that inspection-only tasks must not modify files.
9. The Vercel CLI deployment does not carry attached Git metadata. The deployed source commit is identified by the clean tree at `1aa0709…` plus matching local/deployed CSS and JS asset hashes. Re-verify if the deployment is replaced.
10. The in-app confirmation dialog replaced browser-native `window.confirm`; this is recorded as a visual/interaction deviation. The same guard, exact values, and irreversible-action warning are preserved, and no contract call was changed.

## Single next task

**Phase 9 (Mainnet Release) only after explicit operator authorization.** Reverify official Arc network/token/deadline values, review security and release evidence, export the tested contract source, and deploy/transact on Arc Mainnet only with separate, specific operator approval for the deployment and a low-value transaction. No mainnet action is authorized now.
