/**
 * PostgREST'in stuck olan idle bağlantılarını terminate et — yeni bağlantı kuracak,
 * schema cache'i sıfırdan yükleyecek.
 */
import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("→ Postgres bağlandı");

const before = await client.query(`
  SELECT pid, application_name, state, query_start
  FROM pg_stat_activity
  WHERE application_name ILIKE '%postgrest%'
  ORDER BY pid;
`);
console.log("\n→ Şu an aktif PostgREST bağlantıları:");
for (const r of before.rows) {
  console.log(`  pid=${r.pid} state=${r.state} app=${r.application_name}`);
}

if (before.rows.length === 0) {
  console.log("PostgREST connection yok — restart bekleniyor olabilir.");
}

console.log("\n→ Hepsini terminate ediyorum…");
const killed = await client.query(`
  SELECT pg_terminate_backend(pid) AS terminated, pid
  FROM pg_stat_activity
  WHERE application_name ILIKE '%postgrest%';
`);
console.log(`✓ ${killed.rows.length} bağlantı terminate edildi`);

console.log("\n→ Schema reload signal'ı gönderiyorum (yeni bağlantılar için)…");
await client.query(`NOTIFY pgrst, 'reload schema';`);

await client.end();
console.log("\nBitti — PostgREST 5-10 saniye içinde yeniden bağlanır.");
