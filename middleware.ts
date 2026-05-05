import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/api/og/:path*"],
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LIMIT = Number(process.env.OG_RATE_LIMIT ?? 60);
const WINDOW_SECONDS = Number(process.env.OG_RATE_WINDOW ?? 60);

function getClientId(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

async function upstashIncr(key: string): Promise<number | null> {
  if (!REST_URL || !REST_TOKEN) return null;
  try {
    const pipeline = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(WINDOW_SECONDS), "NX"],
      ]),
    });
    if (!pipeline.ok) return null;
    const data = (await pipeline.json()) as Array<{ result: number | string }>;
    const incr = data[0]?.result;
    return typeof incr === "number" ? incr : Number(incr);
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  if (!REST_URL || !REST_TOKEN) return NextResponse.next();
  const id = getClientId(req);
  const window = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `og:rl:${id}:${window}`;
  const count = await upstashIncr(key);
  if (count !== null && count > LIMIT) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": String(WINDOW_SECONDS),
        "X-RateLimit-Limit": String(LIMIT),
        "X-RateLimit-Remaining": "0",
      },
    });
  }
  const res = NextResponse.next();
  if (count !== null) {
    res.headers.set("X-RateLimit-Limit", String(LIMIT));
    res.headers.set("X-RateLimit-Remaining", String(Math.max(0, LIMIT - count)));
  }
  return res;
}
