import { useEffect, useMemo, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import type { CartItem, PageName } from './types';

interface RenderPageOptions {
  page: PageName;
  search: string;
  onNavigate: (page: PageName) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

function renderPage({ page, search, onNavigate, onAddToCart }: RenderPageOptions) {
  switch (page) {
    case 'home':
      return <Home onNavigate={onNavigate} />;
    case 'products':
      return (
        <Products
          prefillSearch={search}
          onAddToCart={onAddToCart}
        />
      );
    case 'about':
      return <About />;
    case 'blog':
      return <Blog />;
    case 'contact':
      return <Contact />;
    case 'admin':
      return <Admin onNavigate={onNavigate} />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<PageName>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartNotice, setCartNotice] = useState('');

  const prefillSearch = useMemo(
    () => (activePage === 'products' ? sessionStorage.getItem('senkulatharu_products_search_prefill') ?? '' : ''),
    [activePage],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Math.max(1, Math.floor(item.quantity)), 0),
    [cartItems],
  );

  const addToCart = (incoming: Omit<CartItem, 'id'>) => {
    const quantity = Math.max(1, Math.floor(incoming.quantity));
    const signature = `${incoming.productId}::${incoming.variantLabel ?? ''}`;

    setCartItems((prev) => {
      const index = prev.findIndex((item) => `${item.productId}::${item.variantLabel ?? ''}` === signature);
      if (index >= 0) {
        return prev.map((item, itemIndex) =>
          itemIndex === index ? { ...item, quantity: item.quantity + quantity, unitPrice: incoming.unitPrice } : item,
        );
      }

      return [...prev, { ...incoming, quantity, id: `${signature}-${Date.now()}` }];
    });

    setCartNotice(`${incoming.productName} added to cart`);
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: safeQuantity } : item)));
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  useEffect(() => {
    if (!cartNotice) return;
    const timer = window.setTimeout(() => setCartNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [cartNotice]);

  return (
    <div className="min-h-screen bg-app font-body text-brown">
      {activePage !== 'admin' && (
        <Header
          activePage={activePage}
          onNavigate={setActivePage}
          cartCount={cartCount}
          onCartClick={() => {
            setActivePage('products');
          }}
          cartItems={cartItems}
          onUpdateCartItemQuantity={updateCartItemQuantity}
          onRemoveCartItem={removeCartItem}
          onClearCart={clearCart}
        />
      )}
      <main
        className={
          activePage === 'admin'
            ? 'w-full bg-app px-0 pt-0 pb-0'
            : `w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 ${activePage === 'home' ? 'pt-28 sm:pt-32 md:pt-16' : 'pt-32 sm:pt-32 md:pt-20'} pb-8`
        }
      >
        {renderPage({
          page: activePage,
          search: prefillSearch,
          onNavigate: setActivePage,
          onAddToCart: addToCart,
        })}
      </main>
      {cartNotice && (
        <div className="fixed right-4 top-[112px] z-40 rounded-2xl border border-[#c0e1d0] bg-[#e5f5ec] px-5 py-3 text-base font-bold text-[#24523d] shadow-[0_14px_24px_-14px_rgba(31,74,54,0.65)] md:top-[84px]">
          {cartNotice}
        </div>
      )}
      {activePage !== 'admin' && <Footer onNavigate={setActivePage} />}
    </div>
  );
}
