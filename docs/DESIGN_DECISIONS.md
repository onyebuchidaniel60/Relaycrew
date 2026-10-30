# Design Decisions and Approval Record

**Current status:** Phase 8.5 complete. The operator explicitly approved the revised “Warm Editorial Escrow” mockups on 2026-10-30 and separately authorized a Dark Warm Editorial theme. The approved visual system, complete `/docs` and `/risk` content, metadata, footer destinations, and release-facing completeness checks are in place on the Arc Testnet Preview. The Phase 8.5 contract limit and form changes did not alter escrow accounting, permissions, or settlement logic.

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
- Mockups/prototypes: **Created and approved** in `mockups/`.
- Feedback rounds: **1** (the operator rejected the previous direction and supplied references).
- Explicit operator approval: **GIVEN — 2026-10-30**.
- Final visual implementation: **COMPLETE in Phase 7** on top of the working flows.

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

## Approved direction: Warm Editorial Escrow

- **Canvas:** warm ivory `#F5F0E6`; paper cards `#FFFDF8`; fine grid texture at low opacity.
- **Ink:** near-black `#1B1D18`; muted gray-green metadata.
- **Primary:** forest green `#173D2C`; soft green surfaces for selected/active states.
- **Warnings/terminal:** warm amber and rust instead of saturated red.
- **Typography:** `Fraunces` high-contrast serif for display; `Manrope` sans for UI, labels, forms, and metadata; `IBM Plex Mono` for amounts, addresses, and hashes.
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
| Reference analysis & review map | `mockups/index.html` | Responsive | Yes | Approved as the direction record |
| Home / landing hero | `mockups/home.html` | `mockups/mobile.html` (Home frame) | Yes | Approved |
| Create Pipeline + allowance/funding | `mockups/create.html` | `mockups/mobile.html` (Create frame) | Yes | Approved |
| Pipeline Active Detail | `mockups/pipeline-active.html` | `mockups/mobile.html` (Detail frame) | Yes | Approved |
| Mobile views | — | `mockups/mobile.html` | Yes | Approved |

The prior dark `my-pipelines.html`, `pipeline-submitted.html`, and `pipeline-complete.html` mockups were removed with the rejected direction. The current approved review set covers Home, Create, Active Detail, and Mobile.

## Phase 7 implementation record

- **Design tokens:** `tailwind.config.js` and `src/index.css` define the ivory canvas, paper cards, ink, forest-green primary, sage/amber/rust semantic colors, Fraunces/Manrope/IBM Plex Mono typography, 10px card radii, 6px button radii, paper shadows, and fine-grid canvas.
- **Global shell:** editorial header with relay mark, uppercase nav, Arc Testnet badge, wallet control, testnet preview strip, warm warning states, and a footer with working Documentation, Risk notice, GitHub (when configured), and contract-explorer links.
- **Home:** split editorial hero with self-authored warm SVG imagery, illustrative relay stage cards (explicitly labeled “not live data”), protocol-constraint stats, relay explanation, inspection panel, and risk callout.
- **Create:** left setup checklist, wallet/balance/allowance summary, stage editors with live byte counters and exact totals, public-data warning, funding strip, and the unchanged single wallet flow.
- **Pipeline detail:** status header, four-cell money summary, stage rail with active/paid/submitted/rejected markers, right-side role action panel, countdown, payout/next-hire/refund lines, and terminal settlement ledger.
- **Terminal states:** Completed, Rejected, and Expired render a settlement ledger with total budget, paid out, refunded, finished timestamp, and no action controls.
- **Confirmation surface:** the browser-native `window.confirm` prompts were replaced with an accessible in-app `<dialog>` confirmation that repeats the exact recipient, payout, next hire, and refund before invoking the same existing contract call and guard.
- **Assets:** `public/favicon.svg`; `public/images/relay-hero.svg`; `public/images/relay-panel.svg`. The imagery is original SVG artwork, not a copied production asset.
- **Fonts:** Google Fonts stylesheet for Fraunces, Manrope, and IBM Plex Mono, with local serif/sans/mono fallbacks.
- **Behavior freeze:** no contract ABI, address, write function, validation, role check, allowance rule, state transition, or security control was changed in Phase 7.

## Phase 8 completeness record

- **Documentation:** `/docs` now contains the user guide: overview, roles, limits and exact amounts, create/fund, provider submission, approve/reject/expiry, statuses, public-data warning, Arc Testnet vs Mainnet, troubleshooting, and contract/source details.
- **Risk notice:** `/risk` now covers the experimental/unaudited contract, irreversible USDC transfers, sole client evaluation, evaluator non-response and expiry/refund, public/permanent data, and the absence of admin rescue or upgrade.
- **Metadata:** `index.html` uses the approved title, description, Open Graph/Twitter tags, theme color, favicon, and a real 1200×630 Open Graph card at `public/images/og-relaycrew.png`.
- **Footer:** Documentation resolves to `/docs`; Risk notice resolves to `/risk`; GitHub resolves to the actual public repository configured through `VITE_GITHUB_REPOSITORY_URL`; Contract opens the verified Arc Testnet address in the official explorer.
- **State/link audit:** header, footer, documentation anchors, internal routes, external destinations, loading/empty/error/terminal states, wrong-network state, form labels, focus rings, and 390/768/1440 responsive layouts were checked in headless Chromium. No dead anchors, unnamed buttons, console errors, or horizontal overflow were found.
- **Deployment:** Phase 8.5 Preview at `https://relaycrew-1gp6xbcd6-uhhh2.vercel.app`, deployed source commit `4bb066302f17ca6b1c025bafd80beffa37eed57b` (`dpl_3XDUsqQn1A1SzEcFajVGxoZTsudg`). All main routes and the OG image returned HTTP 200 through the protected deployment; deployed CSS/JS hashes match the local build.
- **Repository docs:** README, USER_GUIDE, SECURITY, DEPLOYMENT, CONTRACT_INTERFACE, DECISIONS, and this record were brought in line with the implemented Testnet state. Mainnet remains undeployed and unauthorized.

## Phase 8.5 dark mode extension

- **Authorization:** operator instruction, 2026-10-30, explicitly authorized a Dark Mode toggle and a “Dark Warm Editorial” theme.
- **Implementation:** class-based Tailwind dark mode, a header Light/Dark toggle, locally stored preference, and a CSS-variable token layer that maps the approved ivory/forest/warm palette to warm charcoal and ivory surfaces. The light theme remains the default and the previously approved “Warm Editorial Escrow” design is unchanged.
- **Scope:** visual styling only; no contract call, ABI, address, validation, accounting, role, or state-transition behavior changed.
- **Other authorized Phase 8.5 UX changes:** Days/Hours duration selectors converted to seconds, optional attachment URL appended to the public brief, `MAX_STAGES` raised to 10, and the public pitch change. These are recorded in `DECISIONS.md` (D-23) and `ARCHITECTURE.md`.

## Intentional constraints and deviations

- **Imagery:** original warm editorial SVG artwork is used instead of licensed photography. This preserves the approved palette and composition without introducing an unverified asset license.
- **Amount formatting:** the existing exact base-unit formatter is retained. Whole-USDC amounts display without forced trailing zeros (for example, `18 USDC`); no floating-point arithmetic was introduced.
- **Confirmation dialog:** the interaction is an in-app native dialog rather than a browser-native confirm. The existing guard, exact values, and irreversible nature are preserved; Escape, cancel, and backdrop dismissal close the dialog without sending a transaction.
- **Mobile navigation:** all five routes remain visible as a compact second header row at 390px rather than being hidden, so navigation does not depend on an unapproved menu interaction.
- **Placeholder docs:** the Phase 7 placeholder has been replaced in Phase 8. `/docs` now contains the complete user guide; `/risk` contains the security-derived risk notice. No placeholder claims remain in the live routes.

## Approval decision

- **Approved direction/mockup version:** “Warm Editorial Escrow” — revised Phase 6 set in `mockups/` (`home.html`, `create.html`, `pipeline-active.html`, `mobile.html`, `styles.css`, `index.html`).
- **Approval date:** 2026-10-30.
- **Operator's explicit approval text/decision:** “The ‘Warm Editorial Escrow’ mockups were reviewed and explicitly APPROVED.” (operator instruction, 2026-10-30).
- **Deviations accepted/recorded:** original SVG imagery instead of photography; Google Fonts delivery; existing trimmed amount display retained; in-app confirmation dialog replacing `window.confirm`; mobile nav remains visible.
- **Phase 7 status:** implemented on top of working flows. No product, contract, or security behavior changed.
- **Phase 8 status:** documentation, risk, metadata, footer destinations, and release-checklist completeness verified. Mainnet remains unauthorized.
