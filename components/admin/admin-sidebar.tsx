"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  Home,
  MapPin,
  Users,
  Tag,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  FileText,
  QrCode,
  UserCheck,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useRouter } from "next/navigation"

const adminRoutes = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/admin/games",
    label: "Baby Games",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: "/admin/events",
    label: "NIBOG Events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: "/admin/completed-events",
    label: "Completed Events",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    href: "/admin/cities",
    label: "Cities",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    href: "/admin/venues",
    label: "Venues",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: "/admin/promo-codes",
    label: "Promo Codes",
    icon: <Tag className="h-5 w-5" />,
  },
  {
    href: "/admin/add-ons",
    label: "Add-ons",
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: "/admin/certificate-templates",
    label: "Certificates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: "/admin/attendance",
    label: "Attendance",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear localStorage
      localStorage.removeItem('superadmin')

      // Redirect to login page
      window.location.href = '/superadmin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                  NIBOG Admin
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <nav className="flex-1 overflow-auto p-2">
              <ul className="space-y-1">
                {adminRoutes.map((route) => (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                        pathname === route.href ? "bg-muted" : "text-muted-foreground",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              NIBOG Admin
            </Link>
          </div>
          <nav className="flex-1 overflow-auto p-2">
            <ul className="space-y-1">
              {adminRoutes.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                      pathname === route.href ? "bg-muted" : "text-muted-foreground",
                    )}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
