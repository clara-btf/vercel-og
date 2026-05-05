// HMAC-SHA256 signing for /api/og URLs. Active only when OG_SIGNING_SECRET is set.
// Same-origin requests (Referer matches host) are exempted so the landing keeps working.

const SIGNED_PARAMS = ["titulo", "subtitulo", "emoji", "imagen", "svg", "bg", "color", "marca", "layout"] as const;

function canonical(params: URLSearchParams): string {
  const entries: [string, string][] = [];
  for (const key of SIGNED_PARAMS) {
    const value = params.get(key);
    if (value !== null) entries.push([key, value]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

export async function signParams(params: URLSearchParams, secret: string): Promise<string> {
  return hmacHex(secret, canonical(params));
}

export async function verifyParams(
  params: URLSearchParams,
  sig: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacHex(secret, canonical(params));
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isSameOrigin(req: Request, host: string): boolean {
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return false;
}
