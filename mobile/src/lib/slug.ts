export function slugify(input: string): string {
  const tr: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };
  return input
    .trim()
    .toLowerCase()
    .replace(/[çğıİöşü]/g, (c) => tr[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
