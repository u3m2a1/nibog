"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function BookingConfirmationClientPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get('ref')
  const [currentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch booking details when component mounts
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingRef) {
        setError("No booking reference provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // In a real app, you would fetch the booking details from the API
        // For now, we'll just simulate a successful API call

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Set booking details
        setBookingDetails({
          id: bookingRef,
          status: "Confirmed",
          date: new Date().toISOString(),
          paymentStatus: "Paid"
        })
      } catch (error: any) {
        console.error("Error fetching booking details:", error)
        setError(error.message || "Failed to fetch booking details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingRef])

  return (
    <div className="container py-8 px-4 sm:px-6 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-green-200 opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-yellow-200 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-200 opacity-20 animate-pulse delay-500"></div>
      </div>

      <Card className="mx-auto w-full max-w-3xl relative overflow-hidden shadow-lg border-2 border-green-500/10 bg-white/90 backdrop-blur-sm">
        {/* Decorative top pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500"></div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Booking</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>Return to Home</Button>
          </div>
        ) : (
          <>
            <CardHeader className="space-y-1 relative">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Booking Confirmed!</CardTitle>
                  <CardDescription>
                    Thank you for registering with NIBOG
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border border-dashed border-green-500/20 bg-green-50/50 space-y-4">
            <h3 className="text-lg font-medium text-green-800 flex items-center gap-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              Booking Details
            </h3>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Reference:</span>
                <span className="font-medium">{bookingRef || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span>{currentDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-green-50/50 rounded-lg">
            <p className="text-lg text-gray-700">
              We've sent a confirmation email with all the details to your registered email address.
            </p>
            <p className="mt-2 text-gray-600">
              Please save your booking reference: <span className="font-bold text-green-700">{bookingRef || "N/A"}</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/my-bookings">
                View My Bookings
              </Link>
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" asChild>
              <Link href="/">
                Return to Home <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Need help? Contact us at{" "}
            <Link href="mailto:support@nibog.in" className="text-green-600 font-medium underline-offset-4 hover:underline transition-colors">
              support@nibog.in
            </Link>
          </div>
        </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
