"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import CitySelector from "@/components/city-selector"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [cityId, setCityId] = useState<number | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCityChange = (id: number) => {
    setCityId(id)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form
    if (!fullName || !email || !phone || !password || !cityId) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions")
      setIsLoading(false)
      return
    }

    try {
      // Call our API route
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          city_id: cityId,
          accept_terms: termsAccepted
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Registration successful
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })

      // Redirect to login page
      router.push('/login')

    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Register to book baby events and activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Default City</Label>
              <CitySelector onCityChange={handleCityChange} />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                  terms and conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                  privacy policy
                </Link>
              </Label>
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
          {/* Commented out Google and Phone OTP login options
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Google
            </Button>
            <Button variant="outline" className="w-full">
              Phone OTP
            </Button>
          </div>
          */}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
