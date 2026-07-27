import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { buildVol, siteVersion } from "@/lib/build";
import Cursor from "@/components/Cursor";
import FrameHud from "@/components/FrameHud";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealInit from "@/components/RevealInit";

// Self-hosted at build time, so the site serves its own fonts off CloudFront
// instead of a render-blocking third-party stylesheet.
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const body = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jordandesigns.io"),
  title: "Jordan — Multi-Cloud Engineer",
  description:
    "Jordan, Multi-Cloud Engineer. Platforms, infrastructure, and automation across AWS and Azure. Open to full-time roles and contract (1099) engagements.",
  openGraph: {
    title: "Jordan — Multi-Cloud Engineer",
    description:
      "Platforms, infrastructure, and automation across AWS and Azure. Open to full-time and contract (1099).",
    url: "https://jordandesigns.io",
    siteName: "jordandesigns.io",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Jordan, Multi-Cloud Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jordan — Multi-Cloud Engineer",
    description:
      "Platforms, infrastructure, and automation across AWS and Azure.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <Cursor />
        <FrameHud vol={buildVol} version={siteVersion} />
        <Nav />
        <main>{children}</main>
        <Footer />
        <RevealInit />
      </body>
    </html>
  );
}
