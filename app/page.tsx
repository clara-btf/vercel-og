"use client";

import { useMemo, useState } from "react";

const layouts = [
  { value: "center", label: "Center" },
  { value: "split", label: "Split" },
  { value: "minimal", label: "Minimal" },
  { value: "tip", label: "Tip" },
] as const;

const URL_WARN_THRESHOLD = 14_000;

export default function Home() {
  const [titulo, setTitulo] = useState("Diseño que destaca");
  const [subtitulo, setSubtitulo] = useState(
    "Genera imágenes para tus historias en segundos"
  );
  const [emoji, setEmoji] = useState("🚀");
  const [imagen, setImagen] = useState("");
  const [svg, setSvg] = useState("");
  const [bg, setBg] = useState("0f172a");
  const [bg2, setBg2] = useState("");
  const [bgPattern, setBgPattern] = useState("linear-vertical");
  const [color, setColor] = useState("f8fafc");
  const [marca, setMarca] = useState("");
  const [layout, setLayout] = useState<(typeof layouts)[number]["value"]>("center");
  const [tag, setTag] = useState("");
  const [highlight, setHighlight] = useState("");
  const [accent, setAccent] = useState("");
  const [accent2, setAccent2] = useState("");
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
    if (bg2) params.set("bg2", bg2);
    if (bgPattern && bgPattern !== "linear-vertical") params.set("bgPattern", bgPattern);
    if (color) params.set("color", color);
    if (marca) params.set("marca", marca);
    if (layout && layout !== "center") params.set("layout", layout);
    if (tag) params.set("tag", tag);
    if (highlight) params.set("highlight", highlight);
    if (accent) params.set("accent", accent);
    if (accent2) params.set("accent2", accent2);
    return params.toString();
  }, [
    titulo,
    subtitulo,
    emoji,
    imagen,
    svgBase64,
    bg,
    bg2,
    bgPattern,
    color,
    marca,
    layout,
    tag,
    highlight,
    accent,
    accent2,
  ]);

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

          {layout === "tip" && (
            <>
              <label className="og-label">
                Tag (pill amarillo)
                <input
                  className="og-input"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="A Better Way Tip"
                  maxLength={60}
                />
              </label>
              <label className="og-label">
                Frase highlighted (italic, fondo accent)
                <input
                  className="og-input"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="pero también de tu salud"
                  maxLength={120}
                />
              </label>
              <div className="og-row">
                <label className="og-label">
                  Accent color (hex)
                  <div className="og-color-field">
                    <input
                      className="og-input"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value.replace(/^#/, ""))}
                      placeholder="dcff1f"
                      maxLength={6}
                    />
                    <input
                      type="color"
                      value={`#${accent || "dcff1f"}`}
                      onChange={(e) => setAccent(e.target.value.replace("#", ""))}
                      className="og-color-swatch"
                    />
                  </div>
                </label>
                <label className="og-label">
                  Accent secundario (degradado pill)
                  <div className="og-color-field">
                    <input
                      className="og-input"
                      value={accent2}
                      onChange={(e) => setAccent2(e.target.value.replace(/^#/, ""))}
                      placeholder="opcional"
                      maxLength={6}
                    />
                    <input
                      type="color"
                      value={`#${accent2 || accent || "dcff1f"}`}
                      onChange={(e) => setAccent2(e.target.value.replace("#", ""))}
                      className="og-color-swatch"
                    />
                  </div>
                </label>
              </div>
            </>
          )}

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

          <div className="og-row">
            <label className="og-label">
              Fondo segundo color (vacío = degradado auto)
              <div className="og-color-field">
                <input
                  className="og-input"
                  value={bg2}
                  onChange={(e) => setBg2(e.target.value.replace(/^#/, ""))}
                  maxLength={6}
                  placeholder="auto"
                />
                <input
                  type="color"
                  value={`#${bg2 || bg || "ffffff"}`}
                  onChange={(e) => setBg2(e.target.value.replace("#", ""))}
                  className="og-color-swatch"
                />
              </div>
            </label>

            <label className="og-label">
              Patrón de degradado
              <select
                className="og-input"
                value={bgPattern}
                onChange={(e) => setBgPattern(e.target.value)}
              >
                <option value="linear-vertical">Lineal — arriba a abajo</option>
                <option value="linear-horizontal">Lineal — izq. a der.</option>
                <option value="linear-diagonal">Lineal — diagonal ↘</option>
                <option value="linear-anti-diagonal">Lineal — diagonal ↙</option>
                <option value="radial-center">Radial — desde centro</option>
                <option value="radial-top-left">Radial — esquina sup. izq.</option>
                <option value="radial-top-right">Radial — esquina sup. der.</option>
                <option value="radial-bottom-left">Radial — esquina inf. izq.</option>
                <option value="radial-bottom-right">Radial — esquina inf. der.</option>
              </select>
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
