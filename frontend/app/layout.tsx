import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agencia de Análisis Forense Digital",
  description:
    "Certificación y análisis forense de evidencia digital. Servicios de autenticación de imágenes, detección de manipulaciones y certificación digital con validez legal.",
  keywords: [
    "forense digital",
    "análisis de imágenes",
    "certificación digital",
    "Sudamérica",
    "evidencia digital",
    "autenticación de imágenes",
  ],
  icons: {
    icon: "/logo/logo-afd.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

import { ThemeProvider } from "./components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=cc926480-2a00-4cae-a049-44cdd941fd97"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
