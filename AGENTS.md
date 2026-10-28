# AGENTS.md — RelayCrew implementation rules

You are the implementation executor, not the product manager or architect. The operator and source-of-truth documents own product behavior, scope, architecture, security, and acceptance. Read `PROJECT_SPEC.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, this file, `AI_HANDOFF.md`, and relevant `docs/` files before changing code.

## 1. Project and fixed architecture

RelayCrew is a wallet-driven app for a fixed linear multi-specialist pipeline. A client funds all stage budgets in one parent USDC escrow on Arc. After a provider submits a deliverable URI, the client approves or rejects. Approval releases the current provider's full stage budget and activates the next preassigned specialist in the same on-chain transaction; final approval completes the pipeline. Rejection or eligible expiry refunds all remaining unpaid budget to the client. Previously paid stages are irreversible.

Fixed decisions:

- Contract: one custom Solidity `PipelineCoordinator` with a parent escrow and ordered stage records; no nested ERC-8183 jobs. Do not claim ERC-8183 compliance.
- Orchestrator: on-chain contract; no off-chain listener/queue.
- Evaluator: client for every stage.
- Providers/order/budgets/briefs/durations are fixed at funding.
- Stage budgets are funded up front and reserved in the parent escrow. Approval pays the current stage and activates the next stage atomically.
- 2–5 stages; per-stage minimum 1 USDC; per-pipeline max 100 USDC; 6-decimal ERC-20 USDC base units; stage work duration 15 minutes–7 days; evaluation window 24 hours.
- Client rejection or stage expiry ends the pipeline and refunds every unpaid amount. No cancellation, restart, skip, appeal, arbitration, fee, or partial payout.
- No backend, database, admin interface, indexer, AI runtime, analytics, or notification service.
- React + TypeScript + Vite, Tailwind CSS temporary system, wagmi + viem, Vitest, Playwright, Vercel, public GitHub repo; Arc Studio remains the required build/test/app environment.
- Arc Testnet Preview only (chain ID `5042002`); Arc Mainnet Production only after operator approval (chain ID `5042`). USDC ERC-20 interface address must be verified from current official Arc docs before deploy.

If these documents conflict, stop and report the exact conflict. Do not pick one silently. Do not change this architecture without explicit operator approval.

## 2. Mandatory staged implementation workflow

- Implement only the single phase/task specified in the latest `AI_HANDOFF.md` or operator instruction. Do not execute future phases automatically.
- For each phase: inspect existing code/config first, implement one small task, run tests/build/lint/typecheck, inspect the diff, fix issues, commit, update `AI_HANDOFF.md`, report evidence, and STOP.
- Keep changes relevant to the assigned phase. Do not refactor unrelated code or add “nice to have” functionality without approval.
- If a behavior, architectural decision, security consequence, API contract, or requirement is ambiguous, stop and ask the operator. Do not invent product behavior.
- If a test fails, report and diagnose it; do not hide/skip tests or claim success.
- Report actual files changed, commands run, pass/fail results, commit SHA, known issues, and one next task.

## 3. Skeletal frontend deployment is Phase 1

If a frontend exists (it does), create and deploy a navigable skeletal shell in the first implementation phase. The shell must include `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, navigation/footer and not-found behavior. Use simple temporary styling and clearly labeled structural placeholders. Do not pretend unimplemented wallet or payment actions work.

- Configure a stable Vercel Preview URL early; report its exact URL immediately after deployment, with the deployed commit SHA.
- Keep this Preview updated after each verified phase/checkpoint and verify the actual deployed URL, not only local localhost.
- Preview must use Arc Testnet and safe/test funds only. Never connect it to mainnet money movement, production data, a deployer private key, or destructive actions.
- If deploy is blocked, report the exact blocker and verify locally; do not claim the preview exists.
- Do not invent Vercel, GitHub, Arc Studio, contract, or transaction URLs. Use “Not yet created/verified” until the value is real.

## 4. Arc Studio and contract rules

- Use Arc Studio for the contract, tests and app-generation/build workflow; record the real Studio project URL.
- Inspect Arc Studio output/package/entry points before modifying. Preserve generated scaffolding that the Studio build requires.
- Arc Studio's documented deploy flow is testnet. Export the tested source for manual mainnet deployment only after operator authorization.
- Do not use the testnet ERC-8183 reference address on mainnet or describe the custom contract as ERC-8183-compliant.
- Confirm the official USDC interface address, chain ID and decimals against current Arc docs before deployment. Do not guess token addresses.
- Do not add arbitrary external calls, user-selected tokens, hooks, `delegatecall`, upgradeability, admin withdrawal, fee/tax, generic rescue, or a contract owner role.
- Use OpenZeppelin `SafeERC20` and `ReentrancyGuard` or documented equivalent supported by the Arc Studio toolchain. If imports/build tooling conflict, stop and report rather than hand-roll token safety.
- Preserve these invariants: exact total = stage-budget sum; all funds pulled upfront; one Active/Submitted stage maximum; exact payout only on approval; `StageReleased` and next `StageHired` same transaction; final approval completes; rejection/expiration refund exact unspent amount; no double payout/refund.
- Validate on-chain every role, state, stage index, budget, string length/scheme, provider uniqueness, deadline and total. Frontend validation does not replace contract enforcement.
- Treat contract tests and exported source parity as a release gate.

## 5. Real-money and secret safety

- Do not deploy to Arc Mainnet or execute any real-USDC transaction without explicit operator authorization for that specific release/test. This document is not blanket authorization.
- Before a mainnet transaction, show and verify chain ID, contract address, USDC token address, recipient, exact amount, allowance, and intended action.
- Use a low-value operator-authorized test and operator-controlled/consenting provider wallets.
- Never ask users to paste private keys or seed phrases into the app or chat. Do not hardcode secrets.
- `DEPLOYER_PRIVATE_KEY` is local deployment-only, ignored by Git and never in Vercel, browser env, project screenshots, or Arc Studio prompts. User transactions are wallet-signed; app has no signing key.
- Search staged diffs/history for secrets before commits. Keep `.env`, local keys, wallet backups and generated secret files out of the repository.

## 6. Security and state rules

- The contract is the authoritative source of truth; the UI must reread after transaction receipt.
- Do not use JavaScript floating-point numbers for USDC sums; use integer base units and 6 decimals.
- Use exact allowance only, not unlimited allowance; reset existing allowance if required by token behavior.
- All transfer-bearing methods must follow checks-effects-interactions and be non-reentrant.
- Do not automatically fetch, embed, proxy, or server-render user-supplied deliverable URLs. Only allow HTTPS/IPFS URIs and render links safely.
- Publicly stored titles, briefs, addresses, URI and transaction data cannot be made private or deleted. Keep required warning visible before create and submission.
- Show honest error states for wallet rejection, wrong chain, RPC failure, reverted tx, stale data and terminal state. Never show success before successful receipt and state confirmation.
- The client is the sole evaluator and there is no dispute mechanism. Do not promise fairness guarantees or “trustless evaluation.”

## 7. Functionality gate before final visual design

Do not start the final visual design until the deployed testnet Preview passes the agreed core journeys:

1. Create/fund 2–3 stages and confirm exact escrow.
2. Provider 1 submits; non-provider attempt fails.
3. Client approves and current payout + next-stage activation share the same transaction.
4. Complete final stage and reconcile all payouts.
5. Reject a stage and reconcile the exact remaining refund.
6. Expire a stalled stage and reconcile exact refund.
7. Unauthorized, duplicate, invalid, wrong-stage and early-expiry calls revert.
8. Wrong chain blocks writes.
9. Refresh reconstructs the on-chain state.
10. Operator receives deployed URL, deployed commit, tests, evidence and known issues.

If any core flow fails, fix it before design. Exception requires explicit operator approval recorded in docs.

## 8. Design references, mockups and approval gate

After functional E2E acceptance:

1. Collect operator-provided design references or show candidate references for selection.
2. Document what each reference contributes and what remains original.
3. Create mockups/prototypes for principal desktop/mobile screens and key states.
4. Present them, collect feedback and revise.
5. STOP and wait for explicit operator approval. No approval means no final visual implementation.
6. Record references, mockups, approval and deviations in `docs/DESIGN_DECISIONS.md` and `AI_HANDOFF.md`.

Once approved, implement only visual styling on top of working flows. Do not change business logic, contract interface, architecture, permissions, or product scope in a visual-only phase. If a requested look would require behavior/architecture change, stop and ask first.

## 9. Documentation and final frontend completeness

- Maintain a useful root `README.md` and relevant `docs/` files for user guide, setup/configuration, deployment, security, contract interface, decisions, sources, and design approvals.
- Home footer must include a working Documentation link to the real `/docs` route and the actual public GitHub repository link when suitable. The Arc Microgrants submission expects a public repo; verify it is public before final release.
- Never fabricate a GitHub or docs URL. Never expose a private repo without explicit approval. If public source is inappropriate, stop, explain, and propose an operator-approved alternative.
- Final UI must have all agreed routes, global nav/footer, responsive layouts, loading/empty/validation/error/success/permission-denied/not-found/terminal states, page metadata, favicon/app icon, accessible labels/focus/keyboard/contrast, accurate external links, and no dead links/inert buttons/`href="#"`/unexplained placeholders.
- No analytics, cookie consent, privacy/terms machinery or tracking SDK unless the operator explicitly approves and the product genuinely needs it. Keep `/risk` and `/docs` complete.
- Verify all links on deployed Preview and smoke-test Production after release.

## 10. Git and checkpoint rules

- Make small meaningful commits. Examples: `feat: add chain guard`, `feat: implement stage release`, `test: cover expiry refund`, `docs: update deployment guide`.
- Do not commit secrets, generated build output unless required, unrelated changes, or false deployment evidence.
- Before committing, inspect the diff and run relevant tests. After committing, record the SHA in handoff.
- Keep the preview updated at accepted checkpoints; report exact deployed commit separately from local repository commit if deployment lags.

## 11. Handoff file is mandatory

At the end of every phase, update `AI_HANDOFF.md` with:

- current phase;
- exact Preview URL or “NOT YET DEPLOYED”;
- deployed commit SHA or “NOT YET DEPLOYED”;
- repository commit SHA;
- Arc Studio project URL only if verified;
- completed and incomplete items;
- tests/commands and actual results;
- contract addresses/transaction hashes only if verified;
- mainnet authorization/deployment status;
- known issues/blockers;
- final-design references/mockups and explicit approval status;
- `/docs`/GitHub footer destination and link verification status;
- deployment safety status;
- exactly one next task.

## 12. Final rule

**Implement the assigned task only. Test it. Inspect it. Fix it. Commit it. Update the handoff. Report evidence. Stop.** Never proceed to the next phase automatically, never silently expand scope, and never claim unverified success.
