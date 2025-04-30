"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, X, Check, AlertTriangle, User, Mail, Phone, Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react"
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
    childDetails: [
      {
        name: "Arjun",
        age: "14 months",
        gender: "Male"
      }
    ],
    paymentDetails: {
      method: "Credit Card",
      transactionId: "TXN123456789",
      paidOn: "2025-10-20"
    },
    bookingDate: "2025-10-20"
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
    childDetails: [
      {
        name: "Aarav",
        age: "16 months",
        gender: "Male"
      }
    ],
    paymentDetails: null,
    bookingDate: "2025-10-21"
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
    childDetails: [
      {
        name: "Ananya",
        age: "3 years",
        gender: "Female"
      },
      {
        name: "Advika",
        age: "5 years",
        gender: "Female"
      }
    ],
    paymentDetails: {
      method: "UPI",
      transactionId: "UPI987654321",
      paidOn: "2025-10-19"
    },
    bookingDate: "2025-10-19"
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
    childDetails: [
      {
        name: "Vihaan",
        age: "2 years",
        gender: "Male"
      }
    ],
    paymentDetails: {
      method: "Credit Card",
      transactionId: "TXN987654321",
      paidOn: "2025-03-10",
      refundStatus: "Refunded",
      refundDate: "2025-03-12"
    },
    bookingDate: "2025-03-10",
    cancellationDate: "2025-03-12",
    cancellationReason: "Unable to attend due to personal reasons"
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
    childDetails: [
      {
        name: "Reyansh",
        age: "6 years",
        gender: "Male"
      }
    ],
    paymentDetails: {
      method: "Net Banking",
      transactionId: "NB123456789",
      paidOn: "2025-08-01"
    },
    bookingDate: "2025-08-01"
  }
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

type Props = {
  params: { id: string }
}

export default function BookingDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const bookingId = unwrappedParams.id
  
  const booking = bookings.find((b) => b.id === bookingId)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  
  // Handle confirm booking
  const handleConfirmBooking = () => {
    setIsProcessing("confirm")
    
    // Simulate API call to confirm the booking
    setTimeout(() => {
      console.log(`Confirming booking ${bookingId}`)
      setIsProcessing(null)
      // In a real app, you would update the booking status and refresh the page
      router.refresh()
    }, 1000)
  }
  
  // Handle cancel booking
  const handleCancelBooking = () => {
    setIsProcessing("cancel")
    
    // Simulate API call to cancel the booking
    setTimeout(() => {
      console.log(`Cancelling booking ${bookingId}`)
      setIsProcessing(null)
      // In a real app, you would update the booking status and refresh the page
      router.refresh()
    }, 1000)
  }
  
  if (!booking) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Booking not found</h2>
          <p className="text-muted-foreground">The booking you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/bookings")}>
            Back to Bookings
          </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Booking {booking.id}</h1>
            <p className="text-muted-foreground">{booking.event} - {booking.date}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/bookings/${booking.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Link>
          </Button>
          
          {booking.status === "pending_payment" && (
            <Button 
              variant="default"
              onClick={handleConfirmBooking}
              disabled={isProcessing === "confirm"}
            >
              <Check className="mr-2 h-4 w-4" />
              {isProcessing === "confirm" ? "Confirming..." : "Confirm Payment"}
            </Button>
          )}
          
          {booking.status === "confirmed" && (
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
              {getStatusBadge(booking.status)}
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
                      <p>{booking.event}</p>
                      <p className="text-sm text-muted-foreground">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>{booking.venue}</p>
                      <p className="text-sm text-muted-foreground">{booking.city}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p>{booking.user}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{booking.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Child Information</h3>
              <div className="space-y-2">
                {booking.childDetails.map((child, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{child.name}</p>
                        <p className="text-sm text-muted-foreground">{child.age}, {child.gender}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Payment Information</h3>
                {booking.paymentDetails ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{booking.paymentDetails.method}</p>
                        <p className="text-sm text-muted-foreground">Transaction ID: {booking.paymentDetails.transactionId}</p>
                        <p className="text-sm text-muted-foreground">Paid on: {booking.paymentDetails.paidOn}</p>
                        {booking.paymentDetails.refundStatus && (
                          <p className="mt-1 text-sm text-red-500">
                            {booking.paymentDetails.refundStatus} on {booking.paymentDetails.refundDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Payment pending</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 font-medium">Booking Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Booked on: {booking.bookingDate}</p>
                      {booking.cancellationDate && (
                        <p className="text-sm text-red-500">Cancelled on: {booking.cancellationDate}</p>
                      )}
                    </div>
                  </div>
                  {booking.cancellationReason && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Cancellation Reason:</p>
                      <p className="text-sm text-muted-foreground">{booking.cancellationReason}</p>
                    </div>
                  )}
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
                <span className="text-sm text-muted-foreground">Number of Children</span>
                <span className="font-medium">{booking.children}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price per Child</span>
                <span className="font-medium">₹{booking.amount / booking.children}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold">₹{booking.amount}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/bookings/${booking.id}/receipt`}>
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
