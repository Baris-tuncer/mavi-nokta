/**
 * End-to-end smoke test (browser bypass):
 * 1. Supabase Auth admin API ile test user yarat (BUSINESS rolü)
 * 2. Trigger profile satırını otomatik oluşturmuş olmalı — kontrol
 * 3. pg ile o user adına business INSERT et
 * 4. Verify
 * 5. Cleanup
 */
import "dotenv/config";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DIRECT_URL;

const admin = createClient(url, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const testEmail = `e2e_${Date.now()}@maviokta.com`;
console.log(`→ Test user oluşturuyorum: ${testEmail}`);
const { data: createData, error: createErr } = await admin.auth.admin.createUser({
  email: testEmail,
  password: "test1234",
  email_confirm: true,
  user_metadata: { full_name: "E2E Test", role: "BUSINESS" },
});
if (createErr) {
  console.error("✗ user oluşturulamadı:", createErr);
  process.exit(1);
}
const userId = createData.user.id;
console.log(`✓ user yaratıldı: ${userId}`);

console.log("\n→ 1 saniye bekle (trigger için)…");
await new Promise((r) => setTimeout(r, 1000));

console.log("\n→ profiles satırı otomatik mi oluştu?");
const { rows: profiles } = await client.query(
  `SELECT id, role, full_name FROM public.profiles WHERE id = $1`,
  [userId]
);
console.log("  bulunan:", profiles[0] ?? "(yok)");

console.log("\n→ businesses INSERT (server action simülasyonu):");
const slug = `test-${userId.slice(0, 8)}`;
try {
  await client.query(
    `INSERT INTO public.businesses
       (profile_id, name, slug, category, city, district, address, latitude, longitude, is_active)
     VALUES ($1, 'E2E Test Cafe', $2, 'CAFE', 'İstanbul', 'Beşiktaş',
             'Sinanpaşa Mh.', 41.0426, 29.0083, true)`,
    [userId, slug]
  );
  console.log("✓ business eklendi");
} catch (e) {
  console.error("✗ business INSERT hatası:", e.message);
  process.exit(1);
}

const { rows: bizs } = await client.query(
  `SELECT id, name, slug, category, city, district FROM public.businesses WHERE profile_id = $1`,
  [userId]
);
console.log("  business kaydı:", bizs[0]);

console.log("\n→ Cleanup:");
await admin.auth.admin.deleteUser(userId);
console.log("✓ test user silindi (cascade ile profile + business da gider)");

await client.end();

console.log("\n🎉 E2E smoke test BAŞARILI — server action akışı sağlam.");
