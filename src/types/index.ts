export type PageName = 'home' | 'products' | 'about' | 'blog' | 'contact' | 'admin';

export type CarouselSection = 'top' | 'marquee';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CarouselImage {
  id: string;
  section: CarouselSection;
  image_url: string;
  sort_order: number;
  created_at?: string;
}
