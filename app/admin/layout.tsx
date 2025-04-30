import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/use-toast"
import AdminSidebar from "@/components/admin/admin-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard | NIBOG",
  description: "NIBOG Admin Dashboard",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
              <AdminSidebar />
              <div className="flex-1 p-6 md:p-8">{children}</div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
