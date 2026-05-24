/**
 * One-time script to create the admin user in Supabase Auth.
 * Run once before going live:
 *
 *   node supabase/create-admin.mjs
 *
 * Requires .env.local to be present with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually (no dotenv dependency needed)
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
const email = env['ADMIN_EMAIL'];
const password = env['ADMIN_PASSWORD'];

if (!url || !serviceKey || !email || !password) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  if (error.message.includes('already been registered') || error.message.includes('already exists')) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }
} else {
  console.log(`Admin user created: ${data.user.email} (id: ${data.user.id})`);
}
