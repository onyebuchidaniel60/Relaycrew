# Contract Interface and Event Reference

**Contract name:** `PipelineCoordinator` (planned).  
**Status:** design/interface baseline; ABI and signatures must be generated from actual tested Arc Studio source before integration. Do not treat this document as a compiled ABI.

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

Pipeline constraints: 2–5 stages, total no more than 100,000,000 USDC base units (100 USDC), providers unique and not client. Contract computes total itself.

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

Exact return tuple shape must be finalized from the tested source and included in generated TypeScript ABI types. Do not hand-edit a mismatched ABI.

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
