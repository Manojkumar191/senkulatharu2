import type { CartItem } from '../types';

export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '919080059430';

interface WhatsappOrderOptions {
  variantLabel?: string;
  quantity?: number;
  originalUnitPrice?: number;
  discountPercent?: number;
}

export function buildWhatsappOrderMessage(name: string, price: number, options?: WhatsappOrderOptions): string {
  const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
  const variant = options?.variantLabel?.trim();
  const discount = Math.max(0, Math.min(100, Number(options?.discountPercent ?? 0)));
  const originalUnitPrice = Number(options?.originalUnitPrice);
  const hasOriginal = Number.isFinite(originalUnitPrice) && originalUnitPrice > price;

  const lines = [
    `Hello, I want to order ${name}${variant ? ` (${variant})` : ''}.`,
    `Quantity: ${quantity}`,
  ];

  if (hasOriginal) {
    lines.push(`Unit price: Rs.${price.toFixed(2)} (Discount ${discount}%, was Rs.${originalUnitPrice.toFixed(2)})`);
  } else {
    lines.push(`Unit price: Rs.${price.toFixed(2)}`);
  }

  lines.push(`Total: Rs.${(price * quantity).toFixed(2)}`);

  return lines.join('\n');
}

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}

export function buildWhatsappCartOrderMessage(items: CartItem[]): string {
  if (items.length === 0) {
    return 'Hello, I want to place an order.';
  }

  let grandTotal = 0;
  const lines = ['Hello, I want to place this order:', ''];

  items.forEach((item, index) => {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Number(item.unitPrice);
    const lineTotal = unitPrice * quantity;
    grandTotal += lineTotal;

    lines.push(`${index + 1}. ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''}`);
    lines.push(`   Quantity: ${quantity}`);
    lines.push(`   Unit price: Rs.${unitPrice.toFixed(2)}`);
    lines.push(`   Line total: Rs.${lineTotal.toFixed(2)}`);
  });

  lines.push('');
  lines.push(`Grand total: Rs.${grandTotal.toFixed(2)}`);
  lines.push('Please confirm availability and delivery details.');

  return lines.join('\n');
}
