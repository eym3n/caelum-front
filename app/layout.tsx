import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PayloadProvider } from "@/contexts/PayloadContext"
import { AppProviders } from "@/components/providers/AppProviders"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"

// Switch to a crisper modern font stack + keep mono for future code blocks.
import { Geist_Mono as Font_Geist_Mono } from 'next/font/google'

const fontMono = Font_Geist_Mono({ subsets: ['latin'], weight: ["400","500","600"], variable: '--font-mono' })

export const metadata: Metadata = {
  title: "Ayor Landing Pages",
  description: "Ayor Landing Pages helps teams craft conversion-ready experiences with AI-powered design, copy, and deployment.",
  applicationName: "Ayor Landing Pages",
  generator: "Ayor Landing Pages",
  openGraph: {
    title: "Ayor Landing Pages",
    description: "Build, refine, and deploy high-converting landing pages in minutes with Ayor Landing Pages.",
    siteName: "Ayor Landing Pages",
  },
  twitter: {
    title: "Ayor Landing Pages",
    description: "Build, refine, and deploy high-converting landing pages in minutes with Ayor Landing Pages.",
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontMono.variable} font-sans antialiased bg-background text-foreground`}>        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppProviders>
            <AuthProvider>
              <PayloadProvider>
                {children}
              </PayloadProvider>
            </AuthProvider>
          </AppProviders>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  )
}
