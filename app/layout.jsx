import MobileNav from "@/components/mobile-nav"
import AuthProvider from "@/components/session-provider"
import SiteHeader from "@/components/site-header"
import { LoaderProvider } from "@/context/loader-context"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Smart Travel Dashboard",
  description: "Real-time travel safety and weather insights",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoaderProvider>
          <AuthProvider>
              <div className="min-h-screen bg-background pb-20 lg:pb-0">
                  {/* 1. Global Header */}
                  <SiteHeader/>
                  
                  {/* 2. Page Content */}
                  {children}

                  {/* 3. Global Mobile Footer */}
                  <MobileNav />
              </div>
          </AuthProvider>
        </LoaderProvider>
      </body>
    </html>
  )
}