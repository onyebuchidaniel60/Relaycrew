# Architecture and Product Decisions

This decision log captures design choices already made. The coding agent must not reopen or vary them without operator approval. Feature-by-feature acceptance details are in `REQUIREMENT_MATRIX.md`.

| ID | Decision | Rationale / effect |
|---|---|---|
| D-01 | Product working name is RelayCrew; core concept remains Milestone Team Pipeline | Descriptive working name for source/docs; does not imply a final brand system. |
| D-02 | On-chain coordinator, not off-chain orchestrator | The payout and next hire must be atomic and not depend on a watcher/queue. |
| D-03 | One parent escrow with stage records; no separate child contracts | Simplest architecture under a short deadline; budgets are reserved and stage state is sequential. |
| D-04 | Custom contract inspired by escrow/agent-commerce patterns; do not claim ERC-8183 compliance | Arc docs currently list an ERC-8183 reference deployment on testnet, not mainnet. Avoid unverified mainnet dependency. |
| D-05 | Client is evaluator for every stage | Removes evaluator configuration/marketplace complexity; explicitly accepts trust and no-dispute risk. |
| D-06 | Providers/order/budgets/briefs/durations fixed at funding | Prevents reassignment/routing complexity and makes stage chain auditable. |
| D-07 | Total budget funded up front; no per-stage deposits | One allowance and one funding transaction; future budget stays in parent escrow until paid. |
| D-08 | Approval pays current provider and activates next stage in same transaction | Core differentiator; transfer failure reverts activation. |
| D-09 | Rejection/expiry ends pipeline and refunds unspent funds | Deterministic terminal path; no skipping, restart, partial payout or arbitration. |
| D-10 | 2–10 stages; ≥1 USDC each; ≤100 USDC total | Bounded loops and low demo risk. The operator raised the stage maximum from 5 to 10 on 2026-10-30. |
| D-11 | Stage timer starts at activation; eval timer 24h after submission | Avoids later-stage deadlines expiring before the prior stage finishes; limits stalled submitted jobs. |
| D-12 | User wallet is identity/auth; no app account backend | Keeps MVP client-only and contract-authenticated. |
| D-13 | No database/indexer/backend/AI runtime | All required state fits in contract and user-index arrays at hackathon scale. |
| D-14 | React + TypeScript + Vite; wagmi + viem; Vercel; public GitHub | Simple EVM client architecture and stable preview deployment. Inspect Arc Studio generated project first; if materially incompatible, stop and ask. |
| D-15 | Arc Studio for contract, tests and app; manual mainnet deploy from export | Hackathon requirement; Arc Studio docs state its deploy flow targets testnet. |
| D-16 | Preview is always Arc Testnet; Production only Arc Mainnet with approval | Prevents early preview from moving real money. |
| D-17 | Final visual direction is approved as “Warm Editorial Escrow” (2026-10-30); implement only visual styling on working flows | Final design followed E2E acceptance, operator references, mockups and explicit approval. Phase 7 applied it without changing behavior. |
| D-18 | `/docs` route and real GitHub footer link in final UI | Meets project documentation completeness; never fabricate URLs or expose private repo without approval. |
| D-19 | No platform fee | Avoids fee accounting/treasury and keeps payouts straightforward. |
| D-20 | No contract owner/admin rescue/upgradeability | Reduces privilege surface; means errors may not be recoverable, explicitly disclosed. |
| D-21 | AGENTS.md §3 wording fix: "If a frontend exists (it does)" replaced with neutral phrasing that covers both an existing and a not-yet-existing frontend | Resolves the documented conflict between AGENTS.md §3 and the verified absence of a frontend. Wording-only; no architecture, scope, or permission change. Operator-authorized as part of the post-preflight reconciliation. |
| D-22 | Arc Testnet deployment used Arc Studio’s platform deployer after Circle DCW key provisioning failed | Testnet-only fallback; the contract has no owner/admin role, so the deployer has no special authority. Mainnet remains undeployed and unauthorized. |
| D-23 | Phase 8.5 operator-authorized deviations: `MAX_STAGES` raised to 10; Light/Dark theme toggle; Days/Hours duration selector; optional attachment URL appended to the public brief; pitch changed to “Agent Escrow Protocol for Project Execution on Pipelines.” | Explicit operator authorization (2026-10-30). Contract access, escrow accounting, evaluator role, and settlement rules are unchanged. The 10-stage maximum still fits the 100 USDC total cap. |

## Actions requiring future operator decision

These are action approvals, not unresolved architecture: (1) any mainnet deploy or real-USDC transaction; (2) production release/submission; (3) any future exception to the public repository requirement. The approved visual direction is recorded in `DESIGN_DECISIONS.md`; no action approval is presumed by these docs.
