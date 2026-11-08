# ARCHITECTURE.md — RelayCrew

**Status:** Fixed design baseline. Any architectural change requires explicit operator approval.  
**Last reviewed:** 2026-10-28.

## 1. Architecture summary

RelayCrew is a client-side EVM application over a single Solidity `PipelineCoordinator` contract on Arc. The contract is the source of truth for pipeline state, stages, authorization, escrow accounting, payments, refunds, deadlines, and events. The client signs all state-changing transactions. There is no conventional backend, database, event watcher, queue, admin service, AI runtime, or indexer.

The contract is custom-built for the linear pipeline. It is ERC-8183-inspired in its client/provider/evaluator lifecycle, but must not be advertised as ERC-8183-compliant. Arc's official contract-address list currently shows the reference implementation on testnet, not a mainnet address. The custom coordinator's release→next-hire transition is the key product behavior.

## 2. Fixed decisions

### Orchestrator locus

On-chain `PipelineCoordinator`. Approval pays the current provider and activates the next stage in the same EVM transaction. No off-chain listener triggers a hiring action; the event is an audit signal for UI/history.

### Job topology

One parent pipeline and one shared escrow, with per-stage records inside the contract. All stage budgets are summed and funded once before work begins. When a stage is approved, its full amount leaves escrow; the next stage's budget remains escrowed and is made active. No child contract is deployed per stage.

### Evaluator identity

The pipeline client is the evaluator for all stages. A provider submission moves the stage to `Submitted`; only client approval pays it. The client can reject the current Active or Submitted stage. There is no arbitration, appeal, or quality oracle.

### Stage specification

Provider addresses, stage order, title, brief, budgets, and stage duration are immutable at pipeline creation/funding. Future stage budgets are reserved in the parent escrow from the start. Dynamic assignments, edits, skips, and alternate routing are excluded.

### Unused budget / early stop

There is no cancellation or skip function after funding. If the client rejects the current stage or an eligible deadline expires, pipeline becomes terminal and all unpaid funds are returned to the client. Previously paid providers keep their payouts. No automatic restart.

### Operator-authorized amendments (2026-10-30)

The operator explicitly authorized the following Phase 8.5 changes:

- `MAX_STAGES` is raised from 5 to 10. The maximum total budget remains 100 USDC, and the per-stage minimum remains 1 USDC.
- The frontend adds a light/dark theme toggle using Tailwind's class-based dark mode. The on-chain contract and accounting are unaffected.
- The create form replaces the raw-seconds duration field with Days and Hours selectors. The UI converts the selection to integer seconds before calling `createPipeline`.
- The create form adds an optional attachment URL. When provided, it is appended to the public on-chain brief as `Attachment: <url>`; the combined brief must remain within the contract's 240-byte limit. The field is a link reference only; the app does not fetch or embed its contents.
- The official tagline is “Escrow for Agent Workflows.”

These amendments do not change the evaluator, escrow topology, role checks, settlement rules, or no-admin security model.

## 2A. Alternatives deliberately rejected

| Alternative | Decision and reason |
|---|---|
| Nested ERC-8183 child contracts per stage | Rejected for MVP. It adds child-contract creation/funding/refund interactions and relies on a mainnet reference address that the current Arc contract-address page does not list. The custom one-escrow model makes payout + next-stage activation atomic and simpler to validate. |
| Off-chain orchestrator/event listener | Rejected because a listener could be down, delayed, duplicated, or require a privileged server. The contract itself activates the next stage during the release transaction. |
| Database + REST backend | Rejected because all authoritative state and money transitions are on-chain, and public user-index arrays meet the demo's scale. A database could drift from chain truth. |
| Next.js server routes / Express API | Rejected for this MVP because no server-side business logic, private API, or database is required. A Vite client reduces the runtime surface. If Arc Studio's generated project is incompatible with Vite, stop for operator decision rather than silently migrating. |
| Supabase/Postgres/Redis/queue | Rejected; no off-chain records or background jobs are needed. The event/hire coupling is synchronous on chain. |
| LLM evaluator or autonomous runtime | Rejected; evaluation is client-controlled and payment authorization must remain deterministic. |
| ERC-8004 reputation or marketplace | Rejected as explicit scope creep; providers are preassigned by the client and the product does not discover or rank agents. |
| Multiple tokens / fiat rails / CCTP | Rejected to narrow accounting and deadline risk. Only Arc USDC ERC-20 interface is used. |
| Contract owner, pause, upgrade proxy, generic rescue | Rejected to avoid privileged control and broad attack surface. Consequence: a design bug may not be recoverable; disclose this risk and test thoroughly. |
| Hosted indexer / The Graph | Rejected for demo scale; contract-maintained user indices and direct reads suffice. If RPC history limits become a blocker, report it rather than silently adding a service. |
| Final design before functionality | Rejected by the operator's workflow; critical E2E proof must precede reference-led mockups and the explicit approval gate. |

## 3. Network and token configuration

### Arc Mainnet

- Chain ID: `5042`
- RPC: `https://rpc.mainnet.arc.io`
- Explorer: `https://explorer.arc.io`

### Arc Testnet

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.io`
- Explorer: `https://explorer.testnet.arc.io`

### USDC

- ERC-20 interface: `0x3600000000000000000000000000000000000000` (must be reverified against current official docs immediately before deployment).
- ERC-20 precision: 6 decimals. All escrow, payout, budget, total, and refund amounts use this interface and integer base units.
- Arc native gas token precision is 18 decimals; this is not the amount unit used for ERC-20 escrow. Do not mix them or show separate native and ERC-20 USDC balance rows.

Arc Studio docs state its deploy path targets Arc Testnet. Use Studio for authoring/generation and testing, export the tested source, then manually deploy that exact source to Arc Mainnet after operator authorization.

## 4. System diagram

```text
React + TypeScript + Vite (Vercel)
  ├─ routes and shared UI
  ├─ wagmi (wallet + TanStack Query integration)
  ├─ viem (chain config, contract reads/writes, simulations, receipts)
  └─ no secrets or server-side business logic
              |
              | Arc JSON-RPC
              v
Arc Mainnet / Arc Testnet
  └─ PipelineCoordinator.sol
       ├─ immutable USDC interface address
       ├─ pipeline metadata + stage array
       ├─ fixed role/state/deadline rules
       ├─ escrow balance accounting
       ├─ SafeERC20 transfers + ReentrancyGuard
       └─ Pipeline/Stage events
              |
              v
USDC ERC-20 interface

Arc Studio = required build environment for contract, tests, and app.
GitHub = source, tests, handoff and project docs.
Vercel = early Testnet Preview and final Mainnet Production site.
Arc Explorer = independent transaction and contract evidence.
```

## 5. Contract domain model

### Pipeline record

`Pipeline` stores:

- `client: address`
- `totalBudget: uint256`
- `paidOut: uint256`
- `refundedAmount: uint256`
- `currentStageIndex: uint8`
- `stageCount: uint8`
- `status: PipelineStatus`
- `createdAt: uint64`
- `finishedAt: uint64` (0 until terminal)

`PipelineStatus`: `Active`, `Completed`, `Rejected`, `Expired`.

### Stage record

`Stage` stores:

- `provider: address`
- `budget: uint256`
- `title: string` (1–64 bytes)
- `brief: string` (1–240 bytes, public)
- `durationSeconds: uint32` (900–604800)
- `status: StageStatus`
- `startedAt: uint64`
- `dueAt: uint64`
- `submittedAt: uint64`
- `evaluationDeadline: uint64`
- `deliverableURI: string` (empty until submitted, 9–256 bytes, `https://` or `ipfs://`)

`StageStatus`: `Queued`, `Active`, `Submitted`, `Paid`, `Rejected`, `Expired`.

All strings, transaction calldata and logs are public. No private brief, private file link, email, API credential, or PII may be included.

### Indexes

- `nextPipelineId` or monotonic `pipelineCount`.
- `mapping(pipelineId => Pipeline)`.
- `mapping(pipelineId => Stage[])`.
- `mapping(address => uint256[]) userPipelineIds`.
- `mapping(pipelineId => mapping(address => bool)) userAlreadyIndexed` or equivalent for duplicate-free membership.

On creation, index pipeline ID for client and each provider exactly once. A provider cannot equal client and cannot repeat within one pipeline.

## 6. Contract interface

### `createPipeline(StageInput[] stages)`

1. Validate stage count 2–10.
2. Validate every provider: nonzero, not `msg.sender`, unique within input.
3. Validate titles/briefs and duration bounds.
4. Require each stage budget ≥ 1 USDC (1,000,000 base units).
5. Sum budgets inside contract; require total ≤ 100 USDC (100,000,000 base units).
6. Pull exact total budget from client through `SafeERC20.safeTransferFrom`.
7. Create pipeline ID and immutable stage input data.
8. Mark pipeline Active; first stage Active with `dueAt = block.timestamp + durationSeconds`; remaining stages Queued with no active deadline.
9. Add user indexes; emit `PipelineCreated` and `StageHired` for the first stage.
10. Revert the complete call if validation/token transfer fails.

Allowance is a separate ERC-20 transaction from the browser. The UI must await the receipt before calling `createPipeline`.

### `submitStage(uint256 pipelineId, uint256 stageIndex, string deliverableURI)`

- Caller is current stage provider.
- Pipeline is Active; `stageIndex == currentStageIndex`; stage is Active.
- Work deadline has not passed (`block.timestamp < dueAt`).
- URI is 9–256 bytes, and begins with `https://` or `ipfs://`.
- Store URI; stage becomes Submitted; set `submittedAt` and `evaluationDeadline = submittedAt + 24 hours`; emit `StageSubmitted`.

The contract does not fetch or validate content behind URI. UI must not embed or server-fetch URI. Deliverable reference itself is public.

### `approveStage(uint256 pipelineId, uint256 stageIndex)`

- Caller must equal pipeline client.
- Pipeline Active; index is current; stage Submitted; timestamp before evaluation deadline.
- Mark stage Paid and increase paidOut before external token transfer (checks-effects-interactions; protected by `nonReentrant`).
- Transfer exact stage budget to provider.
- If final: set Pipeline Completed and finish timestamp; emit completion/release events.
- Otherwise: increment current index; set next stage Active; set `startedAt` and `dueAt = block.timestamp + durationSeconds`; emit `StageReleased` and `StageHired` for next stage in same transaction.
- A token transfer revert rolls back payout and stage activation together.

### `rejectStage(uint256 pipelineId, uint256 stageIndex)`

- Caller must equal client; current stage index; current stage Active or Submitted; not beyond relevant deadline.
- Mark stage Rejected and pipeline Rejected.
- Compute remaining amount as `totalBudget - paidOut - refundedAmount`; store refundedAmount before token transfer; return all remaining amount to immutable client address.
- Emit `StageRejected`, `PipelineRejected`, and `PipelineRefunded`.
- Previous Paid stages remain paid. No restart/appeal.

### `expirePipeline(uint256 pipelineId)`

- Anyone may call.
- Pipeline Active, with either (a) current stage Active and `now >= dueAt` or (b) current stage Submitted and `now >= evaluationDeadline`.
- Mark stage and pipeline Expired; set exact remaining refund accounting; send remaining funds to immutable client.
- Caller is never refund recipient. Terminal state and status checks prevent double refund.

### Read views

- `pipelineCount()` — total pipelines created; IDs start at 1, so it returns `nextPipelineId - 1` (or the equivalent tracked total).
- `getPipelineSummary(id)` — client, total, paid, refunded, current index, count, status, created and finished timestamps.
- `getStage(id,index)` — provider, budget, title, brief, status, duration and timestamps, URI.
- `getUserPipelineIds(address)` — IDs where address is client or assigned provider.
- `usdc()` — immutable configured token.

### Events

- `PipelineCreated(pipelineId, client, totalBudget, stageCount)`.
- `StageHired(pipelineId, stageIndex, provider, budget, dueAt)`.
- `StageSubmitted(pipelineId, stageIndex, provider, deliverableURI, evaluationDeadline)`.
- `StageReleased(pipelineId, stageIndex, provider, amount)`.
- `StageRejected(pipelineId, stageIndex, client)`.
- `StageExpired(pipelineId, stageIndex)`.
- `PipelineCompleted(pipelineId, client)`.
- `PipelineRejected(pipelineId, client)`.
- `PipelineExpired(pipelineId, client)`.
- `PipelineRefunded(pipelineId, client, amount)`.

Event parameter names/order may be adjusted only if required by compiler or Arc Studio generation; semantic content must remain, and any ABI drift must be documented before integration.

## 7. Accounting invariants

- `totalBudget == sum(stage.budget)` at creation and never changes.
- `paidOut == sum(budget of Paid stages)`.
- `paidOut + refundedAmount <= totalBudget`.
- `remainingEscrow == totalBudget - paidOut - refundedAmount`.
- While Active, `refundedAmount == 0`.
- Completed: every stage Paid; `paidOut == totalBudget`; `refundedAmount == 0`.
- Rejected/Expired: no future state changes; `refundedAmount == totalBudget - paidOut`; no remaining escrow.
- Stage payout exactly once; refund exactly once.
- Only a successful approval emits a release; nonfinal approval emits a `StageHired` event for the next stage in the same receipt.

## 8. Contract security requirements

- Solidity 0.8.x, pinned compiler.
- OpenZeppelin SafeERC20 and ReentrancyGuard; no custom token transfer helper.
- No arbitrary token contract, external hook, delegatecall, upgradeability, owner withdrawal, generic rescue, treasury, fee, or admin override.
- Enforce all limits on-chain, not merely in form logic.
- State checks, current index checks and monotonic pipeline IDs protect replay/duplicate transitions.
- Use checks-effects-interactions. Guard all transfer-bearing entrypoints.
- Bound loops to max ten stages and bound strings.
- URI validator must check scheme and length before storage.
- Verify compiler/dependencies, warnings and complete test suite before any mainnet deployment.
- This is a new, unaudited contract; show risk notice and keep maximum pipeline size at 100 USDC for this build.

## 9. Frontend stack and boundaries

- React + TypeScript + Vite, Tailwind temporary styling.
- wagmi + viem; Arc/Arc Testnet chain definitions where supported.
- Vitest + Testing Library; Playwright for E2E.
- No backend or external DB.
- Use exact chain configuration and fail closed on missing/mismatched addresses.
- Use integer base units and six decimals.
- All contract writes require explicit user confirmation through wallet.
- All success states derive from successful transaction receipt and subsequent contract read.
- No secret may appear in browser bundle; deployment key remains local-only.

The generated Arc Studio framework must be inspected before modifications. The intended architecture is fixed; if Studio's export conflicts with React/Vite in a way that requires a framework migration, stop and ask the operator rather than silently changing stack.

## 10. Client-side contract API

There is no REST API. Frontend uses these methods:

| Method | Use | State-changing? |
|---|---|---|
| `pipelineCount()` | list scope/read configuration | No |
| `getPipelineSummary(id)` | header/status/money totals | No |
| `getStage(id,index)` | stage details and timeline | No |
| `getUserPipelineIds(address)` | connected wallet dashboard | No |
| `usdc()` | verify token config | No |
| USDC `balanceOf(address)` | show balance/preflight | No |
| USDC `allowance(owner,coordinator)` | exact allowance workflow | No |
| USDC `approve(coordinator, amount)` | exact allowance | Yes |
| USDC `approve(coordinator, 0)` | reset nonzero allowance when required | Yes |
| `createPipeline(stages)` | deposit and create | Yes |
| `submitStage(id,index,uri)` | provider submission | Yes |
| `approveStage(id,index)` | payout + next hire | Yes |
| `rejectStage(id,index)` | terminal refund | Yes |
| `expirePipeline(id)` | eligible terminal refund | Yes |

Map contract custom errors to user-friendly descriptions. For unknown reverts, show a generic failure and never expose a secret or claim success.

## 11. Environment/deployment

### Client-safe build variables

- `VITE_NETWORK_MODE`: `testnet` or `mainnet`.
- `VITE_CHAIN_ID`: `5042002` for Preview, `5042` for Production.
- `VITE_RPC_URL`: official public endpoint by default.
- `VITE_EXPLORER_URL`: matching official explorer.
- `VITE_USDC_ADDRESS`: official address reverified before deployment.
- `VITE_PIPELINE_CONTRACT_ADDRESS`: actual deployed address for configured network, not a placeholder in release build.
- `VITE_GITHUB_REPOSITORY_URL`: actual public repo URL after verified.

### Local deploy-only variables

- `DEPLOYER_PRIVATE_KEY`: secret, local only, never committed, never in Vercel/client/Arc Studio prompt/screenshots.
- `ARC_MAINNET_RPC_URL`: optional local deployment endpoint; official public RPC by default.
- `ARC_TESTNET_RPC_URL`: optional test endpoint; official public RPC by default.

### Hosting rules

- Vercel Preview must be configured only for Arc Testnet and test funds.
- Vercel Production must remain disabled/not promoted until operator authorizes release and the contract address is verified.
- Never set `DEPLOYER_PRIVATE_KEY` in Vercel; user wallet signs app transactions.
- Every accepted phase updates the deployed preview; each report includes exact URL, deployed commit, tested behavior, limitations, and blockers.
- Mainnet contract deployment is a separate operator-authorized step after export; Arc Studio's deploy flow is testnet-only.

## 12. Deployment and evidence checklist

1. Recheck Arc docs for chain IDs and USDC interface address.
2. Compile/test within Arc Studio and export source.
3. Confirm exported code matches the tested contract and compiler/dependency versions.
4. Complete full testnet lifecycle tests and security review.
5. Receive explicit operator authorization for mainnet deployment and low-value USDC movement.
6. Deploy with the verified USDC address; record deployment hash/address/constructor parameters/compiler.
7. Verify the address and contract on Arc Explorer if supported by the network's explorer process.
8. Configure Production Vercel to chain 5042, real contract address and official explorer.
9. Run small end-to-end pipeline with controlled addresses, verify USDC transfer and events.
10. Record funding, each `StageReleased`/`StageHired`, and final completion/refund tx hashes.
11. Verify public app, source repository, Arc Studio project URL, docs link and GitHub link.

## 13. Residual risks

- Custom contract unaudited; limits reduce exposure but do not eliminate risk.
- Client evaluator has discretionary reject power; there is no adjudicator.
- If the client misses 24-hour review deadline after a provider submits, pipeline expires and unspent funds return to client; provider may be unpaid.
- Briefs/URIs are public and permanent.
- Public RPC may fail or rate-limit; app must show stale/error state.
- Arc Studio mainnet deployment is not available as the automatic deploy path; manual source/export parity must be verified.

## 14. Source links

- Arc Studio: https://developers.circle.com/ai/arc-studio
- Arc contract addresses: https://docs.arc.io/arc/references/contract-addresses
- Arc network configuration: https://docs.arc.io/arc/references/connect-to-arc
- Arc ERC-8183 testnet quickstart: https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job
- ERC-8183 draft: https://eips.ethereum.org/EIPS/eip-8183
- Hackathon page (reverify deadline/artifacts before submission): https://dorahacks.io/hackathon/arc-microgrants-2/detail
