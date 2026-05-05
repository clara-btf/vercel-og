import type { Metadata } from "next";
import type { ReactNode } from "react";

const ogParams = new URLSearchParams({
  titulo: "OG Stories Generator",
  subtitulo: "Imágenes 1080×1920 dinámicas con @vercel/og",
  emoji: "✨",
  bg: "0f172a",
  color: "f8fafc",
  layout: "center",
  marca: "@vercel/og",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "OG Stories — Generador de imágenes 1080×1920",
  description: "Genera imágenes tamaño historia de Instagram con @vercel/og",
  openGraph: {
    title: "OG Stories Generator",
    description: "Imágenes 1080×1920 dinámicas con @vercel/og",
    images: [
      {
        url: `/api/og?${ogParams.toString()}`,
        width: 1080,
        height: 1920,
        alt: "OG Stories Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Stories Generator",
    description: "Imágenes 1080×1920 dinámicas con @vercel/og",
    images: [`/api/og?${ogParams.toString()}`],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
          background: "#0b0b14",
          color: "#f4f4f8",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
