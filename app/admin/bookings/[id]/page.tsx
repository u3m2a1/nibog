"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, X, Check, AlertTriangle, User, Mail, Phone, Calendar, Clock, MapPin, Users, CreditCard, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getBookingById, updateBookingStatus, getAllBookings, type Booking } from "@/services/bookingService"
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

type Props = {
  params: { id: string }
}

export default function BookingDetailPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Extract booking ID from params
  const bookingId = params.id

  // Retry function
  const retryFetch = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Add a timeout to the fetch operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 15000) // 15 second timeout
        })

        const fetchPromise = getBookingById(bookingId)

        const data = await Promise.race([fetchPromise, timeoutPromise]) as Booking
        setBooking(data)
      } catch (error: any) {
        console.error("Failed to fetch booking:", error)
        let errorMessage = "Failed to load booking details"

        if (error.message === 'Request timeout') {
          errorMessage = "The request is taking too long. Please try again or check your connection."
        } else if (error.message.includes('timeout')) {
          errorMessage = "The booking service is currently slow. Please try again in a moment."
        } else if (error.message.includes('503') || error.message.includes('504')) {
          errorMessage = "The booking service is temporarily unavailable. Please try again later."
        }

        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId, toast, retryCount])
  
  // Handle confirm booking
  const handleConfirmBooking = async () => {
    try {
      setIsProcessing("confirm")

      await updateBookingStatus(Number(bookingId), "Confirmed")

      // Update local state
      if (booking) {
        setBooking({ ...booking, booking_status: "Confirmed" })
      }

      toast({
        title: "Success",
        description: `Booking #${bookingId} has been confirmed.`,
      })
    } catch (error: any) {
      console.error(`Failed to confirm booking ${bookingId}:`, error)
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
  const handleCancelBooking = async () => {
    try {
      setIsProcessing("cancel")

      await updateBookingStatus(Number(bookingId), "Cancelled")

      // Update local state
      if (booking) {
        setBooking({ ...booking, booking_status: "Cancelled" })
      }

      toast({
        title: "Success",
        description: `Booking #${bookingId} has been cancelled.`,
      })
    } catch (error: any) {
      console.error(`Failed to cancel booking ${bookingId}:`, error)
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading booking details...</h2>
          <p className="text-muted-foreground">
            {retryCount > 0 ? `Retrying... (Attempt ${retryCount + 1})` : "Please wait while we fetch the booking information."}
          </p>
          <div className="text-xs text-muted-foreground">
            Booking ID: {bookingId}
          </div>
        </div>
      </div>
    )
  }

  if (error || (!booking && !isLoading)) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">
            {error ? "Error loading booking" : "Booking not found"}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {error || "The booking you are looking for does not exist."}
          </p>
          <div className="flex gap-2 justify-center">
            {error && (
              <Button variant="outline" onClick={retryFetch}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={() => router.push("/admin/bookings")}>
              Back to Bookings
            </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Booking #{booking.booking_id}</h1>
            <p className="text-muted-foreground">{booking.event_title} - {new Date(booking.event_event_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/bookings/${booking.booking_id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Link>
          </Button>

          {booking.booking_status.toLowerCase() === "pending" && (
            <Button
              variant="default"
              onClick={handleConfirmBooking}
              disabled={isProcessing === "confirm"}
            >
              <Check className="mr-2 h-4 w-4" />
              {isProcessing === "confirm" ? "Confirming..." : "Confirm Booking"}
            </Button>
          )}

          {booking.booking_status.toLowerCase() === "confirmed" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                  <X className="mr-2 h-4 w-4" />
                  Cancel Booking
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
                          This will cancel booking #{booking.booking_id} for {booking.parent_name} for the {booking.event_title} event.
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
                    onClick={handleCancelBooking}
                    disabled={isProcessing === "cancel"}
                  >
                    {isProcessing === "cancel" ? "Cancelling..." : "Yes, Cancel Booking"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <div className="mt-2">
              {getStatusBadge(booking.booking_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Event Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{booking.event_title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.event_event_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{booking.venue_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.city_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>Game: {booking.game_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.game_description}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p>{booking.parent_name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{booking.parent_email}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{booking.parent_additional_phone}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Child Information</h3>
              <div className="space-y-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{booking.child_full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Born: {new Date(booking.child_date_of_birth).toLocaleDateString()}, {booking.child_gender}
                      </p>
                      {booking.child_school_name && (
                        <p className="text-sm text-muted-foreground">School: {booking.child_school_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{booking.payment_method || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">Status: {booking.payment_status}</p>
                      <p className="text-sm text-muted-foreground">
                        Terms Accepted: {booking.terms_accepted ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Booking Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Booked on: {new Date(booking.booking_created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(booking.booking_updated_at).toLocaleDateString()}
                      </p>
                      {booking.cancelled_at && (
                        <p className="text-sm text-red-500">
                          Cancelled on: {new Date(booking.cancelled_at).toLocaleDateString()}
                        </p>
                      )}
                      {booking.completed_at && (
                        <p className="text-sm text-green-500">
                          Completed on: {new Date(booking.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Booking Reference</span>
                <span className="font-medium">{booking.booking_ref || `#${booking.booking_id}`}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Game Duration</span>
                <span className="font-medium">{booking.game_duration_minutes} minutes</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Age Range</span>
                <span className="font-medium">{booking.game_min_age} - {booking.game_max_age} months</span>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold">₹{booking.total_amount}</span>
              </div>
            </div>

            <div className="mt-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/bookings/${booking.booking_id}/receipt`}>
                  View Receipt
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
