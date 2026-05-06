// Inter desde fontsource via jsDelivr — WOFF estable que Satori soporta.
// Cacheado a nivel módulo y con timeout corto. Si falla, el route cae al
// font default de @vercel/og sin romper el render.

const FONT_URLS: Record<string, string> = {
  "400-normal": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.woff",
  "700-normal": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.woff",
  "800-normal": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-800-normal.woff",
  "700-italic": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-italic.woff",
};

const cache = new Map<string, Promise<ArrayBuffer>>();

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

type FontStyle = "normal" | "italic";
type FontWeight = 400 | 700 | 800;

export function loadInterFont(weight: FontWeight, style: FontStyle = "normal"): Promise<ArrayBuffer> {
  const key = `${weight}-${style}`;
  const url = FONT_URLS[key];
  if (!url) return Promise.reject(new Error(`Unsupported font variant ${key}`));
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchFont(url).catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, pending);
  }
  return pending;
}

export async function loadInterFamily() {
  const [regular, bold, extraBold, boldItalic] = await Promise.all([
    loadInterFont(400, "normal"),
    loadInterFont(700, "normal"),
    loadInterFont(800, "normal"),
    loadInterFont(700, "italic"),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
    { name: "Inter", data: boldItalic, weight: 700 as const, style: "italic" as const },
  ];
}
