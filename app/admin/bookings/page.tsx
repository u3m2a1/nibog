"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Edit, Copy, X, Check, AlertTriangle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
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
const bookings = [
  {
    id: "B001",
    user: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    event: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
  },
  {
    id: "B002",
    user: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    event: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "pending_payment",
  },
  {
    id: "B003",
    user: "Srujana",
    email: "srujana@example.com",
    phone: "+91 9876543212",
    event: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 2,
    amount: 3600,
    status: "confirmed",
  },
  {
    id: "B004",
    user: "Ramesh Kumar",
    email: "ramesh@example.com",
    phone: "+91 9876543213",
    event: "Hurdle Toddle",
    venue: "Indoor Stadium",
    city: "Chennai",
    date: "2025-03-16",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "cancelled_by_user",
  },
  {
    id: "B005",
    user: "Suresh Reddy",
    email: "suresh@example.com",
    phone: "+91 9876543214",
    event: "Cycle Race",
    venue: "Sports Complex",
    city: "Vizag",
    date: "2025-08-15",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
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
]

// Mock events data
const events = [
  { id: "1", name: "Baby Crawling" },
  { id: "2", name: "Baby Walker" },
  { id: "3", name: "Running Race" },
  { id: "4", name: "Hurdle Toddle" },
  { id: "5", name: "Cycle Race" },
  { id: "6", name: "Ring Holding" },
]

// Booking statuses
const statuses = [
  { id: "1", name: "confirmed" },
  { id: "2", name: "pending_payment" },
  { id: "3", name: "cancelled_by_user" },
  { id: "4", name: "cancelled_by_admin" },
  { id: "5", name: "attended" },
  { id: "6", name: "no_show" },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case "pending_payment":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Payment</Badge>
    case "cancelled_by_user":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled by User</Badge>
    case "cancelled_by_admin":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled by Admin</Badge>
    case "attended":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Attended</Badge>
    case "no_show":
      return <Badge variant="outline">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [bookingsList, setBookingsList] = useState(bookings)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Handle confirm booking
  const handleConfirmBooking = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to confirm the booking
    setTimeout(() => {
      // In a real app, this would be an API call to update the booking status
      setBookingsList(bookingsList.map(booking =>
        booking.id === id ? { ...booking, status: "confirmed" } : booking
      ))
      setIsProcessing(null)
    }, 1000)
  }

  // Handle cancel booking
  const handleCancelBooking = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to cancel the booking
    setTimeout(() => {
      // In a real app, this would be an API call to update the booking status
      setBookingsList(bookingsList.map(booking =>
        booking.id === id ? { ...booking, status: "cancelled_by_admin" } : booking
      ))
      setIsProcessing(null)
    }, 1000)
  }

  // Filter bookings based on search and filters
  const filteredBookings = bookingsList.filter((booking) => {
    // Search query filter
    if (
      searchQuery &&
      !booking.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !booking.user.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !booking.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !booking.phone.includes(searchQuery) &&
      !booking.event.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // City filter
    if (selectedCity !== "all" && booking.city !== selectedCity) {
      return false
    }

    // Event filter
    if (selectedEvent !== "all" && booking.event !== selectedEvent) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && booking.status !== selectedStatus) {
      return false
    }

    // Date filter
    if (selectedDate && booking.date !== format(selectedDate, "yyyy-MM-dd")) {
      return false
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
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    {booking.user}
                    <div className="text-xs text-muted-foreground">{booking.email}</div>
                  </TableCell>
                  <TableCell>{booking.event}</TableCell>
                  <TableCell>{booking.city}</TableCell>
                  <TableCell>
                    {booking.date}
                    <div className="text-xs text-muted-foreground">{booking.time}</div>
                  </TableCell>
                  <TableCell>{booking.children}</TableCell>
                  <TableCell>₹{booking.amount}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bookings/${booking.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {booking.status === "pending_payment" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={isProcessing === booking.id}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Confirm</span>
                        </Button>
                      )}
                      {booking.status === "confirmed" && (
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
                                      This will cancel booking {booking.id} for {booking.user} for the {booking.event} event.
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
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={isProcessing === booking.id}
                              >
                                {isProcessing === booking.id ? "Cancelling..." : "Yes, Cancel Booking"}
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
