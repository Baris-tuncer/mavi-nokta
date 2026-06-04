/**
 * Supabase init.sql doğru çalıştı mı kontrol et.
 * `node scripts/verify-schema.mjs`
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ .env'de URL veya service_role yok");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = ["profiles", "customers", "businesses", "campaigns", "claims"];

let allGood = true;
for (const t of tables) {
  const { error, count } = await supabase
    .from(t)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.log(`❌ ${t.padEnd(12)} → ${error.message}`);
    allGood = false;
  } else {
    console.log(`✓  ${t.padEnd(12)} → tablo var, ${count ?? 0} satır`);
  }
}

if (allGood) {
  console.log("\n✅ Schema kurulumu başarılı.");
} else {
  console.log("\n⚠️  Bazı tablolar yok — init.sql'i tam çalıştırdığını teyit et.");
}
