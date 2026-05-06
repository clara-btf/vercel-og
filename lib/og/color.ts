export function sanitizeHex(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const cleaned = value.replace(/^#/, "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(cleaned) || /^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  return fallback;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function darken(hex: string, amount = 0.55): string {
  const { r, g, b } = parseHex(hex);
  return `rgb(${Math.floor(r * amount)}, ${Math.floor(g * amount)}, ${Math.floor(b * amount)})`;
}

export function lighten(hex: string, amount = 0.2): string {
  const { r, g, b } = parseHex(hex);
  const mix = (c: number) => Math.min(255, Math.floor(c + (255 - c) * amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function pickContrast(bg: string, light = "#ffffff", dark = "#0f0f1a"): string {
  return luminance(bg) > 0.5 ? dark : light;
}

export const GRADIENT_PATTERNS = [
  "linear-vertical",
  "linear-horizontal",
  "linear-diagonal",
  "linear-anti-diagonal",
  "radial-center",
  "radial-top-left",
  "radial-top-right",
  "radial-bottom-left",
  "radial-bottom-right",
] as const;
export type GradientPattern = (typeof GRADIENT_PATTERNS)[number];

const PATTERN_SET = new Set<string>(GRADIENT_PATTERNS);

export function sanitizeGradientPattern(
  value: string | null | undefined,
  fallback: GradientPattern = "linear-vertical"
): GradientPattern {
  if (value && PATTERN_SET.has(value)) return value as GradientPattern;
  return fallback;
}

export function buildGradient(from: string, to: string, pattern: GradientPattern): string {
  switch (pattern) {
    case "linear-vertical":
      return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;
    case "linear-horizontal":
      return `linear-gradient(90deg, ${from} 0%, ${to} 100%)`;
    case "linear-diagonal":
      return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
    case "linear-anti-diagonal":
      return `linear-gradient(225deg, ${from} 0%, ${to} 100%)`;
    case "radial-center":
      return `radial-gradient(circle at 50% 50%, ${from} 0%, ${to} 100%)`;
    case "radial-top-left":
      return `radial-gradient(circle at 0% 0%, ${from} 0%, ${to} 110%)`;
    case "radial-top-right":
      return `radial-gradient(circle at 100% 0%, ${from} 0%, ${to} 110%)`;
    case "radial-bottom-left":
      return `radial-gradient(circle at 0% 100%, ${from} 0%, ${to} 110%)`;
    case "radial-bottom-right":
      return `radial-gradient(circle at 100% 100%, ${from} 0%, ${to} 110%)`;
  }
}
