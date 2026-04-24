const CATEGORY_REGEX = /\[Category:\s*([^\]]+)\]/i;
const STOCK_REGEX = /\[Stock:\s*([^\]]+)\]/i;
const DISCOUNT_REGEX = /\[Discount:\s*([^\]]+)\]/i;
const VARIANTS_REGEX = /\[Variants:\s*([^\]]*)\]/i;

export interface ProductVariant {
  label: string;
  price: number;
}

export function parseCategoryFromDescription(description: string): string {
  const match = description.match(CATEGORY_REGEX);
  return match?.[1]?.trim() || 'Uncategorized';
}

export function parseStockFromDescription(description: string): number {
  const match = description.match(STOCK_REGEX);
  const parsed = Number(match?.[1]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function parseDiscountFromDescription(description: string): number {
  const match = description.match(DISCOUNT_REGEX);
  const parsed = Number(match?.[1]);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

export function parseVariantsFromDescription(description: string): ProductVariant[] {
  const match = description.match(VARIANTS_REGEX);
  if (!match?.[1]) return [];

  return match[1]
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [rawLabel, rawPrice] = entry.split('=');
      const label = (rawLabel || '').trim();
      const price = Number(rawPrice);
      if (!label || !Number.isFinite(price) || price < 0) return null;
      return { label, price };
    })
    .filter((item): item is ProductVariant => Boolean(item));
}

export function parseVariantsEditorInput(input: string): ProductVariant[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const direct = line.match(/^(.*?)\s*[-=:]\s*([0-9]+(?:\.[0-9]{1,2})?)$/);
      if (direct) {
        return {
          label: direct[1].trim(),
          price: Number(direct[2]),
        };
      }

      const fallback = line.match(/^(.*\D)\s+([0-9]+(?:\.[0-9]{1,2})?)$/);
      if (fallback) {
        return {
          label: fallback[1].trim(),
          price: Number(fallback[2]),
        };
      }

      return null;
    })
    .filter((item): item is ProductVariant => Boolean(item))
    .filter((item) => item.label && Number.isFinite(item.price) && item.price >= 0);
}

export function formatVariantsForEditor(variants: ProductVariant[]): string {
  return variants.map((item) => `${item.label} - ${item.price}`).join('\n');
}

export function stripMetaTags(description: string): string {
  return description
    .replace(CATEGORY_REGEX, '')
    .replace(STOCK_REGEX, '')
    .replace(DISCOUNT_REGEX, '')
    .replace(VARIANTS_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildDescriptionWithMeta(input: {
  description: string;
  category: string;
  stock: number;
  discount: number;
  variants: ProductVariant[];
}): string {
  const base = input.description.trim();
  const category = (input.category || 'Uncategorized').trim();
  const stock = Number.isFinite(input.stock) && input.stock >= 0 ? Math.floor(input.stock) : 0;
  const discount = Number.isFinite(input.discount) ? Math.max(0, Math.min(100, input.discount)) : 0;
  const variants = input.variants
    .filter((item) => item.label && Number.isFinite(item.price) && item.price >= 0)
    .map((item) => `${item.label}=${item.price}`)
    .join('|');
  return `[Category: ${category}] [Stock: ${stock}] [Discount: ${discount}] [Variants: ${variants}] ${base}`.trim();
}
