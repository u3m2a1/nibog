"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Search, Building, Calendar, Plus, ChevronRight, Clock, Users, DollarSign } from "lucide-react"
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

// Mock events data
const eventsByVenue = {
  "Gachibowli Indoor Stadium": [
    {
      id: "E001",
      title: "Baby Crawling Championship",
      date: "2025-10-15",
      status: "scheduled",
      registrations: 25,
      capacity: 40,
      gameTemplate: "Baby Crawling",
      slots: [
        { id: "S001", startTime: "09:00 AM", endTime: "10:30 AM", capacity: 15, bookedCount: 12, price: 799 },
        { id: "S002", startTime: "11:00 AM", endTime: "12:30 PM", capacity: 15, bookedCount: 8, price: 799 },
        { id: "S003", startTime: "02:00 PM", endTime: "03:30 PM", capacity: 10, bookedCount: 5, price: 699 },
      ]
    },
    {
      id: "E002",
      title: "Toddler Dance Party",
      date: "2025-11-05",
      status: "scheduled",
      registrations: 18,
      capacity: 30,
      gameTemplate: "Dance & Music",
      slots: [
        { id: "S004", startTime: "10:00 AM", endTime: "11:30 AM", capacity: 15, bookedCount: 10, price: 899 },
        { id: "S005", startTime: "01:00 PM", endTime: "02:30 PM", capacity: 15, bookedCount: 8, price: 899 },
      ]
    },
  ],
  "Hitex Exhibition Center": [
    {
      id: "E003",
      title: "Baby Walker Race",
      date: "2025-10-20",
      status: "scheduled",
      registrations: 22,
      capacity: 35,
      gameTemplate: "Baby Walker",
      slots: [
        { id: "S006", startTime: "09:30 AM", endTime: "11:00 AM", capacity: 20, bookedCount: 15, price: 849 },
        { id: "S007", startTime: "12:00 PM", endTime: "01:30 PM", capacity: 15, bookedCount: 7, price: 849 },
      ]
    },
  ],
  "Kids Paradise": [
    {
      id: "E004",
      title: "Baby Sensory Play",
      date: "2025-09-25",
      status: "active",
      registrations: 30,
      capacity: 30,
      gameTemplate: "Sensory Play",
      slots: [
        { id: "S008", startTime: "10:00 AM", endTime: "11:30 AM", capacity: 15, bookedCount: 15, price: 999 },
        { id: "S009", startTime: "01:00 PM", endTime: "02:30 PM", capacity: 15, bookedCount: 15, price: 999 },
      ]
    },
  ],
}

// Mock venue data
const venueData = {
  "Gachibowli Indoor Stadium": {
    id: "V001",
    name: "Gachibowli Indoor Stadium",
    address: "Gachibowli, Hyderabad",
    city: "Hyderabad",
    capacity: 500,
    facilities: ["Parking", "Restrooms", "Changing Rooms", "Cafeteria"],
    contactPerson: "Rajesh Kumar",
    contactPhone: "+91 98765 43210",
    contactEmail: "rajesh@gachibowlistadium.com",
  },
  "Hitex Exhibition Center": {
    id: "V002",
    name: "Hitex Exhibition Center",
    address: "Madhapur, Hyderabad",
    city: "Hyderabad",
    capacity: 800,
    facilities: ["Parking", "Restrooms", "Changing Rooms", "Food Court", "First Aid"],
    contactPerson: "Priya Sharma",
    contactPhone: "+91 87654 32109",
    contactEmail: "priya@hitex.com",
  },
  "Kids Paradise": {
    id: "V003",
    name: "Kids Paradise",
    address: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    capacity: 200,
    facilities: ["Parking", "Restrooms", "Changing Rooms", "Play Area"],
    contactPerson: "Amit Patel",
    contactPhone: "+91 76543 21098",
    contactEmail: "amit@kidsparadise.com",
  },
}

export default function EventsVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueName = decodeURIComponent(params.venue as string)
  const [searchQuery, setSearchQuery] = useState("")

  // Get venue data
  const venue = venueData[venueName]
  const events = eventsByVenue[venueName] || []

  // Filter events based on search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true

    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Calculate venue totals
  const venueTotals = {
    totalEvents: events.length,
    totalSlots: events.reduce((sum, event) => sum + event.slots.length, 0),
    totalRegistrations: events.reduce((sum, event) => sum + event.registrations, 0),
    totalCapacity: events.reduce((sum, event) => sum + event.capacity, 0),
  }

  if (!venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Venue Not Found</h2>
          <p className="text-muted-foreground">The venue you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events/cities">Back to Cities</Link>
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
            <Link href={`/admin/events/cities/${encodeURIComponent(venue.city)}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
            <p className="text-muted-foreground">{venue.address}, {venue.city}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/venues/${venue.id}/edit`}>
              Edit Venue
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/events/new?venue=${encodeURIComponent(venue.name)}`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Contact Person</h3>
                <p>{venue.contactPerson}</p>
                <p className="mt-1 text-sm text-muted-foreground">{venue.contactPhone}</p>
                <p className="text-sm text-muted-foreground">{venue.contactEmail}</p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Capacity</h3>
                <p>{venue.capacity} people</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-2 font-medium">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.facilities.map((facility, index) => (
                    <Badge key={index} variant="outline">{facility}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events at {venue.name}</CardTitle>
              <CardDescription>Manage games and events at this venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="transition-all duration-300 ease-in-out">
                  {filteredEvents.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-md border">
                      <p className="text-muted-foreground">No events found matching your search.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredEvents.map((event) => (
                        <div key={event.id} className="rounded-md border overflow-hidden">
                          <div
                            className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {event.gameTemplate} • {new Date(event.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-sm font-medium">Registrations</div>
                                <div className="flex items-center justify-end">
                                  <span className="mr-2">{event.registrations}/{event.capacity}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({Math.round((event.registrations / event.capacity) * 100)}%)
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">Status</div>
                                <Badge variant={event.status === "active" ? "default" : "outline"}>
                                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="mb-2 text-sm font-medium">Time Slots</h4>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Bookings</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {event.slots.map((slot) => (
                                    <TableRow key={slot.id}>
                                      <TableCell>
                                        {slot.startTime} - {slot.endTime}
                                      </TableCell>
                                      <TableCell>{slot.capacity}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <span className="mr-2">{slot.bookedCount}/{slot.capacity}</span>
                                          <span className="text-xs text-muted-foreground">
                                            ({Math.round((slot.bookedCount / slot.capacity) * 100)}%)
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>₹{slot.price}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/events/${event.id}/slots/${slot.id}/edit`}>
                                              Edit
                                            </Link>
                                          </Button>
                                          <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/events/${event.id}/slots/${slot.id}/participants`}>
                                              Participants
                                            </Link>
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button size="sm" asChild>
                                <Link href={`/admin/events/${event.id}/slots/new`}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Time Slot
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Events</span>
                </div>
                <span className="font-medium">{venueTotals.totalEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Time Slots</span>
                </div>
                <span className="font-medium">{venueTotals.totalSlots}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Registrations</span>
                </div>
                <span className="font-medium">{venueTotals.totalRegistrations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Capacity</span>
                </div>
                <span className="font-medium">{venueTotals.totalCapacity}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Fill Rate</span>
                </div>
                <span className="font-medium">
                  {Math.round((venueTotals.totalRegistrations / venueTotals.totalCapacity) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/admin/events/new?venue=${encodeURIComponent(venue.name)}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/edit`}>
                  Edit Venue Details
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/calendar`}>
                  View Venue Calendar
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/venues/${venue.id}/analytics`}>
                  Venue Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
