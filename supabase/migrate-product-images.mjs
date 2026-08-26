/**
 * One-time migration: move product images that are still local static files
 * (paths like /Image/Product/foo.jpg, served from public/) into Supabase
 * Storage, and point the products table at the new URLs.
 *
 * Safe by design:
 *   - Writes a full backup of every product's current image/images to
 *     supabase/product-images-backup-<timestamp>.json before touching the DB.
 *   - Uploads a file and confirms success before updating that product's row.
 *   - Never deletes local files — that's a separate, manual step after you've
 *     spot-checked the live site.
 *
 * Run:
 *   node supabase/migrate-product-images.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();

// Read .env.local manually (same approach as create-admin.mjs)
const env = {};
try {
  const raw = readFileSync('.env.local', 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
} catch {
  console.error('Could not read .env.local — make sure it exists.');
  process.exit(1);
}

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = 'products';
const isLocalPath = (p) => typeof p === 'string' && p.startsWith('/Image/');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

// Cache uploads by local path so identical files referenced by multiple
// products (or repeated within one product's images[]) are only uploaded once.
const uploadCache = new Map();

async function uploadLocalFile(localPath) {
  if (uploadCache.has(localPath)) return uploadCache.get(localPath);

  const filePath = path.join(ROOT, 'public', localPath);
  if (!existsSync(filePath)) {
    console.warn(`  ! File not found on disk, skipping: ${localPath}`);
    uploadCache.set(localPath, null);
    return null;
  }

  const buffer = readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
  const safeName = path.basename(filePath).replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storageName, buffer, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    console.error(`  ! Upload failed for ${localPath}: ${uploadError.message}`);
    uploadCache.set(localPath, null);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storageName);
  uploadCache.set(localPath, data.publicUrl);
  return data.publicUrl;
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image, images')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  // Full backup of current state before any writes.
  const backupFile = path.join(ROOT, 'supabase', `product-images-backup-${Date.now()}.json`);
  writeFileSync(backupFile, JSON.stringify(products, null, 2));
  console.log(`Backed up ${products.length} products' current image data to ${backupFile}\n`);

  const toMigrate = products.filter(
    (p) => isLocalPath(p.image) || (p.images ?? []).some(isLocalPath)
  );
  console.log(`${toMigrate.length} of ${products.length} products reference local image paths.\n`);

  let migrated = 0;
  let failed = 0;

  for (const product of toMigrate) {
    console.log(`Product #${product.id} — ${product.name}`);

    let newImage = product.image;
    if (isLocalPath(product.image)) {
      const uploaded = await uploadLocalFile(product.image);
      if (uploaded) newImage = uploaded;
    }

    const newImages = [];
    for (const img of product.images ?? []) {
      if (isLocalPath(img)) {
        const uploaded = await uploadLocalFile(img);
        newImages.push(uploaded ?? img); // keep local path as fallback if upload failed
      } else {
        newImages.push(img);
      }
    }

    // Only write to the DB if every local path we tried to migrate actually succeeded.
    const stillLocal = isLocalPath(newImage) || newImages.some(isLocalPath);
    if (stillLocal) {
      console.warn(`  ! Skipping DB update for #${product.id} — one or more uploads failed.\n`);
      failed++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ image: newImage, images: newImages })
      .eq('id', product.id);

    if (updateError) {
      console.error(`  ! DB update failed for #${product.id}: ${updateError.message}\n`);
      failed++;
      continue;
    }

    console.log(`  ✓ Migrated\n`);
    migrated++;
  }

  console.log(`Done. Migrated ${migrated}, failed ${failed}, unchanged ${products.length - toMigrate.length}.`);
  if (failed > 0) {
    console.log('Re-run this script to retry failed products — already-migrated ones will be skipped automatically.');
  }
}

main();
