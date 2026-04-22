import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
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
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:flex-nowrap">
        <button className="text-left" onClick={() => onNavigate('home')}>
          <p className="font-headline text-xl font-extrabold leading-none tracking-[0.03em] text-forest sm:text-2xl">Senkulatharu</p>
          <p className="mt-1 text-xs font-extrabold tracking-[0.03em] text-forest sm:text-sm">இது உதிரத்தில் இணைத்த உழவு</p>
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

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => openWhatsApp('Hello, I want to know more about your farm produce.')}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1fbe74] px-3 py-2 text-xs font-extrabold text-white transition hover:scale-[1.03] hover:bg-[#1aa765] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white sm:h-5 sm:w-5">
              <FaWhatsapp className="shrink-0 text-[#25D366]" />
            </span>
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">WA</span>
          </button>
          <a
            href="tel:+919080059430"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-2 text-xs font-extrabold text-white transition hover:scale-[1.03] hover:bg-[#1d4ed8] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <FiPhone className="shrink-0" />
            <span className="hidden sm:inline">Call Us</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-3 pb-3 sm:px-4 md:hidden">
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
