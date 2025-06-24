"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkPhonePePaymentStatus } from "@/services/paymentService"
import { sendBookingConfirmationFromClient } from "@/services/emailNotificationService"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [processingBooking, setProcessingBooking] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const checkPaymentStatus = async (currentRetryCount = 0) => {
      try {
        setIsLoading(true)
        if (currentRetryCount > 0) {
          setIsRetrying(true)
        }

        // Get the transaction ID from the URL
        // In the new workflow, bookingId in URL is actually a temp transaction ID
        const txnId = searchParams.get('transactionId')
        const tempId = searchParams.get('bookingId') // This is the temp ID we passed

        if (!txnId || !tempId) {
          throw new Error("Missing transaction ID or temporary ID")
        }

        setTransactionId(txnId)

        // Check the payment status
        console.log(`Checking payment status (attempt ${currentRetryCount + 1})...`)
        
        // Retrieve booking data from localStorage to send to API
        let bookingDataFromStorage = null;
        try {
          const storedData = localStorage.getItem('nibog_booking_data');
          if (storedData) {
            bookingDataFromStorage = JSON.parse(storedData);
            console.log('Retrieved booking data from localStorage for payment verification:', bookingDataFromStorage);
          } else {
            console.warn('No booking data found in localStorage for payment verification');
          }
        } catch (storageError) {
          console.error('Error retrieving booking data from localStorage:', storageError);
        }
        
        // Pass the booking data to the payment status check
        const status = await checkPhonePePaymentStatus(txnId, bookingDataFromStorage)
        console.log(`Payment status received: ${status}`)
        setPaymentStatus(status)

        // Handle different payment statuses
        if (status === 'SUCCESS') {
          console.log('✅ Payment successful - checking if booking was created by server callback')

          try {
            // In the server-first approach, the booking should already be created by the server callback
            // We just need to verify and show success, plus send backup email if needed

            // Extract booking ID from transaction ID if available
            let extractedBookingId = null
            const bookingMatch = txnId.match(/NIBOG_(\d+)_/)
            if (bookingMatch) {
              extractedBookingId = bookingMatch[1]
              setBookingId(extractedBookingId)
              console.log(`📋 Extracted booking ID from transaction: ${extractedBookingId}`)
            }

            // Retrieve booking data from localStorage
            try {
              console.log('🔍 Retrieving booking data from localStorage...')
              const storedData = localStorage.getItem('nibog_booking_data')
              
              if (storedData) {
                const bookingData = JSON.parse(storedData)
                console.log('✅ Retrieved booking data from localStorage:', JSON.stringify(bookingData, null, 2))
                
                if (extractedBookingId) {
                  console.log('📧 Sending confirmation email with complete data...')

                  // Use full data from localStorage for a more detailed email
                  const emailResult = await sendBookingConfirmationFromClient({
                    bookingId: parseInt(extractedBookingId),
                    parentName: bookingData.parentName || 'Valued Customer',
                    parentEmail: bookingData.email || '',
                    childName: bookingData.childName || '',
                    eventTitle: `Event ${bookingData.eventId || 'Unknown'}`,
                    eventDate: 'TBD',
                    eventVenue: 'TBD',
                    totalAmount: bookingData.totalAmount || 0,
                    paymentMethod: 'PhonePe',
                    transactionId: txnId,
                    gameDetails: bookingData.gameId?.map((gameId: number, index: number) => ({
                      gameName: `Game ${gameId}`,
                      gameTime: 'TBD',
                      gamePrice: bookingData.gamePrice?.[index] || 0,
                    })) || [],
                    addOns: bookingData.addOns?.map((addon: any) => ({
                      name: `Add-on ${addon.addOnId}`,
                      quantity: addon.quantity,
                      price: 0,
                    })) || []
                  })

                  if (emailResult.success) {
                    console.log('✅ Confirmation email sent successfully')
                  } else {
                    console.error('❌ Failed to send confirmation email:', emailResult.error)
                  }
                } else {
                  console.log('⚠️ No booking ID available for email')
                }
                
                // Clear localStorage after successful payment and email
                localStorage.removeItem('nibog_booking_data')
                console.log('🧹 Cleared booking data from localStorage')
              } else {
                console.log('⚠️ No booking data found in localStorage')
                
                // Fall back to minimal email if needed
                if (extractedBookingId) {
                  console.log('📧 Sending minimal confirmation email...')
                  const minimalEmailResult = await sendBookingConfirmationFromClient({
                    bookingId: parseInt(extractedBookingId),
                    parentName: 'Valued Customer',
                    parentEmail: '',
                    childName: '',
                    eventTitle: 'Your Booking',
                    eventDate: 'TBD',
                    eventVenue: 'TBD',
                    totalAmount: 0,
                    paymentMethod: 'PhonePe',
                    transactionId: txnId,
                    gameDetails: [],
                    addOns: []
                  })
                  
                  if (minimalEmailResult.success) {
                    console.log('✅ Minimal confirmation email sent successfully')
                  } else {
                    console.error('❌ Failed to send minimal confirmation email:', minimalEmailResult.error)
                  }
                }
              }
            } catch (emailError) {
              console.error('❌ Error sending confirmation email:', emailError)
              // Don't fail the entire process if email fails
            }

            // Clear any remaining session storage data
            sessionStorage.removeItem('pendingBookingData')
            sessionStorage.removeItem('registrationData')
            sessionStorage.removeItem('selectedAddOns')

            // Redirect to booking confirmation page
            setTimeout(() => {
              if (extractedBookingId) {
                router.push(`/booking-confirmation?ref=${extractedBookingId}`)
              } else {
                router.push('/bookings') // Fallback to bookings list
              }
            }, 3000)

          } catch (error: any) {
            console.error("Error in payment success handling:", error)
            setError("Payment was successful but there was an issue processing your booking. Please contact support.")
          } finally {
            setProcessingBooking(false)
          }
        } else if (status === 'PENDING') {
          // Handle pending payments with retry logic
          const maxRetries = 6 // Maximum 6 retries (about 30 seconds total)
          if (currentRetryCount < maxRetries) {
            console.log(`Payment is pending, retrying in 5 seconds... (${currentRetryCount + 1}/${maxRetries})`)
            setRetryCount(currentRetryCount + 1)

            // Retry after 5 seconds
            setTimeout(() => {
              checkPaymentStatus(currentRetryCount + 1)
            }, 5000)
            return // Don't set loading to false yet
          } else {
            // Max retries reached, show pending status
            console.log('Max retries reached, payment still pending')
            setError('Payment is taking longer than expected. Please check your payment status or contact support.')
          }
        }
        // For FAILED, CANCELLED, or other statuses, just show the status
      } catch (error: any) {
        console.error("Error checking payment status:", error)
        setError(error.message || "Failed to check payment status")
        setPaymentStatus('FAILED')
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
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
          {isLoading || isRetrying ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground">
                {isRetrying
                  ? `Checking payment status... (Attempt ${retryCount + 1}/6)`
                  : "Please wait while we verify your payment..."
                }
              </p>
              {isRetrying && (
                <p className="text-sm text-muted-foreground">
                  Payment is being processed by PhonePe. This may take a few moments.
                </p>
              )}
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
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="h-16 w-16 text-amber-500" />
                  <p className="text-muted-foreground">Payment is still being processed...</p>
                </div>
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
          ) : paymentStatus === 'PENDING' && !isRetrying ? (
            <div className="w-full space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Check Status Again
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If payment was successful, it may take a few minutes to reflect
              </p>
            </div>
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
        return isRetrying
          ? "Payment is being verified with PhonePe. Please wait while we confirm your payment status."
          : "Your payment is being processed. This may take a few moments to complete."
      case 'CANCELLED':
        return "Your payment was cancelled. Please try again if you wish to complete the booking."
      default:
        return "We're having trouble determining your payment status."
    }
  }
}
