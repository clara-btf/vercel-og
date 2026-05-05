// Inter desde fontsource via jsDelivr — WOFF estable que Satori soporta.
// Cacheado a nivel módulo y con timeout corto. Si falla, el route cae al
// font default de @vercel/og sin romper el render.

const FONT_URLS: Record<number, string> = {
  400: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.woff",
  700: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.woff",
  800: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-800-normal.woff",
};

const cache = new Map<number, Promise<ArrayBuffer>>();

async function fetchFont(url: string, timeoutMs = 3000): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.arrayBuffer();
  } finally {
    clearTimeout(timer);
  }
}

export function loadInterWeight(weight: 400 | 700 | 800): Promise<ArrayBuffer> {
  const url = FONT_URLS[weight];
  let pending = cache.get(weight);
  if (!pending) {
    pending = fetchFont(url).catch((err) => {
      cache.delete(weight);
      throw err;
    });
    cache.set(weight, pending);
  }
  return pending;
}

export async function loadInterFamily() {
  const [regular, bold, extraBold] = await Promise.all([
    loadInterWeight(400),
    loadInterWeight(700),
    loadInterWeight(800),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];
}
