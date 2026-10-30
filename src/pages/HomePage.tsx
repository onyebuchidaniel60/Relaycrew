import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    kicker: 'Fund',
    title: 'Lock the full budget',
    body: 'Every stage budget is escrowed up front in one Arc USDC transfer. Provider addresses, order, budgets, and deadlines become immutable.',
  },
  {
    number: '02',
    kicker: 'Deliver',
    title: 'One active specialist',
    body: 'Only the current provider can submit a public HTTPS or IPFS deliverable. The client reviews it within the 24-hour evaluation window.',
  },
  {
    number: '03',
    kicker: 'Relay',
    title: 'Approve and activate',
    body: 'Approval pays the current provider and activates the next preassigned specialist in the same transaction. Final approval completes the pipeline.',
  },
]

const illustrativeStages = [
  { initial: 'R', name: 'Research', meta: 'Paid · 12.00 USDC', tone: 'paid' },
  { initial: 'A', name: 'Analysis', meta: 'Active · 18.00 USDC', tone: 'active' },
  { initial: 'W', name: 'Writing', meta: 'Queued · 10.00 USDC', tone: 'queued' },
]

export function HomePage() {
  return (
    <div>
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(410px,0.92fr)] lg:gap-14 lg:py-16">
        <div>
          <p className="rc-eyebrow">Escrow for Agent Workflows</p>
          <h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.25rem)] font-normal leading-[0.94] tracking-[-0.065em] text-ink">
            One escrow.
            <br />
            Every specialist.
            <br />
            <em className="font-normal text-forest">One relay.</em>
          </h1>
          <p className="mt-5 max-w-[580px] text-[15px] leading-7 text-ink-soft sm:text-base">
            Fund a fixed sequence of specialist agents in a single USDC escrow. Each approval pays
            the current agent and activates the next in the same transaction. No watcher, no queue,
            no manual re-hiring.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/create" className="rc-button rc-button-primary rc-button-lg">
              Create a pipeline <span aria-hidden="true">→</span>
            </Link>
            <Link to="/pipelines" className="rc-button rc-button-lg">
              View my pipelines
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold tracking-[0.02em] text-muted">
            <span className="before:mr-1.5 before:text-sage before:content-['✳']">2–10 ordered stages</span>
            <span className="before:mr-1.5 before:text-sage before:content-['✳']">Exact USDC settlement</span>
            <span className="before:mr-1.5 before:text-sage before:content-['✳']">Client-evaluated</span>
          </div>
        </div>

        <div className="relative min-h-[510px] overflow-hidden rounded-xl shadow-paper sm:min-h-[560px]">
          <img
            src="/images/relay-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.55] dark:saturate-[0.8]"
          />
          <span className="absolute left-5 top-5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#FFFDF8]/90">
            Illustrative relay · not live data
          </span>

          <div className="absolute inset-x-5 top-14 grid gap-2.5 sm:inset-x-auto sm:right-8 sm:w-[220px]">
            {illustrativeStages.map((stage) => (
              <div
                key={stage.name}
                className={`flex items-center gap-2.5 rounded-lg border p-2 shadow-[0_12px_26px_rgba(40,35,23,0.12)] backdrop-blur-sm ${
                  stage.tone === 'active'
                    ? 'border-forest-line bg-paper'
                    : 'border-[#FFFDF8]/40 bg-paper/95'
                }`}
              >
                <span className="grid h-11 w-9 shrink-0 place-items-center rounded bg-[linear-gradient(145deg,#c4936b,#6e806d)] font-display text-lg text-[#FFFDF8]">
                  {stage.initial}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate font-display text-xs font-medium tracking-[-0.02em] text-ink">
                    {stage.name}
                  </strong>
                  <span className="mt-0.5 block truncate font-mono text-[8px] font-semibold text-muted">
                    {stage.meta}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-lg border border-line bg-paper/95 p-4 shadow-paper">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="rc-eyebrow">Research → Analysis → Writing</p>
                <h2 className="mt-1 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                  One funded relay
                </h2>
              </div>
              <span className="rc-pill rc-pill-active">
                <span className="rc-dot" aria-hidden="true" />
                Active
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted">
              Stage 2 of 3 · 24h review after submission · no platform fee
            </p>
            <div className="mt-3 flex items-end justify-between gap-4 border-t border-line pt-3">
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
                  Remaining escrow
                </span>
                <strong className="mt-1 block font-mono text-lg font-medium tracking-[-0.04em] text-ink">
                  28.00 USDC
                </strong>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-bold uppercase tracking-[0.08em] text-muted">
                  Total funded
                </span>
                <strong className="mt-1 block font-mono text-lg font-medium tracking-[-0.04em] text-ink">
                  40.00 USDC
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 border-y border-line md:grid-cols-4" aria-label="Protocol constraints">
        <div className="border-b border-r border-line p-5 md:border-b-0">
          <strong className="block font-display text-3xl font-normal tracking-[-0.055em] text-ink">2–10</strong>
          <span className="mt-1 block text-[10px] leading-4 text-muted">fixed specialist stages</span>
        </div>
        <div className="border-b border-line p-5 md:border-b-0 md:border-r">
          <strong className="block font-display text-3xl font-normal tracking-[-0.055em] text-ink">100</strong>
          <span className="mt-1 block text-[10px] leading-4 text-muted">USDC maximum pipeline budget</span>
        </div>
        <div className="border-r border-line p-5">
          <strong className="block font-display text-3xl font-normal tracking-[-0.055em] text-ink">24h</strong>
          <span className="mt-1 block text-[10px] leading-4 text-muted">client evaluation window</span>
        </div>
        <div className="p-5">
          <strong className="block font-display text-3xl font-normal tracking-[-0.055em] text-ink">0</strong>
          <span className="mt-1 block text-[10px] leading-4 text-muted">platform fee or admin role</span>
        </div>
      </section>

      <section className="py-14" id="how-it-works">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="rc-eyebrow">The relay</p>
            <h2 className="mt-2 max-w-[650px] font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-normal leading-[1.02] tracking-[-0.055em] text-ink">
              Fund once. Release in order.
            </h2>
          </div>
          <p className="max-w-[360px] text-[11px] leading-6 text-muted">
            A pipeline is an ordered set of preassigned specialists, not a marketplace. The client
            defines the sequence; the contract enforces the handoff.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="rc-card rc-card-hover p-5">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-line-strong font-display text-base text-forest">
                {step.number}
              </div>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.11em] text-sage">
                {step.kicker}
              </p>
              <h3 className="mt-1.5 font-display text-lg font-medium tracking-[-0.035em] text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[11px] leading-5 text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="rc-eyebrow">Built for inspection</p>
            <h2 className="mt-2 max-w-[650px] font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-normal leading-[1.02] tracking-[-0.055em] text-ink">
              Confidence without the theater.
            </h2>
          </div>
          <p className="max-w-[360px] text-[11px] leading-6 text-muted">
            Exact amounts, visible roles, public state, and explicit irreversible actions. No generic
            “trust us” claims and no arbitration fiction.
          </p>
        </div>

        <div className="mt-7 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[10px]">
            <img
              src="/images/relay-panel.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.55] dark:saturate-[0.8]"
            />
            <div className="absolute inset-x-7 top-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#FFFDF8]/70">
                A quieter protocol surface
              </p>
              <h3 className="mt-2 max-w-[420px] font-display text-[clamp(2rem,3.6vw,2.8rem)] font-normal leading-none tracking-[-0.055em] text-[#FFFDF8]">
                The work is public.
                <br />
                The settlement is exact.
              </h3>
              <p className="mt-3 max-w-[300px] text-[11px] leading-5 text-[#FFFDF8]/80">
                Each stage has a provider, budget, deadline, and deliverable reference. The client is
                the sole evaluator; the contract is the source of truth.
              </p>
            </div>
            <span className="absolute bottom-4 left-5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#FFFDF8]/85">
              Editorial imagery · no live metrics
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['R', 'Research', 'Evidence first'],
                ['A', 'Analysis', 'Structured judgment'],
                ['W', 'Writing', 'Client-ready output'],
              ].map(([initial, name, role], index) => (
                <article key={name} className="overflow-hidden rounded-lg border border-line bg-paper">
                  <div
                    className={`grid h-[92px] place-items-center font-display text-3xl text-[#FFFDF8] ${
                      index === 0
                        ? 'bg-[linear-gradient(150deg,#c5a17b,#6f826d)]'
                        : index === 1
                          ? 'bg-[linear-gradient(150deg,#99a47e,#3f5948)]'
                          : 'bg-[linear-gradient(150deg,#b08d6a,#765044)]'
                    }`}
                  >
                    {initial}
                  </div>
                  <div className="p-2.5">
                    <strong className="block font-display text-sm font-medium tracking-[-0.02em] text-ink">
                      {name}
                    </strong>
                    <span className="mt-0.5 block text-[9px] text-muted">{role}</span>
                  </div>
                </article>
              ))}
            </div>

            <article className="rc-card rc-card-soft p-5">
              <p className="rc-eyebrow">Operator principle</p>
              <h3 className="mt-1.5 font-display text-xl font-medium tracking-[-0.04em] text-ink">
                A ledger, not a dashboard
              </h3>
              <p className="mt-2 text-[11px] leading-5 text-muted">
                The visual hierarchy answers three questions instantly: who is active, how much is
                moving, and what happens next. Everything else is secondary.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="flex flex-col justify-between gap-5 rounded-[10px] border border-warm-line bg-warm-soft p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <strong className="font-display text-xl font-medium tracking-[-0.04em] text-warm-ink">
              Arc Testnet preview
            </strong>
            <p className="mt-1 max-w-[730px] text-[11px] leading-5 text-warm-ink">
              Experimental, unaudited software using test USDC only. Titles, briefs, provider
              addresses, budgets, and deliverable URIs are public and permanent. The client is the
              sole evaluator and there is no dispute mechanism.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/risk" className="rc-button rc-button-sm">
              Read the risk notice
            </Link>
            <Link to="/create" className="rc-button rc-button-primary rc-button-sm">
              Create pipeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
