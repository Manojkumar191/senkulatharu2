import { FaWhatsapp } from 'react-icons/fa';
import { FiClock, FiMail, FiMapPin, FiPhoneCall } from 'react-icons/fi';
import { openWhatsApp } from '../utils/whatsapp';

const FULL_ADDRESS = 'No.5/223, Kurumbapatti Palaviduthi (Post), Tharagampatti (S.O), Kadavur, Karur, Tamil Nadu, India - 621311';
const MAP_LAT = '10.6477655';
const MAP_LNG = '78.2385564';
const MAP_EMBED_URL = `https://maps.google.com/maps?ll=${MAP_LAT},${MAP_LNG}&z=18&t=m&output=embed`;
const MAP_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${MAP_LAT},${MAP_LNG}`;

const CONTACT_POINTS = [
  {
    title: 'Address',
    value: 'No.5/223, Kurumbapatti, Tharagampatti (S.O), Kadavur, Karur, Tamil Nadu - 621311',
    icon: FiMapPin,
    iconBg: '#dff4e8',
    iconColor: '#1f7a4f',
  },
  {
    title: 'Call',
    value: '+91 90800 59430',
    icon: FiPhoneCall,
    iconBg: '#dfefff',
    iconColor: '#2457a6',
  },
  {
    title: 'Email',
    value: 'senkulatharu@gmail.com',
    icon: FiMail,
    iconBg: '#fff0de',
    iconColor: '#b36216',
  },
  {
    title: 'Hours',
    value: 'Mon-Sat, 8:00 AM - 7:00 PM',
    icon: FiClock,
    iconBg: '#efe7ff',
    iconColor: '#6b46b1',
  },
];

const FAQS = [
  {
    q: 'Do you deliver?',
    a: 'We coordinate delivery details directly over WhatsApp based on your location and availability.',
  },
  {
    q: 'Is this a normal ecommerce checkout?',
    a: 'No. Ordering is done directly with farmers through WhatsApp for transparent communication.',
  },
  {
    q: 'Can we visit farms?',
    a: 'Yes, group visits can be planned with prior request and schedule confirmation.',
  },
];

export function Contact() {
  return (
    <div className="space-y-8 pb-2 md:space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CONTACT_POINTS.map((point) => {
          const Icon = point.icon;
          return (
            <article
              key={point.title}
              className="rounded-2xl border border-[#b8d8c8]/60 bg-white/85 p-5 shadow-[0_16px_28px_-20px_rgba(21,58,43,0.8)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_22px_34px_-22px_rgba(21,58,43,0.95)]"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                style={{ backgroundColor: point.iconBg, color: point.iconColor }}
              >
                <Icon className="text-lg" />
              </span>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#1d5f40]">{point.title}</p>
              <p className="mt-1 text-base font-extrabold leading-7 text-[#143827]">{point.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <form
          className="h-full rounded-3xl border border-[#b4d8c4]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(238,248,241,0.88)_100%)] p-5 shadow-glass md:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            alert('Thanks for your message. We will get back to you soon.');
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-headline text-3xl text-[#1a4f37] md:text-4xl">Message Us</h2>
              <p className="mt-1 text-sm text-[#24563f]/90">Enter your details and tell us what you need.</p>
            </div>
            <span className="rounded-full bg-[#1f7a4f] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">Quick Response</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5 md:col-span-1">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-[#143e2c] md:text-base">Full Name</span>
              <input
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-[#b4d8c4] bg-white/90 px-4 py-3 text-[#1f4f35] outline-none transition focus:border-[#1f7a4f] focus:ring-2 focus:ring-[#a4dfbe]"
              />
            </label>

            <label className="space-y-1.5 md:col-span-1">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-[#143e2c] md:text-base">Email Address</span>
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#b4d8c4] bg-white/90 px-4 py-3 text-[#1f4f35] outline-none transition focus:border-[#1f7a4f] focus:ring-2 focus:ring-[#a4dfbe]"
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <span className="text-sm font-black uppercase tracking-[0.08em] text-[#143e2c] md:text-base">Message</span>
              <textarea
                required
                rows={5}
                placeholder="Tell us what produce or support you are looking for"
                className="w-full rounded-xl border border-[#b4d8c4] bg-white/90 px-4 py-3 text-[#1f4f35] outline-none transition focus:border-[#1f7a4f] focus:ring-2 focus:ring-[#a4dfbe]"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-2.5">
              <button className="rounded-xl bg-[#1f7a4f] px-5 py-3 font-bold text-white transition hover:bg-[#18613f]">Send Message</button>
              <button
                type="button"
                onClick={() => openWhatsApp('Hello, I want to contact Senkulatharu.')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#128c7e] px-5 py-3 font-bold text-white transition hover:bg-[#0f7166]"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp
              </button>
            </div>
          </div>
        </form>

        <div className="h-full min-h-[360px] space-y-3">
          <div className="h-[calc(100%-56px)] min-h-[300px] overflow-hidden rounded-3xl border border-[#b4d8c4]/60 shadow-glass">
            <iframe title="Senkulatharu map" className="h-full w-full" src={MAP_EMBED_URL} loading="lazy" />
          </div>
          <a
            href={MAP_OPEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#1f7a4f] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-[#18613f]"
          >
            Open Map
          </a>
        </div>
      </section>

      <section className="rounded-3xl border border-[#b4d8c4]/70 bg-white/88 p-5 shadow-glass md:p-6">
        <h3 className="font-headline text-3xl text-[#1a4f37]">FAQs</h3>
        <div className="mt-4 space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-[#d1e8db] bg-white/80">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-extrabold text-[#1a4f37]">
                <span>{faq.q}</span>
                <span className="text-base text-[#2f6e4d] transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <p className="border-t border-[#d1e8db] px-4 py-3 text-sm leading-7 text-[#24563f]/95">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
