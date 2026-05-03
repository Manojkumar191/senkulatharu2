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

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  customer_name varchar(255) not null,
  city_state varchar(255) not null,
  review_text text not null,
  rating int not null check (rating between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  excerpt text,
  body text not null,
  author varchar(255) not null,
  is_published boolean not null default true,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

create index if not exists idx_products_created_at on public.products(created_at desc);
create index if not exists idx_carousel_section_order on public.carousel_images(section, sort_order, created_at);
create index if not exists idx_feedback_created_at on public.feedback(created_at desc);
create index if not exists idx_feedback_approval_created on public.feedback(is_approved, created_at desc);
create index if not exists idx_blogs_created_at on public.blogs(created_at desc);
create index if not exists idx_blogs_published_created on public.blogs(is_published, created_at desc);

alter table public.products enable row level security;
alter table public.carousel_images enable row level security;
alter table public.feedback enable row level security;
alter table public.blogs enable row level security;

-- Hosted-safe admin authorization
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Products
drop policy if exists "products_public_select" on public.products;
drop policy if exists "products_public_insert" on public.products;
drop policy if exists "products_public_update" on public.products;
drop policy if exists "products_public_delete" on public.products;
create policy "products_public_select" on public.products
for select
using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
for delete
to authenticated
using (public.is_admin());

-- Carousel
drop policy if exists "carousel_public_select" on public.carousel_images;
drop policy if exists "carousel_public_insert" on public.carousel_images;
drop policy if exists "carousel_public_update" on public.carousel_images;
drop policy if exists "carousel_public_delete" on public.carousel_images;
create policy "carousel_public_select" on public.carousel_images
for select
using (true);

drop policy if exists "carousel_admin_insert" on public.carousel_images;
create policy "carousel_admin_insert" on public.carousel_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "carousel_admin_update" on public.carousel_images;
create policy "carousel_admin_update" on public.carousel_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "carousel_admin_delete" on public.carousel_images;
create policy "carousel_admin_delete" on public.carousel_images
for delete
to authenticated
using (public.is_admin());

-- Feedback
drop policy if exists "feedback_public_insert" on public.feedback;
drop policy if exists "feedback_public_select" on public.feedback;
drop policy if exists "feedback_public_update" on public.feedback;
drop policy if exists "feedback_public_delete" on public.feedback;
create policy "feedback_public_insert" on public.feedback
for insert
with check (true);

drop policy if exists "feedback_public_select_approved" on public.feedback;
create policy "feedback_public_select_approved" on public.feedback
for select
using (is_approved = true);

drop policy if exists "feedback_admin_select_all" on public.feedback;
create policy "feedback_admin_select_all" on public.feedback
for select
to authenticated
using (public.is_admin());

drop policy if exists "feedback_admin_update" on public.feedback;
create policy "feedback_admin_update" on public.feedback
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "feedback_admin_delete" on public.feedback;
create policy "feedback_admin_delete" on public.feedback
for delete
to authenticated
using (public.is_admin());

-- Blogs
drop policy if exists "blogs_public_select_published" on public.blogs;
drop policy if exists "blogs_public_select" on public.blogs;
drop policy if exists "blogs_public_insert" on public.blogs;
drop policy if exists "blogs_public_update" on public.blogs;
drop policy if exists "blogs_public_delete" on public.blogs;
create policy "blogs_public_select_published" on public.blogs
for select
using (is_published = true);

drop policy if exists "blogs_admin_select_all" on public.blogs;
create policy "blogs_admin_select_all" on public.blogs
for select
to authenticated
using (public.is_admin());

drop policy if exists "blogs_admin_insert" on public.blogs;
create policy "blogs_admin_insert" on public.blogs
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "blogs_admin_update" on public.blogs;
create policy "blogs_admin_update" on public.blogs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "blogs_admin_delete" on public.blogs;
create policy "blogs_admin_delete" on public.blogs
for delete
to authenticated
using (public.is_admin());

insert into public.blogs (title, excerpt, body, author, is_published, created_at, updated_at)
select
  'Stories from Kadavur',
  'Every food carries a story from drought, rain, seasonal wild plants, and family-held traditions in Kadavur.',
  'Every food carries a story. Some come from farming practices shaped by drought and rain. Others come from wild plants that appear only in certain seasons. Some are recipes and food traditions that have been quietly preserved within families.' || E'\n\n' ||
  'Senkulatharu also documents and shares these stories, the history of crops, forgotten food practices, the search for traditional varieties, and the everyday wisdom that continues to guide farming in Kadavur block.' || E'\n\n' ||
  'Because understanding food also means understanding the land and the people who care for it.',
  'Senkulatharu Team',
  true,
  '2026-03-18 09:00:00',
  '2026-03-18 09:00:00'
where not exists (
  select 1 from public.blogs
  where title = 'Stories from Kadavur'
    and author = 'Senkulatharu Team'
    and created_at::date = '2026-03-18'
);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('carousel', 'carousel', true)
on conflict (id) do nothing;

-- Storage object policies
drop policy if exists "products_storage_public_select" on storage.objects;
drop policy if exists "products_storage_public_insert" on storage.objects;
drop policy if exists "products_storage_public_delete" on storage.objects;
create policy "products_storage_public_select" on storage.objects
for select using (bucket_id = 'products');

drop policy if exists "products_storage_admin_insert" on storage.objects;
create policy "products_storage_admin_insert" on storage.objects
for insert
to authenticated
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_storage_admin_update" on storage.objects;
create policy "products_storage_admin_update" on storage.objects
for update
to authenticated
using (bucket_id = 'products' and public.is_admin())
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_storage_admin_delete" on storage.objects;
create policy "products_storage_admin_delete" on storage.objects
for delete
to authenticated
using (bucket_id = 'products' and public.is_admin());

drop policy if exists "carousel_storage_public_select" on storage.objects;
drop policy if exists "carousel_storage_public_insert" on storage.objects;
drop policy if exists "carousel_storage_public_delete" on storage.objects;
create policy "carousel_storage_public_select" on storage.objects
for select using (bucket_id = 'carousel');

drop policy if exists "carousel_storage_admin_insert" on storage.objects;
create policy "carousel_storage_admin_insert" on storage.objects
for insert
to authenticated
with check (bucket_id = 'carousel' and public.is_admin());

drop policy if exists "carousel_storage_admin_update" on storage.objects;
create policy "carousel_storage_admin_update" on storage.objects
for update
to authenticated
using (bucket_id = 'carousel' and public.is_admin())
with check (bucket_id = 'carousel' and public.is_admin());

drop policy if exists "carousel_storage_admin_delete" on storage.objects;
create policy "carousel_storage_admin_delete" on storage.objects
for delete
to authenticated
using (bucket_id = 'carousel' and public.is_admin());

-- Recommended production hardening (manual):
-- 1) Replace write policies with authenticated role only.
-- 2) Use Supabase Auth and role checks for admin operations.
-- 3) Restrict storage writes to folder prefixes and MIME checks.
