const POSTS = [
  {
    title: 'How Millets Returned to Kadavur Kitchens',
    date: 'Jan 14, 2026',
    excerpt: 'A community-led revival of traditional grains and recipes.',
    content: 'Farmers collaborated with local women groups to reintroduce native millet dishes and direct weekly produce packs.',
  },
  {
    title: 'Dryland Soil Recovery in 12 Months',
    date: 'Feb 03, 2026',
    excerpt: 'Cover crops and organic matter helped improve moisture retention.',
    content: 'Plots using mixed legume cover showed better resilience and yield stability than monocrop fields.',
  },
  {
    title: 'Seed Saving as a Village Practice',
    date: 'Feb 22, 2026',
    excerpt: 'Intergenerational seed networks are reducing input costs.',
    content: 'Families documented local seed lines and exchanged through farmer gatherings before each season.',
  },
  {
    title: 'Why Direct WhatsApp Ordering Works',
    date: 'Mar 11, 2026',
    excerpt: 'Simple ordering reduced friction for both farmers and customers.',
    content: 'Transparent pricing and direct chat enabled faster feedback and reliable repeat buyers.',
  },
];

export function Blog() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-moss to-forest p-8 text-cream shadow-glass">
        <h1 className="font-headline text-4xl">Blog & Stories</h1>
        <p className="mt-2 text-cream/90">Field stories, farmer insights, and practical dryland knowledge.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {POSTS.map((post, index) => (
          <article
            key={post.title}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-clay">{post.date}</p>
            <h2 className="mt-2 font-headline text-2xl text-forest">{post.title}</h2>
            <p className="mt-3 text-sm font-semibold text-brown">{post.excerpt}</p>
            <p className="mt-2 text-sm text-brown/85">{post.content}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
        <h3 className="font-headline text-2xl text-forest">Newsletter</h3>
        <p className="mt-2 text-sm text-brown/85">Get monthly farmer updates and seasonal produce stories.</p>
        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            alert('Thanks for subscribing. This demo stores no backend records.');
          }}
        >
          <input type="email" required placeholder="Your email" className="flex-1 rounded-xl border border-sand px-4 py-3" />
          <button className="rounded-xl bg-forest px-6 py-3 font-bold text-white">Subscribe</button>
        </form>
      </section>
    </div>
  );
}
