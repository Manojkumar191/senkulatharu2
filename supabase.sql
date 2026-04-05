-- Senkulatharu Supabase setup
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  price numeric(10,2) not null,
  description text,
  image_url varchar(500),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create table if not exists public.carousel_images (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('top','marquee')),
  image_url varchar(500) not null,
  sort_order int default 0,
  created_at timestamp default current_timestamp
);

create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_carousel_section_order on public.carousel_images(section, sort_order, created_at);

alter table public.products enable row level security;
alter table public.carousel_images enable row level security;

-- Open policies to match current frontend-only behavior.
drop policy if exists "products_public_select" on public.products;
create policy "products_public_select" on public.products for select using (true);

drop policy if exists "products_public_insert" on public.products;
create policy "products_public_insert" on public.products for insert with check (true);

drop policy if exists "products_public_update" on public.products;
create policy "products_public_update" on public.products for update using (true) with check (true);

drop policy if exists "products_public_delete" on public.products;
create policy "products_public_delete" on public.products for delete using (true);

drop policy if exists "carousel_public_select" on public.carousel_images;
create policy "carousel_public_select" on public.carousel_images for select using (true);

drop policy if exists "carousel_public_insert" on public.carousel_images;
create policy "carousel_public_insert" on public.carousel_images for insert with check (true);

drop policy if exists "carousel_public_update" on public.carousel_images;
create policy "carousel_public_update" on public.carousel_images for update using (true) with check (true);

drop policy if exists "carousel_public_delete" on public.carousel_images;
create policy "carousel_public_delete" on public.carousel_images for delete using (true);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('carousel', 'carousel', true)
on conflict (id) do nothing;

-- Storage object policies
drop policy if exists "products_storage_public_select" on storage.objects;
create policy "products_storage_public_select" on storage.objects
for select using (bucket_id = 'products');

drop policy if exists "products_storage_public_insert" on storage.objects;
create policy "products_storage_public_insert" on storage.objects
for insert with check (bucket_id = 'products');

drop policy if exists "products_storage_public_delete" on storage.objects;
create policy "products_storage_public_delete" on storage.objects
for delete using (bucket_id = 'products');

drop policy if exists "carousel_storage_public_select" on storage.objects;
create policy "carousel_storage_public_select" on storage.objects
for select using (bucket_id = 'carousel');

drop policy if exists "carousel_storage_public_insert" on storage.objects;
create policy "carousel_storage_public_insert" on storage.objects
for insert with check (bucket_id = 'carousel');

drop policy if exists "carousel_storage_public_delete" on storage.objects;
create policy "carousel_storage_public_delete" on storage.objects
for delete using (bucket_id = 'carousel');

-- Recommended production hardening (manual):
-- 1) Replace write policies with authenticated role only.
-- 2) Use Supabase Auth and role checks for admin operations.
-- 3) Restrict storage writes to folder prefixes and MIME checks.
