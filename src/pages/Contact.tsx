import { openWhatsApp } from '../utils/whatsapp';

export function Contact() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-sand to-cream p-8 shadow-glass">
        <h1 className="font-headline text-4xl text-brown">Contact</h1>
        <p className="mt-2 text-brown/80">Reach our farmer network directly for produce, collaborations, and community programs.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Address', value: 'Kadavur, Karur, Tamil Nadu - 621311' },
          { title: 'Call', value: '+91 90800 59430' },
          { title: 'Email', value: 'hello@senkulatharu.in' },
          { title: 'Hours', value: 'Mon-Sat, 8:00 AM - 7:00 PM' },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-glass">
            <p className="text-xs font-bold uppercase tracking-wide text-clay">{card.title}</p>
            <p className="mt-2 text-sm font-semibold text-forest">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <form
          className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass"
          onSubmit={(event) => {
            event.preventDefault();
            alert('Thanks for your message. We will get back to you soon.');
          }}
        >
          <h2 className="font-headline text-2xl text-forest">Message Us</h2>
          <div className="mt-4 space-y-3">
            <input required placeholder="Your name" className="w-full rounded-xl border border-sand px-4 py-3" />
            <input required type="email" placeholder="Your email" className="w-full rounded-xl border border-sand px-4 py-3" />
            <textarea required rows={5} placeholder="Your message" className="w-full rounded-xl border border-sand px-4 py-3" />
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl bg-forest px-5 py-3 font-bold text-white">Send Message</button>
              <button type="button" onClick={() => openWhatsApp('Hello, I want to contact Senkulatharu.')} className="rounded-xl bg-moss px-5 py-3 font-bold text-white">
                WhatsApp
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <iframe
            title="Senkulatharu map"
            className="h-64 w-full rounded-3xl border border-white/50 shadow-glass"
            src="https://www.google.com/maps?q=Kadavur%2C%20Karur%2C%20Tamil%20Nadu&output=embed"
            loading="lazy"
          />
          <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
            <h3 className="font-headline text-2xl text-forest">FAQs</h3>
            <div className="mt-3 space-y-3 text-sm text-brown/85">
              <p><strong>Do you deliver?</strong> We coordinate delivery details directly over WhatsApp.</p>
              <p><strong>Is this an ecommerce checkout?</strong> No, ordering is direct with farmers through WhatsApp.</p>
              <p><strong>Can we visit farms?</strong> Group visits can be planned by prior request.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
