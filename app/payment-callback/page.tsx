"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkPhonePePaymentStatus } from "@/services/paymentService"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true)

        // Get the transaction ID and booking ID from the URL
        const txnId = searchParams.get('transactionId')
        const bkgId = searchParams.get('bookingId')

        if (!txnId || !bkgId) {
          throw new Error("Missing transaction ID or booking ID")
        }

        setTransactionId(txnId)
        setBookingId(bkgId)

        // Check the payment status
        const status = await checkPhonePePaymentStatus(txnId)
        setPaymentStatus(status)

        // If payment was successful, redirect to the booking confirmation page after a delay
        if (status === 'SUCCESS') {
          // Update the booking status to paid via API call
          try {
            const updateResponse = await fetch('/api/bookings/update-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId: bkgId,
                transactionId: txnId,
                status: 'Paid'
              }),
            });

            if (!updateResponse.ok) {
              console.error('Failed to update booking status');
            }
          } catch (updateError) {
            console.error('Error updating booking status:', updateError);
          }

          // Redirect to booking confirmation page
          setTimeout(() => {
            router.push(`/booking-confirmation?ref=${bkgId}`)
          }, 3000)
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
              {paymentStatus === 'SUCCESS' && (
                <CheckCircle className="h-16 w-16 text-green-500" />
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
    switch (paymentStatus) {
      case 'SUCCESS':
        return "Your payment was successful. You will be redirected to the booking confirmation page."
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
