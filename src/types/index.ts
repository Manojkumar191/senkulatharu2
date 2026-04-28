export type PageName = 'home' | 'products' | 'about' | 'blog' | 'contact' | 'admin';

export type CarouselSection = 'top' | 'marquee';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  admin_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantLabel?: string;
  unitPrice: number;
  originalUnitPrice?: number;
  discountPercent?: number;
  quantity: number;
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

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  author: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}
