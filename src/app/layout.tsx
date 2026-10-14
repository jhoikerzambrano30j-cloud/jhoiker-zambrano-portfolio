import type { Metadata, Viewport } from "next";
import { Orbitron, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { GridBackdrop } from "@/components/layout/GridBackdrop";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import "./globals.css";

/* ------------------------------------------------------------------
   Tipografías oficiales — Manual de Identidad de Marca v3.0, pág. 02
   01. Orbitron          → Titulares, encabezados e isotipo
   02. Plus Jakarta Sans → Cuerpo de texto, contratos y catálogos
   03. JetBrains Mono    → Bloques de código, precios y variables
   ------------------------------------------------------------------ */
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jhoiker-zambrano-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jhoiker Zambrano — Páginas web, diseño gráfico e infraestructura",
    template: "%s · Jhoiker Zambrano",
  },
  description:
    "Páginas web y aplicaciones a medida con principios de diseño gráfico aplicados en serio. Administración de servidores, despliegue, respaldos y monitoreo.",
  keywords: [
    "Jhoiker Zambrano",
    "diseño y desarrollo web",
    "páginas web",
    "diseño gráfico",
    "interfaces",
    "administración de servidores",
    "infraestructura",
    "Linux",
    "Next.js",
    "Supabase",
    "freelance Colombia",
  ],
  authors: [{ name: "Jhoiker Zambrano" }],
  creator: "Jhoiker Zambrano",
  publisher: "Jhoiker Zambrano",
  applicationName: "Jhoiker Zambrano",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Jhoiker Zambrano",
    title: "Jhoiker Zambrano — Páginas web, diseño e infraestructura",
    description:
      "Páginas web a medida, diseño gráfico aplicado a producto e infraestructura administrada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jhoiker Zambrano — Páginas web y diseño",
    description:
      "Páginas web a medida, diseño gráfico aplicado a producto e infraestructura administrada.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0D14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${jakarta.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-obsidian text-white-soft antialiased">
        <GridBackdrop />
        <ScrollProgress />
        <Nav />
        <CommandPalette />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
