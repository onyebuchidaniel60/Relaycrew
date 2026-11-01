# Contract Interface and Event Reference

**Contract name:** `PipelineCoordinator` (implemented).

**Status:** Implemented and tested in Arc Studio (Solc 0.8.28; 31 Foundry tests; `MAX_STAGES = 10`). Deployed to **Arc Mainnet** at [`0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114`](https://explorer.arc.io/address/0x9b85cd94f9dedd8ee6ef09a5c904502da52a9114) on 2026-11-01. Mainnet deployment tx: `0x05354169f4406c949d15e8eae6a94c42d4dc323821022f40aacd4dc52542aa7e`. Constructor USDC: `0x3600000000000000000000000000000000000000`; on-chain `usdc()`, `MAX_STAGES()`, and `pipelineCount()` were verified after deployment. Mainnet pipeline E2E transaction hashes are pending operator browser-wallet execution. The same tested ABI is embedded in `src/lib/contracts.ts`.

Testnet deployment: [`0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070`](https://explorer.testnet.arc.io/address/0x7f9fc5bc88876e07e6674cd29bc73b9dbf02f070), tx `0xc4e95d930cefbd61266f3c603915ceae928046f2d28e1a7a89e44ce76a2f98d3`. The previous 5-stage testnet deployment at `0x85bbf546b09d990959de0672c273b56400f84f05` is superseded. This is unaudited experimental software.

## Core types

### Pipeline status

`Active`, `Completed`, `Rejected`, `Expired`.

### Stage status

`Queued`, `Active`, `Submitted`, `Paid`, `Rejected`, `Expired`.

### Stage input

- `provider`: address, nonzero and distinct from client/other providers in this pipeline.
- `budget`: integer USDC ERC-20 base units, at least 1,000,000 (1 USDC).
- `title`: 1–64 bytes.
- `brief`: 1–240 bytes, public and permanent.
- `durationSeconds`: integer 900–604800.

Pipeline constraints: 2–10 stages, total no more than 100,000,000 USDC base units (100 USDC), providers unique and not client. Contract computes total itself.

## Write methods

### `createPipeline(stages)`

- Caller becomes client/evaluator.
- Pulls exact total from client via USDC `transferFrom`.
- Creates pipeline and fixed stage order; first stage Active, remaining Queued.
- Emits `PipelineCreated` and initial `StageHired`.
- Requires exact USDC allowance first, from a separate transaction.

### `submitStage(pipelineId, stageIndex, deliverableURI)`

- Current provider only; current stage must be Active and within work deadline.
- URI 9–256 bytes; allowed scheme is `https://` or `ipfs://`.
- Stage becomes Submitted; evaluation deadline is submission time + 24 hours.

### `approveStage(pipelineId, stageIndex)`

- Client only; current stage must be Submitted and not past evaluation deadline.
- Pays exact budget to current provider.
- Activates next queued stage in same transaction, or marks pipeline Completed if final stage.

### `rejectStage(pipelineId, stageIndex)`

- Client only; current stage must be Active or Submitted and relevant deadline still open.
- Terminates pipeline and refunds all remaining unpaid budget to client.

### `expirePipeline(pipelineId)`

- Permissionless when current Active stage is past work deadline or Submitted stage past evaluation deadline.
- Terminates and refunds all remaining unpaid budget to client. Caller never receives the refund.

## Read methods

- `pipelineCount()` — total pipelines created (IDs start at 1, return value is `nextPipelineId - 1`).
- `getPipelineSummary(pipelineId)`
- `getStage(pipelineId, stageIndex)`
- `getUserPipelineIds(address)`
- `usdc()`

Exact return tuple shapes are generated from the tested source and embedded in `src/lib/contracts.ts`. Do not hand-edit a mismatched ABI.

## Events

- `PipelineCreated(pipelineId, client, totalBudget, stageCount)`
- `StageHired(pipelineId, stageIndex, provider, budget, dueAt)`
- `StageSubmitted(pipelineId, stageIndex, provider, deliverableURI, evaluationDeadline)`
- `StageReleased(pipelineId, stageIndex, provider, amount)`
- `StageRejected(pipelineId, stageIndex, client)`
- `StageExpired(pipelineId, stageIndex)`
- `PipelineCompleted(pipelineId, client)`
- `PipelineRejected(pipelineId, client)`
- `PipelineExpired(pipelineId, client)`
- `PipelineRefunded(pipelineId, client, amount)`

The final ABI may use equivalent names/field ordering if Arc Studio compiler/tooling constraints require it; preserve semantic event contents and update this file before integration.

## Invariants to test

- Total budget equals sum of stages.
- Payout only occurs for Paid stage and exactly once.
- Next stage activation and preceding payout share one successful transaction.
- Completed has all stage budgets paid and no refund.
- Rejected/Expired refunds total budget minus prior payouts.
- Caller never chooses payout/refund recipient.
- Unauthorized, out-of-order, repeated, deadline-invalid calls revert.

## Illustrative transaction contract (not a real deployed record)

A client submits the stage list and signs USDC approval for the computed total. Once `createPipeline` is confirmed, the contract emits a `PipelineCreated` event containing the actual pipeline ID, client, total budget and count, plus `StageHired` for index 0. In a later transaction, the client calls `approveStage` for the submitted current stage. That transaction emits `StageReleased` for the current provider and `StageHired` for the next stage (except on the final stage). The explorer link and transaction hash shown by the app must come from the actual receipt; no example hash or fake address is valid evidence.
