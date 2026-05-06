import { withAlpha } from "./color";
import { fitTitle, fitSubtitle, clampStyle } from "./typography";

export type Hero =
  | { kind: "svg"; src: string }
  | { kind: "image"; src: string }
  | { kind: "emoji"; value: string }
  | { kind: "none" };

export type LayoutProps = {
  titulo: string;
  subtitulo: string;
  hero: Hero;
  bg: string;
  bgDark: string;
  color: string;
  marca: string | null;
  tag?: string | null;
  highlight?: string | null;
  accent?: string;
  accent2?: string | null;
  bgImage?: string | null;
};

function HeroBlock({ hero, color, size = 520 }: { hero: Hero; color: string; size?: number }) {
  if (hero.kind === "none") return null;
  if (hero.kind === "emoji") {
    return (
      <div
        style={{
          fontSize: Math.round(size * 0.62),
          lineHeight: 1,
          display: "flex",
          filter: `drop-shadow(0 16px 50px ${withAlpha(color, 0.28)})`,
        }}
      >
        {hero.value}
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero.src}
        alt=""
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}

function Marca({ marca, color }: { marca: string | null; color: string }) {
  if (!marca) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        right: 96,
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color,
        opacity: 0.65,
        display: "flex",
      }}
    >
      {marca}
    </div>
  );
}

export function LayoutCenter(props: LayoutProps) {
  const { titulo, subtitulo, hero, bg, bgDark, color, marca } = props;
  const titleFit = fitTitle(titulo);
  const subtitleFit = fitSubtitle(subtitulo);
  return (
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
          backgroundColor: withAlpha(color, 0.85),
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
          marginTop: 96,
        }}
      >
        <HeroBlock hero={hero} color={color} />
        <div
          style={{
            fontSize: titleFit.fontSize,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            maxWidth: 880,
            ...clampStyle(titleFit.maxLines),
          }}
        >
          {titulo}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ width: "100%", height: 2, backgroundColor: withAlpha(color, 0.12), display: "flex" }} />
        <div
          style={{
            fontSize: subtitleFit.fontSize,
            fontWeight: 400,
            lineHeight: 1.3,
            maxWidth: 880,
            opacity: 0.85,
            ...clampStyle(subtitleFit.maxLines),
          }}
        >
          {subtitulo}
        </div>
      </div>

      <Marca marca={marca} color={color} />
    </div>
  );
}

export function LayoutSplit(props: LayoutProps) {
  const { titulo, subtitulo, hero, bg, bgDark, color, marca } = props;
  const titleFit = fitTitle(titulo);
  const subtitleFit = fitSubtitle(subtitulo);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color,
        backgroundColor: bgDark,
      }}
    >
      <div
        style={{
          height: 930,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${withAlpha(
            color,
            0.22
          )} 0%, transparent 65%)`,
        }}
      >
        <HeroBlock hero={hero} color={color} size={680} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "72px 96px",
          backgroundColor: bgDark,
        }}
      >
        <div
          style={{
            fontSize: Math.min(titleFit.fontSize, 88),
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            maxWidth: 880,
            ...clampStyle(Math.min(titleFit.maxLines, 4)),
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            fontSize: subtitleFit.fontSize,
            fontWeight: 400,
            lineHeight: 1.3,
            maxWidth: 880,
            opacity: 0.85,
            ...clampStyle(subtitleFit.maxLines),
          }}
        >
          {subtitulo}
        </div>
      </div>
      <Marca marca={marca} color={color} />
    </div>
  );
}

export function LayoutMinimal(props: LayoutProps) {
  const { titulo, subtitulo, bg, bgDark, color, marca } = props;
  const titleFit = fitTitle(titulo);
  const subtitleFit = fitSubtitle(subtitulo);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 96px",
        color,
        backgroundColor: bg,
        backgroundImage: `linear-gradient(180deg, ${bg} 0%, ${bgDark} 100%)`,
        position: "relative",
        gap: 48,
      }}
    >
      <div
        style={{
          width: 220,
          height: 8,
          backgroundColor: withAlpha(color, 0.95),
          borderRadius: 4,
          display: "flex",
        }}
      />
      <div
        style={{
          fontSize: Math.max(titleFit.fontSize, 96),
          fontWeight: 800,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          maxWidth: 880,
          ...clampStyle(titleFit.maxLines),
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontSize: subtitleFit.fontSize,
          fontWeight: 400,
          lineHeight: 1.3,
          maxWidth: 880,
          opacity: 0.7,
          ...clampStyle(subtitleFit.maxLines),
        }}
      >
        {subtitulo}
      </div>
      <Marca marca={marca} color={color} />
    </div>
  );
}

function fitTipTitle(text: string) {
  const len = text.length;
  if (len <= 60) return { fontSize: 92, maxLines: 4 };
  if (len <= 100) return { fontSize: 76, maxLines: 5 };
  if (len <= 160) return { fontSize: 60, maxLines: 6 };
  return { fontSize: 48, maxLines: 7 };
}

function fitTipBody(text: string) {
  const len = text.length;
  if (len <= 100) return { fontSize: 38, maxLines: 5 };
  if (len <= 200) return { fontSize: 32, maxLines: 6 };
  return { fontSize: 28, maxLines: 7 };
}

export function LayoutTip(props: LayoutProps) {
  const {
    titulo,
    subtitulo,
    hero,
    bg,
    bgDark,
    color,
    marca,
    tag,
    highlight,
    accent = "#dcff1f",
    accent2,
    bgImage,
  } = props;
  const titleFit = fitTipTitle(titulo);
  const highlightSize = Math.round(titleFit.fontSize * 0.82);
  const bodyFit = fitTipBody(subtitulo);
  const ink = "#0a0a0a";
  const resolvedBgImage = bgImage ?? `linear-gradient(180deg, ${bg} 0%, ${bgDark} 100%)`;
  const pillBackground = accent2
    ? `linear-gradient(90deg, ${accent2} 0%, ${accent} 100%)`
    : `linear-gradient(90deg, ${withAlpha(accent, 0)} 0%, ${withAlpha(accent, 0.45)} 35%, ${accent} 75%)`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color,
        backgroundColor: bg,
        backgroundImage: resolvedBgImage,
      }}
    >
      {tag ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: 180,
            marginLeft: -140,
            width: 760,
            height: 84,
            borderRadius: 60,
            padding: "0 64px",
            background: pillBackground,
            fontSize: 40,
            fontWeight: 800,
            color: ink,
            letterSpacing: "-0.01em",
          }}
        >
          {tag}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 110px",
          marginTop: tag ? 110 : 220,
        }}
      >
        <div
          style={{
            fontSize: titleFit.fontSize,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            color: ink,
            ...clampStyle(titleFit.maxLines),
          }}
        >
          {titulo}
        </div>

        {highlight ? (
          <div style={{ display: "flex", marginTop: 18 }}>
            <div
              style={{
                backgroundColor: accent,
                padding: "8px 24px",
                fontFamily: "Inter",
                fontSize: highlightSize,
                fontWeight: 700,
                fontStyle: "italic",
                color: ink,
                lineHeight: 1.15,
                display: "flex",
              }}
            >
              {highlight}
            </div>
          </div>
        ) : null}

        <div
          style={{
            fontSize: bodyFit.fontSize,
            fontWeight: 400,
            lineHeight: 1.4,
            color: ink,
            marginTop: 80,
            maxWidth: 720,
            ...clampStyle(bodyFit.maxLines),
          }}
        >
          {subtitulo}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex" }} />

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <HeroBlock hero={hero} color={accent} size={820} />
      </div>

      <Marca marca={marca} color={ink} />
    </div>
  );
}

export function renderLayout(
  layout: "center" | "split" | "minimal" | "tip",
  props: LayoutProps
) {
  if (layout === "split") return <LayoutSplit {...props} />;
  if (layout === "minimal") return <LayoutMinimal {...props} />;
  if (layout === "tip") return <LayoutTip {...props} />;
  return <LayoutCenter {...props} />;
}
