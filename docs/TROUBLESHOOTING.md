# Troubleshooting

## Supabase errors on load
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- Ensure tables and buckets are created via supabase.sql.
- Confirm RLS policies exist.

## Images not uploading
- Verify storage bucket names are exactly products and carousel.
- Confirm storage insert policy is present.
- Ensure image file type is valid.

## Carousel shows defaults only
- Check carousel_images table has rows for that section.
- Ensure section values are top or marquee.

## Admin login fails
- Verify VITE_ADMIN_PASSWORD in .env.
- Restart dev server after changing env vars.

## Product category or stock not showing
- Ensure product description metadata tags are preserved:
  [Category: X] [Stock: Y]
