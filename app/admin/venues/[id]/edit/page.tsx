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
const venues = [
  {
    id: "1",
    name: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    address: "Gachibowli, Hyderabad, Telangana 500032",
    capacity: 500,
    events: 12,
    isActive: true,
  },
  {
    id: "2",
    name: "Indoor Stadium",
    city: "Chennai",
    address: "Jawaharlal Nehru Stadium, Chennai, Tamil Nadu 600003",
    capacity: 300,
    events: 6,
    isActive: true,
  },
  {
    id: "3",
    name: "Indoor Stadium",
    city: "Bangalore",
    address: "Koramangala, Bangalore, Karnataka 560034",
    capacity: 250,
    events: 8,
    isActive: true,
  },
  {
    id: "4",
    name: "Sports Complex",
    city: "Vizag",
    address: "Beach Road, Visakhapatnam, Andhra Pradesh 530017",
    capacity: 200,
    events: 4,
    isActive: true,
  },
  {
    id: "5",
    name: "Indoor Stadium",
    city: "Mumbai",
    address: "Andheri Sports Complex, Mumbai, Maharashtra 400053",
    capacity: 350,
    events: 5,
    isActive: true,
  },
  {
    id: "6",
    name: "Sports Complex",
    city: "Delhi",
    address: "Indira Gandhi Sports Complex, Delhi 110002",
    capacity: 400,
    events: 6,
    isActive: true,
  },
  {
    id: "7",
    name: "Indoor Stadium",
    city: "Kolkata",
    address: "Salt Lake Stadium, Kolkata, West Bengal 700098",
    capacity: 300,
    events: 3,
    isActive: true,
  },
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

type Props = {
  params: { id: string }
}

export default function EditVenuePage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const venueId = unwrappedParams.id
  
  const [venue, setVenue] = useState<any>(null)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [capacity, setCapacity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the venue data
    const foundVenue = venues.find(v => v.id === venueId)
    if (foundVenue) {
      setVenue(foundVenue)
      setName(foundVenue.name)
      setCity(foundVenue.city)
      setAddress(foundVenue.address)
      setCapacity(foundVenue.capacity.toString())
      setIsActive(foundVenue.isActive)
    }
  }, [venueId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to update the venue
    setTimeout(() => {
      // In a real app, this would be an API call to update the venue
      console.log({
        id: venueId,
        name,
        city,
        address,
        capacity: parseInt(capacity),
        isActive,
      })
      
      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the venue details page
        router.push(`/admin/venues/${venueId}`)
      }, 1500)
    }, 1000)
  }

  if (!venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Venue not found</h2>
          <p className="text-muted-foreground">The venue you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/venues")}>
            Back to Venues
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
            <Link href={`/admin/venues/${venueId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Venue</h1>
            <p className="text-muted-foreground">Update venue information for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Update the venue details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter venue name"
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
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter venue address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input 
                id="capacity" 
                type="number"
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                placeholder="Enter venue capacity"
                min="1"
                required
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active-status">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive venues will not be shown on the website
                </p>
              </div>
              <Switch 
                id="active-status" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/venues/${venueId}`}>
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
              <CardTitle>Venue Statistics</CardTitle>
              <CardDescription>View statistics for this venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Events</h3>
                  <p className="mt-2 text-2xl font-bold">{venue.events}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                  <p className="mt-2 text-2xl font-bold">{venue.capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
