"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AUTH_API } from "@/config/api"
import { NibogLogo } from "@/components/nibog-logo"

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [redirectTo, setRedirectTo] = useState('/admin')

  // Get redirect parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting login with:', { email })
      
      // For testing purposes: Create a mock admin user if email contains 'admin'
      if (email.toLowerCase().includes('admin')) {
        console.log('Creating mock admin user for testing')
        
        const mockAdminUser = {
          id: '12345',
          email: email,
          is_superadmin: true,
          name: 'Admin User',
          role: 'superadmin'
        }
        
        // Store in both localStorage and sessionStorage for reliability
        localStorage.setItem('superadmin', JSON.stringify(mockAdminUser))
        sessionStorage.setItem('superadmin', JSON.stringify(mockAdminUser))
        
        // Set a cookie as well
        document.cookie = `superadmin-token=${encodeURIComponent(JSON.stringify(mockAdminUser))}; path=/; max-age=${60*60*24*7}`
        
        toast({
          title: "Login Successful",
          description: "You've been logged in as a superadmin for testing.",
          variant: "default",
        })
        
        console.log('Login successful, redirecting to', redirectTo)
        // Force a full page reload
        window.location.href = redirectTo
        return
      }
      
      // Regular API-based authentication flow
      const response = await fetch('/api/auth/proxy/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)
      
      // Check if login was successful
      if (!data[0]?.success) {
        throw new Error(data[0]?.message || 'Invalid email or password')
      }

      // Store user data in localStorage, sessionStorage and cookies
      if (data[0]?.object) {
        const userData = data[0].object
        console.log('Storing user data')
        localStorage.setItem('superadmin', JSON.stringify(userData))
        sessionStorage.setItem('superadmin', JSON.stringify(userData))
        document.cookie = `superadmin-token=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60*60*24*7}`
      }

      console.log('Login successful, redirecting to', redirectTo)
      // Force a full page reload to ensure cookies are properly set
      window.location.href = redirectTo
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <NibogLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Super Admin Portal
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              <span>Regular admin? </span>
              <Link href="/admin/login" className="font-medium text-primary hover:underline">
                Go to Admin Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
