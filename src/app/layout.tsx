import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Vibe Coding Research - Blog",
    template: "%s | Vibe Coding Research"
  },
  description: "A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology",
  keywords: ["blog", "coding", "technology", "nextjs", "wordpress", "graphql"],
  authors: [{ name: "Vibe Coding Research Team" }],
  creator: "Vibe Coding Research",
  publisher: "Vibe Coding Research",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Vibe Coding Research - Blog',
    description: 'A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology',
    siteName: 'Vibe Coding Research',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Coding Research - Blog',
    description: 'A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <StructuredData 
          type="website" 
          data={{
            name: "Vibe Coding Research",
            description: "A modern blog built with Next.js and WPGraphQL, featuring the latest insights in coding and technology",
            url: "https://vibecodingresearch.com",
            searchUrl: "https://vibecodingresearch.com/blog?search={search_term_string}"
          }} 
        />
        <StructuredData 
          type="organization" 
          data={{
            name: "Vibe Coding Research",
            description: "A technology blog and research platform",
            url: "https://vibecodingresearch.com",
            logo: "https://vibecodingresearch.com/logo.png",
            sameAs: [
              "https://twitter.com/vibecodingresearch",
              "https://linkedin.com/company/vibecodingresearch"
            ]
          }} 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
