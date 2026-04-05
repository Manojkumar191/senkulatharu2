# Supabase Setup Details

## Tables
### products
- id uuid primary key default gen_random_uuid()
- name varchar(255) not null
- price numeric(10,2) not null
- description text
- image_url varchar(500)
- created_at timestamp default current_timestamp
- updated_at timestamp default current_timestamp

### carousel_images
- id uuid primary key default gen_random_uuid()
- section text not null check in ('top', 'marquee')
- image_url varchar(500) not null
- sort_order int default 0
- created_at timestamp default current_timestamp

## Storage
- Bucket products (public)
- Bucket carousel (public)

## RLS
Enabled on products and carousel_images.
Policies allow public read/write to mirror existing behavior.

## API Keys for Frontend
- Use only the anon public key in frontend env variables.
- Never use the service_role key in browser code, Vite env files exposed to client, or public repositories.
- If service_role was shared, rotate it in Supabase Project Settings > API.

## Safer Alternative
For production:
- Public select only
- Authenticated insert/update/delete
- Restrict storage writes to authenticated admins only
- Add folder-level and MIME constraints for storage objects
