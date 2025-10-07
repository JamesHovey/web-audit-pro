import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import HydrationFix from "@/components/HydrationFix";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Audit Pro",
  description: "Comprehensive website audit tool for performance, SEO, and technical analysis",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <HydrationFix />
        {children}
      </body>
    </html>
  );
}
