"use client";

import { useMemo, useState } from "react";

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
    <main className="og-main">
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(24px, 5vw, 32px)", letterSpacing: "-0.02em" }}>
          OG Stories Generator
        </h1>
        <p style={{ margin: 0, color: "#9999aa", fontSize: 14 }}>
          Imágenes 1080×1920 con <code>@vercel/og</code>, Twemoji, Inter, autocontraste y caché de un año.
        </p>
      </header>

      <div className="og-grid">
        <section className="og-form">
          <div className="og-layout-tabs">
            {layouts.map((l) => (
              <button
                key={l.value}
                type="button"
                className="og-tab"
                aria-pressed={layout === l.value}
                onClick={() => setLayout(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <label className="og-label">
            Título
            <input
              className="og-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={200}
            />
          </label>

          <label className="og-label">
            Subtítulo
            <textarea
              className="og-textarea"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              maxLength={280}
            />
          </label>

          <div className="og-row">
            <label className="og-label">
              Emoji
              <input
                className="og-input"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={8}
                disabled={!!imagen || !!svgBase64}
              />
            </label>
            <label className="og-label">
              Marca / watermark
              <input
                className="og-input"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="@miusuario"
                maxLength={40}
              />
            </label>
          </div>

          <label className="og-label">
            URL de imagen (opcional — reemplaza al emoji)
            <input
              className="og-input"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://..."
              type="url"
              disabled={!!svgBase64}
            />
          </label>

          <label className="og-label">
            SVG inline (opcional — gana sobre URL y emoji)
            <textarea
              className="og-textarea og-textarea-mono"
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

          <div className="og-row">
            <label className="og-label">
              Color de fondo (hex)
              <div className="og-color-field">
                <input
                  className="og-input"
                  value={bg}
                  onChange={(e) => setBg(e.target.value.replace(/^#/, ""))}
                  maxLength={6}
                />
                <input
                  type="color"
                  value={`#${bg}`}
                  onChange={(e) => setBg(e.target.value.replace("#", ""))}
                  className="og-color-swatch"
                />
              </div>
            </label>

            <label className="og-label">
              Color del texto (vacío = autocontraste)
              <div className="og-color-field">
                <input
                  className="og-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value.replace(/^#/, ""))}
                  maxLength={6}
                  placeholder="auto"
                />
                <input
                  type="color"
                  value={`#${color || "ffffff"}`}
                  onChange={(e) => setColor(e.target.value.replace("#", ""))}
                  className="og-color-swatch"
                />
              </div>
            </label>
          </div>

          <div className="og-actions">
            <button type="button" className="og-btn" onClick={handleCopy}>
              {copied ? "¡Copiada!" : "Copiar URL"}
            </button>
            <button
              type="button"
              className="og-btn og-btn-primary"
              onClick={handleDownload}
            >
              Descargar PNG
            </button>
          </div>

          {urlTooLong && (
            <div className="og-warn">
              ⚠️ La URL pesa {relativeUrl.length.toLocaleString()} bytes — Vercel rechaza
              requests &gt; ~16 KB. Subí el SVG como archivo y usá <code>imagen</code>, o
              llamá al endpoint con <code>POST /api/og</code> + JSON body.
            </div>
          )}

          <div className="og-url">
            {relativeUrl.length > 400 ? `${relativeUrl.slice(0, 400)}…` : relativeUrl}
            <div className="og-url-meta">
              {relativeUrl.length.toLocaleString()} bytes
            </div>
          </div>
        </section>

        <section className="og-preview-wrap">
          <div className="og-preview-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={relativeUrl}
              src={relativeUrl}
              alt="Vista previa"
              loading="lazy"
            />
          </div>
          <div style={{ fontSize: 12, color: "#777788" }}>1080 × 1920 (escalado)</div>
        </section>
      </div>
    </main>
  );
}
