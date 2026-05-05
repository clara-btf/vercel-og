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
