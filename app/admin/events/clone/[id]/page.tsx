"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, ArrowLeft, Copy, Check } from "lucide-react"
import { format, addDays, addWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

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
        startTime: "10:00 AM", 
        endTime: "11:30 AM", 
        price: 799, 
        maxParticipants: 12, 
        currentParticipants: 7, 
        status: "active",
      },
      { 
        id: "S002", 
        startTime: "02:00 PM", 
        endTime: "03:30 PM", 
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

type Props = {
  params: { id: string }
}

export default function CloneEventPage({ params }: Props) {
  const router = useRouter()
  const sourceEvent = events.find((e) => e.id === params.id)
  
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

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city === selectedCity)
    : []

  useEffect(() => {
    if (sourceEvent) {
      setEventTitle(`${sourceEvent.title} (Copy)`)
      setEventDescription(sourceEvent.description)
      setSelectedCity(sourceEvent.city)
      setSelectedVenue(sourceEvent.venueId)
      setSelectedDate(addDays(new Date(sourceEvent.date), 7)) // Default to one week later
    }
  }, [sourceEvent])

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!selectedVenue || !selectedDate) {
      alert("Please fill in all required fields.")
      return
    }
    
    // In a real app, this would be an API call to clone the event
    if (cloneType === "single") {
      console.log({
        sourceEventId: params.id,
        title: eventTitle,
        description: eventDescription,
        venueId: selectedVenue,
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        status: eventStatus,
        cloneSlots,
      })
    } else {
      console.log({
        sourceEventId: params.id,
        title: eventTitle,
        description: eventDescription,
        venueId: selectedVenue,
        dates: selectedDates.map(date => format(date, "yyyy-MM-dd")),
        status: eventStatus,
        cloneSlots,
      })
    }
    
    // Redirect to events list
    router.push("/admin/events")
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
          <p className="text-muted-foreground">Create a copy of {sourceEvent.title}</p>
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
                  onValueChange={setSelectedVenue}
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
