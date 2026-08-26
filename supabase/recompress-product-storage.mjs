/**
 * Follow-up to migrate-product-images.mjs: the local source files that got
 * uploaded were never optimized for web (some 10-26MB raw photos). This
 * overwrites the already-uploaded Storage objects in place with compressed
 * versions — same object path, same DB URL, no further DB writes needed.
 *
 * Requires compressed replacements to already exist in COMPRESSED_DIR,
 * named <original-basename-without-ext>.(jpg|png).
 *
 * Run:
 *   node supabase/recompress-product-storage.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const COMPRESSED_DIR =
  '/private/tmp/claude-501/-Users-sohamchatterjee-Desktop-amigo-web/0ecb676b-dc50-4a53-9296-042e20e07e94/scratchpad/compressed-products';
const BACKUP_FILE = path.join(ROOT, 'supabase', 'product-images-backup-1787691598366.json');
const BUCKET = 'products';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const oldProducts = JSON.parse(readFileSync(BACKUP_FILE, 'utf8'));

const { data: currentProducts, error } = await supabase
  .from('products')
  .select('id, image, images')
  .order('id', { ascending: true });
if (error) {
  console.error('Failed to fetch current products:', error.message);
  process.exit(1);
}
const currentById = new Map(currentProducts.map((p) => [p.id, p]));

// Build localPath -> storage object path, by pairing each product's old
// (local) image/images with its new (Supabase URL) counterpart, index for index.
const localToObjectPath = new Map();
const objectPathFromUrl = (url) => {
  const marker = `/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
};

for (const old of oldProducts) {
  const cur = currentById.get(old.id);
  if (!cur) continue;

  if (typeof old.image === 'string' && old.image.startsWith('/Image/')) {
    const objPath = objectPathFromUrl(cur.image ?? '');
    if (objPath) localToObjectPath.set(old.image, objPath);
  }
  const oldImages = old.images ?? [];
  const curImages = cur.images ?? [];
  oldImages.forEach((img, i) => {
    if (typeof img === 'string' && img.startsWith('/Image/')) {
      const objPath = objectPathFromUrl(curImages[i] ?? '');
      if (objPath) localToObjectPath.set(img, objPath);
    }
  });
}

console.log(`${localToObjectPath.size} unique local files mapped to storage objects.\n`);

const compressedFiles = readdirSync(COMPRESSED_DIR);
const findCompressed = (localPath) => {
  const base = path.basename(localPath);
  const nameNoExt = base.slice(0, base.lastIndexOf('.'));
  return compressedFiles.find((f) => f.slice(0, f.lastIndexOf('.')) === nameNoExt);
};

let uploaded = 0;
let failed = 0;

for (const [localPath, objectPath] of localToObjectPath) {
  const compressedName = findCompressed(localPath);
  if (!compressedName) {
    console.warn(`! No compressed file found for ${localPath}, skipping.`);
    failed++;
    continue;
  }

  const fullPath = path.join(COMPRESSED_DIR, compressedName);
  const buffer = readFileSync(fullPath);
  const contentType = compressedName.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType,
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    console.error(`! Failed to overwrite ${objectPath}: ${uploadError.message}`);
    failed++;
    continue;
  }

  console.log(`✓ ${localPath} -> ${objectPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  uploaded++;
}

console.log(`\nDone. Overwrote ${uploaded} storage objects, ${failed} failed.`);
