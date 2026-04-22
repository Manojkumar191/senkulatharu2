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

export interface Feedback {
  id: string;
  customer_name: string;
  city_state: string;
  review_text: string;
  rating: number;
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
}
