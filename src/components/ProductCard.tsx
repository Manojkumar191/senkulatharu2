import type { Product } from '../types';
import { parseCategoryFromDescription, parseStockFromDescription, stripMetaTags } from '../utils/meta';
import { buildWhatsappOrderMessage, openWhatsApp } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const category = parseCategoryFromDescription(product.description || '');
  const stock = parseStockFromDescription(product.description || '');
  const clean = stripMetaTags(product.description || '');

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-glass backdrop-blur">
      <div className="aspect-[4/3] overflow-hidden bg-cream">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brown">No image available</div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">{category}</span>
          <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-bold text-clay">Stock: {stock}</span>
        </div>
        <h3 className="font-headline text-xl text-brown">{product.name}</h3>
        <p className="mt-2 text-sm text-brown/80">{clean || 'Fresh produce from our dryland farms.'}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-extrabold text-forest">₹{Number(product.price).toFixed(2)}</p>
          <button
            onClick={() => openWhatsApp(buildWhatsappOrderMessage(product.name, Number(product.price)))}
            className="rounded-full bg-moss px-4 py-2 text-sm font-bold text-white"
          >
            Order on WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}
