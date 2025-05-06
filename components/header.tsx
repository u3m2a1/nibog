"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Baby, Calendar, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { UserNav } from "./user-nav"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "./ui/use-toast"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  // For now, we'll consider any user as a regular user
  const isAdmin = false

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
    router.push('/')
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Events",
      active: pathname === "/events",
    },
    {
      href: "/baby-olympics",
      label: "NIBOG Games",
      active: pathname === "/baby-olympics",
    },
    {
      href: "/register-event",
      label: "Register Event",
      active: pathname === "/register-event",
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NIBOG
            </span>
            <Badge variant="outline" className="hidden md:inline-flex">
              India's Biggest Baby Games
            </Badge>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-700">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <ModeToggle />
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register-event">Register</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="px-2 md:hidden" aria-label="Toggle Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <nav className="flex flex-col gap-4 mt-4">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          route.active ? "text-primary" : "text-muted-foreground",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {route.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-700"
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </nav>
                </div>

                <div className="border-t py-4">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 px-2">
                        <Avatar>
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}&background=random&color=fff`}
                          />
                          <AvatarFallback>
                            {user?.full_name
                              ? user.full_name
                                  .split(' ')
                                  .map(name => name[0])
                                  .join('')
                                  .toUpperCase()
                                  .substring(0, 2)
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/dashboard/bookings" onClick={() => setIsOpen(false)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            My Bookings
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/dashboard/children" onClick={() => setIsOpen(false)}>
                            <Baby className="mr-2 h-4 w-4" />
                            My Children
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button className="w-full" onClick={() => setIsOpen(false)} asChild>
                        <Link href="/register-event">Register</Link>
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)} asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    </div>
                  )}
                  <div className="mt-4 flex justify-center">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
