"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { BOOKING_API } from "@/config/api"
import { getAllCities, City } from "@/services/cityService"

// Interface for booking creation request
interface BookingCreateRequest {
  parent: {
    user_id?: number;
    parent_name: string;
    email: string;
    additional_phone: string;
  };
  children: {
    full_name: string;
    date_of_birth: string;
    school_name?: string;
    gender: string;
  };
  booking: {
    user_id?: number;
    event_id: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    terms_accepted: boolean;
  };
  booking_games: {
    game_id: number;
    child_index: number;
    game_price: number;
  };
}

// Interface for event from API
interface Event {
  id: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface for game from API
interface Game {
  id: number;
  name: string;
  description: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  categories: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for event game slot from API
interface EventGameSlot {
  id: number;
  event_id: number;
  game_id: number;
  custom_title: string;
  custom_description: string;
  custom_price: string;
  start_time: string;
  end_time: string;
  slot_price: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

// Interface for time slot selection
interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  custom_title: string;
  slot_price: string;
  max_participants: number;
}

export default function NewBookingPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Parent Information
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Child Information
  const [childName, setChildName] = useState("")
  const [childDateOfBirth, setChildDateOfBirth] = useState("")
  const [childGender, setChildGender] = useState("")
  const [schoolName, setSchoolName] = useState("")

  // Hierarchical Selection State
  const [selectedCityId, setSelectedCityId] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedGameId, setSelectedGameId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("")

  // Data state
  const [cities, setCities] = useState<City[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [eventGameSlots, setEventGameSlots] = useState<EventGameSlot[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch all cities first
        const citiesData = await getAllCities()
        console.log("Cities data loaded:", citiesData)
        setCities(citiesData.filter(city => city.is_active))

      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load cities data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchInitialData()
  }, [toast])

  // Handle city selection - fetch events for selected city
  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedEventId("")
    setSelectedGameId("")
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setEvents([])
    setGames([])
    setEventGameSlots([])
    setAvailableDates([])
    setAvailableTimeSlots([])

    if (!cityId) return

    try {
      setIsLoadingEvents(true)

      // Fetch events for the selected city
      const response = await fetch('/api/events/get-by-city', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_id: parseInt(cityId) }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch events for city")
      }

      const eventsData = await response.json()
      console.log("Events for city loaded:", eventsData)

      // Extract unique events from the event-game-slot data
      const uniqueEvents = eventsData.reduce((acc: Event[], slot: any) => {
        const existingEvent = acc.find(e => e.id === slot.event_id)
        if (!existingEvent) {
          acc.push({
            id: slot.event_id,
            title: slot.event_title,
            description: slot.event_description,
            city_id: slot.city_id,
            venue_id: slot.venue_id,
            event_date: slot.event_date,
            status: slot.event_status,
            created_at: slot.event_created_at,
            updated_at: slot.event_updated_at
          })
        }
        return acc
      }, [])

      setEvents(uniqueEvents)
      setEventGameSlots(eventsData)

    } catch (error) {
      console.error("Error fetching events for city:", error)
      toast({
        title: "Error",
        description: "Failed to load events for selected city",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Handle event selection - fetch games for selected event
  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId)
    setSelectedGameId("")
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setGames([])
    setAvailableDates([])
    setAvailableTimeSlots([])

    if (!eventId) return

    try {
      setIsLoadingGames(true)

      // Filter event game slots for the selected event
      const eventSlots = eventGameSlots.filter(slot => slot.event_id === parseInt(eventId))
      console.log("Event slots for selected event:", eventSlots)

      // Extract unique games from the event slots
      const uniqueGames = eventSlots.reduce((acc: Game[], slot: any) => {
        const existingGame = acc.find(g => g.id === slot.game_id)
        if (!existingGame) {
          acc.push({
            id: slot.game_id,
            name: slot.game_name,
            description: slot.game_description,
            min_age: slot.game_min_age,
            max_age: slot.game_max_age,
            duration_minutes: slot.game_duration_minutes,
            categories: slot.game_categories || [],
            is_active: slot.game_is_active,
            created_at: slot.game_created_at,
            updated_at: slot.game_updated_at
          })
        }
        return acc
      }, [])

      setGames(uniqueGames)

    } catch (error) {
      console.error("Error processing games for event:", error)
      toast({
        title: "Error",
        description: "Failed to load games for selected event",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGames(false)
    }
  }

  // Handle game selection - fetch available dates for selected game
  const handleGameChange = async (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setAvailableDates([])
    setAvailableTimeSlots([])

    if (!gameId || !selectedEventId) return

    try {
      setIsLoadingDates(true)

      // Filter event game slots for the selected event and game
      const gameSlots = eventGameSlots.filter(slot =>
        slot.event_id === parseInt(selectedEventId) && slot.game_id === parseInt(gameId)
      )
      console.log("Game slots for selected event and game:", gameSlots)

      // Extract unique dates from the game slots
      const uniqueDates = Array.from(new Set(
        gameSlots.map(slot => {
          // Find the event to get its date
          const event = events.find(e => e.id === slot.event_id)
          return event ? event.event_date.split('T')[0] : null
        }).filter(Boolean)
      )) as string[]

      setAvailableDates(uniqueDates)

    } catch (error) {
      console.error("Error processing dates for game:", error)
      toast({
        title: "Error",
        description: "Failed to load dates for selected game",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDates(false)
    }
  }

  // Handle date selection - fetch time slots for selected date and game
  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlotId("")
    setAvailableTimeSlots([])

    if (!date || !selectedGameId || !selectedEventId) return

    try {
      setIsLoadingTimeSlots(true)

      // Filter event game slots for the selected event, game, and date
      const dateSlots = eventGameSlots.filter(slot =>
        slot.event_id === parseInt(selectedEventId) &&
        slot.game_id === parseInt(selectedGameId)
      )
      console.log("Date slots for selected event, game, and date:", dateSlots)

      // Convert to time slot format
      const timeSlots: TimeSlot[] = dateSlots.map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        custom_title: slot.custom_title,
        slot_price: slot.slot_price,
        max_participants: slot.max_participants
      }))

      setAvailableTimeSlots(timeSlots)

    } catch (error) {
      console.error("Error processing time slots for date:", error)
      toast({
        title: "Error",
        description: "Failed to load time slots for selected date",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTimeSlots(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!parentName || !email || !phone || !childName || !childDateOfBirth || !childGender) {
        throw new Error("Please fill in all required fields")
      }

      if (!selectedEventId || !selectedGameId || !selectedTimeSlotId) {
        throw new Error("Please complete the event selection")
      }

      // Find selected data
      const selectedEvent = events.find(e => e.id.toString() === selectedEventId)
      const selectedGame = games.find(g => g.id.toString() === selectedGameId)
      const selectedSlot = availableTimeSlots.find(slot => slot.id.toString() === selectedTimeSlotId)

      if (!selectedEvent || !selectedGame || !selectedSlot) {
        throw new Error("Invalid selection. Please try again.")
      }

      // Calculate total amount (using slot price)
      const totalAmount = parseFloat(selectedSlot.slot_price)

      // Prepare booking request payload
      const bookingRequest: BookingCreateRequest = {
        parent: {
          user_id: 4, // Default user ID for admin created bookings
          parent_name: parentName,
          email: email,
          additional_phone: phone
        },
        children: {
          full_name: childName,
          date_of_birth: childDateOfBirth,
          school_name: schoolName || "",
          gender: childGender
        },
        booking: {
          user_id: 4, // Default user ID for admin created bookings
          event_id: selectedEvent.id,
          total_amount: totalAmount,
          payment_method: "Admin Created",
          payment_status: "Pending",
          terms_accepted: true
        },
        booking_games: {
          game_id: selectedGame.id,
          child_index: 0,
          game_price: totalAmount
        }
      }

      console.log("Creating booking with payload:", bookingRequest)

      // Call the real booking creation API
      const response = await fetch(BOOKING_API.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Failed to create booking: ${response.status}`

        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If we can't parse the error as JSON, use the status code
        }

        throw new Error(errorMessage)
      }

      const bookingResult = await response.json()
      console.log("Booking created successfully:", bookingResult)

      toast({
        title: "Success",
        description: "Booking created successfully",
      })

      // Redirect to the bookings list
      router.push("/admin/bookings")

    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
              <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading events and venues...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
            <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Enter the parent details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent name"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter the child details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={childDateOfBirth}
                    onChange={(e) => setChildDateOfBirth(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={childGender} onValueChange={setChildGender} required>
                    <SelectTrigger id="childGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Select city, event, game, date and time slot in order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={selectedCityId} onValueChange={handleCityChange} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id!.toString()}>
                        {city.city_name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select
                  value={selectedEventId}
                  onValueChange={handleEventChange}
                  required
                  disabled={!selectedCityId || isLoadingEvents}
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedCityId
                        ? "Select city first"
                        : isLoadingEvents
                          ? "Loading events..."
                          : events.length === 0
                            ? "No events available"
                            : "Select event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEvents ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    ) : events.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No events available for this city
                      </div>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Select
                  value={selectedGameId}
                  onValueChange={handleGameChange}
                  required
                  disabled={!selectedEventId || isLoadingGames}
                >
                  <SelectTrigger id="game">
                    <SelectValue placeholder={
                      !selectedEventId
                        ? "Select event first"
                        : isLoadingGames
                          ? "Loading games..."
                          : games.length === 0
                            ? "No games available"
                            : "Select game"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingGames ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading games...
                      </div>
                    ) : games.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No games available for this event
                      </div>
                    ) : (
                      games.map((game) => (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          {game.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Select
                    value={selectedDate}
                    onValueChange={handleDateChange}
                    required
                    disabled={!selectedGameId || isLoadingDates}
                  >
                    <SelectTrigger id="date">
                      <SelectValue placeholder={
                        !selectedGameId
                          ? "Select game first"
                          : isLoadingDates
                            ? "Loading dates..."
                            : availableDates.length === 0
                              ? "No dates available"
                              : "Select date"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDates ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading dates...
                        </div>
                      ) : availableDates.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No dates available for this game
                        </div>
                      ) : (
                        availableDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), "PPP")}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select
                    value={selectedTimeSlotId}
                    onValueChange={setSelectedTimeSlotId}
                    required
                    disabled={!selectedDate || isLoadingTimeSlots}
                  >
                    <SelectTrigger id="timeSlot">
                      <SelectValue placeholder={
                        !selectedDate
                          ? "Select date first"
                          : isLoadingTimeSlots
                            ? "Loading time slots..."
                            : availableTimeSlots.length === 0
                              ? "No time slots available"
                              : "Select time slot"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTimeSlots ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading time slots...
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No time slots available for this date
                        </div>
                      ) : (
                        availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id.toString()}>
                            <div className="flex flex-col">
                              <span>{slot.start_time} - {slot.end_time}</span>
                              <span className="text-xs text-muted-foreground">
                                {slot.custom_title} (₹{slot.slot_price})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTimeSlotId && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <div className="text-sm">
                    <p className="font-medium">Selected Time Slot Details:</p>
                    {(() => {
                      const slot = availableTimeSlots.find(s =>
                        s.id.toString() === selectedTimeSlotId
                      )
                      return slot ? (
                        <div className="mt-1 space-y-1">
                          <p>Game: {slot.custom_title}</p>
                          <p>Time: {slot.start_time} - {slot.end_time}</p>
                          <p>Price: ₹{slot.slot_price}</p>
                          <p>Max Participants: {slot.max_participants}</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/bookings">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
