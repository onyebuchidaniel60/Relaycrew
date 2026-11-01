# RelayCrew — Design Review 02

High-fidelity static mockups for the operator review of the next RelayCrew visual direction. **This is a review artifact only.** No application code, contract, deployment, or production styling has been changed.

## Review locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/mockups/](http://localhost:8080/mockups/).

The review index links every screen and includes the palette, type specimens, design notes, and the approval status. Each screen is also directly addressable:

- [`home.html`](home.html) — editorial landing page
- [`create.html`](create.html) — four-step create pipeline form
- [`pipeline-active.html`](pipeline-active.html) — active pipeline, submitted stage, client decision
- [`pipeline-terminal.html`](pipeline-terminal.html) — completed pipeline settlement ledger
- [`index.html`](index.html) — design review dossier

All pages are responsive at 1440, 1024, 768, and 390 widths. There is intentionally no separate `mobile.html`; each screen is composed for narrow widths rather than duplicated.

## Direction

**“Warm Editorial Escrow,” review 02.** A stricter, more editorial version of the previously approved direction:

- **Canvas:** warm ivory paper `#F4EEE2`, paper surfaces `#FBF7EE`, deep forest `#173F2D`, clay `#9F5334` reserved for refusal/refund, amber `#B37C39` for review states.
- **Type:** `Newsreader` for display and editorial argument; `Instrument Sans` for UI; `IBM Plex Mono` for money, addresses, deadlines, and ledger figures.
- **Shape:** 2–3px radii, thin warm rules, restrained shadows. No glassmorphism, neon, gradient decoration, or generic rounded dashboard cards.
- **Composition:** one focal artifact per screen. The landing page uses a pipeline dossier with a release slip and a settlement receipt; the app screens use the same paper language with a single active surface.
- **Stageshow-informed:** one hero object plus a satellite, a mixed bento rather than repeated cards, hard crops, legible type at final size, and no invented photography or stock “AI” imagery.

The design uses the principles and craft rules from the Stageshow skill by Benji Taylor, adapted to plain HTML/CSS. It does not use the React kit or any copied example assets.

## What the screens contain

| Screen | The story | Key decisions |
|---|---|---|
| Home | Why a fixed relay needs one escrow | Editorial serif hero; pipeline dossier; stage rail; release slip; mixed bento; dark settlement band |
| Create | Setting exact terms before funding | Four-step progress rail; expandable stage terms; exact budget/duration fields; receipt-like escrow statement |
| Active | One submitted stage awaiting the client | Vertical relay; one expanded review state; visible 24-hour deadline; separated payout, activation, and refund |
| Terminal | The closed account | Reconciliation ledger; per-stage specialist, deliverable, release date, amount; on-chain record; refunded-state note |

## Data and accuracy

- The illustrative pipeline has **4 stages** with budgets `12.00 + 18.00 + 14.00 + 20.00 = 64.00 USDC`.
- The product constraints shown are the current ones: **2–10 stages**, **1.00 USDC minimum per stage**, **100.00 USDC maximum per pipeline**, **24-hour evaluation window**, 6-decimal USDC base units, and **0.00 platform fee**.
- The active screen shows stage 2 **Submitted**, with `52.00 USDC` unpaid and `18.00 USDC` payable on approval. After approval, `34.00 USDC` remains for stages 3–4.
- All names, addresses, deliverable URIs, transaction references, timestamps, and amounts are illustrative. No transaction hash or transaction URL is fabricated as evidence.
- The only real external links are the public repository and the verified Arc Mainnet coordinator contract; they are labeled as source/record links.
- The review strip on every page says the mockup is static, illustrative, and not wired.

## Approval status

**AWAITING OPERATOR APPROVAL — 2 November 2026.**

The previous “Warm Editorial Escrow” system remains the approved and implemented visual direction in `src/`. These review-02 mockups are an unapproved proposal. Do not implement them, modify the live application, or treat silence as approval.
