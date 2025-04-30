"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"

// Mock data - in a real app, this would come from an API
const users = [
  {
    id: "1",
    name: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    city: "Hyderabad",
    bookings: 3,
    role: "user",
    status: "active",
    registeredOn: "2025-01-15",
    lastLogin: "2025-03-20"
  },
  {
    id: "2",
    name: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    city: "Bangalore",
    bookings: 2,
    role: "user",
    status: "active",
    registeredOn: "2025-02-10",
    lastLogin: "2025-03-18"
  },
  {
    id: "6",
    name: "Admin User",
    email: "admin@nibog.in",
    phone: "+91 9876543215",
    city: "Hyderabad",
    bookings: 0,
    role: "admin",
    status: "active",
    registeredOn: "2025-01-01",
    lastLogin: "2025-03-21"
  }
]

// Mock cities data
const cities = [
  { id: "1", name: "Hyderabad" },
  { id: "2", name: "Bangalore" },
  { id: "3", name: "Chennai" },
  { id: "4", name: "Vizag" },
  { id: "5", name: "Mumbai" },
  { id: "6", name: "Delhi" },
  { id: "7", name: "Kolkata" },
  { id: "8", name: "Pune" },
  { id: "9", name: "Patna" },
  { id: "10", name: "Ranchi" },
]

// User roles
const roles = [
  { id: "1", name: "user", label: "User" },
  { id: "2", name: "admin", label: "Admin" },
]

// User statuses
const statuses = [
  { id: "1", name: "active", label: "Active" },
  { id: "2", name: "inactive", label: "Inactive" },
  { id: "3", name: "blocked", label: "Blocked" },
]

type Props = {
  params: { id: string }
}

export default function EditUserPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const userId = unwrappedParams.id
  
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the user data
    const foundUser = users.find(u => u.id === userId)
    if (foundUser) {
      setUser(foundUser)
      setName(foundUser.name)
      setEmail(foundUser.email)
      setPhone(foundUser.phone)
      setCity(foundUser.city)
      setRole(foundUser.role)
      setStatus(foundUser.status)
    }
  }, [userId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to update the user
    setTimeout(() => {
      // In a real app, this would be an API call to update the user
      console.log({
        id: userId,
        name,
        email,
        phone,
        city,
        role,
        status
      })
      
      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the user details page
        router.push(`/admin/users/${userId}`)
      }, 1500)
    }, 1000)
  }

  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">The user you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">Update user information for {user.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update the user details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Admin users have full access to all features and can manage other users.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Blocked users cannot log in or make bookings. Inactive users have not completed registration.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/users/${userId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Registered On</h3>
                  <p className="mt-2 text-lg font-medium">{user.registeredOn}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Login</h3>
                  <p className="mt-2 text-lg font-medium">{user.lastLogin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
