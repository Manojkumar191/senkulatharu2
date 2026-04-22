const STORY_STREAMS = [
  {
    title: 'Farming shaped by drought and rain',
    summary:
      'How crop choices, sowing windows, and field practices are designed around uncertain rain patterns in Kadavur.',
  },
  {
    title: 'Seasonal wild foods and foraging',
    summary:
      'Stories of avaram poo, sundakai, and other wild foods that appear only in certain seasons and remain part of local diets.',
  },
  {
    title: 'Food traditions kept by families',
    summary:
      'Recipes, household methods, and everyday practices that carry forward nutrition, taste, and cultural memory.',
  },
  {
    title: 'Native seed searches and revival',
    summary:
      'Documentation of traditional crop varieties, farmer seed networks, and how local biodiversity is conserved through practice.',
  },
];

const DOCUMENTS = [
  'The history of crops from the Kadavur drylands and their place in local food systems.',
  'Forgotten food practices and processing methods that improve digestibility, taste, and shelf life.',
  'Everyday wisdom from farmers and women collectives who continue to guide seasonal farming choices.',
  'Living links between land, food, memory, and community in rain-dependent agriculture.',
];

export function Blog() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-moss to-forest p-8 text-cream shadow-glass md:p-10">
        <h1 className="font-headline text-4xl md:text-5xl">Stories from Kadavur</h1>
        <div className="mt-4 max-w-5xl space-y-3 text-base leading-8 text-cream/95">
          <p>
            Every food carries a story. Some come from farming practices shaped by drought and rain. Others come from wild plants that appear only in certain seasons. Some are recipes and food traditions that have been quietly preserved within families.
          </p>
          <p>
            Senkulatharu also documents and shares these stories, the history of crops, forgotten food practices, the search for traditional varieties, and the everyday wisdom that continues to guide farming in Kadavur block.
          </p>
          <p>Because understanding food also means understanding the land and the people who care for it.</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {STORY_STREAMS.map((item, index) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glass"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <h2 className="font-headline text-3xl text-[#1b3b2d] md:text-4xl">{item.title}</h2>
            <p className="mt-3 text-lg leading-8 text-forest/85">{item.summary}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-7 shadow-glass">
        <h3 className="font-headline text-3xl text-[#1b3b2d] md:text-4xl">What We Document</h3>
        <div className="mt-4 space-y-3">
          {DOCUMENTS.map((line) => (
            <p key={line} className="rounded-2xl bg-forest/5 px-4 py-3 text-lg leading-8 text-forest/85">
              {line}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
