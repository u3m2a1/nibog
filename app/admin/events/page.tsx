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
import { deleteEvent, updateEvent } from "@/services/eventService"
import { getAllCities, City } from "@/services/cityService"
import { getVenuesByCity } from "@/services/venueService"
import { getAllBabyGames, BabyGame } from "@/services/babyGameService"
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



export default function EventsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [apiEvents, setApiEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [eventToUpdate, setEventToUpdate] = useState<string | null>(null)

  // State for filter data from APIs
  const [cities, setCities] = useState<City[]>([])
  const [venues, setVenues] = useState<any[]>([]) // Venues with city details
  const [gameTemplates, setGameTemplates] = useState<BabyGame[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Function to fetch events with complete information
  const fetchEventsWithGames = async () => {
    const response = await fetch('/api/events/get-all-with-games')
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`)
    }
    return response.json()
  }

  // Fetch events from API when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch events from the API with complete information
        const eventsData = await fetchEventsWithGames()

        if (eventsData.length === 0) {
          toast({
            title: "No Events Found",
            description: "There are no events in the database. You can create a new event using the 'Create New Event' button.",
            variant: "default",
          })
        }

        setApiEvents(eventsData)
      } catch (err: any) {
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

  // Fetch filter data (cities, venues, game templates) from APIs
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingFilters(true)

        // Fetch cities and games first
        const [citiesData, gamesData] = await Promise.all([
          getAllCities(),
          getAllBabyGames()
        ])

        setCities(citiesData)
        setGameTemplates(gamesData)

        // Fetch venues for each city using get-by-city API
        try {
          const allVenues: any[] = []

          // Fetch venues for each city
          for (const city of citiesData) {
            if (city.id) {
              try {
                const cityVenues = await getVenuesByCity(city.id)
                // Add city name to each venue
                const venuesWithCityName = cityVenues.map(venue => ({
                  ...venue,
                  city_name: city.city_name
                }))
                allVenues.push(...venuesWithCityName)
              } catch (cityVenueError) {
                // If fetching venues for a specific city fails, continue with other cities
                console.warn(`Failed to fetch venues for city ${city.city_name}:`, cityVenueError)
              }
            }
          }

          setVenues(allVenues)
        } catch (venueError) {
          // If venue fetching fails completely, set empty array
          setVenues([])
        }
      } catch (err: any) {
        toast({
          title: "Warning",
          description: "Some filter options may not be available due to a loading error.",
          variant: "default",
        })
      } finally {
        setIsLoadingFilters(false)
      }
    }

    fetchFilterData()
  }, [])

  // Convert API events to the format expected by the UI
  const convertedEvents = apiEvents && Array.isArray(apiEvents) ? apiEvents.map((apiEvent: any) => {
    // Extract games from the nested structure
    const games = apiEvent.games || [];
    const gameNames = games.map((game: any) => game.custom_title || game.game_title || "Unknown Game");
    const uniqueGameNames = [...new Set(gameNames)]; // Remove duplicates

    return {
      id: apiEvent.event_id?.toString() || "unknown",
      title: apiEvent.event_title || "Untitled Event",
      gameTemplate: uniqueGameNames.join(", ") || "Unknown", // Join all game names with commas
      venue: apiEvent.venue?.venue_name || "Unknown Venue",
      city: apiEvent.city?.city_name || "Unknown City",
      date: apiEvent.event_date ? apiEvent.event_date.split('T')[0] : "Unknown Date", // Format date to YYYY-MM-DD
      slots: games.map((game: any, index: number) => ({
        id: `${apiEvent.event_id || 'unknown'}-${game.game_id || 'unknown'}-${index}`,
        time: `${game.start_time || '00:00'} - ${game.end_time || '00:00'}`,
        capacity: game.max_participants || 0,
        booked: 0, // API doesn't provide this information
        status: "active" // Assuming all slots are active
      })),
      status: apiEvent.event_status ? apiEvent.event_status.toLowerCase() : "unknown"
    };
  }) : [];

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
  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;

    try {
      setIsDeletingEvent(true);
      setEventToDelete(eventId);

      // Call the API to delete the event
      const result = await deleteEvent(Number(eventId));

      // Check if the result indicates success (either directly or as an array with success property)
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });

        // Remove the deleted event from the state
        setApiEvents(prevEvents => {
          const filteredEvents = (prevEvents || []).filter(event => event.event_id.toString() !== eventId);
          return filteredEvents;
        });

        // Reset the event to delete
        setEventToDelete(null);
      } else {
        throw new Error("Failed to delete event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
      setEventToDelete(null);
    }
  };

  // Handle pause/resume event
  const handleToggleEventStatus = async (eventId: string, currentStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      setEventToUpdate(eventId);

      // Find the event in the current data
      const eventToUpdate = apiEvents.find(event => event.event_id.toString() === eventId);
      if (!eventToUpdate) {
        throw new Error("Event not found");
      }

      // Determine the new status
      const newStatus = currentStatus.toLowerCase() === "published" ? "Paused" : "Published";

      // Prepare the update data with all required fields
      const updateData = {
        id: Number(eventId),
        title: eventToUpdate.event_title,
        description: eventToUpdate.event_description,
        city_id: eventToUpdate.city?.city_id || eventToUpdate.city_id,
        venue_id: eventToUpdate.venue?.venue_id || eventToUpdate.venue_id,
        event_date: eventToUpdate.event_date.split('T')[0], // Format as YYYY-MM-DD
        status: newStatus,
        updated_at: new Date().toISOString(),
        games: eventToUpdate.games || []
      };

      // Call the API to update the event status
      const result = await updateEvent(updateData);

      // Check if the result indicates success
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: `Event ${newStatus.toLowerCase()} successfully`,
        });

        // Update the event status in the state
        setApiEvents(prevEvents => {
          return prevEvents.map(event =>
            event.event_id.toString() === eventId
              ? { ...event, event_status: newStatus }
              : event
          );
        });
      } else {
        throw new Error(`Failed to ${newStatus.toLowerCase()} event. Please try again.`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update event status. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setEventToUpdate(null);
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    try {
      setIsUpdatingStatus(true);
      setEventToUpdate(eventId);

      // Find the event in the current data
      const eventToCancel = apiEvents.find(event => event.event_id.toString() === eventId);
      if (!eventToCancel) {
        throw new Error("Event not found");
      }

      // Prepare the update data with all required fields
      const updateData = {
        id: Number(eventId),
        title: eventToCancel.event_title,
        description: eventToCancel.event_description,
        city_id: eventToCancel.city?.city_id || eventToCancel.city_id,
        venue_id: eventToCancel.venue?.venue_id || eventToCancel.venue_id,
        event_date: eventToCancel.event_date.split('T')[0], // Format as YYYY-MM-DD
        status: "Cancelled",
        updated_at: new Date().toISOString(),
        games: eventToCancel.games || []
      };

      // Call the API to cancel the event
      const result = await updateEvent(updateData);

      // Check if the result indicates success
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event cancelled successfully",
        });

        // Update the event status in the state
        setApiEvents(prevEvents => {
          return prevEvents.map(event =>
            event.event_id.toString() === eventId
              ? { ...event, event_status: "Cancelled" }
              : event
          );
        });
      } else {
        throw new Error("Failed to cancel event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setEventToUpdate(null);
    }
  };

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city_name === selectedCity)
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
                          <SelectItem key={city.id} value={city.city_name}>
                            {city.city_name}
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
                          <SelectItem key={venue.id} value={venue.venue_name}>
                            {venue.venue_name}
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
                          <SelectItem key={template.id} value={template.game_name}>
                            {template.game_name}
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
                          {event.gameTemplate && typeof event.gameTemplate === 'string' ?
                            event.gameTemplate.split(", ").map((game, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {game}
                              </Badge>
                            )) : (
                              <Badge variant="outline">Unknown</Badge>
                            )
                          }
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
                          {event.slots && Array.isArray(event.slots) && event.slots.length > 0 ?
                            event.slots.map((slot) => (
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
                            )) : (
                              <span className="text-xs text-muted-foreground">No slots</span>
                            )
                          }
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleEventStatus(event.id, event.status)}
                              disabled={isUpdatingStatus && eventToUpdate === event.id}
                            >
                              {isUpdatingStatus && eventToUpdate === event.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <Pause className="h-4 w-4" />
                              )}
                              <span className="sr-only">Pause event</span>
                            </Button>
                          )}
                          {event.status === "paused" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleEventStatus(event.id, event.status)}
                              disabled={isUpdatingStatus && eventToUpdate === event.id}
                            >
                              {isUpdatingStatus && eventToUpdate === event.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only">Resume event</span>
                            </Button>
                          )}
                          {(event.status === "published" || event.status === "paused" || event.status === "draft") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Cancel event</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this event? This will prevent any new bookings, but existing bookings will be maintained. This action can be reversed by editing the event status.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelEvent(event.id)}
                                    disabled={isUpdatingStatus && eventToUpdate === event.id}
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    {isUpdatingStatus && eventToUpdate === event.id ? (
                                      <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Cancelling...
                                      </>
                                    ) : (
                                      "Cancel Event"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                                  onClick={() => handleDeleteEvent(event.id)}
                                  disabled={isDeletingEvent && eventToDelete === event.id}
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
