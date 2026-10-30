# RelayCrew Phase 6 Mockups — Operator Reference Revision

Static, reference-led mockups for operator review. **No production styling has been applied to the working app.** All data is illustrative and no mockup is connected to the contract.

The previous dark “Operator Console” mockups were rejected and removed. This revision is based on the two operator-supplied reference images in `docs/references/`.

## Review entry point

From the repository root:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/mockups/](http://localhost:8080/mockups/) (serving from the repository root keeps the reference-image paths working).

## Direction: Warm Editorial Escrow

A light, editorial marketplace language adapted to an agent escrow protocol.

- **Canvas:** warm ivory `#F5F0E6`, paper cards `#FFFDF8`, subtle grid lines.
- **Ink:** near-black `#1B1D18` with soft gray-green metadata.
- **Primary:** forest green `#173D2C` for actions and active state.
- **Accents:** sage/olive imagery, warm amber warnings, rust terminal actions.
- **Type:** high-contrast serif display (`Fraunces`) with a geometric sans (`Manrope`) for UI and metadata.
- **Radii:** cards around 10px, buttons 6px, status chips only.
- **Composition:** top navigation, asymmetric split heroes, photo-led warm panels, thin rules, generous whitespace, stepped create form.

## References used

| Reference | File | What we borrowed |
|---|---|---|
| Reference 1 — editorial marketplace multi-screen board | `docs/references/reference 1.webp` | Ivory canvas, forest-green primary buttons, photo-led hero, thin warm borders, serif/sans contrast, compact nav, stepped create modal |
| Reference 2 — Craftly brand collage | `docs/references/reference 2.jpg` | Oversized serif statement, uppercase sans microcopy, fine grid texture, layered product screens, large evidence numbers, star-brand mark |

**Original to RelayCrew:** the relay stage rail, exact escrow ledger, current-provider action panel, approve/release + next-hire language, refund/terminal states, and on-chain public-data warnings.

## Screen inventory

- [`index.html`](index.html) — reference analysis, extracted tokens, and review map.
- [`home.html`](home.html) — editorial hero, warm agent visual, protocol constraints, how-it-works.
- [`create.html`](create.html) — stepped create form, stage editor, exact allowance/funding strip.
- [`pipeline-active.html`](pipeline-active.html) — stage timeline, countdown, approve/reject panel.
- [`mobile.html`](mobile.html) — 390px Home, Create, and Active detail views.

## Approval status

**PENDING.** This is a proposal, not an approved visual direction. Phase 7 must not begin until the operator gives explicit written approval.
