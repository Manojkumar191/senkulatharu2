export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '919080059430';

export function buildWhatsappOrderMessage(name: string, price: number): string {
  return `Hello, I want to order ${name}, Price: ₹${price.toFixed(2)}`;
}

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}
