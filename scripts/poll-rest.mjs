import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("→ PostgREST'in sağlıklı dönmesini bekliyorum…");
const start = Date.now();

while (true) {
  const r = await fetch(`${url}/rest/v1/profiles?select=count`, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      Prefer: "count=exact",
    },
  }).catch((e) => ({ ok: false, status: 0, error: e.message }));

  const elapsed = Math.round((Date.now() - start) / 1000);

  if (r.ok) {
    const body = await r.text();
    console.log(
      `\n🎉 PostgREST AYAKTA (${elapsed}s sonra) — body: ${body.slice(0, 200)}`
    );
    process.exit(0);
  }

  process.stdout.write(`.${r.status}.`);

  if (elapsed > 300) {
    console.log("\n⚠️ 5 dakika geçti — Supabase status sayfasına bakmak gerek.");
    process.exit(1);
  }

  await new Promise((r) => setTimeout(r, 5000));
}
