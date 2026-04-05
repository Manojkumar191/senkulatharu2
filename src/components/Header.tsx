import { FiMessageCircle, FiPhone } from 'react-icons/fi';
import type { PageName } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface HeaderProps {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
}

const navItems: { label: string; page: PageName }[] = [
  { label: 'Home', page: 'home' },
  { label: 'About', page: 'about' },
  { label: 'Products', page: 'products' },
  { label: 'Blog', page: 'blog' },
  { label: 'Contact', page: 'contact' },
];

export function Header({ activePage, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-cream/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <button className="text-left" onClick={() => onNavigate('home')}>
          <p className="font-headline text-2xl font-bold text-forest">Senkulatharu</p>
          <p className="text-xs font-semibold tracking-wide text-brown">செங்குலத்தாறு கடவூர் உலர் நில விவசாயிகள்</p>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.page}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                activePage === item.page ? 'bg-forest text-white' : 'text-forest hover:bg-forest/10'
              }`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openWhatsApp('Hello, I want to know more about your farm produce.')}
            className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.03]"
          >
            <FiMessageCircle /> WhatsApp
          </button>
          <a href="tel:+919080059430" className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 text-sm font-bold text-brown">
            <FiPhone /> Call Us
          </a>
          <button onClick={() => onNavigate('admin')} className="rounded-full border border-forest px-4 py-2 text-sm font-bold text-forest">
            Quick Login
          </button>
        </div>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.page}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
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
