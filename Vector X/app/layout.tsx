import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GridBackground } from "@/components/grid-background";
import GoogleAnalytics from "@/components/google-analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vector X - Next-Generation SaaS Development | UK Software Company",
  description: "Vector X is a leading UK-based SaaS development company. We build innovative software solutions including VectorWitch AI SVG Generator. Enterprise-grade products for modern businesses.",
  keywords: "Vector X, SaaS Development, Software Company UK, VectorWitch, AI SVG Generator, Enterprise Software, London Tech Company, Custom Software Development, SaaS Solutions, B2B Software",
  authors: [{ name: "Vector X Ltd" }],
  creator: "Vector X Ltd",
  publisher: "Vector X Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vectorx.co.uk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vector X - Next-Generation SaaS Development",
    description: "Leading UK SaaS development company. Building innovative solutions including VectorWitch AI-powered SVG generator. Enterprise software for modern businesses.",
    url: "https://vectorx.co.uk",
    siteName: "Vector X",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vector X - SaaS Development Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vector X - Next-Generation SaaS Development",
    description: "UK's innovative SaaS development company. Creator of VectorWitch and enterprise solutions.",
    images: ["/og-image.png"],
    creator: "@vectorx",
  },
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
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
    other: [
      {
        rel: "apple-touch-icon",
        url: "/logo.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vector X Ltd",
    "alternateName": "Vector X",
    "url": "https://vectorx.co.uk",
    "logo": "https://vectorx.co.uk/logo.svg",
    "description": "Leading UK-based SaaS development company specializing in next-generation software solutions",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Vector X Team"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "128 City Road",
      "addressLocality": "London",
      "postalCode": "EC1V 2NX",
      "addressCountry": "GB"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@vectorx.co.uk",
      "contactType": "customer service",
      "areaServed": "GB",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://github.com/vectorx",
      "https://twitter.com/vectorx"
    ],
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "SaaS Development Services",
        "description": "Custom SaaS development and enterprise software solutions"
      }
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GridBackground>
            {children}
          </GridBackground>
        </ThemeProvider>
      </body>
    </html>
  );
}
