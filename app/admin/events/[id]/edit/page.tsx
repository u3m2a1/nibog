"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    title: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors. This interactive session is designed to stimulate your baby's development through sensory exploration. Activities include tactile play, visual stimulation, and sound discovery. All materials used are baby-safe and age-appropriate.",
    gameTemplateId: "1",
    gameTemplate: {
      id: "1",
      name: "Baby Sensory Play",
      minAgeMonths: 6,
      maxAgeMonths: 18,
      durationMinutes: 90,
      suggestedPrice: 799,
    },
    venueId: "1",
    venue: {
      id: "1",
      name: "Little Explorers Center",
      address: "123 Play Street, Andheri West",
      city: "Mumbai",
    },
    cityId: "1",
    city: "Mumbai",
    date: "2025-04-15",
    slots: [
      {
        id: "S001",
        startTime: "10:00",
        endTime: "11:30",
        price: 799,
        maxParticipants: 12,
        currentParticipants: 7,
        status: "active",
      },
      {
        id: "S002",
        startTime: "14:00",
        endTime: "15:30",
        price: 799,
        maxParticipants: 12,
        currentParticipants: 4,
        status: "active",
      },
    ],
    status: "scheduled",
  },
]

// Mock cities data
const cities = [
  { id: "1", name: "Mumbai" },
  { id: "2", name: "Delhi" },
  { id: "3", name: "Bangalore" },
  { id: "4", name: "Chennai" },
  { id: "5", name: "Hyderabad" },
  { id: "6", name: "Pune" },
]

// Mock venues data
const venues = [
  { id: "1", name: "Little Explorers Center", city: "Mumbai" },
  { id: "2", name: "Rhythm Studio", city: "Delhi" },
  { id: "3", name: "Tiny Champions Arena", city: "Bangalore" },
  { id: "4", name: "Zen Baby Studio", city: "Mumbai" },
  { id: "5", name: "Aqua Tots Center", city: "Pune" },
  { id: "6", name: "Creative Kids Studio", city: "Chennai" },
  { id: "7", name: "Little Movers Gym", city: "Hyderabad" },
]

// Mock game templates data
const gameTemplates = [
  {
    id: "1",
    name: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    minAgeMonths: 6,
    maxAgeMonths: 18,
    durationMinutes: 90,
    suggestedPrice: 799
  },
  {
    id: "2",
    name: "Toddler Music & Movement",
    description: "Fun-filled session with music, dance, and movement activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    durationMinutes: 90,
    suggestedPrice: 899
  },
  {
    id: "3",
    name: "Baby Olympics",
    description: "Exciting mini-games and activities designed for babies to have fun and develop motor skills.",
    minAgeMonths: 8,
    maxAgeMonths: 24,
    durationMinutes: 120,
    suggestedPrice: 999
  },
]

type Props = {
  params: { id: string }
}

export default function EditEventPage({ params }: Props) {
  const router = useRouter()

  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const eventId = unwrappedParams.id

  const eventData = events.find((e) => e.id === eventId)

  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [eventStatus, setEventStatus] = useState("")
  const [showWarning, setShowWarning] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city === selectedCity)
    : []

  useEffect(() => {
    if (eventData) {
      setEventTitle(eventData.title)
      setEventDescription(eventData.description)
      setSelectedTemplate(eventData.gameTemplateId)
      setSelectedCity(eventData.city)
      setSelectedVenue(eventData.venueId)
      setSelectedDate(new Date(eventData.date))
      setEventStatus(eventData.status)

      // Check if event has any bookings
      const totalBookings = eventData.slots.reduce((acc, slot) => acc + slot.currentParticipants, 0)
      setHasBookings(totalBookings > 0)
    }
  }, [eventData])

  if (!eventData) {
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

  const handleVenueChange = (venueId: string) => {
    if (hasBookings && venueId !== selectedVenue) {
      setShowWarning(true)
    }
    setSelectedVenue(venueId)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (hasBookings && date && date.toDateString() !== selectedDate?.toDateString()) {
      setShowWarning(true)
    }
    setSelectedDate(date)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedTemplate || !selectedVenue || !selectedDate) {
      alert("Please fill in all required fields.")
      return
    }

    // In a real app, this would be an API call to update the event
    console.log({
      id: eventId,
      title: eventTitle,
      description: eventDescription,
      gameTemplateId: selectedTemplate,
      venueId: selectedVenue,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      status: eventStatus,
    })

    // Redirect to event details page
    router.push(`/admin/events/${eventId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">Update event details for {eventData.title}</p>
        </div>
      </div>

      {showWarning && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This event has existing bookings. Changing the venue or date will affect all bookings. Participants will be notified of these changes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Update the details for this event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gameTemplate">Game Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={hasBookings} // Disable changing template if there are bookings
              >
                <SelectTrigger id="gameTemplate">
                  <SelectValue placeholder="Select a game template" />
                </SelectTrigger>
                <SelectContent>
                  {gameTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasBookings && (
                <p className="text-xs text-muted-foreground">
                  Game template cannot be changed for events with existing bookings.
                </p>
              )}
            </div>

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
                  if (hasBookings) {
                    setShowWarning(true)
                  }
                }}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
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
              <Select
                value={selectedVenue}
                onValueChange={handleVenueChange}
                disabled={!selectedCity}
              >
                <SelectTrigger id="venue">
                  <SelectValue placeholder={selectedCity ? "Select a venue" : "Select a city first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVenues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={eventStatus} onValueChange={setEventStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/events/${params.id}`}>Cancel</Link>
            </Button>
            {hasBookings ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button">Save Changes</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                      This event has existing bookings. Changing details will notify all participants. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Save Changes</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button type="submit">Save Changes</Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
