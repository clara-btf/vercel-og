// Trick: Google Fonts returns TTF/WOFF when called with a legacy User-Agent.
// We cache the ArrayBuffer at module level so cold-start fetches happen once.

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36";

type FontKey = `${string}-${number}`;
const cache = new Map<FontKey, Promise<ArrayBuffer>>();

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    family: `${family}:wght@${weight}`,
    display: "swap",
  });
  const cssUrl = `https://fonts.googleapis.com/css2?${params}`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": UA } }).then((r) => r.text());
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(woff2?|truetype|opentype)['"]?\)/);
  if (!match) throw new Error(`No font URL found in CSS for ${family} ${weight}`);
  const fontUrl = match[1];
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`Failed to fetch font ${family} ${weight}: ${res.status}`);
  return res.arrayBuffer();
}

export function loadFont(family: string, weight: number): Promise<ArrayBuffer> {
  const key: FontKey = `${family}-${weight}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchGoogleFont(family, weight).catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, pending);
  }
  return pending;
}

export async function loadInterFamily() {
  const [regular, bold, extraBold] = await Promise.all([
    loadFont("Inter", 400),
    loadFont("Inter", 700),
    loadFont("Inter", 800),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];
}
