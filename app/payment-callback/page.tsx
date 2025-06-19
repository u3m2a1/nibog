"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkPhonePePaymentStatus } from "@/services/paymentService"
import { registerBooking, formatBookingDataForAPI } from "@/services/bookingRegistrationService"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [processingBooking, setProcessingBooking] = useState(false)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true)

        // Get the transaction ID from the URL
        // In the new workflow, bookingId in URL is actually a temp transaction ID
        const txnId = searchParams.get('transactionId')
        const tempId = searchParams.get('bookingId') // This is the temp ID we passed

        if (!txnId || !tempId) {
          throw new Error("Missing transaction ID or temporary ID")
        }

        setTransactionId(txnId)
        
        // Check the payment status
        const status = await checkPhonePePaymentStatus(txnId)
        setPaymentStatus(status)

        // If payment was successful, create the booking and update payment status
        if (status === 'SUCCESS') {
          setProcessingBooking(true)
          
          try {
            // Get the pending booking data from session storage
            const pendingBookingDataStr = sessionStorage.getItem('pendingBookingData')
            
            if (!pendingBookingDataStr) {
              throw new Error("Booking data not found. Please try registering again.")
            }
            
            const pendingBookingData = JSON.parse(pendingBookingDataStr)
            
            // Format booking data for the API
            const formattedBookingData = formatBookingDataForAPI({
              ...pendingBookingData,
              paymentStatus: 'Paid', // Mark as paid since payment successful
              transactionId: txnId // Add the actual transaction ID
            })
            
            console.log("Creating booking after successful payment:", formattedBookingData)
            
            // Register the booking now that payment is successful
            const bookingResponse = await registerBooking(formattedBookingData)
            console.log("Booking response:", bookingResponse)
            
            if (!bookingResponse || bookingResponse.length === 0) {
              throw new Error("Failed to create booking after payment. Please contact support.")
            }
            
            const newBookingId = bookingResponse[0].booking_id.toString()
            setBookingId(newBookingId)
            
            // Update the booking with payment info
            const updateResponse = await fetch('/api/bookings/update-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId: newBookingId,
                transactionId: txnId,
                status: 'Paid'
              }),
            })

            if (!updateResponse.ok) {
              console.error('Failed to update booking status')
            }
            
            // Clear the pending booking data now that it's been processed
            sessionStorage.removeItem('pendingBookingData')
            sessionStorage.removeItem('registrationData')
            sessionStorage.removeItem('selectedAddOns')
            
            // Redirect to booking confirmation page
            setTimeout(() => {
              router.push(`/booking-confirmation?ref=${newBookingId}`)
            }, 3000)
          } catch (bookingError: any) {
            console.error("Error creating booking after payment:", bookingError)
            setError(bookingError.message || "Failed to create booking after payment")
            setProcessingBooking(false)
          }
        }
      } catch (error: any) {
        console.error("Error checking payment status:", error)
        setError(error.message || "Failed to check payment status")
        setPaymentStatus('FAILED')
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment {getStatusText()}</CardTitle>
          <CardDescription>
            {isLoading ? "Processing your payment..." : getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {paymentStatus === 'SUCCESS' && !processingBooking && (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
              {paymentStatus === 'SUCCESS' && processingBooking && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
                  <p className="text-muted-foreground">Processing your booking...</p>
                </div>
              )}
              {paymentStatus === 'FAILED' && (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              {paymentStatus === 'PENDING' && (
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              )}
              {paymentStatus === 'CANCELLED' && (
                <XCircle className="h-16 w-16 text-gray-500" />
              )}

              {bookingId && (
                <p className="text-sm text-muted-foreground">
                  Booking Reference: <span className="font-medium">{bookingId}</span>
                </p>
              )}

              {transactionId && (
                <p className="text-sm text-muted-foreground">
                  Transaction ID: <span className="font-medium">{transactionId}</span>
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {paymentStatus === 'SUCCESS' ? (
            <Button
              className="w-full"
              onClick={() => router.push(`/booking-confirmation?ref=${bookingId}`)}
            >
              View Booking Details
            </Button>
          ) : paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push('/register-event')}
            >
              Try Again
            </Button>
          ) : paymentStatus === 'PENDING' ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Check Status Again
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )

  function getStatusText() {
    if (isLoading) return "Processing"
    switch (paymentStatus) {
      case 'SUCCESS': return "Successful"
      case 'FAILED': return "Failed"
      case 'PENDING': return "Pending"
      case 'CANCELLED': return "Cancelled"
      default: return "Status"
    }
  }

  function getStatusDescription() {
    if (error) return error;
    
    switch (paymentStatus) {
      case 'SUCCESS':
        return processingBooking 
          ? "Payment successful! We're finalizing your booking..." 
          : "Your payment was successful. You will be redirected to the booking confirmation page."
      case 'FAILED':
        return "Your payment was not successful. Please try again."
      case 'PENDING':
        return "Your payment is being processed. Please wait or check your email for confirmation."
      case 'CANCELLED':
        return "Your payment was cancelled. Please try again if you wish to complete the booking."
      default:
        return "We're having trouble determining your payment status."
    }
  }
}
