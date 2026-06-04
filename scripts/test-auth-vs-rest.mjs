/**
 * Auth API ve PostgREST'i ayrı ayrı test et — hangisi sağlam göreyim.
 */
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("→ Auth API health (/auth/v1/health):");
const auth = await fetch(`${url}/auth/v1/health`, {
  headers: { apikey: anon },
}).catch((e) => ({ status: 0, error: e.message }));
console.log("  status:", auth.status, auth.statusText ?? "");
if (auth.text) console.log("  body:", (await auth.text()).slice(0, 300));

console.log("\n→ Auth signup endpoint (POST /auth/v1/signup) — yeni email ile:");
const testEmail = `test_${Date.now()}@maviokta.com`;
const sign = await fetch(`${url}/auth/v1/signup`, {
  method: "POST",
  headers: {
    apikey: anon,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email: testEmail, password: "test1234" }),
});
console.log("  status:", sign.status, sign.statusText);
const signBody = await sign.text();
console.log("  body (ilk 400):", signBody.slice(0, 400));

console.log("\n→ PostgREST root (/rest/v1/):");
const rest = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: anon },
});
console.log("  status:", rest.status, rest.statusText);
const restBody = await rest.text();
console.log("  body (ilk 300):", restBody.slice(0, 300));
