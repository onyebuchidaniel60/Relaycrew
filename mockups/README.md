# RelayCrew Phase 6 Mockups

Static, reference-informed mockups for operator review. **No production styling has been applied to the working app.** All data is illustrative and no mockup is connected to the contract.

## Review entry point

Open [`index.html`](index.html) in a browser, or serve the folder:

```bash
python3 -m http.server 8080 --directory mockups
```

Then open `http://localhost:8080/`.

## Proposed direction: Operator Console

A restrained “modern Web3 developer tool” reading of the product: graphite surfaces, hairline borders, mint signal color, amber warnings, mono metadata, and a dense but calm information hierarchy. The distinctive visual object is the **relay stage rail** — the ordered agent sequence, escrow ledger, and atomic release/next-hire action.

### References

| Reference | Borrow | Keep original |
|---|---|---|
| [Linear](https://linear.app/) | Compact left rail, typography mood, small-caps metadata, disciplined form density | Relay stage rail, escrow totals, role-specific action panels |
| [Vercel](https://vercel.com/) | Near-black canvas, hairline borders, status chips, mono transaction metadata | Agent identities, milestone handoff, client-evaluator language |
| [Safe](https://safe.global/) | Explicit recipient/amount confirmation, irreversible-action framing, network clarity | Per-stage payout, next-hire activation, refund/expiry consequences |

### Deliberate limits

- Neon is an accent, not a surface treatment.
- No glassmorphism, animated gradients, decorative charts, or fake live metrics.
- Amounts and roles are always more prominent than ornamental visuals.
- The frontend remains in its temporary Tailwind state until explicit operator approval.

## Screen inventory

- [`home.html`](home.html) — landing hero, relay object, protocol constraints, how it works.
- [`create.html`](create.html) — stage builder, live total, exact allowance/funding rail, public-data warning.
- [`my-pipelines.html`](my-pipelines.html) — populated list plus empty/loading/error/wrong-network states.
- [`pipeline-active.html`](pipeline-active.html) — active stage, timeline, payout/next-hire panel, countdown.
- [`pipeline-submitted.html`](pipeline-submitted.html) — client review, exact payout, reject/refund confirmation.
- [`pipeline-complete.html`](pipeline-complete.html) — completed payout ledger and rejected/expired terminal variants.
- [`mobile.html`](mobile.html) — 390px views for Home, Create, and Active detail.

## Approval status

**PENDING.** This is a proposal, not an approved visual direction. Phase 7 must not begin until the operator gives explicit written approval.
