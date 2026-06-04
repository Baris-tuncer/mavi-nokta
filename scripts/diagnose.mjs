/**
 * PostgREST schema introspection'ın neden başarısız olduğunu izole et.
 * Trigger ve fonksiyonları geçici düşür, sonra test et.
 */
import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("→ Postgres bağlandı");

// 1) PostgREST'in introspection sorgusunun bir kısmını manuel koş
console.log("\n→ Schema introspection'ı simüle ediyorum (authenticator rolü ile):");
try {
  await client.query("SET ROLE authenticator");
  const r = await client.query(`
    SELECT n.nspname AS table_schema, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r','v','m','p','f')
      AND n.nspname NOT IN ('pg_catalog','information_schema','pg_toast')
    LIMIT 20;
  `);
  console.log("  authenticator gözünden tablolar:", r.rows.length);
  for (const row of r.rows.slice(0, 10)) {
    console.log(`    ${row.table_schema}.${row.table_name}`);
  }
  await client.query("RESET ROLE");
} catch (e) {
  console.error("  introspection hatası:", e.message);
  await client.query("RESET ROLE").catch(() => {});
}

// 2) auth.users'a SELECT yapabilir mi?
try {
  await client.query("SET ROLE authenticator");
  const r = await client.query(`SELECT count(*) FROM auth.users`);
  console.log(`  auth.users SELECT: ${r.rows[0].count} satır`);
  await client.query("RESET ROLE");
} catch (e) {
  console.error("  auth.users SELECT hatası:", e.message);
  await client.query("RESET ROLE").catch(() => {});
}

// 3) Trigger ve security definer function'ı düşür (geçici)
console.log("\n→ Trigger'ı geçici düşürüyorum…");
await client.query(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`);
console.log("✓ trigger düşürüldü");

console.log("→ NOTIFY pgrst, 'reload schema'");
await client.query(`NOTIFY pgrst, 'reload schema';`);

await client.end();
console.log("\nBitti — şimdi REST API tekrar test edilecek.");
