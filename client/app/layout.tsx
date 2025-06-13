import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MobileOptimizationProvider } from "@/components/mobile-optimization-provider"
import { AuthProvider } from "@/contexts/auth-context"
import RequireAuth from "@/components/require-auth"
import { ApiKeyProvider } from "@/contexts/api-keys-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Optimize font loading
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
})

export const metadata: Metadata = {
  title: "BOQ Pricing Pro",
  description: "Premium quotation management for construction projects",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BOQ Pricing Pro",
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MobileOptimizationProvider>
            <AuthProvider>
              <ApiKeyProvider>
                <RequireAuth>
                  {children}
                </RequireAuth>
                <Toaster />
              </ApiKeyProvider>
            </AuthProvider>
          </MobileOptimizationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
