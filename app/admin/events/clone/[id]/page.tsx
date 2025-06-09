"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, Copy, Check, AlertTriangle } from "lucide-react"
import { format, addDays, addWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getEventById, createEvent, formatEventDataForAPI, EventListItem } from "@/services/eventService"
import { getAllCities, City } from "@/services/cityService"
import { getVenuesByCity, Venue } from "@/services/venueService"

type Props = {
  params: { id: string }
}

export default function CloneEventPage({ params }: Props) {
  const router = useRouter()
  const eventId = params.id

  // State for source event and loading
  const [sourceEvent, setSourceEvent] = useState<EventListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<City[]>([])
  const [venues, setVenues] = useState<Venue[]>([])

  // Form state
  const [cloneType, setCloneType] = useState<"single" | "multiple">("single")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [eventStatus, setEventStatus] = useState("draft")
  const [cloneSlots, setCloneSlots] = useState(true)

  // Multiple dates options
  const [repeatType, setRepeatType] = useState<"daily" | "weekly">("weekly")
  const [repeatCount, setRepeatCount] = useState(4)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])

  // Custom time slots when not cloning
  const [customSlots, setCustomSlots] = useState<Array<{
    id: string
    startTime: string
    endTime: string
    price: number
    maxParticipants: number
  }>>([{
    id: "1",
    startTime: "10:00",
    endTime: "11:00",
    price: 500,
    maxParticipants: 12
  }])

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city_id.toString() === selectedCity)
    : []

  // Fetch source event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)
        const event = await getEventById(parseInt(eventId))
        setSourceEvent(event)

        // Pre-fill form with source event data
        setEventTitle(`${event.event_title || 'Event'} (Copy)`)
        setEventDescription(event.event_description || "")
        setSelectedCity(event.city_id?.toString() || "")
        setSelectedVenue(event.venue_id?.toString() || "")
        setSelectedDate(addDays(new Date(event.event_date), 7)) // Default to one week later
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [eventId])

  // Fetch cities and venues
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesData] = await Promise.all([
          getAllCities()
        ])
        setCities(citiesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load cities and venues",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  // Fetch venues when city changes
  useEffect(() => {
    const fetchVenues = async () => {
      if (selectedCity) {
        try {
          const venuesData = await getVenuesByCity(parseInt(selectedCity))
          setVenues(venuesData)
        } catch (error) {
          console.error("Error fetching venues:", error)
          toast({
            title: "Error",
            description: "Failed to load venues",
            variant: "destructive",
          })
        }
      } else {
        setVenues([])
      }
    }

    fetchVenues()
  }, [selectedCity])

  // Generate dates for multiple events
  useEffect(() => {
    if (cloneType === "multiple" && selectedDate) {
      const dates = []
      for (let i = 0; i < repeatCount; i++) {
        if (repeatType === "daily") {
          dates.push(addDays(selectedDate, i))
        } else {
          dates.push(addWeeks(selectedDate, i))
        }
      }
      setSelectedDates(dates)
    }
  }, [cloneType, selectedDate, repeatType, repeatCount])

  // Generate dates based on repeat options
  const generateDates = () => {
    if (!selectedDate) return
    
    const dates: Date[] = [selectedDate]
    
    for (let i = 1; i < repeatCount; i++) {
      const newDate = repeatType === "daily"
        ? addDays(selectedDate, i)
        : addWeeks(selectedDate, i)
      
      dates.push(newDate)
    }
    
    setSelectedDates(dates)
  }

  useEffect(() => {
    if (cloneType === "multiple" && selectedDate) {
      generateDates()
    }
  }, [cloneType, selectedDate, repeatType, repeatCount])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedVenue || !selectedDate || !eventTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate custom slots if not cloning
    if (!cloneSlots && customSlots.some(slot => !slot.startTime || !slot.endTime || slot.price <= 0 || slot.maxParticipants <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all time slot details correctly.",
        variant: "destructive",
      })
      return
    }

    // For multiple dates, validate that dates are generated
    if (cloneType === "multiple" && selectedDates.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a start date for multiple events.",
        variant: "destructive",
      })
      return
    }

    try {
      if (cloneType === "single") {
        // Prepare games data for single event
        const gamesData = sourceEvent?.games.map(game => ({
          templateId: game.game_id.toString(),
          customTitle: game.custom_title,
          customDescription: game.custom_description,
          customPrice: game.custom_price,
          slots: cloneSlots
            ? [{
                id: "1",
                startTime: game.start_time.substring(0, 5), // Remove seconds
                endTime: game.end_time.substring(0, 5), // Remove seconds
                price: game.slot_price,
                maxParticipants: game.max_participants,
              }]
            : customSlots.map(slot => ({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                price: slot.price,
                maxParticipants: slot.maxParticipants,
              }))
        })) || []

        // Clone single event
        const eventData = formatEventDataForAPI({
          title: eventTitle,
          description: eventDescription,
          venueId: selectedVenue,
          date: format(selectedDate, "yyyy-MM-dd"),
          status: eventStatus,
          games: gamesData,
          cityId: parseInt(selectedCity),
        })

        await createEvent(eventData)

        toast({
          title: "Success",
          description: "Event cloned successfully!",
        })
      } else {
        // Clone multiple events
        for (const date of selectedDates) {
          // Prepare games data for each event
          const gamesData = sourceEvent?.games.map(game => ({
            templateId: game.game_id.toString(),
            customTitle: game.custom_title,
            customDescription: game.custom_description,
            customPrice: game.custom_price,
            slots: cloneSlots
              ? [{
                  id: "1",
                  startTime: game.start_time.substring(0, 5), // Remove seconds
                  endTime: game.end_time.substring(0, 5), // Remove seconds
                  price: game.slot_price,
                  maxParticipants: game.max_participants,
                }]
              : customSlots.map(slot => ({
                  id: slot.id,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  price: slot.price,
                  maxParticipants: slot.maxParticipants,
                }))
          })) || []

          const eventData = formatEventDataForAPI({
            title: `${eventTitle} - ${format(date, "MMM dd")}`,
            description: eventDescription,
            venueId: selectedVenue,
            date: format(date, "yyyy-MM-dd"),
            status: eventStatus,
            games: gamesData,
            cityId: parseInt(selectedCity),
          })

          await createEvent(eventData)
        }

        toast({
          title: "Success",
          description: `${selectedDates.length} events cloned successfully!`,
        })
      }

      // Redirect to events list after a short delay
      setTimeout(() => {
        router.push("/admin/events")
      }, 1500)

    } catch (error: any) {
      console.error("Error cloning event:", error)
      toast({
        title: "Error",
        description: `Failed to clone event: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Fetching event data...</p>
        </div>
      </div>
    )
  }

  if (!sourceEvent) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clone Event</h1>
          <p className="text-muted-foreground">Create a copy of {sourceEvent.event_title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clone Options</CardTitle>
              <CardDescription>Choose how you want to clone this event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={cloneType} onValueChange={(value) => setCloneType(value as "single" | "multiple")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Event</TabsTrigger>
                  <TabsTrigger value="multiple">Multiple Dates</TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Event Date</Label>
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
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </TabsContent>
                <TabsContent value="multiple" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>First Event Date</Label>
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
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="repeatType">Repeat</Label>
                      <Select value={repeatType} onValueChange={(value) => setRepeatType(value as "daily" | "weekly")}>
                        <SelectTrigger id="repeatType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repeatCount">Number of Events</Label>
                      <Input
                        id="repeatCount"
                        type="number"
                        min="2"
                        max="12"
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="rounded-md border p-4">
                      <h3 className="mb-2 text-sm font-medium">Generated Dates:</h3>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {selectedDates.map((date, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{format(date, "PPP")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cloneSlots"
                  checked={cloneSlots}
                  onCheckedChange={(checked) => setCloneSlots(checked as boolean)}
                />
                <Label htmlFor="cloneSlots">Clone time slots</Label>
              </div>

              {!cloneSlots && (
                <Card>
                  <CardHeader>
                    <CardTitle>Time Slots</CardTitle>
                    <CardDescription>Configure time slots for the cloned event</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customSlots.map((slot, index) => (
                      <div key={slot.id} className="grid gap-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Slot {index + 1}</h4>
                          {customSlots.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCustomSlots(customSlots.filter((_, i) => i !== index))
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                            <Input
                              id={`startTime-${index}`}
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => {
                                const newSlots = [...customSlots]
                                newSlots[index].startTime = e.target.value
                                setCustomSlots(newSlots)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`endTime-${index}`}>End Time</Label>
                            <Input
                              id={`endTime-${index}`}
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => {
                                const newSlots = [...customSlots]
                                newSlots[index].endTime = e.target.value
                                setCustomSlots(newSlots)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`price-${index}`}>Price (₹)</Label>
                            <Input
                              id={`price-${index}`}
                              type="number"
                              min="0"
                              value={slot.price}
                              onChange={(e) => {
                                const newSlots = [...customSlots]
                                newSlots[index].price = parseInt(e.target.value) || 0
                                setCustomSlots(newSlots)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`maxParticipants-${index}`}>Max Participants</Label>
                            <Input
                              id={`maxParticipants-${index}`}
                              type="number"
                              min="1"
                              value={slot.maxParticipants}
                              onChange={(e) => {
                                const newSlots = [...customSlots]
                                newSlots[index].maxParticipants = parseInt(e.target.value) || 1
                                setCustomSlots(newSlots)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCustomSlots([...customSlots, {
                          id: (customSlots.length + 1).toString(),
                          startTime: "10:00",
                          endTime: "11:00",
                          price: 500,
                          maxParticipants: 12
                        }])
                      }}
                    >
                      Add Time Slot
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Update details for the cloned event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter event description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select 
                  value={selectedCity} 
                  onValueChange={(value) => {
                    setSelectedCity(value)
                    setSelectedVenue("")
                  }}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id?.toString() || ""}>
                        {city.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Select
                  value={selectedVenue}
                  onValueChange={setSelectedVenue}
                  disabled={!selectedCity}
                >
                  <SelectTrigger id="venue">
                    <SelectValue placeholder={selectedCity ? "Select a venue" : "Select a city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id?.toString() || ""}>
                        {venue.venue_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={eventStatus} onValueChange={setEventStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/events/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">
                <Copy className="mr-2 h-4 w-4" />
                {cloneType === "single" ? "Clone Event" : `Clone to ${repeatCount} Events`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
