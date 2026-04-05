import { useEffect, useMemo, useRef, useState } from 'react';
import { getCarouselImages } from '../api/carousel';
import { getProducts } from '../api/products';
import type { PageName, Product } from '../types';

interface HomeProps {
  onNavigate: (page: PageName) => void;
}

const FEEDBACK = [
  'Fresh and naturally grown grains every time.',
  'Directly supporting dryland farmers feels meaningful.',
  'Reliable quality and transparent communication on WhatsApp.',
];

export function Home({ onNavigate }: HomeProps) {
  const [topImages, setTopImages] = useState<string[]>([]);
  const [marqueeImages, setMarqueeImages] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [marqueeDirection, setMarqueeDirection] = useState<'normal' | 'reverse'>('normal');
  const touchStartX = useRef(0);

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
      } catch {
        setTopImages(['/carousel/farmer1.svg', '/carousel/farmer2.svg', '/carousel/farmer3.svg']);
        setMarqueeImages(['/carousel/farmer3.svg', '/carousel/farmer4.svg', '/carousel/farmer5.svg']);
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

  const marqueeTrack = useMemo(() => [...marqueeImages, ...marqueeImages], [marqueeImages]);

  const jumpToProducts = (search?: string) => {
    if (search) {
      sessionStorage.setItem('senkulatharu_products_search_prefill', search);
    }
    onNavigate('products');
  };

  return (
    <div className="space-y-14 pb-4">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest to-moss px-6 py-16 text-white shadow-glass md:px-14">
        <div className="absolute -left-24 -top-24 h-52 w-52 rounded-full bg-sun/30 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-60 w-60 rounded-full bg-cream/30 blur-3xl" />
        <div className="relative max-w-3xl animate-floatIn">
          <h1 className="font-headline text-4xl leading-tight md:text-6xl">Dryland Farmers. Honest Produce. Direct Connection.</h1>
          <p className="mt-5 max-w-2xl text-base text-cream md:text-lg">
            Senkulatharu connects Kadavur farmers with households through transparent listings and WhatsApp ordering. No middle layers, only real produce and real stories.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => jumpToProducts()} className="rounded-full bg-sun px-6 py-3 font-bold text-brown transition hover:scale-[1.02]">
              Browse Farm Produce
            </button>
            <button onClick={() => onNavigate('about')} className="rounded-full border border-white/60 px-6 py-3 font-bold text-white">
              Meet Our Farmers
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-3xl text-brown">Farm Carousel</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSlide((prev) => (prev - 1 + topImages.length) % Math.max(1, topImages.length))}
              className="rounded-full border border-forest px-4 py-2 text-sm font-bold text-forest"
            >
              Prev
            </button>
            <button
              onClick={() => setSlide((prev) => (prev + 1) % Math.max(1, topImages.length))}
              className="rounded-full border border-forest px-4 py-2 text-sm font-bold text-forest"
            >
              Next
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-glass">
          {topImages.length > 0 && (
            <img
              src={topImages[slide]}
              alt="Farm highlight"
              className="h-64 w-full object-cover md:h-[420px]"
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src = '/carousel/farmer1.svg';
              }}
            />
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Farmers Connected', value: '120+' },
          { label: 'Products Listed', value: `${products.length}+` },
          { label: 'District Reach', value: 'Karur & Beyond' },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
            <p className="text-sm font-bold uppercase tracking-wide text-clay">{item.label}</p>
            <p className="mt-2 font-headline text-3xl text-forest">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-headline text-3xl text-brown">Moving Produce Gallery</h2>
        <div
          className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 py-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            setMarqueeDirection(delta < 0 ? 'normal' : 'reverse');
          }}
        >
          <div
            className={`flex w-max gap-4 px-4 ${paused ? '' : 'animate-slideLeft'}`}
            style={{ animationDirection: marqueeDirection, animationPlayState: paused ? 'paused' : 'running' }}
          >
            {marqueeTrack.map((src, index) => (
              <button
                key={`${src}-${index}`}
                className="h-36 w-56 shrink-0 overflow-hidden rounded-2xl border border-white/60"
                onClick={() => jumpToProducts(products[index % Math.max(1, products.length)]?.name || 'farmer produce')}
              >
                <img src={src} alt="Marquee produce" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          'Millets & Traditional Grains',
          'Cold Pressed Oils & Pulses',
          'Natural Powders & Value Adds',
        ].map((text) => (
          <article key={text} className="rounded-3xl bg-gradient-to-br from-cream to-sand p-6 shadow-glass transition hover:-translate-y-1">
            <h3 className="font-headline text-xl text-forest">{text}</h3>
            <p className="mt-3 text-sm text-brown">Traceable dryland produce from smallholder farmers with low-input, resilient methods.</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-glass">
        <h2 className="font-headline text-2xl text-brown">Customer Feedback</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {FEEDBACK.map((item) => (
            <p key={item} className="rounded-2xl bg-forest/5 p-4 text-sm text-brown">“{item}”</p>
          ))}
        </div>
      </section>
    </div>
  );
}
