"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Edit, Copy, X, Check, AlertTriangle, Loader2, RefreshCw, CheckCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getAllBookings, getPaginatedBookings, updateBookingStatus, Booking, PaginatedBookingsResponse } from "@/services/bookingService"
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
  { id: "6", name: "Refunded", value: "refunded" },
]

// Booking statuses
const statuses = [
  { id: "1", name: "Confirmed" },
  { id: "2", name: "Pending" },
  { id: "3", name: "Cancelled" },
  { id: "4", name: "Completed" },
  { id: "5", name: "No Show" },
  { id: "6", name: "Refunded" },
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
      return <Badge className="bg-gray-500 hover:bg-gray-600">No Show</Badge>
    case "refunded":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Refunded</Badge>
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalBookings, setTotalBookings] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  // Fetch bookings from API with pagination
  const fetchBookings = async (page: number = currentPage, limit: number = pageSize) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getPaginatedBookings({ page, limit })
      // Ensure we're setting an empty array if data is null or undefined
      setBookings(response.data || [])
      console.log("Fetched bookings:", response.data)

      // Update pagination state
      setCurrentPage(response.pagination.page)
      setTotalBookings(response.pagination.total)
      setTotalPages(response.pagination.totalPages)
      setHasNext(response.pagination.hasNext)
      setHasPrev(response.pagination.hasPrev)

      // Only extract unique cities and events if there is actual data
      if (response.data && response.data.length > 0) {
        const uniqueCities = Array.from(new Set(response.data.map(booking => booking.city_name)))
          .map((cityName, index) => ({ id: String(index + 1), name: cityName as string }))

        const uniqueEvents = Array.from(new Set(response.data.map(booking => booking.event_title)))
          .map((eventTitle, index) => ({ id: String(index + 1), name: eventTitle as string }))

        setCities(uniqueCities)
        setEvents(uniqueEvents)
      } else {
        // Reset cities and events when no data
        setCities([])
        setEvents([])
      }
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

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]) // Fetch when page or page size changes

  // Handle confirm booking
  const handleConfirmBooking = async (id: number) => {
    try {
      setIsProcessing(id)

      // Call the API to update the booking status
      const updatedBooking = await updateBookingStatus(id, "Confirmed")

      // Update the local state optimistically
      setBookings(bookings.map(booking =>
        booking.booking_id === id ? { ...booking, booking_status: "Confirmed" } : booking
      ))

      toast({
        title: "Success",
        description: `Booking #${id} has been confirmed.`,
      })

      // Refresh the bookings list to ensure data consistency
      setTimeout(() => {
        handleRefreshBookings(false)
      }, 1000)
    } catch (error: any) {
      console.error(`Failed to confirm booking ${id}:`, error)
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking. Please try again.",
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
      const updatedBooking = await updateBookingStatus(id, "Cancelled")

      // Update the local state optimistically
      setBookings(bookings.map(booking =>
        booking.booking_id === id ? { ...booking, booking_status: "Cancelled" } : booking
      ))

      toast({
        title: "Success",
        description: `Booking #${id} has been cancelled.`,
      })

      // Refresh the bookings list to ensure data consistency
      setTimeout(() => {
        handleRefreshBookings(false)
      }, 1000)
    } catch (error: any) {
      console.error(`Failed to cancel booking ${id}:`, error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle refresh bookings
  const handleRefreshBookings = async (showToast: boolean = true) => {
    await fetchBookings(currentPage, pageSize)

    if (showToast) {
      toast({
        title: "Success",
        description: "Bookings refreshed successfully",
      })
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }



  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter((booking) => {
    // Search query filter - search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableFields = [
        String(booking.booking_id),
        typeof booking.parent_name === "string" ? booking.parent_name.toLowerCase() : '',
        typeof booking.parent_email === "string" ? booking.parent_email.toLowerCase() : '',
        booking.parent_additional_phone || '',
        typeof booking.child_full_name === "string" ? booking.child_full_name.toLowerCase() : '',
        typeof booking.event_title === "string" ? booking.event_title.toLowerCase() : '',
        typeof booking.city_name === "string" ? booking.city_name.toLowerCase() : '',
        typeof booking.venue_name === "string" ? booking.venue_name.toLowerCase() : '',
        typeof booking.booking_status === "string" ? booking.booking_status.toLowerCase() : '',
        typeof booking.payment_method === "string" ? booking.payment_method.toLowerCase() : '',
        typeof booking.payment_status === "string" ? booking.payment_status.toLowerCase() : '',
        typeof booking.game_name === "string" ? booking.game_name.toLowerCase() : ''
      ]

      const matchesSearch = searchableFields.some(field =>
        field.includes(query)
      )

      if (!matchesSearch) {
        return false
      }
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
    if (
      selectedStatus !== "all" &&
      typeof booking.booking_status === "string" &&
      booking.booking_status.toLowerCase() !== selectedStatus.toLowerCase()
    ) {
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

  // Calculate summary statistics (for current page only - note: for accurate totals across all pages, we'd need separate API calls)
  const confirmedBookings = bookings.filter(b => typeof b.booking_status === "string" && b.booking_status.toLowerCase() === 'confirmed').length
  const pendingBookings = bookings.filter(b => typeof b.booking_status === "string" && b.booking_status.toLowerCase() === 'pending').length
  const cancelledBookings = bookings.filter(b => typeof b.booking_status === "string" && b.booking_status.toLowerCase() === 'cancelled').length
  const completedBookings = bookings.filter(b => typeof b.booking_status === "string" && b.booking_status.toLowerCase() === 'completed').length
  const totalRevenue = bookings
    .filter(b => typeof b.booking_status === "string" && ['confirmed', 'completed'].includes(b.booking_status.toLowerCase()))
    .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage NIBOG event bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleRefreshBookings()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/bookings/new">
              <Eye className="mr-2 h-4 w-4" />
              Create New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, email, phone, event, city..."
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
              <TableHead>Booking Date</TableHead>
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
              filteredBookings.map((booking, idx) => (
                <TableRow key={booking.booking_id ?? idx}>
                  <TableCell className="font-medium">{booking.booking_id}</TableCell>
                  <TableCell>
                    {booking.parent_name}
                    <div className="text-xs text-muted-foreground">{booking.parent_email}</div>
                  </TableCell>
                  <TableCell>
                    {booking.child_full_name}
                  </TableCell>
                  <TableCell>
                    {booking.event_title}
                    <div className="text-xs text-muted-foreground">
                      Booked: {booking.booking_created_at ? new Date(booking.booking_created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>{booking.city_name}</TableCell>
                  <TableCell>
                    <div>{booking.child_full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Booked: {booking.booking_created_at ? new Date(booking.booking_created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>₹{booking.total_amount}</TableCell>
                  <TableCell>{getStatusBadge(typeof booking.booking_status === "string" ? booking.booking_status.toLowerCase() : "")}</TableCell>
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
                      {typeof booking.booking_status === "string" && booking.booking_status.toLowerCase() === "pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isProcessing === booking.booking_id}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Confirm</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                                  <div className="space-y-2">
                                    <div className="font-medium">Do you want to confirm this booking?</div>
                                    <div>
                                      This will confirm booking #{booking.booking_id} for {booking.parent_name} for the {booking.event_title} event.
                                      The booking status will change from "Pending" to "Confirmed".
                                    </div>
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, Keep Pending</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleConfirmBooking(booking.booking_id)}
                                disabled={isProcessing === booking.booking_id}
                              >
                                {isProcessing === booking.booking_id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                  </>
                                ) : "Yes, Confirm Booking"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {typeof booking.booking_status === "string" && booking.booking_status.toLowerCase() === "confirmed" && (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            {filteredBookings.length === 0
              ? "No bookings found."
              : `Showing ${bookings.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to ${Math.min(currentPage * pageSize, totalBookings)} of ${totalBookings} bookings`}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          {/* Page Size Selector */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={!hasPrev || isLoading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrev || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext || isLoading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={!hasNext || isLoading}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
