/**
 * businesses tablosunu service_role ile test et — RLS dışı, doğrudan.
 * Eğer bu da 503 dönüyorsa Supabase tarafında bir sorun var.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("→ businesses tablosunu HEAD ile sayıyorum…");
const head = await supabase
  .from("businesses")
  .select("*", { count: "exact", head: true });

console.log("HEAD sonuç:", JSON.stringify(head, null, 2));

console.log("\n→ profiles tablosunu sayıyorum…");
const p = await supabase
  .from("profiles")
  .select("id, role, full_name", { count: "exact" });

console.log("profiles sonuç:", JSON.stringify(p, null, 2));

console.log("\n→ Schema metadata kontrol — pgrst /:");
const r = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log("status:", r.status, r.statusText);
const text = await r.text();
console.log("body (ilk 500 karakter):", text.slice(0, 500));
