"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Edit, Copy, X, Check, AlertTriangle, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { getAllBookings, updateBookingStatus, Booking } from "@/services/bookingService"
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

// Booking statuses for filtering
const statusOptions = [
  { id: "1", name: "Confirmed", value: "confirmed" },
  { id: "2", name: "Pending", value: "pending" },
  { id: "3", name: "Cancelled", value: "cancelled" },
  { id: "4", name: "Completed", value: "completed" },
  { id: "5", name: "No Show", value: "no show" },
]

// Booking statuses
const statuses = [
  { id: "1", name: "Confirmed" },
  { id: "2", name: "Pending" },
  { id: "3", name: "Cancelled" },
  { id: "4", name: "Completed" },
  { id: "5", name: "No Show" },
]

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "cancelled":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
    case "completed":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    case "no show":
      return <Badge variant="outline">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function BookingsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [cities, setCities] = useState<{id: string, name: string}[]>([])
  const [events, setEvents] = useState<{id: string, name: string}[]>([])

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getAllBookings()
        setBookings(data)

        // Extract unique cities and events from the bookings data
        const uniqueCities = Array.from(new Set(data.map(booking => booking.city_name)))
          .map((cityName, index) => ({ id: String(index + 1), name: cityName as string }))

        const uniqueEvents = Array.from(new Set(data.map(booking => booking.event_title)))
          .map((eventTitle, index) => ({ id: String(index + 1), name: eventTitle as string }))

        setCities(uniqueCities)
        setEvents(uniqueEvents)
      } catch (error: any) {
        console.error("Failed to fetch bookings:", error)
        setError(error.message || "Failed to load bookings. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, []) // Removed toast from dependency array to prevent infinite loop

  // Handle confirm booking
  const handleConfirmBooking = async (id: number) => {
    try {
      setIsProcessing(id)

      // Call the API to update the booking status
      await updateBookingStatus(id, "Confirmed")

      // Update the local state
      setBookings(bookings.map(booking =>
        booking.booking_id === id ? { ...booking, booking_status: "Confirmed" } : booking
      ))

      toast({
        title: "Success",
        description: `Booking #${id} has been confirmed.`,
      })
    } catch (error: any) {
      console.error(`Failed to confirm booking ${id}:`, error)
      toast({
        title: "Error",
        description: "Failed to confirm booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (id: number) => {
    try {
      setIsProcessing(id)

      // Call the API to update the booking status
      await updateBookingStatus(id, "Cancelled")

      // Update the local state
      setBookings(bookings.map(booking =>
        booking.booking_id === id ? { ...booking, booking_status: "Cancelled" } : booking
      ))

      toast({
        title: "Success",
        description: `Booking #${id} has been cancelled.`,
      })
    } catch (error: any) {
      console.error(`Failed to cancel booking ${id}:`, error)
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter((booking) => {
    // Search query filter
    if (
      searchQuery &&
      !String(booking.booking_id).includes(searchQuery) &&
      !booking.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !booking.parent_email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !booking.parent_additional_phone.includes(searchQuery) &&
      !booking.event_title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // City filter
    if (selectedCity !== "all" && booking.city_name !== selectedCity) {
      return false
    }

    // Event filter
    if (selectedEvent !== "all" && booking.event_title !== selectedEvent) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && booking.booking_status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false
    }

    // Date filter
    if (selectedDate) {
      try {
        const bookingDate = format(parseISO(booking.event_event_date), "yyyy-MM-dd")
        const filterDate = format(selectedDate, "yyyy-MM-dd")
        if (bookingDate !== filterDate) {
          return false
        }
      } catch (error) {
        console.error("Error parsing date:", error)
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage NIBOG event bookings</p>
        </div>
        <Button asChild>
          <Link href="/admin/bookings/new">
            <Eye className="mr-2 h-4 w-4" />
            Create New Booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.name}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal md:w-[180px]",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(selectedCity || selectedEvent || selectedStatus || selectedDate) && (
                <Button
                  variant="ghost"
                  className="h-9"
                  onClick={() => {
                    setSelectedCity("all")
                    setSelectedEvent("all")
                    setSelectedStatus("all")
                    setSelectedDate(undefined)
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Child</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <div className="mt-2">Loading bookings...</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-destructive">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell className="font-medium">{booking.booking_id}</TableCell>
                  <TableCell>
                    {booking.parent_name}
                    <div className="text-xs text-muted-foreground">{booking.parent_email}</div>
                  </TableCell>
                  <TableCell>
                    {booking.child_full_name}
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.child_date_of_birth).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{booking.event_title}</TableCell>
                  <TableCell>{booking.city_name}</TableCell>
                  <TableCell>
                    {new Date(booking.event_event_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₹{booking.total_amount}</TableCell>
                  <TableCell>{getStatusBadge(booking.booking_status.toLowerCase())}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bookings/${booking.booking_id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bookings/${booking.booking_id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {booking.booking_status.toLowerCase() === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleConfirmBooking(booking.booking_id)}
                          disabled={isProcessing === booking.booking_id}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Confirm</span>
                        </Button>
                      )}
                      {booking.booking_status.toLowerCase() === "confirmed" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                                  <div className="space-y-2">
                                    <div className="font-medium">Are you sure you want to cancel this booking?</div>
                                    <div>
                                      This will cancel booking {booking.booking_id} for {booking.parent_name} for the {booking.event_title} event.
                                      The user will be notified and may be eligible for a refund.
                                    </div>
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleCancelBooking(booking.booking_id)}
                                disabled={isProcessing === booking.booking_id}
                              >
                                {isProcessing === booking.booking_id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : "Yes, Cancel Booking"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
