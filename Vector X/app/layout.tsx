import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GridBackground } from "@/components/grid-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vector X - Building Tomorrow's SaaS Solutions",
  description: "Innovative SaaS product development company based in the UK. Creating enterprise-grade solutions for modern businesses.",
  keywords: "SaaS, Software Development, Vector X, UK Tech Company, Enterprise Solutions",
  authors: [{ name: "Vector X" }],
  openGraph: {
    title: "Vector X - Building Tomorrow's SaaS Solutions",
    description: "Innovative SaaS product development company based in the UK",
    type: "website",
    locale: "en_GB",
    siteName: "Vector X",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
