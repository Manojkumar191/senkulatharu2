import { useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';
import {
  parseCategoryFromDescription,
  parseDiscountFromDescription,
  parseStockFromDescription,
  parseVariantsFromDescription,
  stripMetaTags,
} from '../utils/meta';
import { buildWhatsappOrderMessage, openWhatsApp } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

function applyDiscount(price: number, discountPercent: number): number {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return price * (1 - discount / 100);
}

export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  const category = parseCategoryFromDescription(product.description || '');
  const stock = parseStockFromDescription(product.description || '');
  const discount = parseDiscountFromDescription(product.description || '');
  const clean = stripMetaTags(product.description || '');
  const variants = parseVariantsFromDescription(product.description || '');

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const selectedVariant = variants[selectedVariantIndex];
  const originalUnitPrice = selectedVariant ? selectedVariant.price : Number(product.price);
  const finalUnitPrice = useMemo(() => applyDiscount(originalUnitPrice, discount), [originalUnitPrice, discount]);

  return (
    <article
      className="group relative animate-floatIn overflow-hidden rounded-3xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(238,249,241,0.92)_100%)] shadow-[0_14px_32px_-20px_rgba(21,58,43,0.58)] transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_38px_-20px_rgba(21,58,43,0.62)]"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2a8f67] via-[#49b18a] to-[#8fd3a2]" />

      <div className="relative aspect-[16/10] overflow-hidden bg-cream sm:aspect-[4/3]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brown">No image available</div>
        )}
      </div>

      <div className="space-y-2.5 p-3.5 sm:space-y-3 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-forest/15 bg-forest/10 px-2.5 py-0.5 text-[11px] font-bold text-forest sm:px-3 sm:py-1 sm:text-xs">{category}</span>
          <span className="rounded-full border border-clay/20 bg-clay/10 px-2.5 py-0.5 text-[11px] font-bold text-clay sm:px-3 sm:py-1 sm:text-xs">Stock: {stock}</span>
          {discount > 0 && (
            <span className="rounded-full border border-[#1f8e62]/25 bg-[#1f8e62]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#0f5f3f] sm:px-3 sm:py-1 sm:text-xs">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-headline text-xl text-brown sm:text-2xl">{product.name}</h3>
          <p className="mt-1 text-xs font-semibold text-brown/80 sm:text-sm">{clean || 'Fresh produce from our dryland farms.'}</p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-forest">Price</p>
            <div className="text-right">
              {discount > 0 && <p className="text-xs font-bold text-brown/60 line-through">Rs.{originalUnitPrice.toFixed(2)}</p>}
              <p className="text-[2rem] font-black leading-none text-forest sm:text-[2.1rem]">Rs.{finalUnitPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {variants.length > 0 ? (
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-brown/70 sm:mb-2 sm:text-xs">Pack options</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant, variantIndex) => {
                const optionFinal = applyDiscount(variant.price, discount);
                return (
                  <button
                    key={`${variant.label}-${variantIndex}`}
                    type="button"
                    onClick={() => setSelectedVariantIndex(variantIndex)}
                    className={`rounded-xl border px-2.5 py-1.5 text-left text-xs transition sm:px-3 sm:py-2 sm:text-sm ${
                      selectedVariantIndex === variantIndex
                        ? 'border-forest bg-forest/10 text-forest'
                        : 'border-sand bg-white text-brown hover:border-forest/50'
                    }`}
                  >
                    <p className="font-bold">{variant.label}</p>
                    {discount > 0 ? (
                      <p className="text-xs">
                        <span className="line-through opacity-70">Rs.{variant.price.toFixed(2)}</span>{' '}
                        <span className="font-bold text-forest">Rs.{optionFinal.toFixed(2)}</span>
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-forest">Rs.{variant.price.toFixed(2)}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              onAddToCart({
                productId: product.id,
                productName: product.name,
                variantLabel: selectedVariant?.label,
                unitPrice: finalUnitPrice,
                originalUnitPrice,
                discountPercent: discount,
                quantity: 1,
              })
            }
            className="w-full rounded-xl bg-[#2f7a5a] px-3 py-2.5 text-sm font-extrabold text-white transition duration-300 hover:bg-[#245f47] sm:px-4 sm:py-3"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() =>
              openWhatsApp(
                buildWhatsappOrderMessage(product.name, finalUnitPrice, {
                  quantity: 1,
                  variantLabel: selectedVariant?.label,
                  originalUnitPrice,
                  discountPercent: discount,
                }),
              )
            }
            className="w-full rounded-xl bg-[#2f7a5a] px-3 py-2.5 text-sm font-extrabold text-white transition duration-300 hover:bg-[#245f47] sm:px-4 sm:py-3"
          >
            Quick Order
          </button>
        </div>
      </div>
    </article>
  );
}
