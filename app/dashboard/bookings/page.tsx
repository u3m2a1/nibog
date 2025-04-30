"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Eye, Download, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
const upcomingBookings = [
  {
    id: "B001",
    eventName: "Baby Sensory Play",
    venue: "Little Explorers Center",
    city: "Mumbai",
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    child: "Aryan",
    status: "confirmed",
    price: 799,
    bookingDate: "2025-03-10",
    paymentStatus: "paid",
  },
  {
    id: "B003",
    eventName: "Toddler Music & Movement",
    venue: "Rhythm Studio",
    city: "Delhi",
    date: "2025-04-16",
    time: "11:00 AM - 12:30 PM",
    child: "Zara",
    status: "confirmed",
    price: 899,
    bookingDate: "2025-03-12",
    paymentStatus: "paid",
  },
]

const pastBookings = [
  {
    id: "B002",
    eventName: "Baby Swimming Intro",
    venue: "Aqua Tots Center",
    city: "Mumbai",
    date: "2025-03-22",
    time: "10:30 AM - 11:30 AM",
    child: "Aryan",
    status: "completed",
    price: 899,
    bookingDate: "2025-03-01",
    paymentStatus: "paid",
  },
  {
    id: "B004",
    eventName: "Parent-Baby Yoga",
    venue: "Zen Baby Studio",
    city: "Mumbai",
    date: "2025-03-20",
    time: "09:00 AM - 10:00 AM",
    child: "Zara",
    status: "cancelled",
    price: 699,
    bookingDate: "2025-02-25",
    paymentStatus: "refunded",
    cancellationReason: "Child was sick",
  },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter bookings based on search query
  const filteredUpcomingBookings = upcomingBookings.filter((booking) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      booking.eventName.toLowerCase().includes(query) ||
      booking.venue.toLowerCase().includes(query) ||
      booking.city.toLowerCase().includes(query) ||
      booking.child.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query)
    )
  })
  
  const filteredPastBookings = pastBookings.filter((booking) => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      booking.eventName.toLowerCase().includes(query) ||
      booking.venue.toLowerCase().includes(query) ||
      booking.city.toLowerCase().includes(query) ||
      booking.child.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query)
    )
  })

  // Handle booking cancellation
  const handleCancelBooking = (bookingId: string) => {
    // In a real app, this would be an API call to cancel the booking
    console.log("Cancel booking:", bookingId)
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your event bookings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Bookings</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-6">
              {filteredUpcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Upcoming Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any upcoming events booked."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredUpcomingBookings.map((booking) => (
                    <div key={booking.id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.eventName}</h3>
                            {booking.status === "confirmed" && (
                              <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                            )}
                            {booking.status === "pending" && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {booking.venue}, {booking.city}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{booking.date}</Badge>
                            <Badge variant="outline">{booking.time}</Badge>
                            <Badge variant="outline">₹{booking.price}</Badge>
                          </div>
                          <p className="pt-2 text-sm">
                            <span className="font-medium">Child:</span> {booking.child}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booking ID:</span> {booking.id}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booked on:</span> {booking.bookingDate}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.paymentStatus === "paid" ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.id}/ticket`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Ticket
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel Booking
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <p>
                                    Are you sure you want to cancel this booking? This action cannot be undone.
                                  </p>
                                  <div className="mt-4 rounded-md bg-muted p-3">
                                    <p className="font-medium">{booking.eventName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.date} | {booking.time}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.venue}, {booking.city}
                                    </p>
                                  </div>
                                  <Separator className="my-4" />
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Cancellation Policy:</strong> Full refund if cancelled at least 24 hours before the event. No refund for cancellations within 24 hours of the event.
                                  </p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Yes, Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="pt-6">
              {filteredPastBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Past Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any past events."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPastBookings.map((booking) => (
                    <div key={booking.id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.eventName}</h3>
                            {booking.status === "completed" && (
                              <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                            )}
                            {booking.status === "cancelled" && (
                              <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                            )}
                            {booking.status === "no_show" && (
                              <Badge className="bg-amber-500 hover:bg-amber-600">No Show</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {booking.venue}, {booking.city}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{booking.date}</Badge>
                            <Badge variant="outline">{booking.time}</Badge>
                            <Badge variant="outline">₹{booking.price}</Badge>
                          </div>
                          <p className="pt-2 text-sm">
                            <span className="font-medium">Child:</span> {booking.child}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booking ID:</span> {booking.id}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booked on:</span> {booking.bookingDate}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.paymentStatus === "paid" && (
                              <span className="text-green-600">Paid</span>
                            )}
                            {booking.paymentStatus === "refunded" && (
                              <span className="text-blue-600">Refunded</span>
                            )}
                          </p>
                          {booking.cancellationReason && (
                            <p className="text-sm">
                              <span className="font-medium">Cancellation Reason:</span>{" "}
                              {booking.cancellationReason}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          {booking.status === "completed" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/bookings/${booking.id}/review`}>
                                Write Review
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
