-- Migration: add admin_user_id to products
-- Run this in Supabase SQL editor or via your migration tooling

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS admin_user_id text;

-- Optional: set existing rows to a default admin identifier
-- UPDATE public.products SET admin_user_id = 'admin' WHERE admin_user_id IS NULL;
