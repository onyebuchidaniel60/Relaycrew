# IMPLEMENTATION_PLAN.md — RelayCrew

**Method:** `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`. This plan is phase-gated. Complete one task/phase, test, review, fix, commit, update `AI_HANDOFF.md`, report evidence, and stop. Do not proceed automatically.

## Global acceptance rules

- **Early visible UI:** Phase 1 deploys a navigable skeletal frontend to a stable Vercel Preview URL. Report its exact URL and deployed commit as soon as it exists. Keep it current at every accepted checkpoint.
- **Safe preview:** Preview uses Arc Testnet only (chain ID 5042002) and safe test funds. No deployer key, production data, mainnet contract writes, or irreversible mainnet money flow in preview.
- **Functionality before polish:** final visual design is forbidden until all agreed critical user journeys pass E2E on the deployed preview.
- **Operator-controlled design:** collect/agree references, produce desktop/mobile mockups, present and revise; stop for explicit operator approval. Silence is not approval.
- **No architecture drift:** final UI work may not change contract behavior, roles, business logic, APIs/contract interface, environment boundaries, or stack without separate operator approval.
- **Frontend completeness:** final UI includes routes, navigation/footer, real `/docs` link, actual public GitHub link when appropriate, relevant risk notice, responsive behavior, accessibility basics, metadata/icon, all relevant states, and zero dead links/inert controls.
- **Evidence over claims:** test results, hashes, preview URL, commit, and links must be actual. Never fabricate a URL, contract address, transaction hash, repository destination, test result, or mainnet status.
- **Stop after assigned task:** the agent does not silently execute the next phase.

## Phase 1 — Repository/platform foundation + skeletal frontend deployment

**Objective:** create/inspect Arc Studio project and repository, scaffold navigable app shell, publish first Vercel Preview.

**Dependencies:** operator has access to Arc Studio, GitHub and Vercel. Actual repository/project do not yet have verified URLs.

**Tasks**
1. Inspect current repository, Arc Studio generated code, package manifest, build/test commands, framework, routes, configuration, and Git status. Do not modify files until inspection is summarized.
2. Confirm the generated project can support the fixed React + TypeScript + Vite direction. If Arc Studio outputs a materially incompatible framework or the required app/test flow cannot be retained, stop and ask the operator; do not migrate silently.
3. Establish `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and not-found route behavior.
4. Add global shell/navigation/footer and simple temporary styles. Label unfinished functionality clearly. Do not imply that wallet, escrow, or payment buttons work.
5. Add safe network-mode structure; set Vercel Preview to testnet only. Keep contract write actions disabled until tested deployment exists.
6. Create/confirm public GitHub repository through actual Arc Studio integration or operator-approved process; push source and `README.md`/handoff docs. Do not invent remote URL.
7. Deploy Vercel Preview. Open the exact deployed URL and inspect route navigation, responsiveness and console/build errors.
8. Update `AI_HANDOFF.md` with exact preview URL, commit SHA, screens visible, what is placeholder, tests and one next task.

**Expected files/components:** app shell/router, page placeholders, `README.md`, `.gitignore`, `.env.example`, initial `AI_HANDOFF.md`; retain Arc Studio files and generated config.

**Data/API:** no backend, database, or live contract calls required yet.

**Tests:** dependency install; build; lint/typecheck; route smoke; reach deployed Preview; wrong chain/write safety check.

**Acceptance criteria:** exact stable Preview URL delivered; deployed commit recorded; all routes navigate; unfinished actions visibly marked; preview exclusively testnet; no secrets in repo or bundle; no fictitious live data.

**Verification procedure:** open URL in fresh browser; navigate every route; inspect mobile width; check browser console; inspect Vercel deployment commit; search repository for secret literals.

**Git checkpoint:** `chore: establish arc studio app shell and preview`.

**STOP report:** exact URL, deployed commit, screenshots/notes, build/tests, current placeholders, known blockers, one next task.

## Phase 2 — Chain/wallet and contract foundation

**Objective:** establish fixed Arc wallet/network configuration and contract development/testing foundation.

**Dependencies:** Phase 1 accepted.

**Tasks**
1. Add typed chain configuration for Arc Testnet (5042002) and Arc Mainnet (5042); use official Arc docs and `viem/chains` when supported.
2. Validate all public config at startup. Preview must fail closed if set to mainnet; Production must not be enabled without verified contract address and operator authorization.
3. Add wallet connect/disconnect and wrong-chain guard; make all contract write controls unavailable unless configured network and wallet chain match.
4. Start `PipelineCoordinator.sol` from architecture spec with constructor-set immutable USDC interface. Keep contract source/iterations/tests in Arc Studio.
5. Add contract views, enums and typed ABI wiring needed to consume the contract. Do not invent different semantics to fit a scaffold.
6. Add local deployment/test workflow only if compatible with exported Arc Studio source. Pin compiler/dependencies in lockfile; resolve and document source/ABI parity.
7. Verify token address against official Arc docs; don't deploy mainnet or send real money.

**Files/components:** `src/lib/chain.ts`, wallet/network components, contract source/types/ABI, Arc Studio contract tests, `docs/DECISIONS.md`.

**Data/API:** no database or REST API; views are public contract calls.

**Tests:** environment validation, Arc/Arc Testnet IDs/RPC links, wrong-chain write blocking, contract compile, USDC address constant/config checks.

**Acceptance:** user can connect wallet and see correct network state; wrong chain blocks writes; no secret in client; contract compiles in Arc Studio; contract/test setup is reproducible.

**Verification:** test deployed Preview and record new URL/commit. Confirm no production config is used by Preview.

**Git checkpoint:** `feat: add arc wallet and contract foundation`.

**STOP report:** changes, tests, preview URL/commit, Studio project URL (only if real), unknown compatibility items, next task.

## Phase 3 — Core domain contract + mainnet feasibility gate

**Objective:** implement and validate the entire on-chain lifecycle.

**Dependencies:** Phase 2 accepted.

**Tasks**
1. Implement pipeline and stage records, immutable ordered stage inputs, max ten stages, unique providers, budget/duration/text constraints, and user indexes.
2. Implement exact `transferFrom` funding, first-stage activation, `StageHired` event.
3. Implement provider submit with URI checks and 24-hour evaluation deadline.
4. Implement approval with exact payout and atomic activation of next stage, plus final completion.
5. Implement client rejection and permissionless eligible expiration, each with exact remaining escrow refund.
6. Add all views/events and custom errors documented in `ARCHITECTURE.md`.
7. Write and run tests in Arc Studio for success, invalid input, roles, timing, replay, payout/refund accounting, and transaction/event atomicity.
8. Export the tested source and verify exported compiler/source/dependency parity; prepare but do not run mainnet deploy until authorized.
9. Complete full testnet flow. Record contract address and actual testnet tx hashes.

**Files/components:** contract source and tests; deploy config/script; `docs/CONTRACT_INTERFACE.md`; security test matrix.

**Data/API:** all persisted domain state on-chain; no backend API/database.

**Tests:** tests from Sections 21 of `MASTER_BLUEPRINT.md` and 7–8 of `ARCHITECTURE.md`; full testnet create-submit-approve-next-submit-approve-final-complete; rejection refund; deadline expiry refund.

**Acceptance:** no known critical authorization/accounting failure; all unit tests pass; one approval transaction proves current payout and next `StageHired` activation atomically on testnet; rejection/expiry refund exactly; source export matches tested artifact.

**Mainnet feasibility gate:** if the operator explicitly authorizes it, deploy tested source to mainnet and demonstrate a small real USDC transfer within the first 24–48 hours. If not authorized, stop before any mainnet deployment or transaction. If this proof is blocked, cut optional extras and focus on diagnosing the minimal contract path; do not bypass authorization.

**Verification:** inspect testnet receipt/logs; compare before/after balances; verify source and constructor argument; record URL/commit/contract/test hashes.

**Git checkpoint:** `feat: implement sequential escrow and milestone hiring`.

**STOP report:** test evidence, testnet address/hash, export parity, mainnet gate status, blocker, one next task.

## Phase 4 — Functional frontend integration

**Objective:** connect the temporary UI to the verified testnet contract.

**Dependencies:** Phase 3 accepted.

**Tasks**
1. Implement exact allowance flow and create/fund form with integer arithmetic.
2. Implement pipeline list and detail reads through contract user indexes/views.
3. Connect provider submission and public URI display; never fetch user URI automatically.
4. Connect client approve/reject, with recipient/amount and irreversible-action confirmation.
5. Connect eligible expire action; show fixed recipient and reason deadline elapsed.
6. Implement transaction status, event decoding, explorer links, known custom-error mapping, pending states, stale reads and safe retry behavior.
7. Update deployed Preview after each small accepted task; verify commits/URLs at checkpoints.

**Files/components:** pipeline features, form components, `src/lib/amounts.ts`, transaction/error components, tests.

**Data/API:** no server API or database.

**Tests:** component/unit tests; testnet integration for allowance/create, submit, approve/release/next hire, reject/refund, expiry/refund.

**Acceptance:** exact contract state reflected after refresh; no fake transaction success; stage role/status restrictions consistent; approve and hire share one receipt; Preview stays on testnet.

**Verification:** run create → submit → approve → next hire → final completion on deployed Preview; record real testnet tx hashes.

**Git checkpoint:** `feat: connect pipeline journeys to arc testnet`.

## Phase 5 — End-to-end functionality completion gate

**Objective:** finish essential flows/edge states and prove functionality before final visual design.

**Dependencies:** Phase 4 accepted.

**Tasks**
1. Finish loading, empty, wrong-network, insufficient-funds, validation, wallet-cancelled, reverted, stale, terminal and not-found states.
2. Verify refund and expired states and exact amount reconciliation.
3. Test duplicate creation retry behavior after ambiguous RPC results; never auto-resubmit.
4. Review direct contract calls for unauthorized/wrong-index/duplicate attempts.
5. Verify public data warning, safe URI link-out, responsive behavior in the plain UI, and route correctness.
6. Complete E2E and regression tests on the deployed Preview; document any unresolved blocker.
7. Present the operator a walkthrough with exact URL, commit, results, limitations and evidence.

**Files/components:** E2E suite, edge-state UI, docs, acceptance report.

**Tests:** 10 core E2E gates from `PROJECT_SPEC.md`, plus contract/security regression.

**Acceptance:** all critical journeys pass on deployed testnet Preview, or an explicit exception is approved by operator and recorded. No known critical functional defect. Do not begin final visual design if the gate is not accepted.

**Git checkpoint:** `test: verify core pipeline journeys end to end`.

**STOP report:** walkthrough and proof, preview/commit, test list/results, known issues, single next task.

## Phase 6 — Reference collection, mockups and design review

**Objective:** define the final visual direction through an operator-controlled process only after the functionality gate.

**Dependencies:** Phase 5 accepted.

**Tasks**
1. Ask operator for design references or written direction. If none exist, present 2–3 grounded candidate references and wait for selection.
2. Record which properties are borrowed (hierarchy, density, transaction feedback, typography mood) and what must remain original.
3. Create mockups/prototypes for Home, Create, My Pipelines, Pipeline Detail Active/Submitted/Completed/Rejected, and key mobile layouts. Include empty/error/wrong-network views.
4. Present the mockups, collect feedback, revise and preserve versions.
5. Update `docs/DESIGN_DECISIONS.md` with approved references/mockups and intentional deviations.

**Files/components:** mockup/prototype assets and design decision record; no production styling change.

**Tests:** verify mockups cover the defined route/state inventory and don't imply unimplemented behavior.

**Acceptance:** operator has seen and responded to mockups; direction is not yet considered approved until explicit approval is received.

**Git checkpoint:** `docs: add reference-informed ui mockups`.

### Explicit operator approval gate — mandatory STOP

Present the latest mockups and request explicit approval. Do not implement final colors, typography, layouts, component styling, or animations without approval. Record the operator's approval and date. Silence is not approval. No agent may continue to Phase 7 automatically.

## Phase 7 — Implement approved final UI

**Objective:** apply the approved aesthetic to already-working screens.

**Dependencies:** explicit approval in `docs/DESIGN_DECISIONS.md` and `AI_HANDOFF.md`.

**Tasks:** implement design tokens/components/styles, maintain existing behavior, retest responsive and transaction states, document any approved intentional deviations. If design feedback requires a product or architecture change, stop and seek separate approval.

**Files/components:** tokens, components, route styling, design docs.

**Database/API/contract:** no changes permitted.

**Tests:** component tests, full E2E regression, desktop/mobile comparison against mockups.

**Acceptance:** approved direction is reflected without changing business logic, contract interface, state machine, or security model.

**Git checkpoint:** `feat: implement approved relaycrew visual system`.

## Phase 8 — Frontend and documentation completeness

**Objective:** finish product shell, docs, link integrity, accessibility, responsive behavior and release-facing polish.

**Dependencies:** Phase 7 accepted; actual public GitHub repository URL verified.

**Tasks**
1. Finish all agreed routes, navigation/footer, `/docs`, `/risk`, metadata, favicon/app icon, not-found, loading/empty/validation/success/error/permission-denied/terminal states.
2. Test links and all interactive controls; remove inert buttons, `href="#"`, dead routes and placeholder claims.
3. Verify responsive layout and accessibility basics: labels, semantics, keyboard access, focus, contrast, useful errors and status announcements.
4. Complete `README.md`, `docs/USER_GUIDE.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/CONTRACT_INTERFACE.md`, `docs/REQUIREMENT_MATRIX.md`, `docs/DECISIONS.md`, `docs/SOURCES.md`, `docs/DESIGN_DECISIONS.md`.
5. Footer Documentation link must resolve to `/docs`; GitHub link must be the actual public repository URL. If public source is no longer appropriate, stop for operator approval and record reason/alternative; never expose private source silently or fabricate URL.
6. Re-run test suite on the deployed Preview and update AI handoff.

**Acceptance:** no dead links, inert controls, fabricated URLs, unexplained placeholders or missing applicable states; docs setup/test/deploy/troubleshooting information is usable; real Docs/GitHub destinations verified on preview.

**Git checkpoint:** `docs: complete operator docs and frontend release checklist`.

## Phase 9 — Final regression, security, production release and monitoring

**Objective:** deploy and demonstrate the mainnet product only when explicitly authorized.

**Dependencies:** Phases 1–8 accepted; exact deployment artifacts verified; operator approval for production/mainnet action.

**Tasks**
1. Reverify official Arc network/token config and hackathon deadline/artifacts.
2. Review compiler warnings, dependency versions, contract tests, role/state/accounting invariants, environment/secret scan.
3. Export exact contract source from Arc Studio, confirm source/ABI/compiler parity, manually deploy to Arc Mainnet using local-only deploy credentials.
4. Record deployment transaction, contract address, constructor args, compiler/dependency lock and Arc Studio project URL.
5. Set Vercel Production values for chain 5042 and the verified contract address. Production is not promoted until authorized.
6. Execute a deliberately low-value full pipeline with controlled/consenting provider wallets; verify USDC transfers, stage events and balance accounting on official Explorer.
7. Smoke-test production routes, wallet connection, network guard, explorer links, Docs/GitHub footer links, responsive behavior and terminal states.
8. Record contract address and real example tx hashes; capture video showing Arc Studio build and real mainnet transaction; verify public repo and builder profile URL.

**Acceptance:** app is live on Arc Mainnet; real USDC moved through the app/contract; required artifacts are real and public; no secret leak; production URL smoke-tested; operator approves final submission.

**Git checkpoint:** `release: arc mainnet demo and submission evidence`.

**STOP report:** actual production URL, contract address, tx hashes, repo URL, Studio URL, commit, all tests/evidence, known risks and submission readiness.

## Checkpoint report template (required after every phase)

```text
Phase:
Objective / result:
Preview URL:
Deployed commit:
Repository commit:
Visible UI changes:
Complete:
Incomplete:
Tests/commands run and exact results:
On-chain addresses/transaction hashes (if any):
Security/deployment safety status:
Design references/mockups and approval status:
Documentation and footer-link status:
Known issues/blockers:
Single next task:
Operator decision required:
```

## Scheduling guidance for the short deadline

**Deadline is not yet resolved:** the prior handoff says 2026-11-02 04:59 UTC. The Eventbrite listing for the organizer's event displays a noon-to-12:59 PM Pacific window on Nov 1 but labels it PDT even though US Pacific daylight time ends at 2:00 AM that date; the time-zone interpretation may differ by one hour. The official form must be checked directly; plan for the earlier **2026-11-01 20:59 WAT** cutoff until verified.

Prioritize skeletal Preview, contract correctness, testnet evidence and an operator-authorized low-value mainnet proof first. If a mainnet release is authorized, target it as soon as the testnet contract path passes rather than postponing until UI polish. Final visual design remains after E2E functionality and must include the explicit mockup approval stop. If the schedule tightens, cut NICE TO HAVE items, not required on-chain proof, safety gates, core tests, documentation, or truthful submission evidence.


## Mandatory per-phase field matrix

The detailed phase sections above define objective, dependencies, tasks, expected files/components, tests, acceptance, verification and Git checkpoint. This matrix makes explicit the database/API/UI changes for every phase.

| Phase | Database changes | API/contract changes | UI changes | Tests required before stop | Acceptance/evidence | Verification and checkpoint |
|---|---|---|---|---|---|---|
| 1 — Shell + Preview | None | None; all transaction controls disabled | Routes, nav/footer, labeled placeholders, testnet-only shell | Install/build/lint/typecheck/routes/deployed URL | Exact Preview URL + deployed commit; no fake/live writes | Inspect deployed URL/console; commit `chore: establish arc studio app shell and preview` |
| 2 — Chain foundation | None | Typed read/write interface setup; contract scaffold only | Wallet, chain badge, wrong-chain guard | Config validation, chain ID, contract compilation | Wrong chain fails closed; Arc Studio can compile contract | Inspect preview/config; commit `feat: add arc wallet and contract foundation` |
| 3 — Core contract | Contract storage only; no external DB | Full contract reads/writes/events and refunds | Temporary contract-status display only | Contract unit/integration tests and full testnet lifecycle | Payout + next hire atomic; rejection/expiry exact; exported source parity | Verify testnet receipt/events; mainnet only if separately authorized; commit `feat: implement sequential escrow and milestone hiring` |
| 4 — Functional UI | None | Connect all specified reads/writes; no REST API | Create/list/detail/submit/approve/reject/expire and transaction state | Unit + testnet integration tests | Live chain-backed journeys and safe retries | Full deployed testnet flow; commit `feat: connect pipeline journeys to arc testnet` |
| 5 — E2E gate | None | No scope expansion; verify only | Finish edge states in temporary design | Required E2E, security and regression suite | Core journeys pass or operator-approved exception recorded | Operator walkthrough + preview/commit evidence; commit `test: verify core pipeline journeys end to end` |
| 6 — Mockups | None | None | Mockups only; do not change working app visuals | Route/state coverage review | References and revised mockups presented; approval still pending | Save mockups/notes; commit `docs: add reference-informed ui mockups` |
| Approval gate | None | None | No final styling until explicit operator approval | No code test; approval record check | Explicit approval recorded with version/date | STOP; update handoff, no phase-7 commit before approval |
| 7 — Final UI | None | None; contract/behavior frozen | Apply approved visual system and responsive patterns | Component/E2E regression and visual checks | Approved mockups reflected without logic change | Preview comparison; commit `feat: implement approved relaycrew visual system` |
| 8 — Completeness/docs | None | None | Finish routes/states, metadata, docs/footer/accessibility | Link audit, responsive/accessibility, all E2E tests | Real `/docs`, real public GitHub link, no dead/inert controls | Test deployed Preview/links; commit `docs: complete operator docs and frontend release checklist` |
| 9 — Production release | On-chain production contract only; no off-chain DB | Deploy verified source; use mainnet ABI/address | Production env and release states | Full regression, security review, mainnet smoke test after authorization | Real USDC and events verified, public repo/Studio/app URLs real | Explorer and production smoke check; commit `release: arc mainnet demo and submission evidence` |
