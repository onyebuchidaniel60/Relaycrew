# Design Decisions and Approval Record

**Current status:** Phase 6 revised mockups proposed from operator-supplied references. Final visual direction is **not approved**. The working app remains in its temporary Tailwind state.

## Required process

1. Complete and verify the MVP's core end-to-end flows on the deployed testnet Preview.
2. Ask the operator for design references. If none are supplied, present a small candidate set and wait for selection.
3. Record the approved references and what each contributes (layout, information hierarchy, density, typography mood, interaction and transaction confirmation patterns).
4. Create mockups for the required screens and mobile variants.
5. Present mockups, capture feedback, revise, and present the revised version.
6. Stop for explicit operator approval before implementing final visuals. Silence is not approval.
7. Record approval and then implement the approved visuals on top of the working product without changing product logic or architecture.

## Current record

- References supplied by operator: **Yes** — two images in `docs/references/`.
- Previous direction: **REJECTED** — the dark “Operator Console” mockups were discarded and removed.
- Candidate references presented: **Operator-supplied only** (no additional candidate selection required).
- Proposed direction: **“Warm Editorial Escrow”** — light editorial marketplace language adapted to an agent escrow protocol.
- Mockups/prototypes: **Created** in `mockups/`.
- Feedback rounds: **1** (the operator rejected the previous direction and supplied references).
- Explicit operator approval: **NOT GIVEN**.
- Final visual implementation: **BLOCKED** until explicit approval.

## Reference analysis

### Reference 1 — `docs/references/reference 1.webp`

A multi-screen marketplace product board (home, talent browse, project create, filters, categories).

- **Layout:** top navigation, asymmetric hero with text left and warm photography right, thin section rules, wide create modal with a left stepper, filter overlay, generous whitespace, consistent card rhythm.
- **Typography:** large editorial serif headlines with tight leading; geometric sans for navigation, labels, body, and buttons; uppercase micro-copy with relaxed tracking.
- **Color:** warm ivory canvas, white/cream cards, near-black ink, forest-green primary buttons, sage/olive and warm wood/terracotta imagery, muted gray-green metadata.
- **Border-radii:** cards roughly 8–12px; buttons 4–6px; pills reserved for filters/status.
- **Vibe:** premium creative marketplace, human, trustworthy, editorial, calm. Not a dark terminal or cyberpunk dashboard.

### Reference 2 — `docs/references/reference 2.jpg`

A brand-level collage for the same “Craftly” system.

- **Layout:** oversized serif statement above layered product screens; large evidence numbers; fine grid texture; small star-brand mark; generous vertical breathing room.
- **Typography:** high-contrast all-caps serif statement, uppercase sans subtitle, small supporting copy; type carries the brand.
- **Color:** same warm ivory, forest green, black ink, sage/wood imagery; no saturated neon.
- **Texture:** faint grid lines, subtle shadows, photography-led panels.
- **Vibe:** established creative studio / editorial marketplace with technical product screens embedded.

## Proposed direction: Warm Editorial Escrow

- **Canvas:** warm ivory `#F5F0E6`; paper cards `#FFFDF8`; fine grid texture at low opacity.
- **Ink:** near-black `#1B1D18`; muted gray-green metadata.
- **Primary:** forest green `#173D2C`; soft green surfaces for selected/active states.
- **Warnings/terminal:** warm amber and rust instead of saturated red.
- **Typography:** `Fraunces`-style high-contrast serif for display; `Manrope`-style sans for UI, labels, forms, and metadata; small uppercase labels.
- **Radii:** cards around 10px; buttons 6px; chips/pills for status only.
- **Composition:** top navigation, split editorial hero with warm visual panel, thin rules, white cards on ivory, stepped create form, right-side action panel for irreversible settlement decisions.
- **Original product language:** the relay stage rail, escrow ledger, exact payout/next-hire panel, client evaluator role, refund/terminal states.

## Reference inventory

| Reference | URL/asset | Operator selected? | Attributes to borrow | Original/product-specific treatment |
|---|---|---|---|---|
| Reference 1 — editorial marketplace multi-screen board | `docs/references/reference 1.webp` | Yes (operator-supplied) | Ivory canvas, forest-green CTAs, photo-led hero, thin warm borders, serif/sans contrast, compact nav, stepped create modal | Relay stage rail, escrow totals, role-specific action panel, exact USDC settlement |
| Reference 2 — Craftly brand collage | `docs/references/reference 2.jpg` | Yes (operator-supplied) | Oversized serif statement, uppercase sans microcopy, fine grid texture, layered product screens, large proof numbers, star mark | Agent identities, stage handoff language, public-data warnings, terminal refund ledger |

**Selected direction:** “Warm Editorial Escrow,” derived from the two operator-supplied references. No additional candidate references are active.

## Mockup inventory

| Screen/state | Desktop mockup | Mobile mockup | Reviewed? | Feedback/status |
|---|---|---|---|---|
| Reference analysis & review map | `mockups/index.html` | Responsive | No | Pending operator review |
| Home / landing hero | `mockups/home.html` | `mockups/mobile.html` (Home frame) | No | Pending operator review |
| Create Pipeline + allowance/funding | `mockups/create.html` | `mockups/mobile.html` (Create frame) | No | Pending operator review |
| Pipeline Active Detail | `mockups/pipeline-active.html` | `mockups/mobile.html` (Detail frame) | No | Pending operator review |
| Mobile views | — | `mockups/mobile.html` | No | Pending operator review |

The prior dark `my-pipelines.html`, `pipeline-submitted.html`, and `pipeline-complete.html` mockups were removed with the rejected direction. The current requested review set covers Home, Create, Active Detail, and Mobile.

## Intentional constraints

- No final app CSS, component styling, typography, or animation has been implemented in Phase 6.
- Mockups are static HTML/CSS with illustrative data; they are not connected to the deployed contract.
- No business logic, contract calls, API surface, or product behavior was changed.
- The reference images are used as direction inputs, not as production assets copied into the app.

## Approval decision

- Approved direction/mockup version: **Pending**.
- Approval date: **Pending**.
- Operator's explicit approval text/decision: **Pending**.
- Deviations accepted: **Pending**.
- Final UI implementation may begin only after this section is filled with explicit approval.

**Phase 7 is blocked.** No final colors, typography, layouts, component styling, or animations may be implemented until the operator approves a direction and version in writing.
