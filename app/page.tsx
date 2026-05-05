"use client";

import { useMemo, useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #2a2a3d",
  background: "#15151f",
  color: "#f4f4f8",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#b8b8c8",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #3a3a55",
  background: "#1f1f2e",
  color: "#f4f4f8",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};

const layouts = [
  { value: "center", label: "Center" },
  { value: "split", label: "Split" },
  { value: "minimal", label: "Minimal" },
] as const;

const URL_WARN_THRESHOLD = 14_000;

export default function Home() {
  const [titulo, setTitulo] = useState("Diseño que destaca");
  const [subtitulo, setSubtitulo] = useState(
    "Generá imágenes para tus historias en segundos"
  );
  const [emoji, setEmoji] = useState("🚀");
  const [imagen, setImagen] = useState("");
  const [svg, setSvg] = useState("");
  const [bg, setBg] = useState("0f172a");
  const [color, setColor] = useState("f8fafc");
  const [marca, setMarca] = useState("");
  const [layout, setLayout] = useState<(typeof layouts)[number]["value"]>("center");
  const [copied, setCopied] = useState(false);

  const svgBase64 = useMemo(() => {
    const trimmed = svg.trim();
    if (!trimmed.startsWith("<svg")) return "";
    try {
      const bytes = new TextEncoder().encode(trimmed);
      let binary = "";
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return btoa(binary);
    } catch {
      return "";
    }
  }, [svg]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (titulo) params.set("titulo", titulo);
    if (subtitulo) params.set("subtitulo", subtitulo);
    if (svgBase64) params.set("svg", svgBase64);
    else if (imagen) params.set("imagen", imagen);
    else if (emoji) params.set("emoji", emoji);
    if (bg) params.set("bg", bg);
    if (color) params.set("color", color);
    if (marca) params.set("marca", marca);
    if (layout && layout !== "center") params.set("layout", layout);
    return params.toString();
  }, [titulo, subtitulo, emoji, imagen, svgBase64, bg, color, marca, layout]);

  const relativeUrl = `/api/og?${queryString}`;
  const urlTooLong = relativeUrl.length > URL_WARN_THRESHOLD;

  const absoluteUrl = useMemo(() => {
    if (typeof window === "undefined") return relativeUrl;
    return `${window.location.origin}${relativeUrl}`;
  }, [relativeUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  async function handleDownload() {
    const res = await fetch(relativeUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = titulo.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "story";
    a.download = `${safeTitle}-1080x1920.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "48px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.02em" }}>
          OG Stories Generator
        </h1>
        <p style={{ margin: 0, color: "#9999aa", fontSize: 15 }}>
          Imágenes 1080×1920 con <code>@vercel/og</code>, Twemoji, Inter, autocontraste y caché de un año.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 40,
          alignItems: "start",
        }}
      >
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            background: "#11111a",
            borderRadius: 16,
            border: "1px solid #1f1f2e",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {layouts.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLayout(l.value)}
                style={{
                  ...buttonStyle,
                  background: layout === l.value ? "#3b3bff" : buttonStyle.background,
                  border: layout === l.value ? "1px solid #3b3bff" : buttonStyle.border,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <label style={labelStyle}>
            Título
            <input
              style={inputStyle}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
            />
          </label>

          <label style={labelStyle}>
            Subtítulo
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              maxLength={280}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={labelStyle}>
              Emoji
              <input
                style={inputStyle}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={8}
                disabled={!!imagen || !!svgBase64}
              />
            </label>
            <label style={labelStyle}>
              Marca / watermark
              <input
                style={inputStyle}
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="@miusuario"
                maxLength={40}
              />
            </label>
          </div>

          <label style={labelStyle}>
            URL de imagen (opcional — reemplaza al emoji)
            <input
              style={inputStyle}
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://..."
              type="url"
              disabled={!!svgBase64}
            />
          </label>

          <label style={labelStyle}>
            SVG inline (opcional — gana sobre URL y emoji)
            <textarea
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 100,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
              }}
              value={svg}
              onChange={(e) => setSvg(e.target.value)}
              placeholder='<svg width="118" height="118" ...> ... </svg>'
            />
            {svg.trim() && !svgBase64 && (
              <span style={{ color: "#ff8888", fontSize: 12 }}>
                El contenido no parece un &lt;svg&gt; válido.
              </span>
            )}
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={labelStyle}>
              Color de fondo (hex)
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={inputStyle}
                  value={bg}
                  onChange={(e) => setBg(e.target.value.replace(/^#/, ""))}
                  maxLength={6}
                />
                <input
                  type="color"
                  value={`#${bg}`}
                  onChange={(e) => setBg(e.target.value.replace("#", ""))}
                  style={{
                    width: 44,
                    height: 40,
                    background: "#15151f",
                    border: "1px solid #2a2a3d",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: 2,
                  }}
                />
              </div>
            </label>

            <label style={labelStyle}>
              Color del texto (hex — vacío = autocontraste)
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={inputStyle}
                  value={color}
                  onChange={(e) => setColor(e.target.value.replace(/^#/, ""))}
                  maxLength={6}
                  placeholder="auto"
                />
                <input
                  type="color"
                  value={`#${color || "ffffff"}`}
                  onChange={(e) => setColor(e.target.value.replace("#", ""))}
                  style={{
                    width: 44,
                    height: 40,
                    background: "#15151f",
                    border: "1px solid #2a2a3d",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: 2,
                  }}
                />
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" style={buttonStyle} onClick={handleCopy}>
              {copied ? "¡Copiada!" : "Copiar URL"}
            </button>
            <button
              type="button"
              style={{ ...buttonStyle, background: "#3b3bff", borderColor: "#3b3bff" }}
              onClick={handleDownload}
            >
              Descargar PNG
            </button>
          </div>

          {urlTooLong && (
            <div
              style={{
                padding: 12,
                background: "#3a1f1f",
                border: "1px solid #6b2929",
                borderRadius: 8,
                color: "#ffcccc",
                fontSize: 12,
              }}
            >
              ⚠️ La URL pesa {relativeUrl.length.toLocaleString()} bytes — Vercel rechaza
              requests &gt; ~16 KB. Subí el SVG como archivo y usá <code>imagen</code>, o
              llamá al endpoint con <code>POST /api/og</code> + JSON body.
            </div>
          )}

          <div
            style={{
              padding: 12,
              background: "#0b0b14",
              border: "1px solid #1f1f2e",
              borderRadius: 8,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              color: "#9999aa",
              wordBreak: "break-all",
            }}
          >
            {relativeUrl.length > 400 ? `${relativeUrl.slice(0, 400)}…` : relativeUrl}
            <div style={{ marginTop: 8, opacity: 0.6 }}>
              {relativeUrl.length.toLocaleString()} bytes
            </div>
          </div>
        </section>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 270,
              height: 480,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid #2a2a3d",
              background: "#000",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={relativeUrl}
              src={relativeUrl}
              alt="Vista previa"
              width={270}
              height={480}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#777788" }}>1080 × 1920 (escalado)</div>
        </section>
      </div>
    </main>
  );
}
