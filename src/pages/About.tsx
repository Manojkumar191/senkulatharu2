export function About() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-clay to-brown p-8 text-cream shadow-glass">
        <h1 className="font-headline text-4xl">About Senkulatharu</h1>
        <p className="mt-3 max-w-3xl text-cream/90">
          Senkulatharu carries the identity of red-soil dryland farming in Kadavur. The name represents resilience, local knowledge, and community-owned growth.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
          <h2 className="font-headline text-2xl text-forest">What Dryland Farming Means</h2>
          <p className="mt-3 text-brown/90">
            Farming without assured irrigation demands soil care, mixed crops, and climate wisdom. Our farmers grow millets, pulses, and oil seeds with low external input systems.
          </p>
        </article>
        <article className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
          <h2 className="font-headline text-2xl text-forest">Farmer Stories</h2>
          <p className="mt-3 text-brown/90">
            Many of our families revived traditional seed varieties and natural pest management methods, sustaining both livelihood and ecological balance.
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
        <h2 className="font-headline text-2xl text-forest">Natural Practices and Mission</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-brown/90">
          <li>Protect soil carbon through diverse crop cycles and reduced tillage.</li>
          <li>Enable direct access to market through transparent digital listings.</li>
          <li>Improve farm income while preserving native food cultures.</li>
          <li>Build trust with buyers through traceability and open communication.</li>
        </ul>
      </section>
    </div>
  );
}
