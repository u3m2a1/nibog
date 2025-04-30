"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, MapPin, Loader2 } from "lucide-react"
import { getCityById, City } from "@/services/cityService"
import { toast } from "@/components/ui/use-toast"

// Mock venues data - in a real app, this would come from an API
// In a future implementation, we would create a venueService.ts file
const venues = [
  {
    id: "1",
    name: "Gachibowli Indoor Stadium",
    city_id: 1,
    address: "Gachibowli, Hyderabad, Telangana 500032",
    capacity: 500,
    events: 12,
    isActive: true,
  },
  {
    id: "2",
    name: "Hitex Exhibition Center",
    city_id: 1,
    address: "Hitex Road, Hyderabad, Telangana 500084",
    capacity: 300,
    events: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "LB Stadium",
    city_id: 1,
    address: "Liberty Rd, Hyderabad, Telangana 500001",
    capacity: 400,
    events: 6,
    isActive: true,
  },
  {
    id: "4",
    name: "Indoor Stadium",
    city_id: 3,
    address: "Jawaharlal Nehru Stadium, Chennai, Tamil Nadu 600003",
    capacity: 300,
    events: 6,
    isActive: true,
  },
]

// Mock events data - in a real app, this would come from an API
// In a future implementation, we would create an eventService.ts file
const events = [
  {
    id: "1",
    title: "Baby Crawling",
    city_id: 1,
    venue: "Gachibowli Indoor Stadium",
    date: "2025-10-26",
    registrations: 45,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Baby Walker",
    city_id: 1,
    venue: "Gachibowli Indoor Stadium",
    date: "2025-10-26",
    registrations: 38,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Running Race",
    city_id: 1,
    venue: "Hitex Exhibition Center",
    date: "2025-11-15",
    registrations: 52,
    status: "upcoming",
  },
]

export default function CityDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [city, setCity] = useState<City | null>(null)
  const [cityVenues, setCityVenues] = useState<any[]>([])
  const [cityEvents, setCityEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const cityId = parseInt(unwrappedParams.id)

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setIsLoading(true)
        // Fetch city data from API
        const cityData = await getCityById(cityId)
        setCity(cityData)

        // Filter venues for this city (using mock data for now)
        // In a real implementation, we would fetch venues by city ID from the API
        const filteredVenues = venues.filter(v => v.city_id === cityId)
        setCityVenues(filteredVenues)

        // Filter events for this city (using mock data for now)
        // In a real implementation, we would fetch events by city ID from the API
        const filteredEvents = events.filter(e => e.city_id === cityId)
        setCityEvents(filteredEvents)

        setError(null)
      } catch (err) {
        console.error(`Failed to fetch city with ID ${cityId}:`, err)
        setError("Failed to load city data. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load city data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (cityId) {
      fetchCityData()
    }
  }, [cityId])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading city data...</h2>
        </div>
      </div>
    )
  }

  if (error || !city) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{error || "City not found"}</h2>
          <p className="text-muted-foreground">The city you are looking for does not exist or could not be loaded.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/cities")}>
            Back to Cities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/cities")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{city.city_name}</h1>
            <p className="text-muted-foreground">{city.state}, India</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/cities/${city.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit City
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {city.is_active ? (
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{city.venues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{city.events}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Venues in {city.city_name}</h2>
          <p className="text-muted-foreground">List of venues where NIBOG events are held</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venue Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cityVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No venues found in {city.city_name}.
                  </TableCell>
                </TableRow>
              ) : (
                cityVenues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.address}</TableCell>
                    <TableCell>{venue.capacity}</TableCell>
                    <TableCell>{venue.events}</TableCell>
                    <TableCell>
                      {venue.isActive ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Upcoming Events in {city.city_name}</h2>
          <p className="text-muted-foreground">List of upcoming NIBOG events in this city</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cityEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No upcoming events in {city.city_name}.
                  </TableCell>
                </TableRow>
              ) : (
                cityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.registrations}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
