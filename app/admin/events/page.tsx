"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, Search, Filter, Eye, Edit, Copy, Pause, Play, X, MapPin, Building, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAllEvents, EventListItem, deleteEvent } from "@/services/eventService"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Fetch events from API when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching events from API...")

        // Fetch events from the API
        const eventsData = await getAllEvents()
        console.log("Events data from API:", eventsData)
        console.log(`Received ${eventsData.length} events from API`)

        if (eventsData.length === 0) {
          console.warn("No events found in the API response")
          toast({
            title: "No Events Found",
            description: "There are no events in the database. You can create a new event using the 'Create New Event' button.",
            variant: "default",
          })
        }

        setApiEvents(eventsData)
      } catch (err: any) {
        console.error("Failed to fetch events:", err)
        setError(err.message || "Failed to load events")
        toast({
          title: "Error",
          description: err.message || "Failed to load events",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Convert API events to the format expected by the UI
  const convertedEvents = apiEvents.map(apiEvent => {
    // Get all games for the event
    const gameNames = apiEvent.games.map(game => game.game_title);
    const uniqueGameNames = [...new Set(gameNames)]; // Remove duplicates

    return {
      id: apiEvent.event_id.toString(),
      title: apiEvent.event_title,
      gameTemplate: uniqueGameNames.join(", ") || "Unknown", // Join all game names with commas
      venue: apiEvent.venue_name,
      city: apiEvent.city_name,
      date: apiEvent.event_date.split('T')[0], // Format date to YYYY-MM-DD
      slots: apiEvent.games.map(game => ({
        id: `${apiEvent.event_id}-${game.game_id}`,
        time: `${game.start_time} - ${game.end_time}`,
        capacity: game.max_participants,
        booked: 0, // API doesn't provide this information
        status: "active" // Assuming all slots are active
      })),
      status: apiEvent.event_status.toLowerCase()
    };
  });

  // Always use API data, even if it's empty
  const eventsToUse = convertedEvents;

  // Filter events based on search and filters
  const filteredEvents = eventsToUse.filter((event) => {
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

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    console.log(`Starting deletion process for event ID: ${eventToDelete}`);

    try {
      setIsDeletingEvent(true);

      // Call the API to delete the event
      console.log(`Calling deleteEvent with ID: ${eventToDelete}`);
      const result = await deleteEvent(Number(eventToDelete));
      console.log("Delete event result:", JSON.stringify(result));

      // Check if the result indicates success (either directly or as an array with success property)
      const isSuccess = result.success || (Array.isArray(result) && result[0]?.success === true);
      console.log(`Delete operation success: ${isSuccess}`);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });

        // Remove the deleted event from the state
        console.log(`Removing event with ID ${eventToDelete} from state`);
        console.log(`Current events: ${apiEvents.map(e => e.event_id).join(', ')}`);

        setApiEvents(prevEvents => {
          const filteredEvents = prevEvents.filter(event => event.event_id.toString() !== eventToDelete);
          console.log(`Events after filtering: ${filteredEvents.map(e => e.event_id).join(', ')}`);
          return filteredEvents;
        });

        // Reset the event to delete
        setEventToDelete(null);
      } else {
        throw new Error("Failed to delete event. Please try again.");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);

      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

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
                        <SelectItem value="published">Published</SelectItem>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading events...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-destructive">
                      Error loading events: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {apiEvents.length === 0 ? (
                        <div>
                          <p>No events found in the database.</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Click the "Create New Event" button to add your first event.
                          </p>
                          <Button className="mt-4" asChild>
                            <Link href="/admin/events/new">
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Event
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <p>No events match your current filters.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          {event.gameTemplate.split(", ").map((game, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {game}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
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
                        {event.status === "published" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
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
                        {!["published", "draft", "paused", "cancelled", "completed"].includes(event.status) && (
                          <Badge>{event.status}</Badge>
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
                          {event.status === "published" && (
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
                          {(event.status === "published" || event.status === "paused" || event.status === "draft") && (
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel event</span>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete event</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this event? This action cannot be undone.
                                  All registrations and data associated with this event will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    console.log(`Setting event to delete: ${event.id}`);
                                    setEventToDelete(event.id);
                                    setTimeout(() => {
                                      handleDeleteEvent();
                                    }, 100); // Small delay to ensure state is updated
                                  }}
                                  disabled={isDeletingEvent}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {isDeletingEvent && eventToDelete === event.id ? (
                                    <>
                                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete Event"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
