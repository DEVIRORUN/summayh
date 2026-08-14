import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local"
import "./globals.css";
// Provider
import { Providers } from "@/components/providers";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://summayh.com";

// Multi-file static font setup
const clashDisplay = localFont({
  src: [
    {
      path: "./fonts/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Summayh — Hire Freelancers & Sell Your Skills Online",
    template: "%s | Summayh",
  },
  description:
    "Summayh is a freelance marketplace where buyers hire vetted sellers for design, video editing, development, tutoring, and more - a fast, low-fee alternative to Fiverr and Upwork.",
  keywords: [
      "freelance marketplace",
      "hire freelancers",
      "get freelancers fast",
      "fiverr alternative",
      "upwork alternative",
      "sell services online",
      "gig marketplace",
      "freelance jobs",
  ],
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "Summayh",
    title: "Summayh — Hire Freelancers & Sell Your Skills Online",
    description:
      "A fast, low-fee freelance marketplace. Post a gig, hire a pro, get it delivered — a modern alternative to Fiverr.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Summayh — Freelance Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Summayh — Hire Freelancers & Sell Your Skills Online",
    description: "A fast, low-fee freelance marketplace and Fiverr alternative.",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: "XsF1KlumO11ryw6ZB9qGi4jXfm119B-nmK5lFbHblU8",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Summayh",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              sameAs: [
                // add real social links you actually have, e.g.:
                // "https://twitter.com/summayh",
                // "https://instagram.com/summayh",
              ],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}