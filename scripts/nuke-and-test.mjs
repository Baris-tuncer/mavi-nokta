/**
 * Mavi Nokta tablolarını TAMAMEN sil, temiz bir tek tablo bırak,
 * PostgREST recovery'sini test et. Eğer sorun yine devam ederse
 * sorun bizim schema'mızda DEĞİL, Supabase tarafında.
 */
import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("→ Postgres bağlandı");

console.log("\n→ Tüm Mavi Nokta tablolarını ve trigger'ları siliyorum…");
await client.query(`
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TABLE IF EXISTS public.claims CASCADE;
  DROP TABLE IF EXISTS public.campaigns CASCADE;
  DROP TABLE IF EXISTS public.businesses CASCADE;
  DROP TABLE IF EXISTS public.customers CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;
  DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
  DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
  DROP TYPE IF EXISTS public.claim_status CASCADE;
  DROP TYPE IF EXISTS public.campaign_status CASCADE;
  DROP TYPE IF EXISTS public.business_category CASCADE;
  DROP TYPE IF EXISTS public.user_role CASCADE;
`);
console.log("✓ silindi");

console.log("\n→ Çıplak test tablosu oluşturuyorum…");
await client.query(`
  CREATE TABLE public.ping (
    id serial primary key,
    label text
  );
  INSERT INTO public.ping (label) VALUES ('hello');
  GRANT ALL ON public.ping TO anon, authenticated, service_role;
  GRANT USAGE ON SEQUENCE public.ping_id_seq TO anon, authenticated, service_role;
`);
console.log("✓ ping tablosu hazır");

console.log("\n→ NOTIFY pgrst, 'reload schema';");
await client.query(`NOTIFY pgrst, 'reload schema';`);

console.log("\n→ PostgREST bağlantılarını da kıçtan tekmeleyip yeniden bağlatıyorum…");
await client.query(`
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE application_name ILIKE '%postgrest%';
`);
console.log("✓ kicked");

await client.end();
console.log("\n5 saniye sonra REST'i test edeceğim.");
