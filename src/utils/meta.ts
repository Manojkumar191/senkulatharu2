const CATEGORY_REGEX = /\[Category:\s*([^\]]+)\]/i;
const STOCK_REGEX = /\[Stock:\s*([^\]]+)\]/i;

export function parseCategoryFromDescription(description: string): string {
  const match = description.match(CATEGORY_REGEX);
  return match?.[1]?.trim() || 'Uncategorized';
}

export function parseStockFromDescription(description: string): number {
  const match = description.match(STOCK_REGEX);
  const parsed = Number(match?.[1]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function stripMetaTags(description: string): string {
  return description
    .replace(CATEGORY_REGEX, '')
    .replace(STOCK_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildDescriptionWithMeta(input: {
  description: string;
  category: string;
  stock: number;
}): string {
  const base = input.description.trim();
  const category = (input.category || 'Uncategorized').trim();
  const stock = Number.isFinite(input.stock) && input.stock >= 0 ? Math.floor(input.stock) : 0;
  return `[Category: ${category}] [Stock: ${stock}] ${base}`.trim();
}
