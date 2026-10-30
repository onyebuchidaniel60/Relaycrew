# RelayCrew User Guide

**Status:** Implemented and in use on Arc Testnet. The live app includes the complete in-app guide at `/docs`; this file mirrors the same behavior for the repository. Mainnet is not deployed or authorized. The contract has not been independently audited.

## What RelayCrew does

RelayCrew lets a client fund a fixed sequence of specialist stages using one Arc USDC escrow. Each stage has a provider wallet and a fixed budget. When the client approves the current specialist's submitted work, that specialist is paid and the next specialist becomes active in the same transaction.

RelayCrew does not find providers, run AI agents, or judge work automatically. The client is the evaluator for every stage.

## Before using it

- Use the network shown by the app: Testnet for Preview; Mainnet only for the authorized live deployment.
- Have enough USDC for the full stage budget and enough native USDC gas balance for transactions.
- Check every provider wallet and every budget carefully. Payments are irreversible.
- Do not put private information or confidential instructions into stage titles, briefs, attachment URLs, or deliverable references. On-chain data is public and permanent.
- The header includes a Light/Dark theme toggle. The preference is stored in your browser only and does not affect contract state.
- Do not use the app for sensitive work or amounts that would cause harm if lost. The contract is an experimental, unaudited hackathon prototype.

## Create a pipeline

1. Connect your wallet and ensure the chain matches the app's network.
2. Open Create Pipeline.
3. Add 2–10 stages in the intended order. For each stage, enter a unique provider address, a short title, a public brief, a budget of at least 1 USDC, and a duration using the Days and Hours selectors. The app converts that choice into on-chain seconds; the valid range is 15 minutes to 7 days, with a 1-hour minimum in the selectors.
4. Optionally add an `https://` or `ipfs://` attachment URL. When present, the app appends `Attachment: <url>` to the public brief before funding. The combined brief must remain within 240 bytes. The URL is public and permanent, and the app does not fetch or embed its contents.
5. Keep total budget at or below 100 USDC for the current MVP.
6. Review each provider, the order, total, and public-data notice.
7. Approve the exact USDC allowance requested for the pipeline, then confirm the funding transaction.
8. Wait until both transactions have confirmed and verify the new pipeline details on chain.

All future stages are funded by the parent escrow at creation, but their stage state remains Queued until the prior stage is approved.

## Submit work

1. The assigned provider connects the wallet that matches the active stage.
2. Review the brief/deadline and submit a public `https://` or `ipfs://` deliverable reference before the work deadline.
3. The client will see a Submitted state and has 24 hours to approve or reject.

The app stores the reference on chain; it does not fetch or validate the referenced content. Only submit links safe to make public.

## Approve a stage

1. The client reviews the submitted reference.
2. Review the recipient, exact payout amount, and next provider.
3. Confirm approval in the wallet.
4. After a successful transaction, the current provider is paid. The next provider becomes Active in the same transaction, or the pipeline becomes Completed if the final stage was approved.

Do not treat a wallet prompt or pending hash as final success. Wait for a successful receipt and confirm the stage state.

## Reject a stage

The client may reject the current Active or Submitted stage before the relevant deadline. The pipeline terminates and all unpaid escrow returns to the client. Providers already paid remain paid. The rejected provider is not paid for that stage. There is no appeal or arbitration mechanism in the MVP.

## Expiration

- If an Active provider misses the work deadline, any wallet may trigger expiration.
- If a Submitted stage is not evaluated within 24 hours, any wallet may trigger expiration.
- Expiration terminates the pipeline and returns all unspent funds to the client. The caller does not receive the refund.

## Pipeline states

- **Active:** one stage is Active or Submitted.
- **Completed:** every stage has been paid.
- **Rejected:** client rejected a stage and the remaining budget was refunded.
- **Expired:** a deadline elapsed and the remaining budget was refunded.

Stage states are Queued, Active, Submitted, Paid, Rejected and Expired.

## Troubleshooting

- **Wrong network:** use the network-switch option shown by the app. Do not force a transaction onto another chain.
- **Insufficient balance:** ensure the wallet has the whole pipeline budget plus transaction gas.
- **Approval rejected:** funding cannot continue until the allowance transaction confirms.
- **Wallet cancelled:** this is a cancellation, not necessarily an application defect.
- **Transaction pending/timeout:** do not immediately resubmit pipeline creation; inspect the wallet transaction and refresh on-chain state to avoid duplicates.
- **RPC unavailable:** state may be stale. Retry the read and do not rely on stale UI values for money decisions.
- **Permission error:** only the assigned current provider can submit, and only client can approve/reject.
- **Expired/rejected/completed pipeline:** terminal; a new task requires a new pipeline.

## Important risks

The client is the sole evaluator. There is no dispute mechanism. If the client does not respond within the evaluation window, the pipeline can expire and the provider may remain unpaid. Transfers cannot be recalled by the app. The contract is not independently audited, and stage metadata/deliverable references are public and permanent. See `/risk` in the live app and `SECURITY.md` in the repository.
