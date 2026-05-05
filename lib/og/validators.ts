export function sanitizeSvgBase64(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=_-]+$/.test(cleaned)) return null;
  const normalized = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const decoded = atob(normalized);
    if (!/^\s*<svg[\s>]/i.test(decoded)) return null;
    return `data:image/svg+xml;base64,${normalized}`;
  } catch {
    return null;
  }
}

export function sanitizeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

const ALLOWED_LAYOUTS = new Set(["center", "split", "minimal"] as const);
export type Layout = "center" | "split" | "minimal";

export function sanitizeLayout(value: string | null | undefined): Layout {
  if (value && (ALLOWED_LAYOUTS as Set<string>).has(value)) {
    return value as Layout;
  }
  return "center";
}

export async function safeFetchImage(
  url: string,
  timeoutMs = 4000
): Promise<ArrayBuffer | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
