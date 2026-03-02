import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ══════════════════════════════════════════════
   SEO – Global Metadata
   ══════════════════════════════════════════════ */
const SITE_URL = "https://steezehumanizer.app";
const SITE_NAME = "Steeze Humanizer";
const SITE_DESCRIPTION =
  "Paste your draft and get a cleaner, more natural version instantly. Steeze Humanizer keeps your meaning while making your text sound human.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Steeze Humanizer — AI Text Humanizer",
    template: "%s | Steeze Humanizer",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI text humanizer",
    "humanize AI text",
    "AI to human text converter",
    "rewrite AI text",
    "text humanizer",
    "AI content rewriter",
    "natural writing tool",
    "Steeze Humanizer",
    "free AI humanizer",
    "make AI text sound human",
  ],
  authors: [{ name: "Steeze Tech" }],
  creator: "Steeze Tech",
  publisher: "Steeze Tech",

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Steeze Humanizer — AI Text Humanizer",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/STEEZE2 (1).png",
        width: 512,
        height: 512,
        alt: "Steeze Humanizer logo",
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card: "summary_large_image",
    title: "Steeze Humanizer — AI Text Humanizer",
    description: SITE_DESCRIPTION,
    images: ["/STEEZE2 (1).png"],
  },

  /* ── Icons ── */
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  /* ── Misc ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

/* ══════════════════════════════════════════════
   JSON-LD Structured Data
   ══════════════════════════════════════════════ */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Steeze Tech",
      url: SITE_URL,
      logo: `${SITE_URL}/STEEZE2 (1).png`,
      description:
        "A small, independent tech startup building AI-powered writing tools that help people communicate more naturally.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@steezetech.com",
        contactType: "customer support",
      },
    },
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "AI text humanization",
        "Multiple tone options",
        "One-click copy",
        "History tracking",
        "Free unlimited use",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
