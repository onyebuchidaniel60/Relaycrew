# RelayCrew — Feature Requirement Matrix

**Status:** Normative implementation requirements. This document expands FR-01–FR-10 in `PROJECT_SPEC.md`. No behavior may be inferred beyond these definitions without operator approval.

## Feature requirement matrix (implementation-level)

This matrix supplements FR-01–FR-10 with actor, preconditions, inputs, processing, outputs, permissions, validation, errors, edge cases and test criteria. No behavior may be inferred beyond these definitions without operator approval.

### F-01 — Network configuration and chain guard

- **Purpose:** prevent an app build from writing to the wrong network/contract.
- **Actor:** all visitors; wallet users for writes.
- **Preconditions:** valid public build variables and supported chain configuration.
- **Inputs:** configured mode, expected chain ID, RPC URL, explorer URL, USDC address, coordinator address, connected wallet chain.
- **Processing:** validate addresses/chain config on app startup; compare wallet chain to configured chain; disable all write affordances on mismatch; reject invalid release build config.
- **Outputs:** correct network badge, contract link/address, ability to read/write only on expected network.
- **Permissions:** reads public; writing requires connected wallet + correct chain.
- **Validation:** Preview = 5042002; Production = 5042; valid nonzero contract address required after deployment.
- **Errors:** missing/invalid env, unsupported network, wrong-chain wallet, missing contract.
- **Edge cases:** wallet chain changes while form is open; RPC differs from selected chain; stale env after redeploy.
- **Acceptance:** all wrong/malformed configurations fail closed and never send a transaction to a different chain.

### F-02 — Wallet connect and user pipeline list

- **Purpose:** let users sign transactions and see pipelines where they participate.
- **Actor:** client/provider/public observer.
- **Preconditions:** browser wallet available for signed actions; chain config valid for personalized reads.
- **Inputs:** wallet connect request, address, chain ID.
- **Processing:** connect/disconnect; checksum display; query `getUserPipelineIds`; read summaries/stages; refresh after receipts.
- **Outputs:** connected address, role-aware actions and client/provider pipeline list.
- **Permissions:** public reads; contract decides every write permission.
- **Validation:** correct chain for live reads/writes; no guessed ENS/name mapping.
- **Errors:** no wallet, rejected connection, wrong chain, RPC timeout, invalid address.
- **Edge cases:** disconnected mid-flow; address changes; empty user index; duplicate IDs in index.
- **Acceptance:** public view is usable without connecting; list reconstructs from chain after hard refresh; duplicates are suppressed and empty state is correct.

### F-03 — Create and fund a pipeline

- **Purpose:** commit a fixed multi-stage sequence and escrow its full budget.
- **Actor:** client.
- **Preconditions:** correct chain, wallet connected, balance/gas sufficient; 2–5 valid stages.
- **Inputs:** provider addresses, titles, public briefs, budgets, durations.
- **Processing:** normalize/check addresses; validate stage count and byte bounds; calculate exact sum using integer base units; display irreversible/public-data summary; approve exact amount; after approval receipt, call contract create; verify receipt/state.
- **Outputs:** new pipeline ID; first active stage; subsequent queued stages; USDC moved into parent escrow.
- **Permissions:** `createPipeline` caller becomes immutable client; contract validates all values.
- **Validation:** provider unique/nonzero/not client; title 1–64 bytes; brief 1–240 bytes; stage ≥1 USDC; total ≤100 USDC; duration 900–604800 seconds.
- **Errors:** invalid input, insufficient funds/gas/allowance, rejected approval, wrong chain, contract revert, RPC ambiguity.
- **Edge cases:** user clicks twice; transaction receipt delayed; approval mined but creation not submitted; transaction succeeded but frontend timed out.
- **Acceptance:** exact total deposited; stages and indexes persisted; no partial pipeline if validation/transfer fails; frontend does not blindly resubmit after ambiguous receipt.

### F-04 — Provider submits deliverable

- **Purpose:** submit work for client evaluation.
- **Actor:** currently assigned provider.
- **Preconditions:** pipeline Active; stage index current; stage Active; current wallet is provider; current time before work deadline.
- **Inputs:** deliverable URI.
- **Processing:** verify URI syntax/scheme in UI; display public-data warning; call contract; store URI/status/submission/evaluation deadlines; reread after receipt.
- **Outputs:** Submitted status, persisted URI, 24-hour evaluation timer.
- **Permissions:** assigned provider only; UI is not the enforcement layer.
- **Validation:** `https://` or `ipfs://`, 9–256 bytes; contract checks status/index/deadline.
- **Errors:** non-provider, non-active stage, wrong index, expired deadline, invalid URI, duplicate submit, wallet/RPC failure.
- **Edge cases:** malicious URI, provider submits after timeout, client already rejected/expired, URL host later changes content.
- **Acceptance:** one valid submission moves Active→Submitted; invalid/duplicate calls revert; URI is shown as a safe external link and is never fetched by app/server.

### F-05 — Client approves and pays a stage

- **Purpose:** release completed stage budget and activate the next specialist.
- **Actor:** client/evaluator.
- **Preconditions:** current stage Submitted; pipeline Active; caller is client; evaluation window open.
- **Inputs:** pipeline ID and current stage index; explicit UI confirmation.
- **Processing:** show provider and amount; call `approveStage`; contract marks paid, transfers exact budget, activates next stage and emits events in same tx, or completes final stage; UI waits for successful receipt and rereads.
- **Outputs:** provider USDC payout; current stage Paid; next stage Active or pipeline Completed; transaction links.
- **Permissions:** client only.
- **Validation:** current index/status/client/time; SafeERC20 payout; invariant checks.
- **Errors:** unauthorized caller, stale stage, wrong state, evaluation deadline passed, token failure, user cancellation.
- **Edge cases:** duplicate/competing approval, expiry/rejection race, RPC timeout after inclusion, payout transfer failure.
- **Acceptance:** exactly one stage amount paid once; nonfinal release and next `StageHired` use same transaction hash; final stage completes and no future stage activates; failed transfer does not partially advance state.

### F-06 — Client rejects a stage

- **Purpose:** terminate an unacceptable stage without trapping unspent escrow.
- **Actor:** client/evaluator.
- **Preconditions:** pipeline Active; current stage Active or Submitted; relevant deadline open.
- **Inputs:** pipeline ID/current index and explicit reject confirmation.
- **Processing:** display consequences; contract marks current stage/pipeline rejected, calculates remaining escrow, records refund accounting and transfers only to client.
- **Outputs:** terminal Rejected pipeline and exact refund of unpaid allocation.
- **Permissions:** client only.
- **Validation:** current index/status/client/deadline; amount accounting.
- **Errors:** unauthorized, terminal pipeline, wrong stage, deadline passed, refund transfer failure.
- **Edge cases:** provider already paid in earlier stage; current submitted URI public; rejection competes with approval/expiry.
- **Acceptance:** prior payouts unchanged; current/future stage budgets are not paid; total prior payout plus refund equals original total; repeat actions revert.

### F-07 — Expire a stalled stage

- **Purpose:** resolve work/evaluation timeout and return unused escrow without requiring the client to act.
- **Actor:** any wallet/caller.
- **Preconditions:** pipeline Active; current Active stage at/after work deadline, or current Submitted stage at/after evaluation deadline.
- **Inputs:** pipeline ID.
- **Processing:** validate eligible timer/status; terminalize current stage and pipeline; calculate and refund remainder to client; emit expiry/refund events.
- **Outputs:** terminal Expired status; client receives remaining escrow.
- **Permissions:** permissionless only after expiry; recipient is immutable client, never caller.
- **Validation:** chain timestamp and stage state verified on chain.
- **Errors:** not expired, wrong state, already terminal, transfer revert.
- **Edge cases:** approval/rejection transaction lands first; another caller expires first; submitted provider may be unpaid if client misses review window.
- **Acceptance:** early expiry reverts; eligible expiry refunds exact remainder; no second refund; UI shows the elapsed deadline and fixed recipient.

### F-08 — Read pipeline details and timeline

- **Purpose:** make the hiring chain auditable.
- **Actor:** public observer, client, provider.
- **Preconditions:** deployed contract address and expected chain available.
- **Inputs:** pipeline ID, stage index, optional wallet address.
- **Processing:** read summaries/stages/user IDs and relevant confirmed events; map event hashes to correct explorer.
- **Outputs:** stage timeline, amounts, statuses, roles, deadlines, deliverable link, tx links.
- **Permissions:** public read; no hidden private data.
- **Validation:** unknown IDs/stage indices result in not-found/error state; chain-specific explorer base only.
- **Errors:** invalid ID, RPC failure, missing historical logs/receipt, indexer lag on explorer.
- **Edge cases:** page refresh, event read failure but contract state available, empty list, transaction pending.
- **Acceptance:** chain state always wins over stale cached events; only actual hashes/receipts are linked; empty views never show fake activity.

### F-09 — Documentation, risk and footer destinations

- **Purpose:** explain how the app works and avoid misleading users about public data or irreversible money movement.
- **Actor:** any visitor.
- **Preconditions:** static documentation is bundled and routes exist.
- **Inputs:** internal `/docs`/`/risk` navigation; verified GitHub repo URL when available.
- **Processing:** present public data, payment, timer, rejection and expiry rules; add Documentation footer route and actual GitHub link.
- **Outputs:** accessible documentation pages and working footer links.
- **Permissions:** public.
- **Validation:** no fabricated URL; GitHub target must be confirmed public; docs route returns real content.
- **Errors:** missing configured repository URL must be reported during release readiness, not silently replaced.
- **Edge cases:** repository private/removed, production and preview links differ, link resolves on desktop but not mobile.
- **Acceptance:** `/docs` and `/risk` load; all links work on preview; no `href="#"`, dead route, fake project claims, or private repo exposure.

### F-10 — Mainnet release evidence

- **Purpose:** prove the hackathon's required real USDC movement through the live app/contract.
- **Actor:** operator and client/provider test wallets controlled by or consenting to operator.
- **Preconditions:** all core tests pass; operator explicitly authorizes deployment and a low-value transaction; source/export parity and token address verified.
- **Inputs:** contract constructor token address, verified deployment config, pipeline stages/budgets, actual tx receipts.
- **Processing:** manually deploy exported tested source to Arc Mainnet, configure production app, create and progress a low-value pipeline, verify transfer and hire events on Explorer.
- **Outputs:** real contract address, deployment tx hash, payout/hire tx hashes, live app URL, Studio URL and video evidence.
- **Permissions:** no mainnet action without explicit operator authorization.
- **Validation:** chain 5042; correct USDC interface; provider addresses/amounts verified before signing; all evidence from actual network receipts.
- **Errors:** wrong source/token/config, insufficient gas/funds, deployment failure, RPC/explorer lag, wrong destination.
- **Edge cases:** transaction pending near deadline; explorer lag; Production env pointed at testnet; repo not public.
- **Acceptance:** real USDC moved through the deployed app/contract, events/receipts verify, live URL works, public repo and Studio project links are real, and evidence package is complete. No fabricated hash or claim.
