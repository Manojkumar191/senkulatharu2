import type { Product } from '../types';
import { parseCategoryFromDescription, parseStockFromDescription, stripMetaTags } from '../utils/meta';
import { buildWhatsappOrderMessage, openWhatsApp } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const category = parseCategoryFromDescription(product.description || '');
  const stock = parseStockFromDescription(product.description || '');
  const clean = stripMetaTags(product.description || '');

  return (
    <article
      className="group relative animate-floatIn overflow-hidden rounded-3xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(246,239,222,0.72)_100%)] shadow-[0_16px_34px_-18px_rgba(21,58,43,0.55)] backdrop-blur transition duration-300 ease-out hover:-translate-y-2 hover:border-forest/25 hover:shadow-[0_24px_40px_-20px_rgba(31,79,53,0.45)] focus-within:-translate-y-2 focus-within:border-forest/25 focus-within:shadow-[0_24px_40px_-20px_rgba(31,79,53,0.45)]"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2a8f67] via-[#49b18a] to-[#8fd3a2]" />

      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110 group-hover:saturate-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brown">No image available</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1738282e] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-forest/15 bg-forest/10 px-3 py-1 text-xs font-bold text-forest">{category}</span>
          <span className="rounded-full border border-clay/20 bg-clay/10 px-3 py-1 text-xs font-bold text-clay">Stock: {stock}</span>
        </div>
        <h3 className="font-headline text-2xl text-brown">{product.name}</h3>
        <p className="mt-2 text-sm text-brown/80">{clean || 'Fresh produce from our dryland farms.'}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="rounded-full bg-forest/10 px-3 py-1 text-lg font-extrabold text-forest">₹{Number(product.price).toFixed(2)}</p>
          <button
            onClick={() => openWhatsApp(buildWhatsappOrderMessage(product.name, Number(product.price)))}
            className="rounded-full bg-moss px-4 py-2 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-forest"
          >
            Quick order
          </button>
        </div>
      </div>
    </article>
  );
}
