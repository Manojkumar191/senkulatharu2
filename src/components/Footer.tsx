import type { PageName } from '../types';

interface FooterProps {
  onNavigate: (page: PageName) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-8 border-t border-white/30 bg-gradient-to-r from-[#0d3425] via-[#1d5a3b] to-[#0d3425] text-cream sm:mt-10">
      <div className="w-full grid gap-6 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-6 md:grid-cols-3 md:gap-7 md:py-8">
        <div>
          <h3 className="font-headline text-lg sm:text-xl">Senkulatharu</h3>
          <p className="mt-2 text-sm leading-6 text-cream/95">
            Supporting farmers through authentic, naturally grown produce from the dryland farms of Kadavur.
          </p>
        </div>

        <div>
          <h3 className="font-headline text-lg sm:text-xl">Quick Links</h3>
          <div className="mt-3 flex flex-col gap-1.5 text-sm">
            <button onClick={() => onNavigate('home')} className="text-left font-semibold hover:text-sun">Home</button>
            <button onClick={() => onNavigate('products')} className="text-left font-semibold hover:text-sun">Products</button>
            <button onClick={() => onNavigate('about')} className="text-left font-semibold hover:text-sun">About</button>
            <button onClick={() => onNavigate('blog')} className="text-left font-semibold hover:text-sun">Blog</button>
            <button onClick={() => onNavigate('contact')} className="text-left font-semibold hover:text-sun">Contact</button>
          </div>
        </div>

        <div>
          <h3 className="font-headline text-lg sm:text-xl">Contact</h3>
          <p className="mt-3 text-sm font-bold">Nellusoru Manufacturers and Services</p>
          <p className="text-sm leading-6">Email: senkulatharu@gmail.com</p>
          <p className="text-sm leading-6">Call: +91 90800 59430</p>
          <p className="text-sm leading-6">Address: No.5/223, Kurumbapatti Palaviduthi (Post), Tharagampatti (S.O), Kadavur, Karur, Tamil Nadu, India - 621311</p>
        </div>
      </div>
      <div className="border-t border-white/20 px-4 py-2.5 text-center text-xs text-cream/85 sm:py-3 sm:text-sm">
        © {new Date().getFullYear()}{' '}
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="font-semibold text-inherit no-underline transition hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
        >
          Senkulatharu
        </button>
        . All rights reserved.
      </div>
    </footer>
  );
}
