const RIVER_STORY = [
  'Senkulatharu means "the red water river", a village name for rainwater that runs from the Kadavur hills, carries red soil, and briefly fills ponds.',
  'In this dryland region there is no permanent river and no assured canal. Agriculture survives through rain windows, careful planning, and patience.',
  'Long before rain arrives, farmers prepare fields, protect soil, and select seeds. When water comes, they are ready.',
];

const JOURNEY_STEPS = [
  'The farmers we work with are mostly small family farmers with deep, lived knowledge of seasons, soil, and seed behavior.',
  'Through Senkulatharu, small, marginal, and women dryland farmers of Kadavur bring produce directly to your home.',
  'Farmers choose crops suited to this landscape and manage soil, seeds, and water with restraint.',
  'What reaches you is not just a product, but food shaped by land, season, and the hands that grow it.',
  'Native seeds continue through local saving and exchange, helping traditional crop varieties stay alive in the region.',
  'These are not industrial farms. They are family farms that work with natural limits instead of against them.',
];

const LIVING_TRADITIONS = [
  {
    title: 'Naturally Grown, Carefully Handled',
    text: 'We source from farmers who follow naturally grown practices. Harvests are cleaned and minimally processed so food keeps its natural character and nutritional value.',
  },
  {
    title: 'Foraged Foods and Local Knowledge',
    text: 'Kadavur food culture includes seasonal forage from hills and commons, alongside cultivated crops and native seeds. Together, they carry local taste, memory, and resilience.',
  },
];

const DRYLAND_POINTS = [
  'Dryland regions like Kadavur depend almost entirely on rainfall and do not have large irrigation systems to fall back on.',
  'Farmers grow crops suited to local climate, including pulses, oilseeds, traditional grains, vegetables, fruits, and forest produce.',
  'These crop systems help conserve water, protect soil health, and keep biodiversity and traditional knowledge alive.',
  'Supporting dryland farmers means supporting agriculture that respects natural limits and long-term resilience.',
];

const PROMISE_LINES = [
  'We believe good food should come with honesty.',
  'Our strength is not scale, but trust, traceability, and restraint.',
  'Some harvests are abundant. Some are limited.',
  'We accept both, because farming in Kadavur depends on rain, patience, and care.',
  'Senkulatharu brings you honest food shaped by land, water, and patience.',
];

const HERO_FACTS = [
  { label: 'Communities', value: 'Small, marginal, and women farmers' },
  { label: 'Farming Type', value: 'Mostly rainfed dryland agriculture' },
  { label: 'Commitment', value: 'Fair, traceable, direct sourcing' },
];

export function About() {
  return (
    <div className="space-y-8 pb-4 md:space-y-10">
      <section className="relative isolate overflow-hidden rounded-3xl border border-[#cfe6d7] bg-gradient-to-br from-[#f8fdf9] via-[#eef9f1] to-[#e2f4e9] px-5 py-9 shadow-[0_14px_34px_rgba(63,118,89,0.1)] md:px-9 md:py-11">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_5%,rgba(255,255,255,0.9),transparent_46%),radial-gradient(circle_at_90%_96%,rgba(181,231,204,0.36),transparent_58%)]" />
        <div className="relative space-y-5 text-[#2b5540]">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#4f8e6a]">Kadavur Dryland Food Story</p>
          <h1 className="max-w-4xl font-headline text-4xl leading-tight text-[#1f4a36] md:text-6xl">About Senkulatharu</h1>
          <p className="max-w-3xl text-sm leading-7 text-[#2f5a45] md:text-base md:leading-8">
            Naturally grown. Carefully handled. Honestly explained. Senkulatharu connects dryland farming communities to homes that value food with origin, context, and integrity.
          </p>

          <div className="grid gap-3 border-t border-[#cce4d4] pt-4 sm:grid-cols-3">
            {HERO_FACTS.map((fact, index) => (
              <div
                key={fact.label}
                className={`flex items-start gap-3 rounded-2xl border px-3 py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] ${
                  index === 0
                    ? 'border-[#c0e1d0] bg-[#e5f5ec]'
                    : index === 1
                      ? 'border-[#bfe1d8] bg-[#e3f4eb]'
                      : 'border-[#c7e4d8] bg-[#e8f6ee]'
                }`}
              >
                <span className="mt-2 inline-flex h-3 w-3 shrink-0 rounded-full bg-[#5aaa7d]" />
                <div className="space-y-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#4f8e6a]">{fact.label}</p>
                  <p className="text-sm font-black leading-6 text-[#234f3a] md:text-base">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d3e9db] bg-gradient-to-br from-[#f8fdf9] to-[#edf8f1] p-5 shadow-[0_12px_28px_rgba(63,118,89,0.08)] md:p-8">
        <div className="flex items-start gap-4">
          <p className="font-headline text-3xl leading-none text-[#53a276] md:text-5xl">01</p>
          <div className="space-y-4">
            <h2 className="font-headline text-3xl leading-tight text-[#24523d] md:text-5xl">A Name Born from Rain and Red Soil</h2>
            <ul className="space-y-3 text-[15px] leading-7 text-[#2f5a45] md:text-base md:leading-8">
              {RIVER_STORY.map((paragraph, index) => (
                <li
                  key={paragraph}
                  className={`flex gap-3 rounded-2xl border px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] ${
                    index % 3 === 0
                      ? 'border-[#c0e1d0] bg-[#e5f5ec]'
                      : index % 3 === 1
                        ? 'border-[#bfe1d8] bg-[#e3f4eb]'
                        : 'border-[#c7e4d8] bg-[#e8f6ee]'
                  }`}
                >
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#5aaa7d]" />
                  <span className="font-bold">{paragraph}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d3e9db] bg-gradient-to-br from-[#f8fdf9] to-[#edf8f1] p-5 shadow-[0_12px_28px_rgba(63,118,89,0.08)] md:p-8">
        <div className="flex items-start gap-4">
          <p className="font-headline text-3xl leading-none text-[#53a276] md:text-5xl">02</p>
          <div className="w-full">
            <h2 className="font-headline text-3xl text-[#24523d] md:text-5xl">From Farmers to Your Home</h2>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.1em] text-[#4f8e6a]">Direct journey, clear origin</p>

            <ul className="mt-5 grid gap-3">
              {JOURNEY_STEPS.map((step, index) => (
                <li
                  key={step}
                  className={`grid gap-3 rounded-2xl border px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] md:grid-cols-[42px_1fr] md:px-5 ${
                    index % 3 === 0
                      ? 'border-[#c0e1d0] bg-[#e5f5ec]'
                      : index % 3 === 1
                        ? 'border-[#bfe1d8] bg-[#e3f4eb]'
                        : 'border-[#c7e4d8] bg-[#e8f6ee]'
                  }`}
                >
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#5aaa7d]" />
                  <p className="text-[15px] font-bold leading-7 text-[#2f5a45] md:text-base md:leading-8">{step}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d3e9db] bg-gradient-to-br from-[#f8fdf9] to-[#edf8f1] p-5 shadow-[0_12px_28px_rgba(63,118,89,0.08)] md:p-8">
        <div className="flex items-start gap-4">
          <p className="font-headline text-3xl leading-none text-[#53a276] md:text-5xl">03</p>
          <div className="w-full space-y-4">
            <h2 className="font-headline text-3xl text-[#24523d] md:text-5xl">Living Traditions in Practice</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {LIVING_TRADITIONS.map((item, index) => (
                <article
                  key={item.title}
                  className={`rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] md:p-5 ${
                    index % 2 === 0 ? 'border-[#c0e1d0] bg-[#e5f5ec]' : 'border-[#bfe1d8] bg-[#e3f4eb]'
                  }`}
                >
                  <h3 className="font-headline text-2xl text-[#2b6147] md:text-4xl">{item.title}</h3>
                  <p className="mt-2 text-[15px] font-bold leading-7 text-[#2f5a45] md:text-base md:leading-8">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d3e9db] bg-gradient-to-br from-[#f8fdf9] to-[#edf8f1] p-5 shadow-[0_12px_28px_rgba(63,118,89,0.08)] md:p-8">
        <div className="flex items-start gap-4">
          <p className="font-headline text-3xl leading-none text-[#53a276] md:text-5xl">04</p>
          <div className="w-full">
            <h2 className="font-headline text-3xl text-[#24523d] md:text-5xl">Why Dryland Farming Matters</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#2f5a45] md:text-base md:leading-8">
              Dryland agriculture protects long-term soil and water health while sustaining local communities that have farmed this landscape for generations.
            </p>
            <ol className="mt-4 grid gap-3">
              {DRYLAND_POINTS.map((point, index) => (
                <li
                  key={point}
                  className={`flex gap-3 rounded-2xl border px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] md:px-5 ${
                    index % 2 === 0 ? 'border-[#c0e1d0] bg-[#e5f5ec]' : 'border-[#bfe1d8] bg-[#e3f4eb]'
                  }`}
                >
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#5aaa7d]" />
                  <span className="text-[15px] font-bold leading-7 text-[#2f5a45] md:text-base md:leading-8">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#d3e9db] bg-gradient-to-br from-[#f8fdf9] to-[#edf8f1] p-5 shadow-[0_12px_28px_rgba(63,118,89,0.08)] md:p-8">
        <div className="flex items-start gap-4">
          <p className="font-headline text-3xl leading-none text-[#53a276] md:text-5xl">05</p>
          <div className="w-full">
            <h2 className="font-headline text-3xl text-[#24523d] md:text-5xl">Our Promise</h2>
            <p className="mt-3 text-[15px] leading-7 text-[#2f5a45] md:text-base md:leading-8">Our promise is simple and transparent, always in this order:</p>
            <ul className="mt-4 space-y-3">
              {PROMISE_LINES.map((line, index) => (
                <li
                  key={line}
                  className={`flex gap-3 rounded-2xl border px-4 py-3 text-[15px] leading-7 text-[#355f49] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(63,118,89,0.65)] md:text-base md:leading-8 ${
                    index % 2 === 0 ? 'border-[#c0e1d0] bg-[#e5f5ec]' : 'border-[#bfe1d8] bg-[#e3f4eb]'
                  }`}
                >
                  <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#5aaa7d]" />
                  <span className="font-bold">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
