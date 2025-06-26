import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Background from "@/components/layout/Background";
import NoiseTexture from "@/components/layout/NoiseTexture";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NesDesign E-Commerce",
  description: "Modern e-commerce platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="nesdesign">
      <body className={`${inter.className} bg-base-100 text-base-content relative`}>
        <Background />
        <Providers>
          <div className="flex flex-col min-h-screen relative z-20">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
        <NoiseTexture />
      </body>
    </html>
  );
}
