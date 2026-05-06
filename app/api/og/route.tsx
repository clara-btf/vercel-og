import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

import {
  darken,
  sanitizeHex,
  pickContrast,
  buildGradient,
  sanitizeGradientPattern,
} from "@/lib/og/color";
import { loadInterFamily } from "@/lib/og/fonts";
import {
  sanitizeImageUrl,
  sanitizeLayout,
  sanitizeSvgBase64,
  safeFetchImage,
  type Layout,
} from "@/lib/og/validators";
import { isSameOrigin, verifyParams } from "@/lib/og/sign";
import { renderLayout, type Hero } from "@/lib/og/layouts";

export const runtime = "edge";

const WIDTH = 1080;
const HEIGHT = 1920;

type RawParams = {
  titulo?: string | null;
  subtitulo?: string | null;
  emoji?: string | null;
  imagen?: string | null;
  svg?: string | null;
  bg?: string | null;
  bg2?: string | null;
  bgPattern?: string | null;
  color?: string | null;
  marca?: string | null;
  layout?: string | null;
  tag?: string | null;
  highlight?: string | null;
  accent?: string | null;
  accent2?: string | null;
  sig?: string | null;
};

function fromSearchParams(sp: URLSearchParams): RawParams {
  return {
    titulo: sp.get("titulo"),
    subtitulo: sp.get("subtitulo"),
    emoji: sp.get("emoji"),
    imagen: sp.get("imagen"),
    svg: sp.get("svg"),
    bg: sp.get("bg"),
    bg2: sp.get("bg2"),
    bgPattern: sp.get("bgPattern"),
    color: sp.get("color"),
    marca: sp.get("marca"),
    layout: sp.get("layout"),
    tag: sp.get("tag"),
    highlight: sp.get("highlight"),
    accent: sp.get("accent"),
    accent2: sp.get("accent2"),
    sig: sp.get("sig"),
  };
}

function toSearchParams(raw: RawParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (k === "sig") continue;
    if (typeof v === "string" && v.length > 0) sp.set(k, v);
  }
  return sp;
}

function renderFallback(message: string): Response {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 96,
          backgroundColor: "#1a1a2e",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, marginBottom: 32 }}>OG Stories</div>
        <div style={{ fontSize: 36, opacity: 0.7, maxWidth: 800 }}>{message}</div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=10",
      },
    }
  );
}

async function buildResponse(req: NextRequest, raw: RawParams): Promise<Response> {
  const secret = process.env.OG_SIGNING_SECRET;
  if (secret) {
    const host = req.headers.get("host") ?? "";
    const sameOrigin = isSameOrigin(req, host);
    if (!sameOrigin) {
      if (!raw.sig) {
        return new Response("Missing signature", { status: 401 });
      }
      const ok = await verifyParams(toSearchParams(raw), raw.sig, secret);
      if (!ok) return new Response("Invalid signature", { status: 401 });
    }
  }

  const titulo = (raw.titulo ?? "Tu título acá").slice(0, 200);
  const subtitulo = (
    raw.subtitulo ?? "Un subtítulo corto que acompaña la idea principal"
  ).slice(0, 280);
  const emoji = (raw.emoji ?? "✨").slice(0, 8);
  const marca = raw.marca ? raw.marca.slice(0, 40) : null;
  const layout: Layout = sanitizeLayout(raw.layout);
  const tag = raw.tag ? raw.tag.slice(0, 60) : null;
  const highlight = raw.highlight ? raw.highlight.slice(0, 120) : null;

  const defaultBg = layout === "tip" ? "#fff4e6" : "#1a1a2e";
  const bg = sanitizeHex(raw.bg, defaultBg);
  const color = raw.color ? sanitizeHex(raw.color, pickContrast(bg)) : pickContrast(bg);
  const bgDark = darken(bg, layout === "tip" ? 0.92 : 0.35);
  const accent = raw.accent ? sanitizeHex(raw.accent, "#dcff1f") : "#dcff1f";
  const accent2 = raw.accent2 ? sanitizeHex(raw.accent2, accent) : null;
  const bg2 = raw.bg2 ? sanitizeHex(raw.bg2, bgDark) : null;
  const bgPattern = sanitizeGradientPattern(raw.bgPattern);
  const bgImage = raw.bg2 || raw.bgPattern
    ? buildGradient(bg, bg2 ?? bgDark, bgPattern)
    : null;

  const svgDataUri = sanitizeSvgBase64(raw.svg);
  const imagenUrl = sanitizeImageUrl(raw.imagen);

  let hero: Hero;
  if (svgDataUri) {
    hero = { kind: "svg", src: svgDataUri };
  } else if (imagenUrl) {
    const buf = await safeFetchImage(imagenUrl);
    hero = buf ? { kind: "image", src: imagenUrl } : { kind: "emoji", value: emoji };
  } else {
    hero = { kind: "emoji", value: emoji };
  }

  const fonts = await loadInterFamily().catch(() => undefined);

  try {
    return new ImageResponse(
      renderLayout(layout, {
        titulo,
        subtitulo,
        hero,
        bg,
        bgDark,
        color,
        marca,
        tag,
        highlight,
        accent,
        accent2,
        bgImage,
      }),
      {
        width: WIDTH,
        height: HEIGHT,
        emoji: "twemoji",
        fonts,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=31536000, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    try {
      return new ImageResponse(
        renderLayout(layout, {
          titulo,
          subtitulo,
          hero: { kind: "emoji", value: emoji },
          bg,
          bgDark,
          color,
          marca,
          tag,
          highlight,
          accent,
          accent2,
          bgImage,
        }),
        { width: WIDTH, height: HEIGHT }
      );
    } catch (err) {
      return renderFallback(
        err instanceof Error ? err.message : "No se pudo generar la imagen"
      );
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return buildResponse(req, fromSearchParams(searchParams));
}

export async function POST(req: NextRequest) {
  let body: RawParams;
  try {
    body = (await req.json()) as RawParams;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  return buildResponse(req, body);
}
