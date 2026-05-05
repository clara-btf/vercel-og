import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OG Stories — Generador de imágenes 1080x1920",
  description: "Genera imágenes tamaño historia de Instagram con @vercel/og",
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
