/**
 * PostgREST'in introspection sorgusuna yakın bir versiyon koş — hangi obje bozuk bul.
 */
import "dotenv/config";
import pg from "pg";

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

console.log("→ pg_class introspection (PostgREST'in benzeri):");
try {
  const r = await c.query(`
    SELECT n.nspname, c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r','v','m','p','f')
      AND n.nspname IN ('public', 'graphql_public')
    ORDER BY n.nspname, c.relname;
  `);
  console.log("  satır:", r.rows.length);
  for (const row of r.rows) {
    console.log(`    ${row.nspname}.${row.relname} (${row.relkind})`);
  }
} catch (e) {
  console.error("  HATA:", e.message);
}

console.log("\n→ kolon introspection:");
try {
  const r = await c.query(`
    SELECT
      n.nspname AS table_schema,
      c.relname AS table_name,
      a.attname AS column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY n.nspname, c.relname, a.attnum;
  `);
  console.log("  toplam kolon:", r.rows.length);
} catch (e) {
  console.error("  HATA:", e.message);
}

console.log("\n→ FK relationships (cross-schema dahil):");
try {
  const r = await c.query(`
    SELECT
      con.conname,
      n1.nspname || '.' || c1.relname AS source,
      n2.nspname || '.' || c2.relname AS target
    FROM pg_constraint con
    JOIN pg_class c1 ON con.conrelid = c1.oid
    JOIN pg_namespace n1 ON c1.relnamespace = n1.oid
    LEFT JOIN pg_class c2 ON con.confrelid = c2.oid
    LEFT JOIN pg_namespace n2 ON c2.relnamespace = n2.oid
    WHERE con.contype = 'f'
      AND n1.nspname = 'public';
  `);
  for (const row of r.rows) {
    console.log(`  ${row.conname}: ${row.source} → ${row.target}`);
  }
} catch (e) {
  console.error("  HATA:", e.message);
}

console.log("\n→ Functions:");
try {
  const r = await c.query(`
    SELECT
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS args,
      l.lanname AS lang,
      p.prosecdef AS security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname = 'public';
  `);
  for (const row of r.rows) {
    console.log(
      `  ${row.nspname}.${row.proname}(${row.args}) [lang=${row.lang}] [secdef=${row.security_definer}]`
    );
  }
} catch (e) {
  console.error("  HATA:", e.message);
}

console.log("\n→ Triggers:");
try {
  const r = await c.query(`
    SELECT
      n.nspname AS schema,
      c.relname AS table,
      t.tgname AS name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE NOT t.tgisinternal
      AND n.nspname IN ('public', 'auth');
  `);
  for (const row of r.rows) {
    console.log(`  ${row.schema}.${row.table}: ${row.name}`);
  }
} catch (e) {
  console.error("  HATA:", e.message);
}

console.log("\n→ Authenticator rolü ile aynı sorguları koş:");
try {
  await c.query("SET ROLE authenticator");
  const r = await c.query(`
    SELECT n.nspname, c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r','v') AND n.nspname = 'public';
  `);
  console.log("  authenticator gözünden public tablolar:", r.rows.length);
  await c.query("RESET ROLE");
} catch (e) {
  console.error("  HATA:", e.message);
  await c.query("RESET ROLE").catch(() => {});
}

await c.end();
