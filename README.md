# Senkulatharu

Senkulatharu is a frontend-only farmer product showcase platform for dryland farmers in Kadavur, Tamil Nadu.

The app has six pages:
- Home
- Products
- About
- Blog
- Contact
- Admin

All CRUD and file operations are done directly from the browser using Supabase JavaScript client.

## Stack
- React 18+ with Vite + TypeScript
- Tailwind CSS
- Supabase (Database + Storage)

## Key Features
- Direct WhatsApp order button per product
- Metadata compatibility in description:
  - [Category: X]
  - [Stock: Y]
- Home top carousel with fallback local images
- Home moving marquee with hover pause and touch direction support
- Marquee click to prefill product search (sessionStorage)
- Admin panel with frontend password from environment variable
- Product CRUD + image compression in browser before upload
- Carousel CRUD for top and marquee sections
- Local category management in localStorage

## Environment Variables
Copy .env.example to .env and fill values.

Required:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ADMIN_PASSWORD

Optional:
- VITE_WHATSAPP_NUMBER

## Supabase Setup
1. Create a Supabase project.
2. Open SQL editor and run supabase.sql.
3. Verify tables:
   - products
   - carousel_images
4. Verify buckets:
   - products
   - carousel
5. Configure .env values from project settings.

## Local Run
1. npm install
2. npm run dev

## Build
1. npm run build
2. npm run preview

## Deploy
Deploy as a static frontend (Vercel/Netlify/Cloudflare Pages).
No backend server is needed.

## Notes
Current policies are intentionally open to mirror the original behavior.
For production hardening, use Supabase Auth and tighten write policies.
