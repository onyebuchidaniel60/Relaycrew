# Sources and Verification Record

Last checked: 2026-10-28. Verify network/token/deadline values again before any mainnet deploy or hackathon submission.

## Official Arc/Circle sources

- **Arc Studio:** https://developers.circle.com/ai/arc-studio — describes Arc Studio as Circle's AI coding agent and states it deploys to Arc Testnet.
- **Arc contract addresses:** https://docs.arc.io/arc/references/contract-addresses — Arc USDC ERC-20 interface address is listed as `0x3600000000000000000000000000000000000000`, uses 6 decimals; docs describe the native-USDC interface precision difference; ERC-8183 reference contract is listed under Arc Testnet.
- **Connect to Arc:** https://docs.arc.io/arc/references/connect-to-arc — chain IDs, official RPCs/explorer URLs, and recommendation to use wagmi/viem.
- **ERC-8183 quickstart:** https://docs.arc.io/arc/tutorials/create-your-first-erc-8183-job — an Arc Testnet workflow example.
- **Arc smart-contract deployment tutorial:** https://docs.arc.io/arc/tutorials/deploy-contracts

## Standard reference (context only)

- **ERC-8183 draft:** https://eips.ethereum.org/EIPS/eip-8183 — agentic commerce job lifecycle with client/provider/evaluator and escrow principles. RelayCrew's custom coordinator is not asserted to conform.

## Hackathon

- **Official Arc Microgrants 2 page:** https://dorahacks.io/hackathon/arc-microgrants-2/detail — returned HTTP 405 in the last automated check, so its live cutoff and form fields need manual verification. Secondary summaries describe eight $500 grants from a $4,000 pool, rolling review, Arc Studio use, mainnet USDC movement, and app/repo/transaction/video/profile artifacts.
- **Secondary event listing:** https://www.eventbrite.com/e/httpsdorahacksiohackathonarc-microgrants-2detail-tickets-2003559137314?aff=ebdssbdestsearch — shows a noon-to-12:59 PM Pacific window on Nov 1 and says submissions close Nov 1. It labels the time PDT, but Pacific daylight time ends at 2:00 AM that date, so the displayed local-time conversion can be ambiguous by one hour. This conflicts with the previous handoff's 2026-11-02 04:59 UTC estimate. Treat 2026-11-01 20:59 WAT (Africa/Lagos) as a conservative working cutoff until direct submission-form verification.
- **Secondary round summary:** https://devgrantsdaily.com/items/2026-10-25-arc-microgrants-built-with-arc-studio/ — summarizes deliverables and rubric as checked on Oct 25; not authoritative over live organizer page.

## Time-zone cross-check

- **NIST daylight-saving rules:** https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst — US daylight time ends on November 1 in 2026, so an event listing labelled PDT for a Nov 1 end date may be ambiguous by one hour.

## Methodology

- `PROPER_VIBE_CODING_WORKFLOW_REVISED(1).md` supplied by the operator. Its required lifecycle is: inspect before modifying; deploy skeletal UI early; work end-to-end before final visual design; use design references/mockups and explicit operator approval; finish the full frontend/documentation; test, inspect, fix, commit and stop after one phase.

## Verification policy

Do not cite this file as proof of an on-chain transaction. Contract addresses, deployment URLs, tx hashes, repository URLs and build statuses must be recorded only after inspecting the actual product or official explorer. No values are guessed.
