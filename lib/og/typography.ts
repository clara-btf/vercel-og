export type FitResult = { fontSize: number; maxLines: number };

export function fitTitle(text: string): FitResult {
  const len = text.length;
  if (len <= 24) return { fontSize: 120, maxLines: 3 };
  if (len <= 48) return { fontSize: 96, maxLines: 4 };
  if (len <= 80) return { fontSize: 72, maxLines: 5 };
  if (len <= 120) return { fontSize: 56, maxLines: 6 };
  return { fontSize: 44, maxLines: 7 };
}

export function fitSubtitle(text: string): FitResult {
  const len = text.length;
  if (len <= 80) return { fontSize: 44, maxLines: 3 };
  if (len <= 160) return { fontSize: 36, maxLines: 4 };
  return { fontSize: 30, maxLines: 5 };
}

export function clampStyle(maxLines: number) {
  return {
    display: "-webkit-box" as const,
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: maxLines,
    overflow: "hidden" as const,
  };
}
