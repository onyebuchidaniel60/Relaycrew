# Design Decisions and Approval Record

**Current status:** Phase 6 mockups proposed. Final visual direction is **not approved**. The working app remains in its temporary Tailwind state.

## Required process

1. Complete and verify the MVP's core end-to-end flows on the deployed testnet Preview.
2. Ask the operator for design references. If none are supplied, present a small candidate set and wait for selection.
3. Record the approved references and what each contributes (layout, information hierarchy, density, typography mood, interaction and transaction confirmation patterns).
4. Create mockups for Home, Create, My Pipelines, Pipeline Detail Active/Submitted/Completed/Rejected and mobile variants.
5. Present mockups, capture feedback, revise, and present the revised version.
6. Stop for explicit operator approval before implementing final visuals. Silence is not approval.
7. Record approval and then implement the approved visuals on top of the working product without changing product logic or architecture.

## Current record

- References supplied by operator: **None**.
- Candidate references presented: **3** (Linear, Vercel, Safe).
- Proposed direction: **“Operator Console”** — restrained cyberpunk/developer-tool surface for an agent escrow protocol.
- Mockups/prototypes: **Created** in `mockups/`.
- Feedback rounds: **None yet**.
- Explicit operator approval: **NOT GIVEN**.
- Final visual implementation: **BLOCKED** until explicit approval.

## Proposed direction

The working product already has functional flows. Phase 6 proposes a visual language that communicates **security, technical precision, and agent orchestration** without turning the interface into decorative neon theater.

- **Surface:** graphite/near-black, fine technical grid, hairline borders, restrained shadows.
- **Signal color:** mint/teal for active state and primary action; amber for warnings and deadlines; rose for destructive/terminal states.
- **Typography:** modern sans for hierarchy, mono for addresses, amounts, deadlines, transaction references, and small-caps metadata.
- **Structure:** compact left rail for orientation; a single dominant work area; a right-side action panel for irreversible decisions.
- **Original object:** the relay stage rail — ordered agents, exact stage budgets, one active handoff, and a terminal settlement ledger.

## Reference inventory

| Reference | URL/asset | Operator selected? | Attributes to borrow | Original/product-specific treatment |
|---|---|---|---|---|
| Linear | https://linear.app/ | Pending | Compact left rail, calm density, small-caps metadata, form rhythm, restrained interaction states | Relay stage rail, escrow totals, wallet-role panels, milestone handoff semantics |
| Vercel | https://vercel.com/ | Pending | Near-black developer-tool canvas, hairline borders, status chips, mono transaction metadata, precise spacing | Agent identities, stage timeline, client-evaluator language, atomic release/next-hire confirmation |
| Safe | https://safe.global/ | Pending | Security-first confirmation hierarchy, explicit recipient/amount, network clarity, irreversible-action framing | Per-stage payout, fixed refund recipient, permissionless expiry, terminal settlement ledger |

**Selected references:** None yet. The three candidates are presented for operator selection or written direction.

## Mockup inventory

| Screen/state | Desktop mockup | Mobile mockup | Reviewed? | Feedback/status |
|---|---|---|---|---|
| Home / landing hero | `mockups/home.html` | `mockups/mobile.html` (Home frame) | No | Pending operator review |
| Create pipeline + allowance/funding | `mockups/create.html` | `mockups/mobile.html` (Create frame) | No | Pending operator review |
| My Pipelines | `mockups/my-pipelines.html` | Responsive single-column treatment | No | Pending operator review |
| Detail — Active | `mockups/pipeline-active.html` | `mockups/mobile.html` (Detail frame) | No | Pending operator review |
| Detail — Submitted | `mockups/pipeline-submitted.html` | Responsive | No | Pending operator review |
| Detail — Completed | `mockups/pipeline-complete.html` | Responsive | No | Pending operator review |
| Detail — Rejected/Expired variants | `mockups/pipeline-complete.html` (terminal variants) | Responsive | No | Pending operator review |
| Empty/loading/error/wrong-network | `mockups/my-pipelines.html` (state inventory) | Responsive | No | Pending operator review |
| Reference board / review index | `mockups/index.html` | Responsive | No | Pending operator review |

## Intentional constraints

- No final app CSS, component styling, typography, or animation has been implemented in Phase 6.
- Mockups are static HTML/CSS with illustrative data; they are not connected to the deployed contract.
- No business logic, contract calls, API surface, or product behavior was changed.
- The mockups must not imply that final visual work is approved. Explicit written approval is required.

## Approval decision

- Approved direction/mockup version: **Pending**.
- Approval date: **Pending**.
- Operator's explicit approval text/decision: **Pending**.
- Deviations accepted: **Pending**.
- Final UI implementation may begin only after this section is filled with explicit approval.

**Phase 7 is blocked.** No final colors, typography, layouts, component styling, or animations may be implemented until the operator approves a direction and version in writing.
