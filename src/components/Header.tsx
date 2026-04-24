import { useMemo, useState } from 'react';
import { FiMinus, FiPhone, FiPlus, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import type { CartItem, PageName } from '../types';
import { buildWhatsappCartOrderMessage, openWhatsApp } from '../utils/whatsapp';

interface HeaderProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
  cartCount?: number;
  onCartClick?: () => void;
  cartItems: CartItem[];
  onUpdateCartItemQuantity: (id: string, quantity: number) => void;
  onRemoveCartItem: (id: string) => void;
  onClearCart: () => void;
}

const navItems: { label: string; page: PageName }[] = [
  { label: 'Home', page: 'home' },
  { label: 'About', page: 'about' },
  { label: 'Products', page: 'products' },
  { label: 'Blog', page: 'blog' },
  { label: 'Contact', page: 'contact' },
];

export function Header({
  activePage,
  onNavigate,
  cartCount = 0,
  onCartClick,
  cartItems,
  onUpdateCartItemQuantity,
  onRemoveCartItem,
  onClearCart,
}: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPrice * Math.max(1, Math.floor(item.quantity)), 0),
    [cartItems],
  );

  const handleOpenCart = () => {
    onCartClick?.();
    setIsCartOpen(true);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[92rem] items-center gap-2 px-3 py-2 sm:gap-2.5 sm:px-4 sm:py-2.5">
        <button className="min-w-0 flex-1 text-left" onClick={() => onNavigate('home')}>
          <p className="truncate font-headline text-lg font-extrabold leading-none tracking-[0.03em] text-forest sm:text-[1.65rem]">Senkulatharu</p>
          <p className="mt-0.5 truncate text-[11px] font-extrabold tracking-[0.03em] text-forest sm:text-[13px]">Rooted in Soil, Grown with Care</p>
        </button>

        <nav className="hidden items-center gap-1 md:mx-auto md:flex">
          {navItems.map((item) => (
            <button
              key={item.page}
              className={`border-b-2 px-4 py-2 text-base font-black transition ${
                activePage === item.page
                  ? 'border-forest text-forest'
                  : 'border-transparent text-forest hover:border-forest/40 hover:text-forest'
              }`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative ml-auto flex shrink-0 items-center gap-2">
          <a
            href="tel:+919080059430"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-2 text-xs font-extrabold text-white transition hover:scale-[1.03] hover:bg-[#1d4ed8] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <FiPhone className="shrink-0" />
            <span className="hidden sm:inline">Call Us</span>
            <span className="sm:hidden">Call</span>
          </a>

          <button
            type="button"
            onClick={handleOpenCart}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-2 text-xs font-extrabold text-white transition hover:scale-[1.03] hover:bg-[#1f5c45] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <FiShoppingCart className="shrink-0" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-black text-forest sm:min-w-6">
                {cartCount}
              </span>
            )}
          </button>

          {isCartOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(88vw,22rem)] max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-[#cfe6d7] bg-[#f8fdf9] p-3 shadow-[0_18px_30px_-20px_rgba(25,75,54,0.55)]">
              <div className="mb-2 flex shrink-0 items-center justify-between">
                <h2 className="text-base font-black text-[#1f4a36]">Cart</h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full border border-[#c7e4d8] p-1 text-[#2f5a45]"
                >
                  <FiX />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="shrink-0 rounded-xl bg-[#e8f6ee] p-2 text-sm font-semibold text-[#2f5a45]">Your cart is empty.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="max-h-[60vh] space-y-1.5 overflow-auto pr-1">
                    {cartItems.map((item) => {
                      const quantity = Math.max(1, Math.floor(item.quantity));
                      const lineTotal = item.unitPrice * quantity;
                      return (
                        <article key={item.id} className="rounded-xl border border-[#cfe6d7] bg-[#eef9f1] p-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-bold text-[#234f3a]">{item.productName}</p>
                              <p className="text-xs font-bold text-[#2f5a45]">
                                Qty {quantity} {item.variantLabel ? `| ${item.variantLabel}` : ''}
                              </p>
                            </div>
                            <p className="shrink-0 text-[15px] font-extrabold text-[#1f4a36]">Rs.{lineTotal.toFixed(2)}</p>
                          </div>

                          <div className="mt-1 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-[#c7e4d8] bg-white">
                              <button
                                type="button"
                                onClick={() => onUpdateCartItemQuantity(item.id, Math.max(1, quantity - 1))}
                                className="px-2 py-0.5 text-[#2f5a45]"
                                aria-label={`Decrease ${item.productName}`}
                              >
                                <FiMinus />
                              </button>
                              <span className="min-w-7 px-1.5 text-center text-xs font-bold text-[#2f5a45]">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateCartItemQuantity(item.id, quantity + 1)}
                                className="px-2 py-0.5 text-[#2f5a45]"
                                aria-label={`Increase ${item.productName}`}
                              >
                                <FiPlus />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.id)}
                              className="rounded-md p-1 text-clay transition hover:bg-clay/10"
                              aria-label={`Remove ${item.productName}`}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="shrink-0 rounded-xl border border-[#cfe6d7] bg-[#eef9f1] p-2.5">
                    <div className="flex items-center justify-between text-sm font-bold text-[#2f5a45]">
                      <span>Total</span>
                      <span className="text-base text-[#1f4a36]">Rs.{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => openWhatsApp(buildWhatsappCartOrderMessage(cartItems))}
                        className="rounded-lg bg-[#2f7a5a] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#245f47]"
                      >
                        Order on WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={onClearCart}
                        className="rounded-lg bg-[#2f7a5a] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#245f47]"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-2 sm:px-4 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.page}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-black ${
              activePage === item.page ? 'bg-forest text-white' : 'bg-white/80 text-forest'
            }`}
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
