"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { TimePickerDemo } from "@/components/time-picker"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    venue: {
      name: "Little Explorers Center",
      city: "Mumbai",
    },
    date: "2025-04-15",
    gameTemplate: {
      suggestedPrice: 799,
      durationMinutes: 90,
    },
  },
]

type Props = {
  params: { id: string }
}

export default function NewSlotPage({ params }: Props) {
  const router = useRouter()
  const event = events.find((e) => e.id === params.id)
  
  const [startTime, setStartTime] = useState<Date | undefined>(new Date())
  const [endTime, setEndTime] = useState<Date | undefined>(new Date())
  const [price, setPrice] = useState(event?.gameTemplate.suggestedPrice || 799)
  const [maxParticipants, setMaxParticipants] = useState(12)
  const [status, setStatus] = useState("active")

  if (!event) {
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

  // Initialize end time based on start time and duration
  const initializeEndTime = (start: Date) => {
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + (event?.gameTemplate.durationMinutes || 90))
    setEndTime(end)
  }

  // Handle start time change
  const handleStartTimeChange = (time: Date | undefined) => {
    setStartTime(time)
    if (time) {
      initializeEndTime(time)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!startTime || !endTime) {
      alert("Please select start and end times.")
      return
    }
    
    if (startTime >= endTime) {
      alert("End time must be after start time.")
      return
    }
    
    if (price <= 0) {
      alert("Price must be greater than zero.")
      return
    }
    
    if (maxParticipants <= 0) {
      alert("Maximum participants must be greater than zero.")
      return
    }
    
    // In a real app, this would be an API call to create the slot
    console.log({
      eventId: params.id,
      startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      price,
      maxParticipants,
      status,
    })
    
    // Redirect to event slots page
    router.push(`/admin/events/${params.id}/slots`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${params.id}/slots`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Time Slot</h1>
          <p className="text-muted-foreground">
            {event.title} | {event.venue.name}, {event.venue.city} | {event.date}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Details</CardTitle>
            <CardDescription>Define a new time slot for this event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <TimePickerDemo
                  date={startTime}
                  setDate={handleStartTimeChange}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <TimePickerDemo
                  date={endTime}
                  setDate={setEndTime}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Suggested price: ₹{event.gameTemplate.suggestedPrice}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/events/${params.id}/slots`}>Cancel</Link>
            </Button>
            <Button type="submit">Add Time Slot</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
