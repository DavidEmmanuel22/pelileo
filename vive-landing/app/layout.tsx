import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { seo } from "@/content/site";
import { PRELOAD_SCRIPT } from "@/components/scenes/preload-script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: seo.title,
  description: seo.description,
  applicationName: "Vive by clapzy",
  openGraph: {
    title: seo.title,
    description: seo.description,
    type: "website",
    locale: "es_EC",
    siteName: "Vive by clapzy",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Cuando una ciudad se vive, se nota. Vive by clapzy" }],
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d0907",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_SCRIPT }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
