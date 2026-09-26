import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StatusColorProvider } from "@/components/providers/StatusColorProvider";
import { PWAProvider } from "@/components/providers/PWAProvider";
import { prisma } from "@/lib/db/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fellow AI CRM",
  description: "AI-Powered CRM and Lead Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fellow AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import NextTopLoader from 'nextjs-toploader';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialThemes: Record<string, string> = {}
  try {
    const statusColors = await prisma.statusColor.findMany()
    statusColors.forEach(sc => {
      initialThemes[sc.status] = sc.theme
    })
  } catch (e) {
    console.error("Failed to fetch status colors", e)
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextTopLoader color="#10b981" showSpinner={false} shadow="0 0 10px #10b981,0 0 5px #10b981" />
        <PWAProvider>
          <StatusColorProvider initialThemes={initialThemes}>
            {children}
          </StatusColorProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
