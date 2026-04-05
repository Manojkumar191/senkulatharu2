import type { PageName } from '../types';

interface FooterProps {
  onNavigate: (page: PageName) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-white/40 bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-headline text-2xl">About Senkulatharu</h3>
          <p className="mt-4 text-sm leading-6 text-cream/90">
            A dryland farmer collective from Kadavur, Tamil Nadu. We connect farms directly with families through transparent produce listings and WhatsApp ordering.
          </p>
        </div>

        <div>
          <h3 className="font-headline text-2xl">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <button onClick={() => onNavigate('home')} className="text-left hover:text-sun">Home</button>
            <button onClick={() => onNavigate('products')} className="text-left hover:text-sun">Products</button>
            <button onClick={() => onNavigate('about')} className="text-left hover:text-sun">About</button>
            <button onClick={() => onNavigate('blog')} className="text-left hover:text-sun">Blog</button>
            <button onClick={() => onNavigate('contact')} className="text-left hover:text-sun">Contact</button>
          </div>
        </div>

        <div>
          <h3 className="font-headline text-2xl">Contact</h3>
          <p className="mt-4 text-sm">Email: hello@senkulatharu.in</p>
          <p className="text-sm">Phone: +91 90800 59430</p>
          <p className="text-sm">Address: Kadavur, Karur District, Tamil Nadu, India - 621311</p>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-sm text-cream/80">© {new Date().getFullYear()} Senkulatharu. All rights reserved.</div>
    </footer>
  );
}
