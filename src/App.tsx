import { useMemo, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import type { PageName } from './types';

function renderPage(page: PageName, search: string, onNavigate: (page: PageName) => void) {
  switch (page) {
    case 'home':
      return <Home onNavigate={onNavigate} />;
    case 'products':
      return <Products prefillSearch={search} />;
    case 'about':
      return <About />;
    case 'blog':
      return <Blog />;
    case 'contact':
      return <Contact />;
    case 'admin':
      return <Admin />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<PageName>('home');

  const prefillSearch = useMemo(
    () => (activePage === 'products' ? sessionStorage.getItem('senkulatharu_products_search_prefill') ?? '' : ''),
    [activePage],
  );

  return (
    <div className="min-h-screen bg-app font-body text-brown">
      <Header activePage={activePage} onNavigate={setActivePage} />
      <main className={`mx-auto max-w-7xl px-4 ${activePage === 'home' ? 'pb-8 pt-0' : 'py-8'}`}>
        {renderPage(activePage, prefillSearch, setActivePage)}
      </main>
      <Footer onNavigate={setActivePage} />
    </div>
  );
}
