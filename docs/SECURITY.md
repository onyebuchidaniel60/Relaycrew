# Security and Risk Notes

## Status

RelayCrew is implemented and deployed to Arc Testnet. The contract has not been independently audited. These controls reduce known risks but are not a guarantee of safety. Mainnet is not deployed or authorized.

## Money and authority

- All stage allocations are funded upfront in a single parent USDC escrow.
- A successful approval pays the current provider and activates the next stage in the same transaction. If token payout fails, the whole transaction reverts.
- Client is the sole evaluator for every stage and can reject current work. There is no arbitration, appeal, or independent quality verification.
- If the client does not evaluate within 24 hours after submission, any wallet can trigger expiry and unpaid escrow is returned to client; the provider may not be paid for submitted work.
- A completed payout is irreversible. Check provider addresses and amounts before signing.
- The MVP caps a pipeline at 100 USDC and a stage at a minimum of 1 USDC. Those bounds are demonstration safety measures, not insurance.

## Public data

Pipeline details, provider addresses, budgets, stage titles/briefs, transaction calldata, and deliverable URI are public and permanent. Do not enter secret information, personal data, credentials, confidential task briefs, or private document URLs. The app does not store task files, but URI content may remain publicly accessible and can be changed by its host. RelayCrew does not download or validate linked content.

## Contract controls required

- On-chain validation of stage count, budgets, addresses, provider uniqueness, string lengths, URI scheme, deadlines, caller permissions and current stage index.
- `SafeERC20` for token transfers and `ReentrancyGuard` on all transfer-bearing methods.
- Checks-effects-interactions; status/amount accounting updates before external transfer.
- Exact sum computed on-chain; exact allowance requested; exact payout/refund recipient fixed by contract.
- No arbitrary token selection, arbitrary call, hooks, `delegatecall`, owner withdrawal, upgradeability, generic rescue or fee.
- Status guards prevent duplicate submit, payout, rejection, or expiry; chain transaction ordering handles races.
- No floating-point token calculations; USDC ERC-20 uses 6 decimals.

## Wallet/UI controls

- Use separate Testnet Preview and Mainnet Production configuration. Wrong-chain writes fail closed.
- User signs their own transactions; app contains no private signing key.
- Show exact provider, total budget, approval amount and irreversible action before signature.
- Request exact allowance only; reset existing allowance if necessary.
- Show pending/confirmed/reverted/user-cancelled states distinctly.
- Reread on-chain state after a receipt or ambiguous timeout before allowing retry.
- Do not auto-fetch external deliverable URIs; do not render user text as HTML.

## Deployment and secrets

- Never commit `DEPLOYER_PRIVATE_KEY`, seed phrase, wallet backups, API credentials or `.env` files.
- Never place deployer credentials in Vercel, browser variables or Arc Studio prompts/screenshots.
- Review Git diff and history for secrets before pushing public.
- Verify token/chain/contract before mainnet operations. Mainnet deploy and real USDC test require explicit operator authorization.
- Use small values and operator-controlled or consenting provider wallets for demonstration.
- Check dependency/compiler versions and all tests. Do not claim a formal audit has occurred unless an independent audit was actually commissioned and completed.

## Incident handling

If a serious bug or suspicious transfer is discovered: stop encouraging new pipelines, do not improvise a privileged rescue function, record exact contract/transaction evidence, inform the operator, and explain whether funds are still recoverable through normal rejection/expiry paths. Frontend rollback does not reverse on-chain transactions.

## Third-party/privacy limitations

The public Arc RPC endpoint may log network requests and IP metadata. The app has no application database or analytics SDK, but wallet and chain activity are public by design. Read the actual privacy disclosure before using the app.
