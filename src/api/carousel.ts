import { supabase } from '../lib/supabase';
import { buildStoragePath, compressImage } from '../utils/image';
import type { CarouselImage, CarouselSection } from '../types';

const defaults: Record<CarouselSection, string[]> = {
  top: ['/carousel/Honey.jpg', '/carousel/Wheat.jpg', '/carousel/Rice.jpg'],
  marquee: [
    '/carousel/Honey.jpg',
    '/carousel/Wheat.jpg',
    '/carousel/Rice.jpg',
    '/carousel/Ragi.jpg',
    '/carousel/Corn.jpg',
    '/carousel/Dal.jpg',
  ],
};

export function getDefaultCarouselImages(section: CarouselSection): string[] {
  return defaults[section];
}

export async function getCarouselImages(section: CarouselSection): Promise<string[]> {
  const cacheKey = `senkulatharu_carousel_${section}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore parse issues and continue with DB fetch
  }

  const { data, error } = await supabase
    .from('carousel_images')
    .select('*')
    .eq('section', section)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;

  const urls = (data as CarouselImage[]).map((row) => row.image_url).filter(Boolean);
  const active = urls.length > 0 ? urls : getDefaultCarouselImages(section);
  sessionStorage.setItem(cacheKey, JSON.stringify(active));
  return active;
}

export async function addCarouselImage(section: CarouselSection, file: File): Promise<void> {
  const compressed = await compressImage(file);
  const ext = compressed.type.includes('webp') ? 'webp' : 'jpg';
  const filePath = buildStoragePath(section, `${file.name}.${ext}`);

  const upload = await supabase.storage
    .from('carousel')
    .upload(filePath, compressed, { contentType: compressed.type, upsert: true });

  if (upload.error) throw upload.error;

  const { data: publicData } = supabase.storage.from('carousel').getPublicUrl(filePath);

  const { data: existing, error: existingErr } = await supabase
    .from('carousel_images')
    .select('sort_order')
    .eq('section', section)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingErr) throw existingErr;

  const { error } = await supabase.from('carousel_images').insert({
    section,
    image_url: publicData.publicUrl,
    sort_order: ((existing?.sort_order as number | undefined) ?? -1) + 1,
  });

  if (error) throw error;
  sessionStorage.removeItem(`senkulatharu_carousel_${section}`);
}

export async function removeCarouselImage(section: CarouselSection, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('carousel_images').delete().eq('section', section).eq('image_url', imageUrl);
  if (error) throw error;

  const marker = '/storage/v1/object/public/carousel/';
  const split = imageUrl.split(marker);
  if (split.length > 1) {
    await supabase.storage.from('carousel').remove([split[1]]);
  }

  sessionStorage.removeItem(`senkulatharu_carousel_${section}`);
}

export async function resetCarouselImages(section: CarouselSection): Promise<void> {
  const { error } = await supabase.from('carousel_images').delete().eq('section', section);
  if (error) throw error;
  sessionStorage.removeItem(`senkulatharu_carousel_${section}`);
}
