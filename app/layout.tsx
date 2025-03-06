import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Valhalla Builder",
  description: "A professional construction project management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            <footer className="bg-gray-800 text-white py-4">
              <div className="container mx-auto px-4 text-center">© 2024 Valhalla Builder. All rights reserved.</div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'