import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BootScreen, BOOT_SCRIPT, ClientInit, Toaster } from "@/components/shell/Boot";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vive Pelileo · by Clapzy",
    template: "%s · Vive Pelileo",
  },
  description:
    "Descubre qué hacer en Pelileo: atractivos, comida, hospedaje, experiencias y eventos. Arma tu plan hora por hora con Gaia.",
  applicationName: "Vive Pelileo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafaf8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <BootScreen />
        {children}
        <Toaster />
        <ClientInit />
      </body>
    </html>
  );
}
