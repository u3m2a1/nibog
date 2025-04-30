"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, Search, Filter, Eye, Edit, Copy, Pause, Play, X, MapPin, Building } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Crawling",
    gameTemplate: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    slots: [
      { id: "S001", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 12, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E002",
    title: "Baby Walker",
    gameTemplate: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    slots: [
      { id: "S003", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 15, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E003",
    title: "Running Race",
    gameTemplate: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    slots: [
      { id: "S004", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 10, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E004",
    title: "Hurdle Toddle",
    gameTemplate: "Hurdle Toddle",
    venue: "Indoor Stadium",
    city: "Chennai",
    date: "2025-03-16",
    slots: [
      { id: "S006", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 20, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E005",
    title: "Cycle Race",
    gameTemplate: "Cycle Race",
    venue: "Sports Complex",
    city: "Vizag",
    date: "2025-08-15",
    slots: [
      { id: "S008", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 12, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E006",
    title: "Ring Holding",
    gameTemplate: "Ring Holding",
    venue: "Indoor Stadium",
    city: "Bangalore",
    date: "2025-10-12",
    slots: [
      { id: "S009", time: "9:00 AM - 8:00 PM", capacity: 50, booked: 15, status: "active" },
    ],
    status: "draft",
  },
  {
    id: "E007",
    title: "Baby Gymnastics",
    gameTemplate: "Baby Gymnastics",
    venue: "Little Movers Gym",
    city: "Hyderabad",
    date: "2025-04-28",
    slots: [
      { id: "S010", time: "09:30 AM - 10:30 AM", capacity: 8, booked: 0, status: "active" },
      { id: "S011", time: "11:00 AM - 12:00 PM", capacity: 8, booked: 0, status: "active" },
    ],
    status: "scheduled",
  },
  {
    id: "E008",
    title: "Toddler Dance Party",
    gameTemplate: "Toddler Dance",
    venue: "Rhythm Studio",
    city: "Delhi",
    date: "2025-04-30",
    slots: [
      { id: "S012", time: "04:00 PM - 05:30 PM", capacity: 15, booked: 0, status: "active" },
    ],
    status: "scheduled",
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

// Mock venues data
const venues = [
  { id: "1", name: "Gachibowli Indoor Stadium", city: "Hyderabad" },
  { id: "2", name: "Indoor Stadium", city: "Chennai" },
  { id: "3", name: "Indoor Stadium", city: "Bangalore" },
  { id: "4", name: "Sports Complex", city: "Vizag" },
  { id: "5", name: "Indoor Stadium", city: "Mumbai" },
  { id: "6", name: "Sports Complex", city: "Delhi" },
  { id: "7", name: "Indoor Stadium", city: "Kolkata" },
]

// Mock game templates data
const gameTemplates = [
  { id: "1", name: "Baby Crawling" },
  { id: "2", name: "Baby Walker" },
  { id: "3", name: "Running Race" },
  { id: "4", name: "Hurdle Toddle" },
  { id: "5", name: "Cycle Race" },
  { id: "6", name: "Ring Holding" },
  { id: "7", name: "Ball Throw" },
  { id: "8", name: "Balancing Beam" },
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    // Search query filter
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.venue.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // City filter
    if (selectedCity && event.city !== selectedCity) {
      return false
    }

    // Venue filter
    if (selectedVenue && event.venue !== selectedVenue) {
      return false
    }

    // Game template filter
    if (selectedTemplate && event.gameTemplate !== selectedTemplate) {
      return false
    }

    // Status filter
    if (selectedStatus && event.status !== selectedStatus) {
      return false
    }

    // Date filter
    if (selectedDate && event.date !== format(selectedDate, "yyyy-MM-dd")) {
      return false
    }

    return true
  })

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city === selectedCity)
    : venues

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Events</h1>
          <p className="text-muted-foreground">Manage NIBOG baby games events across 21 cities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/events/cities">
              <MapPin className="mr-2 h-4 w-4" />
              Browse by City
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <div className="flex flex-1 items-center gap-2 sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Events</h4>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger id="venue">
                        <SelectValue placeholder="All Venues" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Venues</SelectItem>
                        {filteredVenues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.name}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Game Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="template">
                        <SelectValue placeholder="All Templates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Templates</SelectItem>
                        {gameTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCity("")
                        setSelectedVenue("")
                        setSelectedTemplate("")
                        setSelectedStatus("")
                        setSelectedDate(undefined)
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button>Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Game Template</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.gameTemplate}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/events/venues/${encodeURIComponent(event.venue)}`}
                          className="flex items-center hover:underline"
                        >
                          <Building className="mr-1 h-3 w-3 text-muted-foreground" />
                          {event.venue}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/events/cities/${encodeURIComponent(event.city)}`}
                          className="flex items-center hover:underline"
                        >
                          <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                          {event.city}
                        </Link>
                      </TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {event.slots.map((slot) => (
                            <div key={slot.id} className="flex items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full p-0",
                                  slot.status === "active" && "bg-green-500",
                                  slot.status === "paused" && "bg-amber-500",
                                  slot.status === "cancelled" && "bg-red-500"
                                )}
                              />
                              <span>
                                {slot.time} ({slot.booked}/{slot.capacity})
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.status === "scheduled" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Scheduled</Badge>
                        )}
                        {event.status === "draft" && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {event.status === "paused" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                        )}
                        {event.status === "cancelled" && (
                          <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                        )}
                        {event.status === "completed" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/events/${event.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit event</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/events/clone/${event.id}`}>
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Clone event</span>
                            </Link>
                          </Button>
                          {event.status === "scheduled" && (
                            <Button variant="ghost" size="icon">
                              <Pause className="h-4 w-4" />
                              <span className="sr-only">Pause event</span>
                            </Button>
                          )}
                          {event.status === "paused" && (
                            <Button variant="ghost" size="icon">
                              <Play className="h-4 w-4" />
                              <span className="sr-only">Resume event</span>
                            </Button>
                          )}
                          {(event.status === "scheduled" || event.status === "paused" || event.status === "draft") && (
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel event</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Calendar View</h3>
                  <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    View events organized by date in a calendar format. Coming soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
