import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNavigation } from "@/components/MobileNavigation"
import { OfflineIndicator } from "@/components/OfflineIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bazari - Ethnic Fashion Marketplace",
  description:
    "Discover and sell authentic ethnic clothing from all cultures. From vintage finds to custom designs, celebrate diversity through fashion.",
  manifest: "/manifest.json",
  themeColor: "#667eea",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bazari",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OfflineIndicator />
          <MobileNavigation />
          <main className="pb-20 pt-16 md:pb-0 md:pt-0">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
