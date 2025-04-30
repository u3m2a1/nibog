"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Baby, Download, ArrowLeft, QrCode } from "lucide-react"

type BookingType = {
  id: string
  eventName: string
  description: string
  venue: {
    name: string
    address: string
    city: string
  }
  date: string
  time: string
  child: {
    name: string
    dob: string
    ageAtEvent: string
  }
  status: string
  price: number
  bookingDate: string
  paymentStatus: string
  ticketCode: string
  qrCode: string
  instructions: string
}

type TicketClientProps = {
  booking: BookingType
  id: string
}

export default function TicketClient({ booking, id }: TicketClientProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  
  // Handle print ticket
  const handlePrintTicket = () => {
    setIsPrinting(true)
    window.print()
    setTimeout(() => setIsPrinting(false), 1000)
  }

  if (!booking) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Not Found</h2>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2 print:hidden">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/bookings/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Ticket</h1>
          <p className="text-muted-foreground">
            Booking ID: {booking.id} | {booking.eventName}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden border-2">
          <div className="bg-primary px-6 py-2 text-center text-primary-foreground">
            <h2 className="text-lg font-bold">NIBOG EVENT TICKET</h2>
          </div>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-2xl">{booking.eventName}</CardTitle>
              <p className="text-muted-foreground">Booking ID: {booking.id}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Status: Confirmed</p>
              <p className="text-sm text-muted-foreground">Booked on {booking.bookingDate}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{booking.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">{booking.venue.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.venue.address}</p>
                      <p className="text-xs text-muted-foreground">{booking.venue.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Child</p>
                      <p className="text-sm text-muted-foreground">{booking.child.name}</p>
                      <p className="text-xs text-muted-foreground">Age at event: {booking.child.ageAtEvent}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-medium">Important Information</h3>
                  <p className="text-sm text-muted-foreground">{booking.instructions}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-md bg-white p-2">
                  <Image
                    src={booking.qrCode}
                    alt="Ticket QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">Scan this QR code at the venue</p>
                <p className="text-center text-xs font-medium">{booking.ticketCode}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 print:hidden">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/bookings/${id}`}>
                Back to Booking
              </Link>
            </Button>
            <Button onClick={handlePrintTicket}>
              <Download className="mr-2 h-4 w-4" />
              {isPrinting ? "Printing..." : "Print Ticket"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
