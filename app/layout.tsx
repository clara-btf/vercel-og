import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b14",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
