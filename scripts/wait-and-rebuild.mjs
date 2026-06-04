/**
 * Restart bitene kadar bekle, sonra:
 * 1. ping tablosunu sil
 * 2. supabase/init.sql'i koş
 * 3. PostgREST'i test et
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "node:fs";

const url = process.env.DIRECT_URL;
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function tryConnect() {
  const c = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await c.connect();
    await c.query("SELECT 1");
    await c.end();
    return true;
  } catch (e) {
    try {
      await c.end();
    } catch {}
    return false;
  }
}

console.log("→ Postgres'in geri dönmesini bekliyorum…");
const start = Date.now();
let dots = 0;
while (true) {
  const ok = await tryConnect();
  if (ok) {
    console.log(
      `\n✓ Postgres ayakta — ${Math.round((Date.now() - start) / 1000)}s sürdü.`
    );
    break;
  }
  process.stdout.write(".");
  dots += 1;
  if (dots > 60) {
    console.log("\n⚠️ 5 dakika geçti, hâlâ down. Manuel kontrol gerek.");
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 5000));
}

// Bir 5 saniye daha PostgREST'in start etmesi için bekle
console.log("→ Servislerin tamamen ayağa kalkması için 10s bekle…");
await new Promise((r) => setTimeout(r, 10000));

console.log("\n→ Şemayı sıfırdan kuruyorum (init.sql)…");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Önce ping tablosunu temizle
await client.query(`DROP TABLE IF EXISTS public.ping CASCADE;`);

const sql = readFileSync("supabase/init.sql", "utf8");
try {
  await client.query(sql);
  console.log("✓ init.sql başarıyla koştu");
} catch (e) {
  console.error("✗ init.sql hatası:", e.message);
  console.error("  detay:", e.detail ?? "");
  console.error("  position:", e.position ?? "");
  process.exit(1);
}

// Yetkileri tazele (yeni tablolar için)
await client.query(`
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
`);
console.log("✓ yetkiler tazelendi");

await client.query(`NOTIFY pgrst, 'reload schema';`);
console.log("✓ NOTIFY gönderildi");

await client.end();

// PostgREST'i test et
console.log("\n→ PostgREST'i test ediyorum…");
await new Promise((r) => setTimeout(r, 5000));
const r = await fetch(`${supaUrl}/rest/v1/profiles?select=count`, {
  headers: { apikey: anon, Authorization: `Bearer ${anon}`, Prefer: "count=exact" },
});
console.log(`  status: ${r.status} ${r.statusText}`);
const body = await r.text();
console.log(`  body: ${body.slice(0, 300)}`);

if (r.ok) {
  console.log("\n🎉 PostgREST sağlıklı, schema cache yüklendi.");
} else {
  console.log("\n⚠️ Hâlâ sorun var.");
}
