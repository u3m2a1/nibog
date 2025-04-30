"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, MapPin, Building, Calendar, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// We'll implement animations without framer-motion

// Mock venues data
const venuesByCity = {
  "Hyderabad": [
    { id: "V001", name: "Gachibowli Indoor Stadium", address: "Gachibowli, Hyderabad", activeEvents: 2, upcomingEvents: 1 },
    { id: "V002", name: "Hitex Exhibition Center", address: "Madhapur, Hyderabad", activeEvents: 1, upcomingEvents: 1 },
    { id: "V003", name: "Kids Paradise", address: "Banjara Hills, Hyderabad", activeEvents: 1, upcomingEvents: 0 },
    { id: "V004", name: "Little Stars Center", address: "Jubilee Hills, Hyderabad", activeEvents: 1, upcomingEvents: 1 },
  ],
  "Mumbai": [
    { id: "V005", name: "Aqua Sports Complex", address: "Andheri, Mumbai", activeEvents: 1, upcomingEvents: 0 },
    { id: "V006", name: "Kids World", address: "Bandra, Mumbai", activeEvents: 2, upcomingEvents: 1 },
    { id: "V007", name: "Play Zone", address: "Juhu, Mumbai", activeEvents: 1, upcomingEvents: 1 },
  ],
  "Bangalore": [
    { id: "V008", name: "Little Explorers Hub", address: "Koramangala, Bangalore", activeEvents: 2, upcomingEvents: 1 },
    { id: "V009", name: "Tiny Tots Center", address: "Indiranagar, Bangalore", activeEvents: 2, upcomingEvents: 2 },
    { id: "V010", name: "Kids Adventure Zone", address: "Whitefield, Bangalore", activeEvents: 1, upcomingEvents: 0 },
    { id: "V011", name: "Baby Play Arena", address: "JP Nagar, Bangalore", activeEvents: 1, upcomingEvents: 1 },
    { id: "V012", name: "Toddler Town", address: "Marathahalli, Bangalore", activeEvents: 0, upcomingEvents: 0 },
  ],
}

// Mock events data
const eventsByVenue = {
  "Gachibowli Indoor Stadium": [
    { id: "E001", title: "Baby Crawling Championship", date: "2025-10-15", status: "scheduled", registrations: 25, capacity: 40 },
    { id: "E002", title: "Toddler Dance Party", date: "2025-11-05", status: "scheduled", registrations: 18, capacity: 30 },
  ],
  "Hitex Exhibition Center": [
    { id: "E003", title: "Baby Walker Race", date: "2025-10-20", status: "scheduled", registrations: 22, capacity: 35 },
  ],
  "Kids Paradise": [
    { id: "E004", title: "Baby Sensory Play", date: "2025-09-25", status: "active", registrations: 30, capacity: 30 },
  ],
}

export default function EventsCityPage() {
  const router = useRouter()
  const params = useParams()
  const cityName = decodeURIComponent(params.city as string)
  const [searchQuery, setSearchQuery] = useState("")

  // Get venues for this city
  const venues = venuesByCity[cityName] || []

  // Filter venues based on search query
  const filteredVenues = venues.filter(venue => {
    if (!searchQuery) return true

    return (
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Calculate city totals
  const cityTotals = {
    totalVenues: venues.length,
    activeEvents: venues.reduce((sum, venue) => sum + venue.activeEvents, 0),
    upcomingEvents: venues.reduce((sum, venue) => sum + venue.upcomingEvents, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events/cities">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cityName}</h1>
            <p className="text-muted-foreground">Manage venues and events in {cityName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/cities/${encodeURIComponent(cityName)}/edit`}>
              Edit City
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/venues/new?city=${encodeURIComponent(cityName)}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.totalVenues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.activeEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityTotals.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search venues in ${cityName}...`}
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="transition-all duration-300 ease-in-out space-y-6">
          {filteredVenues.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border">
              <p className="text-muted-foreground">No venues found matching your search.</p>
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden">
                <div
                  className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                  onClick={() => router.push(`/admin/events/venues/${encodeURIComponent(venue.name)}`)}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">{venue.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Active Events</div>
                      <div className="flex items-center justify-end">
                        <Badge variant={venue.activeEvents > 0 ? "default" : "outline"}>
                          {venue.activeEvents}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Upcoming Events</div>
                      <div className="flex items-center justify-end">
                        <Badge variant="outline">
                          {venue.upcomingEvents}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {eventsByVenue[venue.name] && (
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventsByVenue[venue.name].map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={event.status === "active" ? "default" : "outline"}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{event.registrations}/{event.capacity}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({Math.round((event.registrations / event.capacity) * 100)}%)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {!eventsByVenue[venue.name] && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No events found for this venue.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            ))
          )}
      </div>
    </div>
  )
}
