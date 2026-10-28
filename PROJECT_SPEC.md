# PROJECT_SPEC.md — RelayCrew

**Status:** Approved design baseline for implementation planning; mainnet actions and final visual design are not approved by this document.  
**Working product name:** RelayCrew.  
**Product concept:** Milestone Team Pipeline.  
**Last updated:** 2026-10-28.

## 1. Product overview

RelayCrew lets a client fund one Arc USDC escrow for a fixed linear sequence of specialist stages. Each provider submits a public deliverable reference. The client evaluates each stage. When the client approves a stage, the contract pays the completed specialist and, in the same on-chain transaction, activates the next preassigned specialist. The final approval pays the final provider and completes the pipeline.

RelayCrew is an on-chain settlement coordinator, not an agent marketplace or runtime. “Specialist agent” is a wallet address controlled by software or a human operator. The app does not execute AI agents, find providers, verify their identity, or judge the quality of their work.

### Problem and current workaround

Multi-step tasks need an ordered series of specialists, but clients typically coordinate handoffs and payments manually using chat, spreadsheets, separate contracts, and payment tools. A single escrow can settle a task, but normally the client must manually create/coordinate the next job. RelayCrew demonstrates an on-chain milestone-release → next-hire activation chain.

### Target users

- Client/pipeline creator: funds the whole task and evaluates every stage.
- Specialist provider: assigned to one stage and receives payment when approved.
- Public observer: can inspect public state and transaction evidence without signing in.

### Core value/differentiator

One parent-funded budget; immutable stage order, provider addresses, and budgets; one active stage at a time; exact on-chain USDC settlement; a milestone approval that pays the current provider and activates the next provider in the same transaction; public, explorer-verifiable proof.

### Primary use case

Researcher → Analyst → Writer, with a client funding all three budgets in advance. Each client approval pays the current provider and activates the next specialist. Final approval completes the pipeline.

## 2. Product boundaries

### Included

- 2–5 fixed sequential stages.
- Distinct, preassigned provider wallet per stage.
- Client acts as evaluator for every stage.
- Full budget funded upfront in Arc USDC ERC-20 interface.
- Stage submission via public HTTPS/IPFS URI.
- Full payout on approval, all unpaid funds refunded on rejection/expiration.
- Stage deadline and fixed 24-hour evaluation window.
- Public on-chain state and wallet-centric pipeline history.
- Arc Studio workflow, testnet preview, Vercel hosting, public GitHub repo, repo docs, explorer evidence.

### Explicitly not included

Marketplace/discovery, ratings/reputation, dynamic hiring, parallel or DAG topology, skipped stages, backup agents, bids/auctions, partial payout, quality-weighted payment, escrow disputes, arbiters, holdbacks, slashing, AI execution/evaluation, x402, ERC-8004, child ERC-8183 jobs, fiat ramps, cross-chain transfers, multiple tokens, platform fees, notifications, email, user profiles, passwords, database, API server, admin interface, analytics, or mobile app.

## 3. MVP limits

- At least 2 and at most 5 stages.
- Each stage budget ≥ 1 USDC.
- Total budget ≤ 100 USDC per pipeline for this experimental implementation.
- Amounts use six-decimal USDC ERC-20 base units; do not use floating-point arithmetic.
- Each stage duration is 900–604800 seconds (15 minutes to 7 days) from activation.
- Evaluation deadline is 24 hours after submission.
- No platform fee.
- Provider addresses must be nonzero, unique per pipeline, and not equal to the client.
- All stage data and submitted URI are public and permanent on-chain. Do not enter secrets, private files, personal information, or confidential task instructions.

## 4. Roles and permissions

| Role | Allowed | Not allowed |
|---|---|---|
| Client | Create/fund; approve/reject current stage; view own pipelines | Change terms after funding; arbitrarily withdraw; reverse completed payout |
| Provider | View assigned pipelines; submit its own current stage | Submit for another provider; approve/reject; edit pipeline terms |
| Evaluator | Same address as client for every stage; approve/reject | Third-party arbitration or policy overrides |
| Public observer | Read on-chain state | Change state, except anyone may call eligible expiration; cannot choose refund recipient |
| Deployer/operator | Deploy and configure the app before release | No special admin powers, withdrawal function, upgrade key, or ability to override stage state after deployment |

Contract authorization is authoritative. UI visibility alone is never a security control.

## 5. Core user flows

### 5.1 Browse/connect

1. Public pages render without a wallet. Live state is only shown when read from the configured contract.
2. User connects EVM wallet; app reads address and chain.
3. If wrong chain, show the expected Arc network and disable writes.
4. Fetch IDs through `getUserPipelineIds(address)`, then summaries and stages.
5. Refresh state after transaction receipts and on explicit refresh; cache is non-authoritative.

### 5.2 Create/fund

1. Client enters 2–5 ordered stages with provider, title, public brief, budget, duration.
2. Frontend validates provider uniqueness/address format, title/brief length, budget limits, duration bounds, and sum using integer base units.
3. Show public/permanent data warning, total budget, each provider address, and each stage allocation.
4. Request exact USDC allowance for the total. Never request unlimited allowance. If needed, reset prior allowance to zero first.
5. After allowance receipt, call `createPipeline(stages)`.
6. Contract revalidates, computes total, pulls exact funds, creates stage 1 Active and remaining stages Queued, and emits creation/hire events.
7. Wait for receipt, reread state, and navigate to detail. Never show success solely because wallet submitted.

### 5.3 Submit work

1. Current provider views its active stage and deadline.
2. Provider supplies a public `https://` or `ipfs://` URI, acknowledging that it will be public.
3. `submitStage(id,index,uri)` verifies current provider/stage/deadline/scheme/length, stores URI, and sets Submitted plus a 24-hour evaluation deadline.
4. UI refreshes after receipt and shows the persisted URI/deadline.

### 5.4 Approve and activate next hire

1. Client reviews the submitted URI and sees the current payout plus next provider/budget.
2. Client explicitly confirms an irreversible payout.
3. `approveStage(id,index)` validates client/current stage/status/evaluation deadline, marks current stage Paid, transfers exact budget to current provider, and activates the next stage in the same transaction. Final approval completes the pipeline instead.
4. UI verifies release/hire events in the receipt and rereads the contract.

### 5.5 Reject

1. Client confirms rejection of the current Active or Submitted stage.
2. Contract ends the pipeline and returns all unspent escrow to client. The rejected stage is unpaid; previously completed payouts are final.
3. No restart, appeal, or dispute flow exists in MVP.

### 5.6 Expire

1. If an Active stage misses its work deadline, or a Submitted stage misses its 24-hour evaluation deadline, anyone may call `expirePipeline(id)`.
2. Contract marks the current stage/pipeline Expired and refunds all remaining escrow to the client.
3. Caller does not receive funds; terminal status prevents a second refund.

## 6. Functional requirements

### FR-01 Network and contract configuration

- Preview must use Arc Testnet chain ID `5042002`; production must use Arc Mainnet `5042`.
- Wrong-chain writes are disabled. Missing/invalid configuration fails closed; no sample values are presented as live data.
- USDC ERC-20 interface must match the official Arc address at deployment time.

### FR-02 Wallet

- Public reads require no connected wallet.
- Wallet connection supports the generated Arc Studio setup and an injected EVM wallet.
- Write transactions are signed by the user wallet. No app private key exists.

### FR-03 Create/fund

- 2–5 unique nonzero providers, each different from client.
- Title 1–64 bytes, brief 1–240 bytes.
- Each stage ≥ 1 USDC, total ≤ 100 USDC.
- Duration 900–604800 seconds.
- Contract computes exact total and calls `transferFrom` for that exact amount.
- Initial stage Active, others Queued; user index includes client and all providers.

### FR-04 Submit

- Only current provider; only current Active stage; only before work deadline; once.
- URI 9–256 bytes and begins `https://` or `ipfs://`.
- Submission stores URI, status, submission time, and 24-hour evaluation deadline.

### FR-05 Approve/release

- Only client can approve current Submitted stage before evaluation deadline.
- Full stage budget transferred to provider with no fee.
- Next stage activates in same transaction unless final; final approval sets Completed.
- Failed payout reverts payout and activation together.

### FR-06 Reject/refund

- Client can reject current Active or Submitted stage before relevant deadline.
- Pipeline becomes Rejected; all unpaid funds return to client; previous payouts remain final.

### FR-07 Expire/refund

- Anyone may trigger only after the relevant deadline.
- Pipeline becomes Expired; all remaining funds return to client.

### FR-08 Read history

- Public contract view functions expose pipeline summaries/stages.
- Connected wallet list includes pipelines where it is client or assigned provider.
- After refresh, UI state is reconstructed from chain.

### FR-09 Transaction history

- Only real hashes/receipts are linked to explorer.
- Success UI requires successful receipt plus confirming state read.
- No fake transactions, fabricated balances, or false mainnet labels.

### FR-10 Final frontend completeness

- Routes: `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, not-found.
- Footer links to real `/docs` and actual public GitHub repo URL after verified. Never guess URLs or expose a private repo.
- Responsive layouts, keyboard accessibility, metadata, favicon, all action/status/error states and working links are acceptance criteria.

Detailed actor/precondition/input/processing/output/permission/validation/error/edge-case/acceptance records are also maintained in [`docs/REQUIREMENT_MATRIX.md`](docs/REQUIREMENT_MATRIX.md).

## 7. Business rules and states

### Pipeline states

- `Active`: one stage is Active or Submitted.
- `Completed`: all stages Paid; `paidOut == totalBudget`; no refund.
- `Rejected`: client rejected a current stage; unspent budget refunded.
- `Expired`: eligible deadline elapsed and expiration executed; unspent budget refunded.

### Stage states

`Queued`, `Active`, `Submitted`, `Paid`, `Rejected`, `Expired`.

### Invariants

1. One stage is active/submitted at a time.
2. Stage order, provider, title, brief, budget, and duration are immutable after funding.
3. `totalBudget = sum(stage budgets)`.
4. `paidOut = sum(budgets of Paid stages)`.
5. `remainingEscrow = totalBudget - paidOut - refundedAmount`.
6. Completed requires all stage budgets paid and zero refund.
7. Rejected/Expired refunds exact remaining amount and is terminal.
8. Client's approval pays current provider and starts next stage in the same successful transaction.
9. No fee and no partial payout.
10. EVM contract and exact transaction receipt are authoritative over UI caches.

### Deadline rules

- Stage work deadline begins when the stage becomes Active.
- Provider must submit before `dueAt`.
- Evaluation deadline begins at submission and ends 24 hours later.
- Client may approve/reject before that deadline.
- Anyone may expire an unsubmitted Active stage at/after `dueAt`, or an unreviewed Submitted stage at/after `evaluationDeadline`.
- No extensions or deadline resets other than a new stage's initial activation time.

### Rejection/refund accounting

On rejection/expiration, the current stage is unpaid and all remaining stage allocations are returned to client. Amount already paid to previous providers is final. No cancellation, restart, skip, dispute, or rollback of payouts.

## 8. UI screen specification

### Home `/`

Purpose: explain product and main CTA. Public access. Contains “How it works,” exact network mode badge, Create and Docs links, product limitations, footer. No fabricated stats/activity. Loading/error only where live config/state is involved. Responsive, semantic headings, visible focus.

### Create `/create`

Connected wallet and correct chain required for writes. Ordered stage builder (2–5), provider, title, brief, budget, duration, sum breakdown, public-data warning, exact allowance action and funding action. Loading/wallet-prompt/pending/success/failure/wrong-network/insufficient-funds/validation states required. Buttons reflect form/role state and always have behavior. After funding, route to details.

### My Pipelines `/pipelines`

Reads current wallet's pipeline IDs and shows client/provider role, status, current stage, total, paid, remaining, timestamps/deadline. Disconnected/loading/empty/populated/error/stale states. No browse/search marketplace.

### Pipeline Detail `/pipelines/:id`

Public summary, sequential stage timeline, provider addresses, stage title/brief, fixed budget, status, deadline, deliverable URI, real transaction/explorer links, and role-authorized actions. Show clear confirmation dialog for approve/reject/expire and pending state. Unknown ID gets not-found. Each terminal state has no write controls except read/explorer.

### Docs `/docs`

Actual user-facing documentation: what the app does, step-by-step use, stage lifecycle, amount/deadline/refund rules, Arc testnet versus mainnet, public data, transaction links, known limitations, real GitHub URL when configured, Arc Studio project URL only when verified.

### Risk `/risk`

Experimental and unaudited contract notice; USDC transfers are irreversible; no dispute mechanism; client is evaluator; evaluator non-response causes expiry/refund; public data; no AI agent execution; low-value testing warning; no claims of audited/production-grade security.

### Not-found

Explains missing route and links home/docs; never blank.

## 9. Error handling

- Wallet unavailable/disconnected: allow public read-only UI; prompt to connect for writes.
- Wrong chain: block writes and display expected network.
- User rejects wallet: treat as cancellation, not app crash.
- RPC failure: show stale/unavailable label and retry; don't fabricate state.
- Revert: translate known custom errors; unknown reverts receive safe generic message.
- Timeout after hash: query receipt and state before retrying; prevent duplicate creation.
- Deadlines/races: reread chain and explain that another valid transaction may have won.
- Malicious URI: no server-side fetch; only allowed schemes and safe new-tab behavior.

## 10. Security and privacy requirements

- Contract role/state/time validation, SafeERC20, ReentrancyGuard, strict amount/provider/URI bounds, immutable token address, no arbitrary external calls or upgrade/admin withdraw methods.
- Use exact allowance and exact payout/refund accounting.
- `.env` and deployment key ignored by Git; no secret in Vercel or client bundle.
- Preview always testnet and must not expose production signing keys/data or live money flows.
- Public-chain warning before create/submit; task titles/briefs and deliverable references are permanent public data.
- Do not fetch user-supplied URLs or render HTML from them.
- The contract is an unaudited hackathon prototype; do not describe it as audited or production safe.

## 11. Technical decisions

- Arc Studio required for app/contract/tests and project URL evidence.
- Solidity 0.8.x; OpenZeppelin SafeERC20 and ReentrancyGuard.
- React + TypeScript + Vite; Tailwind temporary system; wagmi + viem; Vitest; Playwright.
- Vercel for stable Preview and Production hosting; GitHub public repo.
- No backend, database, AI model, server API, event listener, queue, analytics, or indexer.
- Mainnet contract deployed manually from exported/tested source after explicit operator approval; Arc Studio itself deploys to testnet.

## 12. Acceptance gate before final visual design

All must pass on deployed Arc Testnet preview:

1. Create/fund 2–3 stages; verify exact escrow.
2. Only current provider can submit.
3. Client approval pays current provider and activates next stage in one transaction.
4. Full sequence completes with payouts reconciled.
5. Reject refunds all unspent escrow exactly.
6. Expiry refunds all unspent escrow exactly.
7. Unauthorized, wrong-stage, duplicate, invalid-input and early-expiry calls revert.
8. Wrong chain blocks writes.
9. Refresh reconstructs true state and timeline.
10. Operator receives exact deployed preview URL, commit, test output, issues, and evidence.

Only after acceptance may the agent collect/agree on design references, produce mockups, present revisions, and stop for explicit operator approval.

## 13. Final frontend acceptance

- All routes, responsive layouts, metadata, icon/favicon, not-found, loading/empty/validation/success/error/permission-denied/terminal states.
- All controls perform real actions; no inert buttons, dead links, `href="#"`, or unexplained placeholders.
- `/docs` is a real route; footer Documentation link works; GitHub link points to actual public repository only after verified.
- Operator-approved references/mockups and deviations are in `docs/DESIGN_DECISIONS.md`.
- Final UI doesn't change product behavior, contract calls, API interface, or architecture.
- Deployed preview is checked for links, accessibility basics, desktop/mobile, and regression.

## 14. Submission evidence (update only with real values)

- Arc Studio project URL: **Not yet created/verified**.
- Live app URL: **Not yet deployed**.
- GitHub public repository: **Not yet created/verified**.
- Mainnet coordinator address: **Not yet deployed**.
- Mainnet transaction hashes: **Not yet executed/verified**.
- Video walkthrough: **Not yet recorded**.
- Builder profile URL: use actual operator-provided GitHub/X/Farcaster URL; do not invent.

**Deadline warning (unresolved):** the prior handoff records 2026-11-02 04:59 UTC. An Eventbrite listing for the organizer's event displays a noon-to-12:59 PM Pacific window on November 1, but labels it PDT even though Pacific daylight time ends at 2:00 AM that date, making the displayed local time potentially ambiguous by one hour. The direct official page returned HTTP 405 in automated verification. Treat **2026-11-01 20:59 WAT (Africa/Lagos)** as the conservative planning cutoff until the actual submission form confirms the exact timestamp.

## 15. Feature requirement matrix

The complete implementation-level feature matrix—including actors, preconditions, inputs, processing, outputs, permissions, validation, errors, edge cases, and acceptance criteria—is maintained in [`docs/REQUIREMENT_MATRIX.md`](docs/REQUIREMENT_MATRIX.md). The coding agent must follow it as a normative project document.
