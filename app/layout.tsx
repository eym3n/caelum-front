import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PayloadProvider } from "@/contexts/PayloadContext"
import { AppProviders } from "@/components/providers/AppProviders"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"

// Switch to a crisper modern font stack (Inter) + keep mono for future code blocks.
import { Inter, Geist_Mono as Font_Geist_Mono } from 'next/font/google'

// Provide both .className (sets font-family) and .variable (custom property) so Tailwind's font-sans + any CSS using var(--font-sans) work.
const fontSans = Inter({ subsets: ['latin'], variable: '--font-sans', weight: ["300","400","500","600","700"], display: 'swap' })
const fontMono = Font_Geist_Mono({ subsets: ['latin'], weight: ["400","500","600"], variable: '--font-mono' })

export const metadata: Metadata = {
  title: "AI Landing Page Builder",
  description: "Create stunning, conversion-optimized landing pages with AI in minutes",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.className} ${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-[radial-gradient(circle_at_25%_25%,rgba(114,105,248,0.10),transparent_60%),radial-gradient(circle_at_75%_65%,rgba(114,105,248,0.08),transparent_70%)]`}>        
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
