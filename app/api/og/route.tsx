import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const WIDTH = 1080;
const HEIGHT = 1920;

function sanitizeHex(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const cleaned = value.replace(/^#/, "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(cleaned) || /^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  return fallback;
}

function darken(hex: string, amount = 0.55): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const dr = Math.max(0, Math.floor(r * amount));
  const dg = Math.max(0, Math.floor(g * amount));
  const db = Math.max(0, Math.floor(b * amount));
  return `rgb(${dr}, ${dg}, ${db})`;
}

function sanitizeImageUrl(value: string | null): string | null {
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

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const titulo = (searchParams.get("titulo") ?? "Tu título acá").slice(0, 140);
  const subtitulo = (
    searchParams.get("subtitulo") ?? "Un subtítulo corto que acompaña la idea principal"
  ).slice(0, 220);
  const emoji = (searchParams.get("emoji") ?? "✨").slice(0, 8);
  const bg = sanitizeHex(searchParams.get("bg"), "#1a1a2e");
  const color = sanitizeHex(searchParams.get("color"), "#ffffff");
  const imagen = sanitizeImageUrl(searchParams.get("imagen"));

  const bgDark = darken(bg, 0.35);
  const accent = withAlpha(color, 0.12);
  const accentStrong = withAlpha(color, 0.85);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "120px 96px",
          color,
          backgroundColor: bg,
          backgroundImage: `radial-gradient(ellipse at 30% 20%, ${withAlpha(
            color,
            0.18
          )} 0%, transparent 55%), linear-gradient(160deg, ${bg} 0%, ${bgDark} 100%)`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 96,
            width: 96,
            height: 8,
            backgroundColor: accentStrong,
            borderRadius: 4,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 48,
            marginTop: 120,
          }}
        >
          {imagen ? (
            <div
              style={{
                width: 520,
                height: 520,
                borderRadius: 32,
                overflow: "hidden",
                display: "flex",
                border: `2px solid ${withAlpha(color, 0.18)}`,
                boxShadow: `0 24px 60px ${withAlpha(color, 0.18)}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagen}
                alt=""
                width={520}
                height={520}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: 280,
                lineHeight: 1,
                filter: `drop-shadow(0 12px 40px ${withAlpha(color, 0.25)})`,
                display: "flex",
              }}
            >
              {emoji}
            </div>
          )}

          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              maxWidth: 880,
              display: "flex",
            }}
          >
            {titulo}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 2,
              backgroundColor: accent,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 44,
              fontWeight: 400,
              lineHeight: 1.3,
              maxWidth: 880,
              opacity: 0.85,
              display: "flex",
            }}
          >
            {subtitulo}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}
