import { useEffect, useMemo, useState } from 'react';
import { getCarouselImages } from '../api/carousel';
import { getApprovedFeedback, submitFeedback } from '../api/feedback';
import { getProducts } from '../api/products';
import type { PageName, Product } from '../types';

interface HomeProps {
  onNavigate: (page: PageName) => void;
}

interface FeedbackCard {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

const DEFAULT_PRODUCT_NAMES = ['Rice', 'Black Rice', 'Whole Wheat', 'Pure Honey', 'Organic Rice'];

const VALUE_POINTS = [
  {
    icon: '🌾',
    title: 'Farm-first sourcing',
    description: 'Harvested in small batches, shade-dried, and packed without additives.',
  },
  {
    icon: '🛢️',
    title: 'Slow-crafted oils',
    description: 'Cold-pressed gingelly, groundnut, and coconut oils that keep nutrients intact.',
  },
  {
    icon: '🪺',
    title: 'Forest pantry',
    description: 'Wild honey, sundakai, and herbs gathered responsibly by women farmer collectives.',
  },
  {
    icon: '🧺',
    title: 'Grower tools',
    description: 'Garden kits, seed starters, and soil boosters that help you grow at home.',
  },
];

const CATEGORY_LANES = [
  {
    title: 'Rice, Millets & Dal',
    description: 'Dryland staples',
    status: '',
  },
  {
    title: 'Forest honey, sundakai, avaram poo',
    description: 'Foraged from wild',
    status: '',
  },
  {
    title: 'Oils',
    description: 'Slow, small batches',
    status: '',
  },
  {
    title: 'Garden kits',
    description: 'Grow what the land accepts',
    status: '',
  },
];

const DEFAULT_CUSTOMER_FEEDBACK: FeedbackCard[] = [
  {
    quote: 'Authentic products just like village-grown food. Clean grains and natural aroma in every batch. Highly recommended for healthy cooking.',
    author: 'Priya S.',
    location: 'Karur',
    rating: 5,
  },
  {
    quote: 'Customer support was very friendly and helpful. Received exactly what was shown in the catalog. Will continue ordering regularly.',
    author: 'Mohan V.',
    location: 'Trichy',
    rating: 5,
  },
  {
    quote: 'The honey was pure and naturally sweet. No artificial taste, very genuine quality. Worth every rupee.',
    author: 'Anitha K.',
    location: 'Dindigul',
    rating: 4,
  },
  {
    quote: 'The millet quality is excellent and very fresh. Packing was neat and delivery was on time. My family loved the taste.',
    author: 'Karthik R.',
    location: 'Karur',
    rating: 5,
  },
];

const FEEDBACK_MIN_VISIBLE_ITEMS = 10;

const TOP_FALLBACK_IMAGES = ['/carousel/farmer1.svg', '/carousel/farmer2.svg', '/carousel/farmer3.svg'];
const MARQUEE_FALLBACK_IMAGES = ['/carousel/farmer3.svg', '/carousel/farmer4.svg', '/carousel/farmer5.svg'];
const MARQUEE_MIN_VISIBLE_ITEMS = 10;

function formatProductLabel(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

export function Home({ onNavigate }: HomeProps) {
  const [topImages, setTopImages] = useState<string[]>(TOP_FALLBACK_IMAGES);
  const [marqueeImages, setMarqueeImages] = useState<string[]>(MARQUEE_FALLBACK_IMAGES);
  const [products, setProducts] = useState<Product[]>([]);
  const [approvedFeedback, setApprovedFeedback] = useState<FeedbackCard[]>([]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [feedbackPaused, setFeedbackPaused] = useState(false);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    customer_name: '',
    city_state: '',
    review_text: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [top, marquee, productRows] = await Promise.all([
          getCarouselImages('top'),
          getCarouselImages('marquee'),
          getProducts(),
        ]);

        setTopImages(top);

        const productImages = productRows.map((p) => p.image_url).filter(Boolean) as string[];
        setMarqueeImages(productImages.length > 0 ? productImages : marquee);
        setProducts(productRows);

        try {
          const approvedRows = await getApprovedFeedback();
          setApprovedFeedback(
            approvedRows.map((row) => ({
              quote: row.review_text,
              author: row.customer_name,
              location: row.city_state,
              rating: row.rating,
            })),
          );
        } catch {
          setApprovedFeedback([]);
        }
      } catch {
        setTopImages(TOP_FALLBACK_IMAGES);
        setMarqueeImages(MARQUEE_FALLBACK_IMAGES);
        setApprovedFeedback([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (paused || topImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % topImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [paused, topImages]);

  const jumpToProducts = (search?: string) => {
    if (search) {
      sessionStorage.setItem('senkulatharu_products_search_prefill', search);
    }
    onNavigate('products');
  };

  const marqueeItems = useMemo(() => {
    const productLinked = products
      .filter((product) => Boolean(product.image_url))
      .map((product) => ({
        src: product.image_url as string,
        name: product.name,
      }));

    if (productLinked.length > 0) {
      return productLinked;
    }

    return marqueeImages.map((src, index) => ({
      src,
      name: DEFAULT_PRODUCT_NAMES[index % DEFAULT_PRODUCT_NAMES.length],
    }));
  }, [products, marqueeImages]);

  const marqueeTrack = useMemo(() => {
    if (marqueeItems.length === 0) return [];

    const filled = [...marqueeItems];
    while (filled.length < MARQUEE_MIN_VISIBLE_ITEMS) {
      filled.push(marqueeItems[filled.length % marqueeItems.length]);
    }

    return [...filled, ...filled];
  }, [marqueeItems]);

  const activeFeedback = useMemo(
    () => (approvedFeedback.length > 0 ? approvedFeedback : DEFAULT_CUSTOMER_FEEDBACK),
    [approvedFeedback],
  );

  const feedbackTrack = useMemo(() => {
    if (activeFeedback.length === 0) return [];

    const filled = [...activeFeedback];
    while (filled.length < FEEDBACK_MIN_VISIBLE_ITEMS) {
      filled.push(activeFeedback[filled.length % activeFeedback.length]);
    }

    return [...filled, ...filled];
  }, [activeFeedback]);

  const handleSubmitFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = feedbackForm.customer_name.trim();
    const cityState = feedbackForm.city_state.trim();
    const review = feedbackForm.review_text.trim();

    if (!name || !cityState || !review) {
      setFeedbackNotice('Please fill all feedback fields.');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackNotice('');
    try {
      await submitFeedback({
        customer_name: name,
        city_state: cityState,
        review_text: review,
        rating: 5,
      });

      setFeedbackForm({
        customer_name: '',
        city_state: '',
        review_text: '',
      });
      setFeedbackNotice('Thanks for your feedback.');
    } catch {
      setFeedbackNotice('Unable to submit feedback right now. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-6">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[#bfe4d2] px-4 py-9 md:px-8 md:py-12">
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="animate-floatIn">
            <h1 className="max-w-2xl font-headline text-[clamp(3rem,5vw,5.6rem)] leading-[0.95] text-[#153a2b]">
              Honest food and tools crafted by dryland farmers.
            </h1>
            <p className="mt-5 max-w-2xl text-[clamp(1.2rem,1.6vw,2rem)] leading-tight text-[#1f3b2f]">
              Grains, oils, forest honey, and garden tools gathered with care by small and women farmers. Packed slow, shipped fresh.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => jumpToProducts()}
                className="rounded-2xl bg-[#1fbe74] px-6 py-3 text-base font-bold text-white transition hover:scale-[1.02] hover:bg-[#1aa765]"
              >
                Browse farm produce
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="rounded-2xl border border-forest/20 bg-white/70 px-6 py-3 text-base font-bold text-forest transition hover:scale-[1.02] hover:bg-white/90"
              >
                Meet our farmers
              </button>
            </div>

            <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                { value: '40+', label: 'Heritage grains' },
                { value: '80+', label: 'Farmer families' },
                { value: '6', label: 'Cold-pressed oils' },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/80 bg-white/85 p-4 text-center shadow-[0_22px_30px_-24px_rgba(21,58,43,0.85)]">
                  <p className="text-4xl font-bold leading-none text-[#1f3b2f]">{item.value}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wide text-[#1f3b2f]">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-[620px] justify-self-end overflow-hidden rounded-[2rem] border border-white/80 bg-[#bde6d3]/80 p-3 shadow-glass backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,79,53,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,79,53,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-[#b9e5d1]/70">
              {topImages.length > 0 ? (
                <img
                  src={topImages[slide]}
                  alt="Dryland farm spotlight"
                  className="h-72 w-full object-cover md:h-[440px]"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = '/carousel/farmer1.svg';
                  }}
                />
              ) : (
                <img
                  src="/carousel/farmer1.svg"
                  alt="Dryland farm spotlight"
                  className="h-72 w-full object-cover md:h-[440px]"
                />
              )}
            </div>

            <div className="absolute bottom-6 right-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-glass">
              <p className="text-lg font-bold text-forest">Dryland harvest</p>
              <p className="text-sm font-semibold text-forest/80">Sun-kissed grains and heritage seeds</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-[#c6e4d5] bg-[#d9f2e5] px-5 py-7 shadow-[0_18px_34px_-26px_rgba(16,64,45,0.6)] md:px-6 md:py-8">
        <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#123728] md:text-sm">
          <span className="h-3 w-3 rounded-full bg-moss" />
          Crafted with care
        </p>
        <h2 className="max-w-4xl font-headline text-2xl leading-tight text-[#103327] md:text-4xl">Everything from our farms</h2>
        <p className="max-w-5xl text-base font-semibold leading-snug text-[#234f3f] md:text-xl">
          We grow, harvest, cold-press, and hand-pack. Add farm tools to your kitchen and balcony gardens to keep the story going.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {VALUE_POINTS.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-[#d8e9e0] bg-[#f4fbf7] p-5 shadow-[0_16px_24px_-20px_rgba(21,58,43,0.68)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_30px_-20px_rgba(21,58,43,0.75)] md:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl leading-none md:text-3xl">{item.icon}</span>
                <div>
                  <h3 className="font-headline text-2xl text-[#143a2c] md:text-3xl">{item.title}</h3>
                  <p className="mt-2 text-base font-medium text-[#2a5747] md:text-xl">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative -mx-[110px] bg-gradient-to-r from-[#2fa77d] via-[#47b892] to-[#73c9a8] py-6 md:-mx-[126px] lg:-mx-[134px]">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#2d9f78] via-[#46b48d]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#228661]/55 to-transparent blur-md" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#68c4a2] via-[#5dbc99]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#4faa88]/55 to-transparent blur-md" />

          <div
            className="flex w-max gap-4 animate-slideLeft"
            style={{ animationDirection: 'normal', animationPlayState: paused ? 'paused' : 'running' }}
          >
            {marqueeTrack.map((item, index) => {
              const label = formatProductLabel(item.name);
              return (
                <button
                  key={`${item.src}-${item.name}-${index}`}
                  onClick={() => jumpToProducts(item.name)}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  onFocus={() => setPaused(true)}
                  onBlur={() => setPaused(false)}
                  className="group relative w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,255,248,0.92)_100%)] shadow-[0_14px_28px_-14px_rgba(21,58,43,0.65)] transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_22px_34px_-18px_rgba(21,58,43,0.7)] focus-visible:-translate-y-2 focus-visible:shadow-[0_22px_34px_-18px_rgba(21,58,43,0.7)]"
                >
                  <img
                    src={item.src}
                    alt={label}
                    className="h-44 w-full object-cover transition duration-500 ease-out group-hover:scale-110 group-hover:saturate-110"
                  />
                  <div className="bg-gradient-to-r from-[#2f6f58] to-[#3f8468] px-4 py-3 text-center text-lg font-extrabold text-white transition duration-300 group-hover:from-[#285b48] group-hover:to-[#326c55] md:text-2xl">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-[#bce8d4]/80 p-8 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-headline text-4xl text-[#173828] md:text-5xl">Farm pantry and tools</h2>
          <button
            onClick={() => jumpToProducts()}
            className="rounded-2xl bg-[#21ab7f] px-6 py-3 text-base font-bold text-white shadow-[0_12px_24px_-16px_rgba(24,120,88,0.85)] transition hover:bg-[#1c956e]"
          >
            Explore catalog
          </button>
        </div>
        <p className="mt-3 max-w-4xl text-lg text-forest/85">
          Pick a lane: grains and millets, forest pantry essentials, slow oils, or ready-to-grow garden kits.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORY_LANES.map((item) => (
            <article
              key={item.title}
              className="group rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glass transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-[#95ccad] hover:shadow-[0_22px_32px_-24px_rgba(21,58,43,0.75)]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-headline text-4xl text-[#1f3d2f] transition-colors duration-300 group-hover:text-[#15402d]">{item.title}</h3>
                {item.status && <span className="rounded-full bg-[#bde9d4] px-3 py-1 text-xs font-bold text-forest">{item.status}</span>}
              </div>
              <p className="text-lg text-forest/85">{item.description}</p>
              <button
                onClick={() => jumpToProducts()}
                className="group mt-4 inline-flex items-center gap-2 text-lg font-bold text-forest transition-colors hover:text-[#1b3f30]"
              >
                View products
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  ›
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-gradient-to-r from-[#2fa77d] via-[#49b890] to-[#73c9a8] py-5 md:py-6">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <h2 className="text-center font-headline text-xl text-white md:text-3xl">What Our Customers Say</h2>

          <div
            className="relative mt-3 overflow-hidden pb-2 pt-3"
            onMouseEnter={() => setFeedbackPaused(true)}
            onMouseLeave={() => setFeedbackPaused(false)}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#2d9f78] via-[#46b48d]/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#228661]/55 to-transparent blur-md" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#68c4a2] via-[#5dbc99]/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#4faa88]/55 to-transparent blur-md" />

            <div
              className="flex w-max gap-3 animate-slideLeft"
              style={{
                animationDirection: 'normal',
                animationDuration: '42s',
                animationPlayState: feedbackPaused ? 'paused' : 'running',
              }}
            >
              {feedbackTrack.map((item, index) => (
                <article
                  key={`${item.author}-${item.location}-${index}`}
                  className="group w-[250px] shrink-0 rounded-2xl border border-white/60 bg-[#d7e5e0] p-3 font-semibold text-[#1a3a2e] shadow-[0_14px_22px_-18px_rgba(8,43,28,0.55)] transition duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:bg-[#e4f0eb] hover:shadow-[0_20px_30px_-20px_rgba(8,43,28,0.75)]"
                >
                  <p className="text-[20px] leading-none text-[#2a7d62]">“</p>
                  <p className="mt-1.5 text-[15px] font-extrabold leading-6 text-[#163a2c]">{item.quote}</p>
                  <p className="mt-2 text-xl font-extrabold text-[#19865f]">{item.author}</p>
                  <p className="text-sm font-bold text-[#2a7d62]">{item.location}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#7fc59d]/45 bg-gradient-to-r from-[#114d31] via-[#1a6a41] to-[#114d31] p-3 text-cream shadow-glass md:p-4">
        <button
          type="button"
          onClick={() => setFeedbackFormOpen((open) => !open)}
          aria-expanded={feedbackFormOpen}
          aria-controls="feedback-dropdown-panel"
          className="flex w-full items-center justify-between gap-2 rounded-xl bg-[#c7edce]/22 px-4 py-2.5 text-left transition hover:bg-[#c7edce]/32"
        >
          <span className="inline-flex items-center gap-2.5">
            <span className="text-base">✍️</span>
            <span className="text-lg font-extrabold leading-none text-cream md:text-xl">Share Your Experience</span>
          </span>
          <span className={`text-base font-bold text-cream transition-transform duration-300 md:text-lg ${feedbackFormOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {feedbackFormOpen && (
          <div id="feedback-dropdown-panel" className="mt-3 rounded-xl border border-[#9fdab8]/35 bg-[#0d3f28]/45 p-3 md:p-4">
            <form onSubmit={handleSubmitFeedback} className="grid gap-3 md:grid-cols-2">
              <input
                value={feedbackForm.customer_name}
                onChange={(event) => setFeedbackForm((prev) => ({ ...prev, customer_name: event.target.value }))}
                placeholder="Your Name"
                className="rounded-xl border border-[#9fdab8]/30 bg-[#d7e5e0] px-4 py-2.5 text-sm text-[#163a2c] placeholder:text-[#163a2c]/70 font-bold caret-[#163a2c] focus:outline-none focus:ring-2 focus:ring-[#9fdab8]/40"
                required
              />
              <input
                value={feedbackForm.city_state}
                onChange={(event) => setFeedbackForm((prev) => ({ ...prev, city_state: event.target.value }))}
                placeholder="City, State"
                className="rounded-xl border border-[#9fdab8]/30 bg-[#d7e5e0] px-4 py-2.5 text-sm text-[#163a2c] placeholder:text-[#163a2c]/70 font-bold caret-[#163a2c] focus:outline-none focus:ring-2 focus:ring-[#9fdab8]/40"
                required
              />
              <textarea
                value={feedbackForm.review_text}
                onChange={(event) => setFeedbackForm((prev) => ({ ...prev, review_text: event.target.value }))}
                placeholder="Write your review"
                rows={4}
                className="rounded-xl border border-[#9fdab8]/30 bg-[#d7e5e0] px-4 py-2.5 text-sm text-[#163a2c] placeholder:text-[#163a2c]/70 md:col-span-2 font-bold caret-[#163a2c] focus:outline-none focus:ring-2 focus:ring-[#9fdab8]/40"
                required
              />
              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="rounded-2xl bg-[#1c9f63] px-5 py-2.5 text-base font-bold text-white transition hover:bg-[#178252] md:col-span-2 md:w-fit"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>

            {feedbackNotice && <p className="mt-3 text-sm font-semibold text-cream">{feedbackNotice}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
