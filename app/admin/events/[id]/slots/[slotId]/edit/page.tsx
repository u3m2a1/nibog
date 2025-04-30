"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { TimePickerDemo } from "@/components/time-picker"
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
    venue: {
      name: "Little Explorers Center",
      city: "Mumbai",
    },
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
  },
]

// Helper function to convert time string to Date object
const timeStringToDate = (timeStr: string): Date => {
  const [time, period] = timeStr.split(' ')
  const [hourStr, minuteStr] = time.split(':')
  let hour = parseInt(hourStr)
  const minute = parseInt(minuteStr)
  
  if (period === 'PM' && hour < 12) {
    hour += 12
  } else if (period === 'AM' && hour === 12) {
    hour = 0
  }
  
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  return date
}

type Props = {
  params: { id: string; slotId: string }
}

export default function EditSlotPage({ params }: Props) {
  const router = useRouter()
  const event = events.find((e) => e.id === params.id)
  const slot = event?.slots.find((s) => s.id === params.slotId)
  
  const [startTime, setStartTime] = useState<Date | undefined>()
  const [endTime, setEndTime] = useState<Date | undefined>()
  const [price, setPrice] = useState(0)
  const [maxParticipants, setMaxParticipants] = useState(0)
  const [status, setStatus] = useState("")
  const [showWarning, setShowWarning] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)

  useEffect(() => {
    if (slot) {
      setStartTime(timeStringToDate(slot.startTime))
      setEndTime(timeStringToDate(slot.endTime))
      setPrice(slot.price)
      setMaxParticipants(slot.maxParticipants)
      setStatus(slot.status)
      setHasBookings(slot.currentParticipants > 0)
    }
  }, [slot])

  if (!event || !slot) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Slot Not Found</h2>
          <p className="text-muted-foreground">The time slot you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href={`/admin/events/${params.id}/slots`}>Back to Slots</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Handle capacity change
  const handleCapacityChange = (value: number) => {
    if (hasBookings && value < slot.currentParticipants) {
      setShowWarning(true)
    }
    setMaxParticipants(value)
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
    
    if (hasBookings && maxParticipants < slot.currentParticipants) {
      alert("Cannot reduce capacity below current bookings.")
      return
    }
    
    // In a real app, this would be an API call to update the slot
    console.log({
      eventId: params.id,
      slotId: params.slotId,
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Time Slot</h1>
          <p className="text-muted-foreground">
            {event.title} | {event.venue.name}, {event.venue.city} | {event.date}
          </p>
        </div>
      </div>

      {showWarning && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This slot has {slot.currentParticipants} existing bookings. You cannot reduce capacity below this number.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Details</CardTitle>
            <CardDescription>Update details for this time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <TimePickerDemo
                  date={startTime}
                  setDate={setStartTime}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={hasBookings ? slot.currentParticipants : 1}
                  value={maxParticipants}
                  onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                />
                {hasBookings && (
                  <p className="text-xs text-muted-foreground">
                    Current bookings: {slot.currentParticipants}. Capacity cannot be reduced below this number.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  {hasBookings ? null : <SelectItem value="cancelled">Cancelled</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/events/${params.id}/slots`}>Cancel</Link>
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
                      This slot has existing bookings. Changing details will notify all participants. Are you sure you want to continue?
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
