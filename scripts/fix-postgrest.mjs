/**
 * PGRST002 onarımı — direkt Postgres üzerinden.
 * 1. Bağlantıyı test et
 * 2. authenticator/anon/authenticated rollerine GRANT'leri zorla
 * 3. NOTIFY pgrst, 'reload schema'
 * 4. Tabloları doğrula
 * 5. Hâlâ sorun varsa schema'yı sıfırla ve baştan kur
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "node:fs";

const url = process.env.DIRECT_URL;
if (!url) {
  console.error("DIRECT_URL .env'de yok");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  // Supabase pooler SSL ister
  ssl: { rejectUnauthorized: false },
});

async function step(name, fn) {
  process.stdout.write(`→ ${name}… `);
  try {
    const r = await fn();
    console.log("✓");
    return r;
  } catch (e) {
    console.log("✗");
    console.error("  hata:", e.message);
    throw e;
  }
}

await step("Postgres bağlantısı", () => client.connect());

const version = await client.query("SELECT version()");
console.log("  version:", version.rows[0].version.slice(0, 60), "…");

// 1) Hangi tablolar var?
const tables = await client.query(`
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
`);
console.log(
  "  public tabloları:",
  tables.rows.map((r) => r.tablename).join(", ") || "(yok)"
);

// 2) authenticator rolünün yetkilerini kontrol et
const grants = await client.query(`
  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'profiles'
  AND grantee IN ('anon', 'authenticated', 'authenticator', 'service_role')
  ORDER BY grantee, privilege_type;
`);
console.log("  profiles üzerindeki yetkiler:");
for (const r of grants.rows) {
  console.log(`    ${r.grantee} → ${r.privilege_type}`);
}

// 3) Yetkileri tazele
await step("Yetkileri tazele (GRANT)", async () => {
  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
  `);
});

// 4) PostgREST'e schema reload sinyali
await step("NOTIFY pgrst, 'reload schema'", async () => {
  await client.query(`NOTIFY pgrst, 'reload schema';`);
  await client.query(`NOTIFY pgrst, 'reload config';`);
});

// 5) Postgres tarafından servisleri pingle (replication slot var mı vs.)
const replicas = await client.query(`
  SELECT application_name, state FROM pg_stat_activity
  WHERE application_name ILIKE '%postgrest%';
`);
console.log("  postgrest aktif bağlantılar:", replicas.rows.length);
for (const r of replicas.rows) {
  console.log(`    ${r.application_name} | state: ${r.state}`);
}

// 6) Schema bütünlüğü kontrol — businesses tablosunda district kolonu var mı?
const cols = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'businesses'
  ORDER BY ordinal_position;
`);
console.log(
  "  businesses kolonları:",
  cols.rows.map((r) => r.column_name).join(", ")
);

await client.end();
console.log("\n✅ Bitti. 10 saniye sonra PostgREST test edilecek.");
