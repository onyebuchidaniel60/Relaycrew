# RelayCrew — Arc Microgrants 2 Implementation-Ready Blueprint

**Status:** Design baseline for operator review; no application code has been written.  
**Product name:** RelayCrew (working name; product concept remains “Milestone Team Pipeline”).  
**Hackathon:** Arc Microgrants: Built with Arc Studio.  
**Blueprint date:** 2026-10-28.  
**Deadline warning (unresolved):** the previous session handoff recorded 2026-11-02 04:59 UTC. A DoraHacks event listing mirrored on Eventbrite displays a noon-to-12:59 PM Pacific window on Sunday, 2026-11-01, but labels it PDT even though US Pacific daylight time ends at 2:00 AM that date; a time-zone-aware end may therefore be one hour later than a literal PDT conversion. The direct official submission page returned HTTP 405 during automated verification. For safe planning, use **2026-11-01 20:59 WAT (Africa/Lagos)** as a conservative cutoff until the live submission form confirms the exact timestamp; do not rely on the later prior-session estimate.  
**Core principle:** the operator controls product, architecture, security, scope, and acceptance. The coding agent executes one verified phase at a time.

> This is a design/documentation artifact, not a security audit or legal opinion. Mainnet deployment and real-money transactions require explicit operator authorization. The proposed contract will be unaudited at hackathon scale; keep demo values low and state the risk plainly.

---

# 1. Product definition

## Product

**RelayCrew — a client-funded, sequential specialist-agent pipeline with on-chain milestone settlement.** A client funds one Arc USDC escrow for a fixed linear sequence of specialist stages. A provider submits a deliverable reference; the client evaluates it. Approval pays that stage's provider and, in the same on-chain transaction, activates and hires the next preassigned specialist. The last approval pays the final provider and completes the pipeline.

The word *agent* means a specialist represented by a wallet address. It may be operated by software or a person. RelayCrew does not run agents, discover agents, or verify that a wallet corresponds to an autonomous AI.

## Problem

A multi-step task often needs several specialists—for example, research → analysis → writing. Today, the client usually coordinates the handoff manually through chat, spreadsheets, payment apps, and separate contracts. The client has to remember which stage is approved, arrange the next hire, and track payments. Existing escrow primitives can settle a job, but the chosen experiment makes a release event drive the next stage's activation in one auditable, on-chain hiring chain.

## Alternatives/workarounds

Manual messaging and bank/crypto transfers; spreadsheets and project-management tools; a single escrow with manually coordinated milestone releases; separate single-agent escrow jobs manually created between stages. RelayCrew is not claiming that milestone escrow itself is new.

## Target users

1. **Client / pipeline creator:** a person or software service coordinating a fixed multi-specialist task and funding the complete budget up front.
2. **Specialist provider:** an individual or AI-agent operator whose wallet is assigned to one stage, submits a work reference, and receives USDC after approval.
3. **Public observer:** a reviewer who can inspect pipeline states and transaction history without connecting a wallet.

## Value proposition

One upfront budget, one immutable stage order, clear approval authority, exact USDC transfers, a next-stage activation tied atomically to the prior stage's release, and a public explorer trail.

## Differentiator

The narrowly scoped differentiator is not “escrow for agents.” It is the **on-chain coupling between milestone payout and next-stage hire activation**: the approval transaction releases the current stage's USDC payout and, unless it is the final stage, activates the next preassigned specialist. Both state changes occur in the same transaction or both revert.

## Primary use case

A client funds Researcher → Analyst → Writer. The Researcher submits a public deliverable URL and the client approves it. RelayCrew pays the Researcher and activates the Analyst in the same transaction. The same happens for the Analyst, then Writer. The final approval completes the pipeline.

## Secondary use cases

A fixed review → implementation → QA chain; document extraction → data analysis → report preparation; software-to-software work where each provider wallet is controlled by an agent operator. These are examples of the same linear workflow, not separate feature sets.

## Explicit non-goals

No marketplace, provider discovery, reputation, dynamic agent selection, parallel fan-out, DAGs, conditional routing, stage skipping, auctions, bidding, slashing, quality-weighted payouts, holdbacks, arbitration, dispute courts, backup providers, cross-chain payments, fiat ramps, platform fees, AI inference, agent execution runtime, ERC-8004 integration, user accounts, email, notifications, analytics, admin panel, mobile app, or broad workflow automation.

---

# 2. MVP scope

## MUST HAVE

- A client can connect an EVM wallet, use the configured Arc network, approve an exact ERC-20 USDC allowance, and create/fund a pipeline in one follow-on contract transaction.
- A pipeline contains 2–5 stages in an immutable, fixed order.
- Every stage has a distinct, nonzero provider wallet, a title, a short public brief, a fixed USDC budget, and a relative work duration.
- Client is the evaluator for every stage.
- Exactly one stage is active at a time. Future stages are queued and already budget-reserved inside the parent escrow.
- The current provider can submit a public HTTPS or IPFS deliverable reference before the work deadline.
- Client can approve or reject the active submitted stage. Approval pays the full stage budget to that provider and atomically activates the next stage, or completes the pipeline after the final stage.
- Client can reject the active stage before submission or after submission; rejection terminates the pipeline and refunds all unspent escrow. Previously released payouts cannot be clawed back.
- Anyone can trigger expiration after the active stage's work deadline or after its 24-hour evaluation window. Expiration refunds all unspent escrow to the client.
- On-chain state and emitted events are the source of truth; users can see pipelines where their connected wallet is client or provider.
- Testnet preview, contract tests, error/loading/success states, a usable `/docs` page, and a final public repo/docs link when their real URLs exist.
- Mainnet deployment and real USDC movement only after explicit operator authorization, with transaction hashes recorded and verified on `explorer.arc.io`.

## SHOULD HAVE (only if core is green and time remains)

- Clear transaction timeline with explorer links for pipeline funding, stage hiring, stage submission, releases, refunds, and expiration.
- A copy-address affordance and precise USDC amount formatting.
- A small “demo pipeline” walkthrough on `/docs`, using hypothetical values and clearly labeled as an example—not fabricated chain activity.

## NICE TO HAVE

- Human-readable mapping of event names to a timeline, manual refresh button, copy transaction hash, and downloadable transaction summary.

## FUTURE

- Evaluator agents, programmable evaluation, agent identity/reputation, dynamically selected providers, signed off-chain work manifests, third-party indexing, notification relays, batched operations, relayer/meta-transactions, privacy-preserving task briefs, multiple currencies, and formal ERC-8183 interoperability.

## OUT OF SCOPE FOR THIS SUBMISSION

Anything that increases contract surface area without improving the demonstrable release→next-hire chain. No real agent orchestration, autonomous off-chain watchers, or child ERC-8183 contracts.

## Hard caps and product policy

- Minimum 2 stages; maximum 5 stages.
- Each stage budget must be at least **1 USDC**.
- Maximum total pipeline budget: **100 USDC** for the demo implementation.
- All amounts use the Arc USDC ERC-20 interface with 6 decimals; never use floating-point arithmetic for token amounts.
- Work duration per stage: 15 minutes to 7 days, measured from stage activation.
- Evaluation window: 24 hours from submission.
- No platform fee.
- The creator supplies every provider before funding; stage providers cannot be changed later.
- Pipeline briefs and deliverable references are public on-chain data. Never put secrets, personal data, confidential client content, credentials, or private document URLs in them.

---

# 3. User roles and permissions

| Role | Identity | Permissions | Explicit limits |
|---|---|---|---|
| Client | Wallet that creates/funds the pipeline | Create/fund; evaluate each stage; approve or reject the active stage; see client-owned pipelines | Cannot edit stage order, addresses, budgets, or terms after funding; cannot withdraw funds arbitrarily; cannot claw back payouts already made |
| Provider | Preassigned stage wallet | See assigned pipelines; submit a deliverable reference for its active stage | Cannot submit for another provider; cannot approve/reject; cannot alter the pipeline or payout amount |
| Evaluator | The client wallet, globally for the pipeline | Approve/reject each submitted stage; can reject active work before submission | No third-party arbitration; the client is trusted to evaluate honestly |
| Public viewer | Anyone | Read public on-chain pipeline state and links | Cannot send state-changing transactions except `expirePipeline`, which has fixed recipient and eligibility checks |
| Operator/deployer | Project maintainer during deployment | Deploy the contract and set build-time network/contract configuration | No application admin permissions after deployment; no owner, upgrade key, treasury, or admin withdrawal function |

The frontend's role-specific visibility is convenience only. The contract enforces all permissions; hiding a button is not authorization.

---

# 4. User flows

## Flow A — Connect wallet and inspect pipelines

**Entry:** home page or `/pipelines`.  
**Preconditions:** an EVM wallet is available; the deployment's configured chain is available. Read-only browsing does not require connection.

1. User opens the app. UI reads the configured chain ID and contract address from client-safe build configuration.
2. If not connected, show public read-only overview plus “Connect wallet.” Do not require a signature to browse public chain data.
3. On connect, read active wallet address and current chain.
4. If the chain differs from the deployment's expected chain, show “Switch to Arc Testnet” for preview or “Switch to Arc” for production. Disable all writes until correct chain and contract are confirmed.
5. Read `getUserPipelineIds(address)`, then query summaries/stages. Show only pipelines relevant to the connected wallet (client or any assigned provider); public individual pipeline pages remain readable.
6. Refresh chain data after transaction receipt, explicit refresh, or a short stale-cache interval. Show loading, empty, RPC error, and disconnected states.

**State changes:** none, except client-side wallet connection preference.  
**Validation/permissions:** read calls are public; write actions require the expected connected wallet and contract-side role checks.  
**Success:** user sees the correct pipeline list or an explicit empty state.  
**Failure/edge cases:** wallet unavailable, wrong chain, RPC unavailable, malformed env config, stale cache, pipeline read reverted. Show a recoverable message and retry; never show mock data as if live.

## Flow B — Create and fund a pipeline

**Entry:** `/create`, available to a connected wallet on configured chain.  
**Preconditions:** wallet has enough USDC and native gas balance; stage list is valid; wallet is not assigned as a provider for its own pipeline.

1. Client enters 2–5 stages in fixed order: provider address, title, brief, budget in USDC, and duration. Provider addresses must be unique within the pipeline.
2. UI validates addresses, stage count, title/brief lengths, duration bounds, per-stage minimum and total cap. It computes the total with integer base units, then displays per-stage and total amounts.
3. Before any approval, show an irreversible/public-data warning: stage titles, briefs, provider addresses, amounts, and later deliverable references are public and permanent. Client confirms.
4. UI reads token balance and current allowance for the coordinator. It requests **exact allowance only**. If nonzero allowance must be reset for wallet/token compatibility, send `approve(0)` first, then exact approval. No unlimited approval.
5. Wait for approval transaction receipt. If it fails, do not proceed.
6. Client calls `createPipeline(stages)`. Contract validates all inputs again, computes total budget on-chain, pulls the exact total from client, creates pipeline ID, marks stage 1 active, queues the rest, and stores user indexes.
7. Wait for receipt, decode `PipelineCreated` and `StageHired`, then reread the contract. Do not optimistically claim success based only on wallet submission.
8. Navigate to `/pipelines/:id`, showing funding transaction, active specialist, stage order, budgets, and deadline.

**Database/state changes:** none off-chain. On-chain pipeline + stages + per-user indexes; USDC transfer into coordinator.  
**Success:** pipeline is Active, first stage is Active, all future stages are Queued, and escrow is funded exactly.  
**Failure:** allowance rejected, insufficient balance/gas, wrong chain, validation revert, stale allowance, RPC failure, user closes wallet, or transaction replaced. Keep form values in client memory and offer a retry; query chain state before offering resubmission to avoid duplicate pipelines.

## Flow C — Provider submits work

**Entry:** `/pipelines/:id` for the assigned active provider.  
**Preconditions:** pipeline is active, connected wallet matches current stage provider, stage status is Active, and work deadline has not passed.

1. Provider reads the brief and stage deadline.
2. Provider enters a deliverable reference using `https://` or `ipfs://`. The UI does not fetch or embed the target. It explains that the URI will be public.
3. Provider confirms and calls `submitStage(pipelineId, stageIndex, uri)`.
4. Contract verifies caller, current stage index, Active state, not expired, URI scheme/length; stores the URI, transitions stage Active→Submitted, and sets the 24-hour evaluation deadline.
5. After receipt, UI refreshes and displays submission time, deliverable link, and evaluation deadline. The link opens in a new tab with `noopener noreferrer` and a clear external-link indication.

**Success:** stage is Submitted and the client can evaluate it.  
**Failure:** wrong provider, wrong stage, invalid URI, expired stage, duplicate submit, wrong chain, or tx failure. Explain the error and reread status before retry. A second submission is not permitted.

## Flow D — Client approves a stage; next specialist is hired

**Entry:** stage detail when current stage is Submitted and client wallet is connected.  
**Preconditions:** caller is pipeline client; current stage is Submitted; current stage's evaluation window has not expired.

1. Client inspects the deliverable reference and chooses Approve.
2. Show exact payout amount, recipient address, and next provider/amount (if any). Explain that approval is irreversible: the payment is final and cannot be recalled by RelayCrew.
3. Client confirms; UI calls `approveStage(pipelineId, stageIndex)`.
4. Contract checks the client role and stage state; marks current stage Paid and increments paid-out accounting; transfers the exact stage budget to the current provider; if a next stage exists, sets it Active, sets its deadline from its configured duration, and emits `StageHired` in the **same transaction**. If the final stage, set pipeline Completed instead. A failed transfer reverts the entire transaction, including activation.
5. UI waits for receipt and verifies `StageReleased` and—except for the final stage—`StageHired`, then rereads contract state.
6. Timeline shows USDC transfer to the current provider and the next stage activation; the next provider can now submit. For the final stage, show Completed.

**Race handling:** two approval attempts cannot both succeed because state changes atomically; the second reverts. If the transaction fails, no payout or activation occurred.  
**Success:** exactly one payout and one next-stage activation, or final completion.  
**Edge cases:** current stage changed, evaluator window elapsed, insufficient contract balance due to an invariant violation, token transfer failure, RPC timeout after inclusion, wallet rejection. Always check transaction receipt and on-chain state before retrying.

## Flow E — Client rejects the active stage

**Entry:** Active or Submitted current stage, client wallet.  
**Preconditions:** caller is client; pipeline Active; current stage not Paid/Rejected/Expired; corresponding work/evaluation window remains open.

1. Client selects Reject and confirms that the pipeline ends, current stage is unpaid, all remaining unspent escrow returns to the client, and previous stage payouts remain final.
2. Contract marks current stage Rejected and pipeline Rejected; computes `remaining = totalBudget - paidOut - refundedAmount`; sets refunded accounting before transferring; sends the full remaining amount to client; emits rejection/refund events.
3. UI verifies receipt and final balances; all further pipeline write actions are disabled.

**Failure:** only-client restriction, terminal state, already-expired timing, transfer revert. State and balances roll back on revert. No appeals, partial payouts, or restart in MVP.

## Flow F — Expire a stalled stage and refund

**Entry:** pipeline detail after a visible deadline. Any wallet or public caller may trigger.  
**Eligible conditions:** current stage is Active and `now >= dueAt`, or Submitted and `now >= evaluationDeadline`.

1. UI shows which timer elapsed and the estimated unspent refund; no one is asked to evaluate after the expiry window.
2. Caller invokes `expirePipeline(pipelineId)`.
3. Contract revalidates time/state, marks current stage Expired and pipeline Expired, updates refund accounting, and returns all unspent funds to client.
4. UI rereads status and links the transaction.

**Edge case:** anyone can call this because the recipient is fixed to the client. The caller never receives the refund. If another transaction wins the race first, the losing call reverts and the UI refreshes.

## Flow G — Mainnet demonstration

1. First complete the same pipeline on testnet with test USDC and obtain passing tests.
2. Operator explicitly authorizes mainnet deployment and a low-value funding/release test; no coding agent may assume authorization.
3. Deploy the exported and tested contract with the official mainnet USDC ERC-20 interface address, verify bytecode/constructor configuration and record contract address/deployment tx.
4. Set production Vercel environment to chain ID `5042` and the verified mainnet contract address; keep previews pinned to testnet.
5. Operator connects a funded wallet and creates a 2–3 stage pipeline within the 100 USDC cap. Use provider wallets controlled by the operator or consenting test participants; do not send unsolicited funds.
6. Submit a deliverable, approve the stage, verify the USDC Transfer event and `StageReleased` / `StageHired` events on `explorer.arc.io`, and repeat to show the complete chain.
7. Capture transaction hashes, contract address, Studio URL, public repo URL, deployed app URL, and a walkthrough recording. Never invent or fabricate evidence.

---

# 5. Functional requirements and acceptance criteria

Each FR is testable and maps to unit/integration/E2E coverage.

## FR-01 — Correct chain and contract configuration

- **Actor/purpose:** every user; prevent writes to a wrong chain/contract.
- **Inputs:** build-time `VITE_NETWORK_MODE`, `VITE_CHAIN_ID`, `VITE_CONTRACT_ADDRESS`, `VITE_USDC_ADDRESS`.
- **Logic:** validate addresses and chain ID on startup; only allow writes when wallet chain equals configured chain. Preview builds must use Arc Testnet (5042002); production must use Arc mainnet (5042).
- **Permissions:** all users read; writes require wallet connection and correct chain.
- **Errors:** missing/invalid config; mismatched chain; no deployed contract.
- **Acceptance:** app fails closed on invalid config and displays no fake balances/state. A test proves that a mainnet wallet cannot send a write through a testnet preview.

## FR-02 — Wallet connection and role-aware UI

- Read-only pages work without a wallet; connect/switch/disconnect flow works with a supported injected EVM wallet and optionally a QR connector only if it is already supported by Arc Studio's generated setup.
- Wallet address is checksummed for display and normalized for comparisons.
- UI labels client/provider actions based on contract state; all authorization is repeated by contract.
- Acceptance: unauthorized UI actions are hidden/disabled, and direct contract calls from unauthorized accounts revert.

## FR-03 — Pipeline creation and funding

- Input contract: 2–5 unique provider addresses; each not zero and not the client; stage title 1–64 bytes; public brief 1–240 bytes; each stage budget at least 1 USDC; total 2–100 USDC; stage duration 900–604800 seconds; sum computed using integer base units.
- Contract atomically creates the pipeline only if exact `transferFrom` succeeds. First stage Active, remainder Queued; budgets and order immutable.
- Acceptance: total deposited equals the sum of stage budgets; user-index entries exist for client and all providers; duplicate provider addresses or invalid values revert without moving funds or creating an ID.

## FR-04 — Stage submission

- Only current provider may submit only the current Active stage, before work deadline, once.
- Deliverable URI length 9–256 bytes and scheme `https://` or `ipfs://`; external resource is never fetched by server or app automatically.
- Submission sets Submitted, `submittedAt`, and `evaluationDeadline = submittedAt + 24 hours`.
- Acceptance: valid submit creates one state change; invalid caller/status/URI/deadline/duplicate calls revert; UI shows the persisted URI from chain after refresh.

## FR-05 — Approve and release

- Only client can approve the current Submitted stage before evaluation deadline.
- Transfer full stage budget to that provider; no fee. Update `paidOut`; stage becomes Paid.
- If more stages remain, activate exactly the next stage, calculate its deadline from activation time and stage duration, and emit `StageHired` in the same transaction. Otherwise set pipeline Completed.
- Acceptance: balance delta equals exact stage budget; no next stage is active before release; next stage activation and payout share transaction hash; final release completes pipeline with zero unspent escrow.

## FR-06 — Reject and refund

- Only client can reject current Active or Submitted stage before the relevant deadline.
- Rejection terminally ends pipeline and refunds all unspent budget: `totalBudget - paidOut - refundedAmount`.
- Prior payments are final; current and future stages receive no payout.
- Acceptance: client receives exact refund; total paid + refund equals total budget; repeat rejection and any further write revert.

## FR-07 — Expiration and refund

- Anyone may call `expirePipeline` once the current Active stage passes `dueAt`, or the Submitted stage passes `evaluationDeadline`.
- Refund goes only to client. Expired pipeline is terminal.
- Acceptance: expiration before deadline reverts; after deadline refund is exact; a caller other than client receives no funds; competing expiry/rejection/approval transactions cannot cause double refund.

## FR-08 — Pipeline history

- Public read APIs show summary and stage details. Connected wallet's list includes any pipeline where it is client or a provider.
- UI never claims chain state changed until a receipt and a subsequent read confirm it.
- Acceptance: after hard refresh, chain-created pipelines and stages remain visible; list contains no duplicate IDs; an unfamiliar wallet sees an empty state, not sample chain transactions.

## FR-09 — Transaction and activity timeline

- Show transaction hashes and links when known; use official explorer base URL matching configured network.
- Timeline events are decoded from contract logs or derived from canonical contract state; do not fabricate timestamps, payout states, or transaction evidence.
- Acceptance: all success messages map to a mined successful receipt and confirmed state; failed/reverted txs do not show success.

## FR-10 — Documentation and completed frontend

- `/docs` must be a real, navigable in-app documentation destination; home footer links to it.
- The GitHub link must use the actual public repository URL configured only after the repository exists. Do not fabricate it or expose a private repo. The required hackathon public-repo deliverable means public repository is expected for final release; if that changes, stop for operator decision.
- All routes, internal links, responsive states, keyboard accessibility basics, loading/empty/error/success/not-found states, metadata, and favicon are checked on deployed preview.
- Acceptance: no dead links, `href="#"`, inert buttons, unexplained placeholders, or false “live on mainnet” claims.

---

# 6. Business logic and state machines

## State invariants

1. A pipeline is funded in the same transaction that creates it; there is no unfunded persistent pipeline state.
2. `pipeline.currentStageIndex` identifies the only stage that can be submitted, approved, rejected, or expired.
3. At most one stage is Active or Submitted at a time. All earlier stages are Paid; later stages are Queued.
4. A provider address is unique within a pipeline and cannot equal the client.
5. Total budget equals the sum of immutable stage budgets; `paidOut + refundedAmount <= totalBudget`.
6. No platform fee. Each approved stage transfers exactly its stage budget to its provider.
7. A successful stage approval emits a release event and activates the next stage in the same EVM transaction; a failed payout reverts the state transition.
8. Rejected or Expired pipeline refunds all unspent budget to client; previous releases are irreversible.
9. Completed means all stages Paid, `paidOut == totalBudget`, `refundedAmount == 0`, and no current active stage remains.
10. Every external token transfer function is non-reentrant and uses SafeERC20.

## Pipeline state machine

```text
createPipeline + exact USDC pull
          |
          v
       ACTIVE -------------------------------+
          |                                   |
          | all stages approved               | reject current / expiry
          v                                   v
      COMPLETED                        REJECTED or EXPIRED
   (all paid, no refund)             (unspent funds refunded)
```

## Stage state machine

```text
Stage 1: ACTIVE -> SUBMITTED -> PAID
                                  | approval pays provider
                                  | and atomically activates next
Stage N: QUEUED -> ACTIVE -> SUBMITTED -> PAID
                         \-> REJECTED (pipeline terminal)
                         \-> EXPIRED (pipeline terminal)
Active can also be REJECTED by client or EXPIRED after work deadline.
```

The stage being submitted is not considered paid until the client approves it. A rejected or expired stage does not transfer its budget to the provider; its unpaid amount returns to the client with all other unspent allocations.

## Deterministic money accounting

- `totalBudget = sum(stage[i].budget)`.
- `paidOut = sum(budget for all Paid stages)`.
- `refundedAmount = 0` during Active/Completed; once Rejected/Expired, set to `totalBudget - paidOut` before transfer.
- `remainingEscrow = totalBudget - paidOut - refundedAmount`.
- For active pipelines, token balance attributable to the pipeline equals `remainingEscrow` in the absence of direct token donations; unsolicited direct ERC-20 transfers are not accounted as user deposits and must never be distributed.
- Do not use native transaction value for USDC escrow. All escrow flows use the official ERC-20 interface. Arc's native USDC gas balance is a separate unit interface to the same underlying balance and has different precision.

## Exact transition rules

- `createPipeline(stages)`: nonexistent → Active; stage 0 → Active; stages 1..N−1 → Queued; pull total budget; start stage 0 timer.
- `submitStage(id, index, uri)`: Active stage → Submitted; caller is current provider; `now < dueAt`; set evaluation deadline 24h from submission.
- `approveStage(id, index)`: Submitted → Paid; caller is client; `now < evaluationDeadline`; transfer provider payout; next queued stage → Active with new deadline, or pipeline → Completed.
- `rejectStage(id, index)`: Active or Submitted → Rejected; caller is client; deadline still open; pipeline → Rejected; refund remaining escrow.
- `expirePipeline(id)`: current Active and `now >= dueAt`, or current Submitted and `now >= evaluationDeadline`; stage → Expired; pipeline → Expired; refund remaining escrow.
- No cancel after funding, no stage reassignment, no extension, no partial approval, no multi-stage approval, no restart.

## Conflict/race rules

The contract state is serialized by EVM transactions. If submit/approve/reject/expire calls race, the first valid transaction changes state and later stale calls revert. The frontend must reload state after any revert or ambiguous RPC result. Approval and expiration cannot both pay/refund because each requires the prior state and one state change terminalizes the path.

---

# 7. Data model

There is **no off-chain application database**. The smart contract is the authoritative write store. The browser cache is disposable and must be reconstruable from chain state.

## Pipeline

| Field | Type | Required | Rule |
|---|---|---|---|
| `id` | `uint256` | Yes | Monotonic ID starting at 1; unique primary key |
| `client` | `address` | Yes | `msg.sender` at creation; immutable |
| `totalBudget` | `uint256` | Yes | Sum of stage budgets, 6-decimal USDC base units; immutable |
| `paidOut` | `uint256` | Yes | Starts 0; increases only by paid stage amounts |
| `refundedAmount` | `uint256` | Yes | Starts 0; set once on Rejected/Expired terminal refund |
| `currentStageIndex` | `uint8` | Yes | Starts 0; increases only after successful approval |
| `stageCount` | `uint8` | Yes | 2–5 |
| `status` | enum | Yes | `Active`, `Completed`, `Rejected`, `Expired` |
| `createdAt` | `uint64` | Yes | Block timestamp |
| `finishedAt` | `uint64` | Optional | Set for Completed, Rejected, Expired |

## Stage

| Field | Type | Required | Rule |
|---|---|---|---|
| `provider` | `address` | Yes | Nonzero, unique within pipeline, not client; immutable |
| `budget` | `uint256` | Yes | At least `1_000_000` token units (1 USDC); immutable |
| `title` | `string` | Yes | 1–64 bytes; permanent public text |
| `brief` | `string` | Yes | 1–240 bytes; permanent public text; never place secrets here |
| `durationSeconds` | `uint32` | Yes | 900–604800; immutable relative deadline |
| `status` | enum | Yes | `Queued`, `Active`, `Submitted`, `Paid`, `Rejected`, `Expired` |
| `startedAt` | `uint64` | Optional | Set when Active |
| `dueAt` | `uint64` | Optional | `startedAt + durationSeconds` |
| `submittedAt` | `uint64` | Optional | Set on submission |
| `evaluationDeadline` | `uint64` | Optional | `submittedAt + 86400` |
| `deliverableURI` | `string` | Optional | 9–256 bytes; `https://` or `ipfs://`; permanent public data; set once on submit |

## Relationships

- One Pipeline has 2–5 ordered Stage records.
- One client has zero or more pipelines.
- A provider wallet may participate in many pipelines, but only once within a particular pipeline.
- A user index maps an address to the pipeline IDs where it is client or provider. An auxiliary `hasUserPipeline[id][address]` boolean or equivalent prevents duplicate index entries.

## Indexes/constraints

- Primary: `pipelineId`.
- Stage: `(pipelineId, stageIndex)`.
- User index: `userPipelineIds[address]` array; each pipeline appears once per client/provider wallet.
- Enforce input bounds and provider uniqueness inside contract, not only UI.
- Provide explicit view functions for `getPipelineSummary`, `getStage`, `getUserPipelineIds`, and `pipelineCount`.

## Data visibility and privacy

All contract storage, emitted event parameters, transaction calldata, addresses, amounts, briefs, and deliverable URIs are public. Do not store personal data, private work products, credentials, hidden document links, or sensitive client details. The app must warn before funding and before submission. External RPC providers may observe a user's IP and wallet queries; blockchain interaction itself is public.

## Client-side data

- Transient form state while the user drafts a not-yet-submitted pipeline.
- Wallet connection state/query cache as provided by the selected wallet library.
- No local cache is an authoritative source; clearing browser storage must not delete contract state.
- No app server, database, personal profile, upload storage, or tracking database.

---

# 8. System architecture

## Overview

```text
Browser (React + TypeScript)
  ├─ wagmi wallet connection + chain enforcement
  ├─ viem contract reads/writes
  ├─ temporary query cache (non-authoritative)
  └─ routes: Home / Create / My Pipelines / Pipeline Detail / Docs / Risk
                 |
                 | JSON-RPC (reads, simulated writes, receipts, logs)
                 v
         Arc RPC (Testnet in preview; Mainnet in production)
                 |
                 v
      PipelineCoordinator.sol
        ├─ immutable USDC ERC-20 address
        ├─ one parent escrow per pipeline accounting
        ├─ immutable ordered stage records
        ├─ role/state/deadline validation
        └─ USDC transfers + events
                 |
                 v
        USDC ERC-20 interface (Arc)

Arc Studio: source workflow for contract, testing, generated app. Export source/repo.
Vercel: stable early preview deployment and final frontend hosting.
GitHub: public source repository, docs, tests, and release checkpoints.
Arc Explorer: independent transaction/contract verification.
```

## On-chain versus off-chain responsibility

**On-chain:** pipeline and stages, immutable provider order and budgets, state machine, deadlines, role checks, escrow, payout/refund accounting, event trail. The contract is the financial and permission authority.

**Frontend:** collect and validate forms for usability, wallet connection, display state, send user-signed transactions, decode known contract errors/events, show transaction receipts and explorer links, explain irreversible/public data. It cannot override contract state.

**No server:** no REST API, database, background job, queue, webhook, notification service, event listener, or admin API. The contract itself activates the next stage; no off-chain listener is needed to cause the hire.

**External systems:** Arc Studio for build/test workflow; Arc RPC; injected EVM wallet; USDC token interface; Vercel for hosting; GitHub for source; Arc Explorer for verification.

## Orchestrator locus

The on-chain `PipelineCoordinator` is the only orchestrator. It executes all state transitions synchronously. On `approveStage`, it pays the current provider and sets the next stage Active before the transaction ends. The `StageHired` event is evidence of this on-chain transition, not a trigger consumed by a separate service.

## Job topology decision

Use one parent Pipeline record with per-stage records inside the same coordinator/escrow. Do **not** create nested parent→child ERC-8183 contracts for the MVP. This avoids cross-contract escrow funding and deployment complexity and is credible within the deadline. This implementation is **ERC-8183-inspired but not claimed to conform to ERC-8183**. The current Arc contract-address page shows the ERC-8183 reference implementation on testnet, and does not list a mainnet implementation; don't rely on an unverified mainnet contract.

## Storage/caching/indexing

Chain storage is source of truth. Contract-maintained user-to-pipeline arrays avoid dependence on an external indexer. Wallet reads use wagmi/viem; caching is short-lived and invalidated on receipt. Do not introduce The Graph, a hosted indexer, Redis, Postgres, IPFS upload service, or custom backend.

## Observability

- Frontend displays transaction status phases: wallet prompt → submitted/pending → confirmed success or confirmed failure.
- Use explorer links built from the configured official network URL and actual transaction hashes.
- Browser logs must not print private keys or environment secrets. No analytics/telemetry SDK in MVP.
- Vercel deployment logs are used for build/runtime investigation; there is no backend server log.

---

# 9. Technology stack

| Area | Decision | Responsibility and rationale |
|---|---|---|
| On-chain workflow | **Arc Studio** | Mandatory hackathon build environment for contract, contract tests, and app generation; preserve Arc Studio project URL as evidence. |
| Contract language | **Solidity 0.8.x** | EVM-compatible mainnet contract exported from Studio; pin compiler in repository so test/deploy use the same version. |
| Token transfers | **OpenZeppelin Contracts SafeERC20 + ReentrancyGuard** | Established transfer wrapper and reentrancy protection; do not hand-roll ERC-20 safety helpers. Pin exact package version in lockfile. |
| Frontend | **React + TypeScript + Vite** | Small client-side app; the product has no server-side business logic. Keep the generated Arc Studio app compatible; do not rewrite the project structure without operator approval. |
| Styling | **Tailwind CSS with a minimal temporary utility system** | Fast consistent behavior-first UI. Final visual system is deliberately unapproved until Phase 6. |
| Wallet/chain interaction | **wagmi + viem** | Arc docs recommend wagmi/viem and ship Arc/Arc Testnet chain definitions. Typed reads, writes, simulations, and receipt handling. |
| UI query cache | **TanStack Query as integrated through wagmi** | Short-lived reads and invalidation; never authoritative. No external cache service. |
| Frontend tests | **Vitest + Testing Library** | Unit tests for forms, state displays, validation, and transaction feedback. |
| E2E tests | **Playwright** | Verify route navigation and user journeys in preview; wallet/chain test support may need a controlled test fixture. Never use a real mainnet wallet in automated E2E. |
| Contract test/deploy tooling | **Arc Studio tests as required; Hardhat for reproducible exported-source tests/deployment if Studio export supports standard Hardhat project layout** | Studio is the required primary workflow; exported contract source must be independently reproducible. Stop and request operator approval if generated export prevents this without architecture changes. Use the same compiler/dependencies/artifacts for deployment. |
| Hosting | **Vercel** | Stable preview from the first phase; preview forced to Arc Testnet, production forced to Arc Mainnet. |
| Source of truth/repo | **Public GitHub repository** | Required submission artifact; created/connected through Arc Studio if supported. Real URL only after confirmed. |
| Contract network | **Arc Mainnet 5042 / Arc Testnet 5042002** | Preview uses testnet only; production uses mainnet only. Official RPCs listed below. |
| ERC-20 USDC interface | `0x3600000000000000000000000000000000000000` | Official Arc docs list same interface address on mainnet and testnet; 6 decimals. Read/verify at deployment time, never assume a lookalike address. |

### Stack constraints

- Keep package versions pinned by a committed lockfile. Do not write `latest` tags or update the entire dependency tree without need.
- Arc Studio remains mandatory for the contract/app build narrative and tests. Record prompts/iterations and project URL for submission evidence.
- If Arc Studio's generated framework materially conflicts with the specific React/Vite frontend decision, **stop and ask the operator** instead of migrating the app or silently swapping stacks. This is an integration compatibility checkpoint, not permission for the agent to choose a different architecture.
- Mainnet deployment is manual after export because Studio docs state its deploy flow targets Arc Testnet.

---

# 10. API specification

There is no REST API. The public interface consists of read-only contract views and wallet-signed contract methods. The frontend may use local route state but must not simulate a server.

## Read contract functions

| Read | Parameters | Returns / rules | Authorization |
|---|---|---|---|
| `pipelineCount()` | None | Latest pipeline ID/count semantics documented by implementation; IDs start at 1 | Public |
| `getPipelineSummary(pipelineId)` | `uint256` | Client, total, paid, refunded, current index, stage count, status, createdAt, finishedAt | Public; reverts/returns invalid for unknown ID consistently |
| `getStage(pipelineId, stageIndex)` | `uint256,uint256` | Provider, budget, title, brief, status, duration, start/due/submission/evaluation times, deliverable URI | Public |
| `getUserPipelineIds(user)` | `address` | IDs where address is client or assigned provider, in creation order | Public |
| `usdc()` | None | Immutable token interface address | Public |

## Write contract functions

### `createPipeline(StageInput[] stages)`

- **Purpose:** pull full budget and create a fixed pipeline.
- **Auth:** connected client wallet; transaction signed by client.
- **Request fields per stage:** provider address, budget in USDC base units, title, brief, duration seconds.
- **Validation:** 2–5 stages; provider nonzero, distinct and not client; title/brief limits; stage budget ≥1 USDC; total ≤100 USDC; duration within 900–604800 seconds; exact USDC allowance/balance sufficient; correct deployed USDC token.
- **Side effects:** token `transferFrom`, pipeline ID allocated, stage 0 Active, future stages Queued, user indexes written, `PipelineCreated` and `StageHired` events emitted.
- **Success:** receipt with pipeline ID event; frontend then rereads summary.
- **Errors:** custom errors such as `InvalidStageCount`, `InvalidProvider`, `DuplicateProvider`, `InvalidTitle`, `InvalidBrief`, `InvalidBudget`, `TotalBudgetTooHigh`, `InvalidDuration`, `TransferFailed`/SafeERC20 revert, insufficient allowance.
- **Idempotency:** not retry-safe by itself; before resubmitting after timeout, search receipt and query recent pipeline IDs/logs for the wallet. Never auto-resubmit.
- **Rate/security:** normal wallet tx; client form rate is not a contract security control.

### `submitStage(pipelineId, stageIndex, deliverableURI)`

- **Purpose:** provider submits a reference to work.
- **Auth:** current stage provider only.
- **Validation:** pipeline Active; index equals current index; stage Active; `block.timestamp < dueAt`; URI 9–256 bytes and starts with `https://` or `ipfs://`.
- **Side effects:** state changes to Submitted; sets timestamps and evaluation deadline; emits `StageSubmitted`.
- **Success:** confirmation receipt; frontend rereads stage.
- **Errors:** `PipelineNotActive`, `WrongStage`, `NotProvider`, `StageNotActive`, `WorkDeadlinePassed`, `InvalidDeliverableURI`.
- **Replay:** only one successful submission due to status guard.

### `approveStage(pipelineId, stageIndex)`

- **Purpose:** evaluator approves stage, pays provider, and starts next stage atomically.
- **Auth:** client/evaluator only.
- **Validation:** pipeline Active; index is current; stage Submitted; `block.timestamp < evaluationDeadline`.
- **Side effects:** stage Paid; paidOut increases by exact budget; USDC sent to provider; if nonfinal, next stage becomes Active, new work deadline begins, `StageHired` emitted; if final, pipeline becomes Completed; emits `StageReleased` and appropriate pipeline/stage events.
- **Success:** one transaction hash proves payout plus next hire (or final completion).
- **Errors:** `NotClient`, `PipelineNotActive`, `WrongStage`, `StageNotSubmitted`, `EvaluationDeadlinePassed`, SafeERC20 transfer revert.
- **Concurrency:** stage state/current index prevents double payout; nonReentrant.

### `rejectStage(pipelineId, stageIndex)`

- **Purpose:** terminate after rejecting current stage and refund unpaid balance.
- **Auth:** client only.
- **Validation:** current stage Active or Submitted; work/evaluation deadline still open; pipeline Active.
- **Side effects:** stage Rejected, pipeline Rejected, refund `totalBudget - paidOut - refundedAmount` to client, terminal events.
- **Errors:** `NotClient`, `WrongStage`, `InvalidStageStatus`, `DeadlinePassed`, SafeERC20 transfer revert.
- **Idempotency:** terminal state makes repeat call revert.

### `expirePipeline(pipelineId)`

- **Purpose:** settle a stalled stage after deadline.
- **Auth:** anyone; fixed refund recipient is client.
- **Validation:** pipeline Active and either Active stage past `dueAt` or Submitted stage past `evaluationDeadline`.
- **Side effects:** current stage Expired, pipeline Expired, refund all unspent amount to client, events.
- **Errors:** `PipelineNotActive`, `NotExpired` or appropriate timing/state custom error, SafeERC20 transfer revert.
- **Abuse protection:** caller never receives funds; state/time checked on chain; terminal state prevents replay.

## Error format in the frontend

No JSON API error envelope exists. Translate known custom errors and wallet errors into a consistent UI shape:

```text
{ category: validation | authorization | wrong_network | user_rejected | reverted | rpc_unavailable | unknown,
  title: human-readable short message,
  detail: safe explanation,
  retryable: boolean,
  txHash?: actual hash only }
```

Never display raw stack traces to users or claim a transaction was reverted unless the wallet/RPC provides evidence. For unknown reverts, say the transaction failed or could not be confirmed and show the hash only if one exists.

## Contract event API

Minimum events: `PipelineCreated`, `StageHired`, `StageSubmitted`, `StageReleased`, `StageRejected`, `StageExpired`, `PipelineCompleted`, `PipelineRejected`, `PipelineExpired`, and `PipelineRefunded`. Include pipeline ID, stage index, relevant provider/client, amount, due/evaluation deadlines, and actual recipient where appropriate. Events are for history and proof; contract state remains authoritative.

---

# 11. Database operations, atomicity, and concurrency

There is no external database. EVM transaction semantics provide atomicity. Every write maps to these operations:

| User action | Contract operations | Atomicity / conflict rule |
|---|---|---|
| Approve USDC allowance | USDC `approve` transaction | Separate transaction; creation must not proceed until allowance receipt confirmed |
| Create pipeline | Validate all stage inputs → compute sum → transferFrom full amount → create pipeline and stages → write user indexes → emit events | Entire contract call atomic; if validation/transfer fails, no pipeline or partial funds persist |
| Submit stage | Check role/current index/status/deadline/URI → set Submitted/timestamps → emit | Atomic; only one valid submission |
| Approve stage | Check client/current index/status/window → mark Paid/account paidOut → transfer provider amount → activate next stage or complete → emit | One transaction; if any step fails, all state and token transfer revert |
| Reject stage | Check client/current stage/status/window → mark terminal → set exact refund accounting → transfer refund → emit | One transaction; duplicate rejection cannot pay twice |
| Expire pipeline | Check active state and elapsed deadline → terminalize → compute/refund remainder → emit | One transaction; only fixed client can receive refund |
| Read dashboard | Get user IDs → read summaries and stages | Public, no transaction; cache is disposable |

### Critical implementation rules

- Use checks-effects-interactions and `nonReentrant` on all methods that move tokens.
- Use OpenZeppelin SafeERC20 for `transferFrom`/`transfer`.
- All user-entered token amounts are parsed into integer base units using six decimals; `parseUnits`/`formatUnits` equivalents only. Never convert through JavaScript `Number` for accounting.
- Contract computes `totalBudget` from stage inputs; never trusts a frontend-supplied total.
- A release and subsequent hire are coupled in the same EVM transaction. There is no event-listener queue that could lose or duplicate a hiring action.
- No payout occurs for queued, active, submitted, rejected, or expired stage; only Paid stage pays exactly once.
- `refundedAmount` is written before the external transfer. If the transfer reverts, the whole tx reverts to prior state.
- A direct token donation to the coordinator is not attributed to any pipeline and is not available to client/provider withdrawals. Do not add a generic rescue function.
- Frontend follows transaction receipt with `getPipelineSummary`/`getStage`; do not trust local optimism after ambiguous receipt status.
- If a wallet's transaction is dropped/replaced or RPC times out, query receipt and contract state before retrying. Never blindly repeat `createPipeline`.

---

# 12. Authentication and authorization

- **Authentication:** EVM wallet connection. No email/password, session server, social login, SIWE signature, or user database. Connecting a wallet permits read personalization; an actual state-changing action requires an on-chain transaction signature.
- **Session:** wallet adapter state exists in the browser only. No server-held session or credential.
- **Authorization:** enforced by the contract using `msg.sender`, `client`, `provider`, current stage index, stage status, and timestamps. UI role checks are only UX.
- **Ownership:** pipeline `client` is immutable `msg.sender` during creation. Stage providers and stage order are immutable.
- **Public reads:** anyone can read all pipeline metadata/states. Never treat UI routes or hidden controls as private access barriers.
- **Protected operations:** `createPipeline` requires USDC allowance and sufficient balance; `submitStage` requires exact current provider; `approveStage`/`rejectStage` require client; `expirePipeline` is permissionless only after deadline with client as fixed refund recipient.
- **Admin:** no protocol owner, admin route, emergency withdrawal, upgrade key, treasury, or operator bypass. The deployer cannot alter contracts after deployment.
- **Account lifecycle:** user can disconnect wallet at any time; chain history remains public and is not deleted. New wallet address creates a separate view of its own assigned pipelines.

---

# 13. Security architecture

## Threats and mitigations

| Threat | Mitigation | Test evidence required |
|---|---|---|
| Wrong-chain or wrong-contract write | Separate Vercel Preview and Production environment variables; preview pinned to 5042002, production to 5042; disable writes on mismatch; display contract/network address | UI test that wrong chain blocks transaction; manual preview configuration check |
| Fake/malicious USDC token | Contract constructor gets configured token address; verify address against official Arc docs before deploy; no user-selected token; mainnet/testnet address verification | Deployment checklist + read `usdc()` + chain check |
| Unlimited allowance / approval phishing | Request exact total allowance only; reset nonzero allowance if needed; show total and contract address before approval; no permit signatures beyond standard wallet transaction | UI tests for exact amount; review all allowance writes |
| Client changes amount in frontend | Contract calculates total from stage budgets; USDC transferFrom exact computed total; stage budgets immutable | Contract boundary tests |
| Unauthorized submission/approval | Every function validates wallet role on chain; current stage/index/status required | Unauthorized account tests for every write function |
| Duplicate payment/replay | Terminal/state guards, incrementing current index, `nonReentrant`; transaction receipt check before retries | Two competing approvals; duplicate submit; duplicate reject/expire tests |
| Reentrancy/token callback | SafeERC20 and nonReentrant; checks-effects-interactions; only official USDC address | Static review and malicious mock token test if time permits |
| Accounting/refund bug | Immutable per-stage budgets; paidOut/refunded accounting invariant; compute remainder in contract; no generic withdrawal | Property-style tests across sequences; balance and invariant assertions |
| Wrong recipient refund | Recipient always immutable client; permissionless caller cannot choose recipient | Test third-party expiration caller and balances |
| Race between expiry/rejection/approval | Deadline and status checks in contract; EVM serializes calls; one terminal transition only | Competing transaction tests/test script and stale UI state test |
| Public/private data leakage | Clear warning; no confidential data fields in product; no server upload; public briefs/URIs; privacy page notes public chain/RPC metadata | Copy review and manual create/submit flow |
| Malicious deliverable URL | URI accepts only `https://` or `ipfs://`; max length; never fetch server-side; new tab with `noopener noreferrer`; display domain/URI before opening | Malformed scheme and link behavior tests |
| XSS/injection | React escaped text; no `dangerouslySetInnerHTML`; user-controlled text/URI rendered as text, not HTML | Static review and text injection tests |
| SSRF | No backend and no automatic external URL fetching; link-out only | Verify app does not issue HTTP request to user-supplied URI |
| Malicious transaction calldata / UI tampering | Contract remains final authority; exact verified ABI/bytecode; mainnet contract/address displayed in docs | Interface/ABI check; mainnet smoke test |
| Insufficient gas/USDC balance | Preflight balance/allowance reads; wallet simulation; actionable errors; no promise of exact gas | Test insufficient balance/gas UI where possible |
| RPC outage/rate-limit | Show unavailable/stale state; manual retry; never invent data; no transaction retry without checking state | RPC disconnect/timeout E2E test |
| Leaked deployer key | Deploy key local-only environment variable; never commit or upload to Vercel; use a low-value deployment wallet; rotate/remove after deployment as appropriate | Secret scan, `.gitignore`, Vercel env audit |
| Supply-chain/dependency compromise | Pin dependencies/lockfile, install only required packages, review scripts, audit dependencies if feasible | `npm audit`/dependency review; no auto major upgrades |
| Unreviewed unaudited contract | Low fixed total cap (100 USDC); operator authorization; testnet tests; disclose experimental/unaudited status; no user claims of “trustless audited security” | Acceptance checklist includes risk disclosure and review results |
| Privacy inference from RPC | Use official public RPC; disclose that provider can observe requests/IP and chain data is public; no analytics SDK | Privacy docs review |

## Contract safety requirements

- No `delegatecall`, arbitrary calls, user-supplied token contract, or user-supplied hook.
- No upgradeability, owner withdrawal, arbitrary rescue, platform fee, or admin role.
- Only transfer USDC on the configured ERC-20 interface.
- All amounts use 6-decimal base units and are bounded.
- Validate array length before iterating, URI length before storing, and stage index/status before storage mutation.
- Avoid unbounded loops other than the maximum five stages during creation/refund/indexing.
- Keep public strings bounded to control gas and avoid accidental oversized inputs.
- Do not implement off-chain arbitration or claim a security guarantee that is not present.

## Operational safety

- Preview: testnet contract and test data only; never real mainnet USDC flow from Vercel preview.
- Production: separate configuration and operator approval. The app has no private signing key. Users sign transactions with their own wallet.
- Mainnet test: intentionally low-value; confirm USDC amount, provider address, chain ID, contract address, calldata, and expected refund/payout before signing.
- If the mainnet contract is wrong or funds are at risk, do not add a fast unreviewed rescue function. Stop new use, disclose issue, and record whether remaining funds are recoverable through the designed state machine.

---

# 14. UI/UX architecture

The **UX structure and behavior are specified now**. The final visual style is **not approved**; it must be designed after end-to-end functionality works.

## Route inventory

| Route | Access / purpose | Main actions and data | Required UI states |
|---|---|---|---|
| `/` | Public landing page; explains the linear pipeline and has no fake live activity | Create CTA, browse docs, connect wallet, simple “how it works” | Initial loading only for config; missing-contract warning; network badge; error banner if RPC unavailable |
| `/create` | Connected wallet; create/fund fixed stage list | Add/remove stage fields within 2–5; provider address, title, brief, budget, duration; sum breakdown; public-data warning; exact approval then create | Disconnected, wrong network, validating, insufficient balance/allowance, wallet prompt, pending, success, failure, retry-safe state |
| `/pipelines` | Wallet-centric “My pipelines” (client or assigned provider) | List summaries, status, current specialist, budget paid/remaining, deadlines; open details | Disconnected prompt, loading, empty, populated, RPC error, stale/refresh |
| `/pipelines/:id` | Public detail; role-specific controls | Stage timeline; budget; client/provider labels; deadlines; deliverable link; contract/events/tx hashes; submit/approve/reject/expire as allowed | Loading, not-found, RPC error, Active, Submitted, Paid, Queued, Rejected, Expired, Completed, pending transaction, wallet rejected, reverted, stale state |
| `/docs` | Public | Plain-language “what is RelayCrew,” stages, lifecycle, how to connect wallet, how payout/refund works, public-data warning, testnet/mainnet distinction, Arc Studio and repo links | Not dependent on contract reads; show current contract address only when configured and verified |
| `/risk` | Public | Experimental software notice, unaudited contract notice, no dispute resolution, public data, irreversible transfers, test low-value, no guarantee of deliverable quality | Static; accessible from create and footer |
| `/*` / not-found | Public | Explain page not found; link Home/Docs | Not-found not blank; preserve accessible keyboard navigation |

## Shared components and behavior

- `AppShell`: global header/nav, network badge, wallet connect/disconnect, route outlet, footer.
- `NetworkGuard`: shows expected chain and contract; blocks writes until chain is correct.
- `WalletButton`: connection status and shortened address, accessible label, disconnect.
- `TransactionStatus`: wallet pending, submitted hash, confirmations, success/failure; allows explorer open only with real hash.
- `UsdcAmount`: fixed 6-decimal formatting, no float math, always labels USDC.
- `AddressDisplay`: shortened address, copy button and explorer address link; no fabricated ENS resolution.
- `StageEditor`: provider, title, brief, budget, duration, remove/add controls with 2–5 constraints.
- `BudgetSummary`: per-stage total and cap/min checks.
- `PublicDataWarning`: required before create/funding and before submitting deliverable URI.
- `StageTimeline`: stage state, provider, budget, deadline, submit/release state.
- `ActionConfirmationDialog`: action-specific recipient, amount, impact, irreversible effect; no generic “Are you sure?” only.
- `EmptyState`, `LoadingState`, `ErrorState`, `InlineValidation`, `Toast/Announcement`, `NotFound`.

## UX interaction rules

- All forms use controlled state and inline validation; on submit, revalidate and then simulate/estimate transaction where practical.
- Distinguish wallet prompt from chain-pending state. User cancellation is not presented as a contract failure.
- Disable actions when invalid or unauthorized, but still rely on contract authorization.
- Keep stage order explicit with numbered stages. No drag/drop reordering after funding.
- Amounts show raw USDC formatted to 2–6 decimals as needed; preserve exact base-unit values behind UI.
- Every write warns of transaction cost, recipient/amount, and public/irreversible consequences.
- No fake counts, mock balances, fabricated agent reputations, countdowns, or sample transactions on production.

## Early skeletal UI (Phase 1)

Deploy in Phase 1 with the real route map, header/nav, footer shell, responsive columns, placeholder panels, and conspicuous “Preview shell — on-chain actions not connected yet” notice. `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, and not-found must navigate. No real-wallet approval or mainnet calls in Phase 1; write buttons are clearly disabled placeholders with reasons. Preview points to Arc Testnet configuration only. Operator receives exact URL and deployed Git commit as soon as Vercel deployment succeeds.

## Progressive functional UI (Phases 2–5)

Keep simple temporary styling and connect one behavior at a time: network guard/wallet read, create form validation, testnet allowance and pipeline funding, pipeline detail reads, provider submission, client approval and atomic next-hire view, reject/refund, expiry, history/timeline. Keep the same preview updated after each accepted checkpoint. Show the testnet chain label clearly; never present testnet transactions as mainnet proof.

## End-to-end functionality gate before final design

The following must pass on the deployed preview with Arc Testnet before mockups/final design phase starts:

1. Create a valid 2–3 stage pipeline and confirm exact escrow funding.
2. Verify provider 1 can submit and a non-provider cannot.
3. Verify client approval pays provider 1 and activates provider 2 in the same transaction.
4. Repeat through final stage and reach Completed with all stage payouts reconciled.
5. Reject a stage and confirm exact refund of remaining escrow, with prior stage payouts final.
6. Expire a stalled stage and confirm exact refund.
7. Verify duplicate/unauthorized/wrong-stage/expired writes revert.
8. Verify wrong-chain writes are disabled; RPC/wallet failure states appear correctly.
9. Confirm after hard refresh that pipeline and event history reconstruct from chain state.
10. Show the operator actual deployed preview URL, commit SHA, test report, known limits, and any remaining functional blockers. No final visual polish starts until blockers are fixed or an operator-approved exception is documented.

## Final frontend inventory (Phase 8)

- All routes above and global nav/footer; no placeholder route in final build.
- `/docs` footer link (real internal route); GitHub footer link only to actual public repo URL.
- `/risk` link from create flow/footer; no unnecessary analytics/cookie consent.
- Responsive desktop/tablet/mobile layout; 320px minimum viewport without horizontal overflow where feasible; long address/URI wrapping and scroll behavior tested.
- Accessible semantic landmarks, headings, buttons, input labels, errors tied to fields, keyboard access, focus visibility, contrast, reduced motion if animation is added, screen-reader status for transaction changes.
- Titles, descriptions, canonical/base metadata as appropriate, favicon/app icon, social sharing metadata with no unverified claims.
- Correct external-link behavior, not-found page, loading/skeleton/empty/validation/error/success/permission-denied/terminal states.
- All footer/nav links verified on deployed preview; no `href="#"`, dead buttons, inert controls, fabricated repo/docs URLs, or fake “mainnet verified” badge.
- Production shows live network only when chain ID, contract address, and a real successful mainnet transaction have been verified.

---

# 15. Design-reference, mockup, and final UI approval workflow

This phase occurs **after Phase 5 end-to-end functionality acceptance**. No final aesthetic is approved in this blueprint.

1. **Collect references:** ask the operator for URLs, screenshots, products, or written direction. If none are supplied, provide a short candidate set for explicit choice (for example, a wallet-security interface reference for transaction confirmations, a data-dense on-chain explorer for activity history, and a clear editorial-style product page for explanation). These are candidates, not decisions.
2. **Map reference attributes:** for each approved reference, document which layout/hierarchy/density/form/table/transaction-feedback traits are useful and what must remain original. Do not copy logos, proprietary illustrations, or distinctive protected branding.
3. **Produce mockups/prototypes:** at minimum Home, Create, Pipeline Detail in Active and Submitted states, Completed/Rejected state, and mobile versions of Create and Pipeline Detail. Include loading/error/empty/wrong-network variants where relevant.
4. **Present to operator:** show the actual mockups/prototypes and list deliberate deviations from references. Do not treat a written style description as operator approval of screenshots.
5. **Revise:** incorporate feedback and record it.
6. **Hard approval gate:** stop and wait. The coding agent must not implement final colors, typography, visual layout treatment, animation system, or component styling until the operator explicitly approves the mockups/direction. Silence or continued conversation is not approval.
7. **Implement approved visuals:** use the working app and existing contract calls. No behavior/API/state transition/security changes are permitted under a visual-design task.
8. **Record decision:** preserve reference links/assets, mockup files, approval date, accepted decisions, and deviations in `docs/DESIGN_DECISIONS.md` and `AI_HANDOFF.md`.

The final visual system must specify typography, color contrast, spacing, component states, forms, tables/cards, navigation, transaction confirmations, responsive behavior, focus and motion. No design system is chosen here before reference approval.

---

# 16. Third-party integrations

| Integration | Purpose/auth | Data exchanged | Failure policy | Status |
|---|---|---|---|---|
| Arc Studio (browser/CLI) | Required build/test/app workflow; user/operator account | Requirements, source, contract tests, generated app/project URL | If access/export/deploy limitation blocks workflow, stop and report exact block; do not claim Studio coverage | Mandatory |
| Arc JSON-RPC | Reads, simulations, writes/receipts; wallet signs writes | Public contract reads, tx calldata/receipt/events; no app API key required for official public endpoint | Show stale/RPC state and retry read; never auto-retry write | Mandatory |
| EVM wallet | User authorization; transaction signatures stay in wallet | Account address, chain ID, transaction data | User rejection is nonfatal; don't proceed on wrong chain | Mandatory |
| Arc USDC ERC-20 interface | Escrow pull, provider payout, client refund | Amounts/allowances/transfers | SafeERC20, exact amount, state rollback on failure | Mandatory |
| Vercel | Preview/production hosting | Static frontend bundle and client-safe build vars | Report deployment URL, commit, build status; no private keys in hosted env | Mandatory |
| GitHub | Public repo and versioned docs | Source, tests, docs; no secrets | Never fabricate repository URL; confirm public visibility | Mandatory at submission |
| Arc Explorer | Independent contract/transaction evidence | Contract and transaction URLs | If indexer lag, wait/query receipt; no fake proof | Mandatory at submission |

No webhooks, queue, notification service, database, storage provider, analytics SDK, AI API, fiat processor, or third-party indexer.

---

# 17. AI architecture

There is **no runtime AI architecture**. RelayCrew does not call an LLM, execute agents, infer deliverable quality, generate stage assignments, or use model output to authorize payment. All business decisions are deterministic and expressed in the contract.

Arc Studio's AI coding capability is part of the development process, not a runtime integration. Keep any Arc Studio prompt history or screenshots for the submission evidence, but do not ship builder credentials or prompt data with the app. If future work adds AI evaluation, it is out of scope and requires a separate design/security approval; an LLM must never directly move funds without deterministic contract validation and an explicitly designed authorization model.

---

# 18. Payment and financial architecture

## Asset/network

- Arc mainnet chain ID: **5042**; RPC `https://rpc.mainnet.arc.io`; explorer `https://explorer.arc.io`.
- Arc Testnet chain ID: **5042002**; RPC `https://rpc.testnet.arc.io`; explorer `https://explorer.testnet.arc.io`.
- Arc official docs list USDC ERC-20 interface address `0x3600000000000000000000000000000000000000` on mainnet and testnet. That interface uses **6 decimals**. Arc's native gas-token interface has 18 decimals even though it represents the same underlying USDC balance; do not confuse units. Use the ERC-20 interface for escrow and token accounting.

## Payment lifecycle

1. Client authorizes exact allowance to `PipelineCoordinator`.
2. `createPipeline` pulls exact sum of all stage budgets into escrow.
3. Stage allocations stay in the parent escrow. There is no deposit/withdraw to a separate child contract when a new stage starts.
4. Client approval of a submitted stage sends that stage's entire budget to its provider and atomically activates the next stage, whose budget is already reserved in the escrow. This is the on-chain meaning of “funds and triggers the next hire” for the fixed-budget MVP.
5. Final approval pays the final specialist and completes the pipeline.
6. Rejection/expiration refunds all remaining unpaid funds to the client; past payouts are final.

## Financial rules

- Token amounts are integer base units (6 decimals).
- No fees, revenue shares, splits, tips, gas sponsorship, token swaps, cross-chain transfer, native-value transfer, or off-chain payment tracking.
- The app must show budget breakdown and total cap before allowance/funding.
- The contract, not the frontend, calculates totals and releases/refunds.
- A wallet's gas balance must be nonzero in Arc-native USDC terms; show if gas estimate fails.
- Client is responsible for verifying provider addresses; addresses are displayed/checksummed before funding and each payout.
- No payout can be undone. If the client approves incorrectly, RelayCrew cannot reverse a completed transfer.
- No dispute adjudication. Client is trusted as evaluator; provider accepts risk that rejected/expired work receives no payout under the MVP rules.
- Direct token donations to the contract do not count as pipeline budget and are not withdrawable through a generic rescue function.

## Reconciliation

For every pipeline:

`totalBudget = sum(stage budgets)`  
`paidOut = sum(budgets of Paid stages)`  
`remainingEscrow = totalBudget - paidOut - refundedAmount`  
Terminal Completed: paidOut = totalBudget, refund = 0. Terminal Rejected/Expired: refundedAmount = totalBudget - paidOut, remainingEscrow = 0.

Test each invariant after every sequence. Verify on mainnet that the contract transfer event and provider balance change match the expected amount; inspect the `StageReleased`/`StageHired` events on the same transaction.

---

# 19. Admin and operations

No admin UI or admin contract role is necessary. The deployer is not a privileged protocol operator after deployment. The operator's release responsibilities are operational, not on-chain:

- maintain Arc Studio project URL and public repository;
- protect deployment key locally;
- verify compiler, token address, chain ID, bytecode, and contract address;
- set correct Vercel environments and test the preview;
- authorize mainnet deployment and low-value real transfer explicitly;
- monitor submission deadlines and collect proof artifacts;
- stop use if a critical accounting/security bug is discovered.

No user management, moderation, support dashboard, user reports, fraud dashboard, treasury management, or analytics in MVP. User support is a public `/docs` and `/risk` destination plus project repository issues if the operator chooses to enable them; do not invent a support address.

---

# 20. Error and edge-case matrix

| Scenario | Expected behavior | Recovery / evidence |
|---|---|---|
| Missing wallet | Read-only pages remain; write actions prompt connect | Connect and retry |
| Wrong network | Writes disabled, explicit expected chain shown | Switch to configured Arc network; reread config/state |
| Invalid contract env/address | Fail closed with deployment/config error; no dummy data | Fix Vercel env and redeploy; report commit/URL |
| Insufficient USDC | Do not send create call; show required/available amount if reliably read | Add funds; reread balance |
| Insufficient gas | Wallet rejects/estimate fails; don't say “contract error” unless chain confirms | Add native USDC gas; retry manually |
| Insufficient allowance | No auto-unlimited approval; request exact needed allowance | Confirm allowance tx then create |
| User rejects wallet tx | Mark user-cancelled; no failure accusation and no automatic retry | User initiates again |
| RPC timeout before hash | Show unconfirmed and refresh chain; no auto-resubmit create | Reconnect/retry read; inspect wallet activity |
| RPC timeout after hash | Use real hash to fetch receipt and contract state | Do not create duplicate transaction while state uncertain |
| Contract revert | Decode known custom error, otherwise say reverted/unknown | Refresh status, fix input/permission/deadline |
| Duplicate create retry | Do not blindly retry; inspect client pipeline IDs/events | Resume detail if the first transaction succeeded |
| Duplicate submission | Contract reverts because stage is Submitted | Refresh state, show current URI |
| Non-provider submit | Contract rejects | Show role mismatch and assigned provider address |
| Non-client approve/reject | Contract rejects | Show client/evaluator address |
| Out-of-order stage action | Contract rejects noncurrent index/status | Refresh and show current stage |
| Duplicate approval | First one pays once; later one reverts | Confirm receipt and state; never show duplicate success |
| Approve versus expiry race | First valid transaction wins; second reverts | Reload pipeline status, show final state |
| Client rejects while stage Active | Pipeline ends, unpaid escrow refunded, current provider unpaid | Explain no dispute/appeal mechanism |
| Client rejects after submission | Same refund logic; previous payments final | Explain irreversibility in confirmation |
| Provider misses work deadline | Anyone can expire; unpaid amount refunded to client | Terminal Expired state; no restart |
| Client misses evaluation window | Anyone can expire; unpaid amount refunded; submitted provider may remain unpaid | Risk notice; deadline displayed clearly |
| Final stage approval | Full payout and Completed; no next hire event expected | Completion page and final payout tx link |
| Empty user list | Show “No pipelines for this wallet” with create CTA when appropriate | Never show fictional sample pipelines as real |
| Provider duplicate address in form | Block before wallet interaction; contract also rejects | Point to repeated stage field |
| Malicious external URI | Only permitted scheme; no fetch or embed; safe target attributes | Render as controlled external link/plain URI |
| Public brief contains secret | Warn before create; cannot delete from chain | Do not submit; if already on-chain, warn data is public/permanent and treat as exposed |
| Stage string too large | Frontend blocks; contract revalidates | Shorten text |
| Token transfer fails | EVM revert rolls back all state/payout/activation | Show failure; inspect revert and contract balance; no partial status |
| Unexpected direct USDC donation | Do not count as pipeline escrow or allow arbitrary withdraw | Document untracked donation; do not introduce rescue function in response |
| Browser refresh/disconnect | Contract state remains; browser draft may be lost if not submitted | Reconnect and reconstruct from chain; warn unsaved draft is local |
| Vercel preview accidentally configured mainnet | CI/build config should reject; UI write-guard must fail closed | Stop release, fix env, verify chain, redeploy preview |
| GitHub repo private/missing | Submission not complete; footer link not set to guessed URL | Create/verify public repo or stop and ask operator; never expose private repo silently |
| Documentation route/link broken | Phase 8 fails | Fix route, verify deployed URL before release |

---

# 21. Test strategy

## Contract unit tests (Arc Studio required; exported-source local tests recommended)

- Valid create for 2, 3, and 5 stages.
- Reject 0/1/6 stages; zero/client provider; duplicate provider; invalid title/brief lengths; budget under 1 USDC; total >100 USDC; invalid duration; insufficient allowance/balance.
- Exact sum and deposit transfer; all provider/client user indexes correct and unique.
- Stage initial state and deadline; later queued stages have no active deadline until hired.
- Only current provider submits; URI scheme/length boundary; deadline boundary; duplicate submit rejection.
- Only client can approve/reject; approval only Submitted and before evaluation deadline.
- Release exactly one stage budget and activate exactly next stage in same transaction; event assertions share receipt; no next stage active earlier.
- Final approval sets Completed; full budget is paid; no `StageHired` for nonexistent next stage.
- Reject while Active and Submitted; refund remaining precisely; previous payouts remain; status terminal.
- Expire before deadline reverts; expire at/after dueAt if Active succeeds; Submitted stage expires only at/after evaluation deadline; fixed client refund recipient.
- Invariant tests: `paidOut + refundedAmount <= totalBudget`; terminal Completed sum exactly total; terminal Rejected/Expired remainder exactly refunded; no double transfer on repeated/competing transitions.
- Token transfer failure and malicious mock token reentrancy test if time permits.

## Frontend unit tests

- Form bounds, provider duplicates, address parsing/checksum display, total budget integer arithmetic, decimals, duration bounds.
- Network guard blocks wrong-chain writes.
- Approval sequence uses exact allowance, not unlimited.
- Transaction status distinguishes user rejection, pending, reverted, and confirmed.
- Empty, loading, error, wrong-network, terminal-state rendering.
- URI links are shown as text, never rendered as HTML/iframe or automatically fetched.
- No fake demo values are presented as live chain data.

## Integration tests

- Read/write ABI matches deployed testnet contract and addresses.
- Wallet allowance → create/fund → read summary and stage data.
- Submit → approve → exact payout and next stage hired.
- Reject and expire → exact refund and terminal status.
- User pipeline index updates for client and provider.
- After page reload, contract is source of truth and all state is reconstructed.

## End-to-end tests on deployed preview

1. Connect funded test wallet on Arc Testnet.
2. Create a 2-stage pipeline with low test budgets.
3. Confirm pipeline ID, funded escrow, stage 1 Active/stage 2 Queued.
4. Connect as provider 1 and submit a valid test deliverable URI.
5. Connect as non-provider and prove submit fails/does not appear as an allowed UI action.
6. Connect as client and approve; verify provider 1 paid, stage 2 active, both events same tx hash.
7. Submit and approve stage 2; verify Completed and exact balance changes.
8. Separate test: reject active/submitted stage and verify refund.
9. Separate test: allow deadline to pass and expire; verify refund.
10. Change chain/RPC to force error states; confirm no write bypass.

Do not use a production private key in Playwright. Automated E2E must use local/testnet fixtures and controlled test accounts.

## Security tests/review

- Directly call each write as an unauthorized account.
- Reorder stage indexes, call terminal states twice, race approval and expiry, and attempt budget/recipient manipulation.
- Try malicious URI schemes/oversized strings and XSS strings in title/brief/URI display.
- Inspect all contract token transfers for destination/amount correctness.
- Review `.env`/Git history/production build for secrets; run dependency and secret scans if tooling is available.
- Review compiler warnings and contract tests before any mainnet deployment.

## Acceptance evidence

Every phase report must include actual commands/tests run, pass/fail counts, exact preview URL and deployed commit, screenshot or notes of the visible UI changes, known issues, and next single task. “Looks good” or an AI claim alone is not proof.

---

# 22. Repository structure

```text
relaycrew/
├── PROJECT_SPEC.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_PLAN.md
├── AGENTS.md
├── AI_HANDOFF.md
├── README.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
├── .env.example
├── src/
│   ├── app/                 # router, app shell, route boundaries
│   ├── components/          # shared wallet/network/transaction/stage UI
│   ├── features/
│   │   ├── pipelines/       # create, list, detail, stage forms, timeline
│   │   └── wallet/          # connection, network guard, error mapping
│   ├── lib/
│   │   ├── chain.ts         # chain definitions/config validation
│   │   ├── contracts.ts     # generated/exported ABI and address wiring
│   │   ├── errors.ts        # custom error mapping
│   │   ├── amounts.ts       # USDC base unit helpers
│   │   └── explorer.ts      # verified network explorer link construction
│   ├── routes/              # Home, Create, Pipelines, Detail, Docs, Risk, NotFound
│   ├── styles/              # temporary tokens; final styles after approval
│   └── test/                # frontend test setup/fixtures
├── contracts/
│   ├── PipelineCoordinator.sol
│   ├── interfaces/          # minimal interfaces only if not sourced from OZ
│   ├── test/                # Arc Studio and exported-source test artifacts
│   ├── scripts/             # deployment scripts; no private keys committed
│   └── deployments/         # verified addresses by chain (no fake addresses)
├── tests/
│   ├── contract/            # exported-source/Hardhat tests if supported
│   ├── integration/         # testnet integration scripts
│   └── e2e/                 # Playwright journeys
├── public/
│   └── favicon.svg
└── docs/
    ├── USER_GUIDE.md
    ├── DEPLOYMENT.md
    ├── SECURITY.md
    ├── CONTRACT_INTERFACE.md
    ├── REQUIREMENT_MATRIX.md
    ├── DECISIONS.md
    ├── SOURCES.md
    └── DESIGN_DECISIONS.md  # created during mockup phase; records approval/references
```

Purpose: `PROJECT_SPEC.md` is the product source of truth; `ARCHITECTURE.md` captures fixed technical decisions; `IMPLEMENTATION_PLAN.md` drives phase execution; `AGENTS.md` applies persistent behavior rules; `AI_HANDOFF.md` tracks live project state and the single next task; `README.md` gets a developer/operator started. The exported Arc Studio project may have extra generated files; preserve them when required by the Studio build and map them clearly in the README. Do not refactor away generated Arc Studio scaffolding merely for aesthetic consistency.

---

# 23. Environment configuration

No secret is required by the frontend. The environment variables below are build-time values; only the `VITE_` values are client-visible by design.

| Variable | Required | Where | Secret? | Rule |
|---|---|---|---|---|
| `VITE_NETWORK_MODE` | Yes | Frontend build | No | `testnet` for Vercel Preview; `mainnet` only for authorized Production |
| `VITE_CHAIN_ID` | Yes | Frontend build | No | `5042002` for preview; `5042` for production |
| `VITE_RPC_URL` | Optional | Frontend build | No for official public RPC | Default to official Arc RPC for configured network; only override with operator-approved endpoint |
| `VITE_EXPLORER_URL` | Yes | Frontend build | No | `https://explorer.testnet.arc.io` or `https://explorer.arc.io` matching chain |
| `VITE_USDC_ADDRESS` | Yes | Frontend build | No | Official address `0x3600000000000000000000000000000000000000`, reverified at deployment |
| `VITE_PIPELINE_CONTRACT_ADDRESS` | Required after deployment | Frontend build | No | Must be real deployed address for exact chain; no guessed placeholder in release builds |
| `VITE_GITHUB_REPOSITORY_URL` | Required before final release if public repo exists | Frontend build | No | Actual public GitHub repository URL only; not a placeholder or private URL without approval |
| `DEPLOYER_PRIVATE_KEY` | Only for local deploy | Local shell/secret manager | **Yes** | Never in Git, Arc Studio source, Vercel, browser build, logs, or screenshots. Use a dedicated low-value deployer key. |
| `ARC_MAINNET_RPC_URL` | Optional deploy script | Local deployment environment | Public URL, possibly provider-keyed | Use official public endpoint by default; do not put private RPC key in client bundle |
| `ARC_TESTNET_RPC_URL` | Optional deploy/test script | Local/CI test environment | Public URL, possibly provider-keyed | Official testnet endpoint by default |

`.env.example` includes names and comments but no secret values or fabricated deployed addresses. Production build validation must refuse to label a configuration as mainnet unless chain ID equals 5042 and a valid nonzero deployed contract address is present. Preview must be forced to testnet and fail closed if accidentally supplied mainnet values. `DEPLOYER_PRIVATE_KEY` is never passed to the frontend build and never configured in Vercel.

---

# 24. Phased implementation plan

**Methodology:** follow `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md`: inspect before changing, implement only one task/phase, test, inspect, fix, commit, update `AI_HANDOFF.md`, and stop. The early frontend deploy → proven E2E functionality → reference/mockup phase → explicit approval → final visual implementation → frontend/docs completeness → production release order is mandatory.

## Phase 1 — Repository/platform foundation + skeletal frontend deployment

- **Objective:** create the Arc Studio project/repository baseline and a navigable frontend visible at a stable Vercel Preview URL.
- **Dependencies:** operator access to Arc Studio, GitHub, and Vercel; repo may be empty/new.
- **Tasks:** inspect repository and generated Arc Studio output before edits; document the stack/output; establish routes `/`, `/create`, `/pipelines`, `/pipelines/:id`, `/docs`, `/risk`, not-found; add header/footer and temporary styles; clearly mark all unfinished on-chain features; configure preview env pinned to Arc Testnet; connect the actual repo to Vercel; deploy and inspect preview.
- **Files/components:** initial app shell, router, placeholders, chain-config guard skeleton, `.gitignore`, `.env.example`, `README.md`, initial handoff.
- **Database:** none.
- **API:** none; contract calls disabled.
- **UI:** navigable shell and placeholders only.
- **Tests:** install/build/lint; route smoke checks; deployed URL reachability; wrong-chain writes not available.
- **Acceptance:** operator receives exact preview URL and deployed commit; all agreed routes navigate; no live/mainnet transaction action; preview config is testnet only; no fake data presented as live.
- **Verification:** open the actual deployed preview, test desktop/mobile basics, inspect console/build logs, record screenshots/notes.
- **Git checkpoint:** `chore: establish arc studio app shell and preview`.
- **Stop:** report URL, commit, visible screens, incomplete features, tests, blockers. Do not start Phase 2 automatically.

## Phase 2 — Chain/wallet and contract foundation

- **Objective:** configure deterministic Arc chain/wallet interaction and create the minimal contract/test foundation while keeping the preview safe.
- **Dependencies:** Phase 1 accepted; Arc Studio project and exported-source workflow understood.
- **Tasks:** add wagmi/viem config for Arc and Arc Testnet; add network guard; define ABI/types from Studio contract; create `PipelineCoordinator` scaffolding with immutable USDC token; add local/testnet-only environment checks; setup contract test workflow in Arc Studio; add local exported-source toolchain only if compatible.
- **Files/components:** `src/lib/chain.ts`, `contracts/PipelineCoordinator.sol`, test scaffolding, ABI/config, `docs/DECISIONS.md` updates.
- **Database:** none.
- **API:** read/write interface placeholders typed; no endpoint server.
- **UI:** wallet connect, chain status, network guard and test placeholders. No mainnet write.
- **Tests:** chain configuration, bad env config, contract compiles in Arc Studio, USDC address configured/verified.
- **Acceptance:** preview shows accurate testnet badge, wallet connect/read state works, wrong chain blocks writes, contract source compiles in Arc Studio.
- **Verification:** deployed Preview still reachable and reports current commit; confirm no private keys in app/env.
- **Git checkpoint:** `feat: add arc wallet and contract foundation`.

## Phase 3 — Core domain contract and mainnet-feasibility gate

- **Objective:** implement and test the full deterministic on-chain lifecycle in Studio; prove manual export/deployment procedure without rushing into unsafe funding.
- **Dependencies:** Phase 2 accepted.
- **Tasks:** stage/pipeline structures; budget validation; exact `transferFrom`; submission; payout + next hire atomically; rejection/refund; expiration; views/indexes/events; tests covering roles, bounds, edge cases, accounting and event coupling. Export source and confirm deployed-source parity. Test full flow on Arc Testnet. Prepare mainnet deployment script using same source/compiler/dependencies.
- **Files/components:** contract source and tests; deployment script/config; `docs/CONTRACT_INTERFACE.md`, `docs/SECURITY.md`.
- **Database:** none.
- **API:** all contract read/write calls defined in interface docs/ABI.
- **UI:** still temporary; may expose only testnet read-only contract info until integration.
- **Tests:** all contract unit tests; testnet create-submit-approve-next-stage-approve-complete; rejection and expiry refund; payout invariants; exported source compiles identically.
- **Acceptance:** all required contract tests pass; transaction-level evidence on testnet; no known high-severity accounting or authorization defect; deploy path documented. Mainnet gate: before deploying or moving real USDC, **stop and obtain operator's explicit written authorization**. If authorized, deploy to mainnet and conduct a deliberately low-value test transaction; verify real USDC movement and events by the deadline's first 24–48 hours. If the first proof fails, cut optional scope and debug the minimal payment path; don't keep adding features.
- **Verification:** read the deployed testnet contract, verify expected addresses, record tx hashes, contract export commit/version, and test outputs.
- **Git checkpoint:** `feat: implement sequential escrow and milestone hiring`.

## Phase 4 — Functional frontend integration

- **Objective:** connect user flows to real contract state on testnet using plain temporary UI.
- **Dependencies:** Phase 3 contract tests accepted and testnet deployment addresses verified.
- **Tasks:** create/fund form and exact allowance; pipeline dashboard via contract user indexes; detail/stage timeline; provider submit; client approve/reject; permissionless expiry; transaction receipt/error mapping; explorer links; update UI after each confirmed receipt.
- **Files/components:** pipeline feature screens/components, amount helpers, transaction status, ABI, tests.
- **Database:** none.
- **API:** wagmi/viem contract reads/writes only.
- **UI:** behavior complete in temporary styling; preview updated at checkpoints.
- **Tests:** component tests + testnet integration for each action; authorization and network guard.
- **Acceptance:** all writes are user-signed; data reflects chain state after refresh; no fake transactions; payout and next-stage state share receipt; correct errors for wrong roles/status.
- **Verification:** run complete testnet journey manually on deployed preview and record commit/hash evidence.
- **Git checkpoint:** `feat: connect pipeline journeys to arc testnet`.

## Phase 5 — End-to-end functionality completion gate

- **Objective:** finish agreed MVP functionality and prove critical journeys before any final visual redesign.
- **Dependencies:** Phase 4 accepted.
- **Tasks:** complete expiry/refund UI; invalid/empty/loading/permission-denied/not-found states; fix races/retry behavior; verify privacy warning and deliverable links; run tests against preview; inspect no-console-error paths; report remaining limitations.
- **Files/components:** edge-state UI, E2E tests, docs, acceptance report.
- **Database:** none.
- **API:** no new endpoints.
- **UI:** all routes functional and behaviorally complete, visual style still temporary.
- **Tests:** complete E2E checklist from Section 14; security and regression checks.
- **Acceptance:** every end-to-end gate in Section 14 passes or a precisely described exception is explicitly approved by operator. No known critical functional bug. Operator receives preview URL, deployed commit, test evidence and issues list.
- **Verification:** walk the core flow on the deployed preview using testnet and inspect actual chain receipt/logs.
- **Git checkpoint:** `test: verify core pipeline journeys end to end`.
- **Hard stop:** no final visual design before this gate is accepted.

## Phase 6 — Design references and mockups

- **Objective:** agree on visual direction using operator-approved references and evaluate mockups—not code the final look.
- **Dependencies:** Phase 5 accepted.
- **Tasks:** ask operator for references; if none, present candidate references for selection; produce principal desktop/mobile mockups and important states; document borrowed attributes and deviations; show mockups; gather feedback/revise.
- **Files/components:** mockups/prototype assets and draft `docs/DESIGN_DECISIONS.md`.
- **Database/API:** none; no behavior changes.
- **UI:** functional app remains on temporary styling.
- **Tests:** confirm mockups cover route inventory and core states; no implementation changes.
- **Acceptance:** operator has reviewed the mockups and revision history is recorded; no implicit approval.
- **Verification:** present mockups to operator in a reviewable format.
- **Git checkpoint:** `docs: add reference-informed ui mockups`.

## Explicit operator approval gate — STOP

The coding agent must stop after presenting revised mockups. It may not implement final colors, typography, styling, motion, or component appearance until the operator explicitly approves the named direction/mockups. Record approval in `docs/DESIGN_DECISIONS.md` and `AI_HANDOFF.md`. If approval is not given, continue only bug fixes or docs tasks that do not affect final design.

## Phase 7 — Implement approved final UI

- **Objective:** translate only the approved design direction into existing functional screens.
- **Dependencies:** explicit operator approval recorded.
- **Tasks:** implement design tokens/components/responsive styling; maintain existing routes, contract calls, state transitions, APIs and security controls; record deviations and stop for approval if an approved visual demands behavioral changes.
- **Files/components:** design tokens, shared components, page styles, design note.
- **Database/API:** no changes allowed in this phase.
- **UI:** approved aesthetic on working flows.
- **Tests:** visual regression where useful; all component and E2E tests still pass.
- **Acceptance:** approved mockups reflected; no business/API/architecture changes; desktop/mobile checked.
- **Verification:** review deployed preview alongside approved mockups and run the critical flows again.
- **Git checkpoint:** `feat: implement approved relaycrew visual system`.

## Phase 8 — Frontend completion and documentation/footer completeness

- **Objective:** finish the whole frontend, usable docs, links, accessibility, and production-facing details.
- **Dependencies:** Phase 7 accepted; repo public URL verified.
- **Tasks:** finalize nav/footer, `/docs`, `/risk`, metadata/title/description/favicon, not-found, all loading/empty/error/success/denied states, responsive behavior, keyboard/focus/labels/contrast, link audit; ensure home footer Documentation link goes to real `/docs` and GitHub link to actual public repo; write README and all appropriate `docs/` guides; update `AI_HANDOFF.md`.
- **Files/components:** README/docs, `docs/DESIGN_DECISIONS.md`, icons, UI link inventory.
- **Database/API:** none.
- **UI:** complete shell; no inert controls/dead links/unexplained placeholders.
- **Tests:** link checker/manual link audit on deployed preview; accessibility basics; responsive checks; full E2E regression.
- **Acceptance:** all applicable frontend items from Section 14 pass; Documentation and actual GitHub links resolve; if repository must remain private or links should differ, stop and seek operator-approved alternative—never silently expose/omit.
- **Verification:** inspect the actual deployed preview at desktop and mobile sizes; check each nav/footer/CTA/external link.
- **Git checkpoint:** `docs: complete operator docs and frontend release checklist`.

## Phase 9 — Final regression, security, mainnet release, and monitoring

- **Objective:** make an explicitly authorized production release and gather truthful hackathon evidence.
- **Dependencies:** Phases 1–8 accepted; verified source/tests; operator explicitly authorizes mainnet deploy and real transaction.
- **Tasks:** final contract/security review; compile and export code; verify exact USDC address; deploy contract manually to Arc Mainnet; record constructor args, tx, address, compiler/dependencies; inspect mainnet code/ABI; set production Vercel vars; deploy; smoke-test routes/wallet/wrong-chain guard; execute small mainnet pipeline using controlled addresses; verify USDC transfers and events; capture demo video; check public repo and Arc Studio project URL; compile submission package.
- **Files/components:** verified deployment metadata, transaction evidence, final README/docs, `AI_HANDOFF.md`.
- **Database/API:** none.
- **UI:** production configuration fixed to chain 5042 and verified contract.
- **Tests:** full regression on preview and smoke tests production; explorer links open; amounts/recipients match receipts; build and secret scan pass.
- **Acceptance:** public live app works on mainnet; real USDC has moved through contract/app; contract and transaction hashes are verified; public repo and Arc Studio URL real; video walkthrough ready; no dead links or unverified claims.
- **Verification:** open production URL in a fresh browser, connect wallet, inspect contract and transaction links, confirm official explorer evidence and balances.
- **Git checkpoint:** `release: arc mainnet demo and submission evidence`.
- **Stop:** report exact deployed app URL, contract address, all verified tx hashes, GitHub URL, Studio URL, commit, test results and outstanding risks. Do not submit until operator confirms submission copy and links.

### Deadline strategy

The build window is short. Prioritize, in order: (1) Arc Studio project + deployed skeletal preview; (2) minimal contract that passes testnet funding/release/refund; (3) explicit operator-authorized low-value mainnet proof within the first 24–48 hours if feasible; (4) the end-to-end core path; (5) user-approved design; (6) essential frontend/docs/submission artifacts. If the mainnet path is blocked, remove optional UI extras—not the required mainnet proof, Arc Studio use, or critical security checks.

---

# Documentation package map (reference)

The repository must contain these actual documents:

- `PROJECT_SPEC.md` — product, MVP, flows, functional requirements, business rules, UX behavior, acceptance criteria.
- `ARCHITECTURE.md` — contract design, stack, data, permissions, API/contract interface, security, environment/deployment.
- `IMPLEMENTATION_PLAN.md` — one-phase-at-a-time plan and hard gates.
- `AGENTS.md` — durable implementation executor rules.
- `AI_HANDOFF.md` — current state, actual preview URL/commit, tests, blockers, design approval and docs-link status, single next task.
- `README.md` — developer/operator setup and commands.
- `docs/USER_GUIDE.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/CONTRACT_INTERFACE.md`, `docs/REQUIREMENT_MATRIX.md`, `docs/DECISIONS.md`, `docs/SOURCES.md`, and `docs/DESIGN_DECISIONS.md` created/maintained during the appropriate phase.

All operational values (deployed URLs, commit SHA, contract address, transaction hashes, GitHub URL, Arc Studio project URL) start as **Not yet created / Not yet verified**. They are updated only from verified results; they must never be guessed.

---

# 25. `PROJECT_SPEC.md`

The actual file is delivered separately in the package. It is the source of truth for product behavior, limits, user flows, requirements, state machine, and acceptance.

# 26. `ARCHITECTURE.md`

The actual file is delivered separately in the package. It is the source of truth for system topology, contract interface, stack, security, and deployment boundaries.

# 27. `IMPLEMENTATION_PLAN.md`

The actual file is delivered separately in the package. It defines the nine mandatory phases, verification gates, and operator approval stop.

# 28. `AGENTS.md`

The complete persistent implementation-executor rules are provided in the separate `AGENTS.md` file in the package. It governs scope, safety, phase sequencing, testing, preview deployment, mockup approval, documentation, commits, and stop conditions.

# 29. `AI_HANDOFF.md`

The initial `AI_HANDOFF.md` is provided as a separate file in the package. It truthfully records that implementation has not started and that no project preview, deployed commit, contract, or transaction exists. It contains the exact first task for the coding agent and the single-task-per-phase rule.

---

# 30. Final pre-implementation audit

## Contradictions resolved

- **ERC-8183 versus mainnet deployment:** do not claim standard compliance or depend on a mainnet ERC-8183 address. Use a single custom linear pipeline escrow; Arc's docs currently publish the reference deployment on testnet.
- **Orchestrator:** on-chain contract only; no off-chain release listener or queue.
- **Topology:** one parent escrow with stage records, not nested child contracts. All budgets funded up front; release pays current provider and activates the next preassigned specialist.
- **Evaluator:** client for every stage; no independent verifier or AI.
- **Stage plan:** fixed and immutable at funding time; provider order and budgets cannot change.
- **Unused funds:** rejection/expiry refunds all remaining unpaid budget; previous payments stay final; no skip, cancellation, restart, or arbitration.
- **Database/backend:** none. Contract data + wallet reads suffice for MVP; user pipeline index is maintained on-chain.
- **AI:** no runtime AI; Arc Studio only as build tool.
- **Preview/production safety:** preview exclusively testnet; no real transfers before operator approval; mainnet env only on Production.
- **Design gate:** final UI remains unapproved and blocked until functional E2E acceptance, references/mockups, review, and explicit operator approval.
- **Docs/footer:** `/docs` route required; GitHub link uses only verified public repo URL; no dead links/placeholders in final release.

## Residual risks explicitly accepted for MVP

- The bespoke contract is not independently audited and may contain unknown defects. Budget caps and operator authorization limit exposure; they do not make it secure.
- Client is the sole evaluator. It can reject a stage, and no dispute process protects either side. This is a deliberate MVP trust assumption.
- An evaluator may fail to approve within 24 hours, leading to expiry and refund despite submitted work. The UI must make the window visible.
- Task briefs and deliverable references are public permanently. No private workflow should use the product.
- Mainnet deployment from exported Arc Studio source is a manual process; source/artifact/constructor parity must be verified.
- Public RPC endpoints can be rate-limited/unavailable; app shows errors instead of fabricated status.
- The official hackathon page could not be directly fetched in this verification pass; recheck the cutoff and required form fields before submission.

## Final implementation blockers / decisions

None of the five design questions from the ideation handoff remain delegated to the coding agent. The chosen architecture is intentionally small and concrete. The operator's only required future approvals are action gates, not product-design questions: (1) approve a specific low-value mainnet deployment/transaction before money moves; (2) select/approve final UI references/mockups during Phase 6; (3) authorize the production release/submission; and (4) decide if a private repo exception is ever required (the hackathon normally requires a public repo).

## Reverification checklist before mainnet

- Re-open official hackathon page and confirm exact cutoff/time zone/required artifacts.
- Re-open official Arc contract-address page and confirm USDC interface address and decimals.
- Confirm Arc mainnet chain ID/RPC/explorer in current Arc docs.
- Confirm Arc Studio project URL, export, source commit, and test run.
- Verify exact contract constructor argument `0x3600000000000000000000000000000000000000` against official Arc docs at deployment time.
- Verify preview is on testnet and production config is not activated until operator approval.
- Validate no secret is committed or included in Vercel bundle.
- Review contract balances/accounting after a complete low-value pipeline and on explorer.

## Sources (checked 2026-10-28 unless noted)

- **Arc Studio documentation:** https://developers.circle.com/ai/arc-studio — states Arc Studio writes/previews/deploys apps and deploys to Arc Testnet.
- **Arc contract addresses:** https://docs.arc.io/arc/references/contract-addresses — lists USDC ERC-20 interface as `0x3600000000000000000000000000000000000000`, 6 decimals; native gas-token precision differs; lists ERC-8183 reference implementation on testnet.
- **Connect to Arc:** https://docs.arc.io/arc/references/connect-to-arc — mainnet chain ID 5042, RPC `https://rpc.mainnet.arc.io`, explorer `https://explorer.arc.io`; testnet chain ID 5042002, RPC `https://rpc.testnet.arc.io`, explorer `https://explorer.testnet.arc.io`; mentions wagmi/viem.
- **Arc ERC-8183 quickstart:** https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job — expressly a testnet lifecycle example.
- **ERC-8183 draft:** https://eips.ethereum.org/EIPS/eip-8183 — reference semantics/security context only; this MVP does not claim compliance.
- **Hackathon official page:** https://dorahacks.io/hackathon/arc-microgrants-2/detail — requested source, but the page fetch returned 405 during this verification pass. The official submission form must be checked directly before submitting; exact cutoff and any form fields are not independently confirmed here.
- **Secondary event description:** https://www.eventbrite.com/e/httpsdorahacksiohackathonarc-microgrants-2detail-tickets-2003559137314?aff=ebdssbdestsearch — displays Nov 1, 2026, a noon-to-12:59 PM Pacific window and says submissions close Nov 1. The listing labels the time PDT, but US Pacific daylight time ends at 2:00 AM on Nov 1, 2026; the display may therefore be ambiguous by one hour. The previous session's 2026-11-02 04:59 UTC estimate is substantially later. Treat 2026-11-01 20:59 WAT (Africa/Lagos) as a conservative working cutoff pending confirmation in the actual DoraHacks submission form. This is a secondary listing, not final proof of the deadline.
- **Methodology reference:** `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md` supplied by the operator. Follow early preview, functionality-before-polish, mockup approval gate, final frontend/docs completeness, evidence-based testing, small commits, and one phase at a time.

---

# CODING AGENT START POINT

**Give the agent this exact first task.** It is an inspection-only preflight that prevents incompatible generated scaffolding from being changed blindly. The first implementation task follows after this report is accepted.

```text
Read these files before doing anything: AGENTS.md, AI_HANDOFF.md, PROJECT_SPEC.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, docs/DECISIONS.md, docs/CONTRACT_INTERFACE.md, docs/SECURITY.md, and PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md.

TASK: PRE-PHASE-1 PREFLIGHT INSPECTION ONLY.

Do not modify, create, or delete files. Do not install or upgrade dependencies. Do not change configuration. Do not deploy. Inspect the current working directory/repository and any existing Arc Studio project and report:
1. repository structure and current Git branch/working-tree state;
2. whether an app repository, Arc Studio project, generated source, and package manifest actually exist;
3. framework, dependency versions, package scripts, application entry points, route setup, and generated Arc Studio scaffolding that must be preserved, where present;
4. actual local development, build, lint/typecheck, test, and deploy commands (report “not present” when not present; do not invent commands);
5. existing contract source/ABI/test artifacts and whether they are generated by Arc Studio;
6. how a stable Vercel Preview can be deployed without exposing secrets or connecting to mainnet;
7. compatibility findings against the fixed React + TypeScript + Vite + wagmi/viem architecture;
8. specific blockers or operator access/workspace prerequisites.

Do not redesign the product, propose new features, choose a new architecture, or silently migrate frameworks. If no application repository or Arc Studio-generated project exists yet, report that as the current state—not as an architecture failure—inventory the available blueprint files and STOP. If a generated environment exists but is materially incompatible with the documented architecture, explain the exact conflict and STOP for operator direction. If the existing environment is compatible, report readiness and STOP. Update no files during this preflight.

End with the exact heading “PREFLIGHT RESULT”, a concise compatible/incompatible verdict, evidence, known blockers, and the single recommended next task. Then STOP and wait for the operator’s instruction.

IMPORTANT: This task is inspection only; it is not authorization to deploy a contract, use mainnet, move real USDC, create production resources, or implement application code.
```

After the preflight report is accepted, the next instruction is **Phase 1 only** from `IMPLEMENTATION_PLAN.md`: build and deploy the testnet-only skeletal frontend, report the exact Preview URL and deployed commit, verify the deployed shell, commit, update `AI_HANDOFF.md`, and stop. Do not jump ahead to contract implementation or final UI design.

