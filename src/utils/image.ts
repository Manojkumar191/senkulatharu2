export async function compressImage(file: File): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const maxWidth = 800;
  const ratio = imageBitmap.width > maxWidth ? maxWidth / imageBitmap.width : 1;

  const width = Math.max(1, Math.round(imageBitmap.width * ratio));
  const height = Math.max(1, Math.round(imageBitmap.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable for compression');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const preferredType = 'image/webp';
  const fallbackType = 'image/jpeg';

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), preferredType, 0.6);
  });

  if (blob) {
    return blob;
  }

  const fallbackBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), fallbackType, 0.6);
  });

  if (!fallbackBlob) {
    throw new Error('Failed to compress image');
  }

  return fallbackBlob;
}

export function buildStoragePath(prefix: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  return `${prefix}/${Date.now()}-${safeName}`;
}
