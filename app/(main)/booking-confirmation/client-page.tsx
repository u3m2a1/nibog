"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, ArrowRight, Download, Ticket, Check, Home, File } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import html2canvas from "html2canvas"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import { TicketDetails, getTicketDetails, convertBookingRefFormat } from "@/services/bookingService"
import { checkPhonePePaymentStatus } from "@/services/paymentService"

export default function BookingConfirmationClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get('ref')
  const [bookingDetails, setBookingDetails] = useState<TicketDetails | null>(null)
  const [ticketDetails, setTicketDetails] = useState<TicketDetails[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTicket, setShowTicket] = useState(true)
  const ticketRef = useRef<HTMLDivElement>(null)

  // Handler for downloading ticket as image
  const handleDownloadImage = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `NIBOG-Ticket-${ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "ticket"}.png`);
          }
        });
      });
    }
  };

  // Handler for downloading ticket as PDF
  const handleDownloadPDF = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate dimensions to fit the ticket on the PDF
        const imgWidth = 190; // mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const pageHeight = 297; // A4 height
        const marginTop = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', 10, marginTop, imgWidth, imgHeight);
        pdf.save(`NIBOG-Ticket-${ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "ticket"}.pdf`);
      });
    }
  }

  // Fetch booking details when component mounts
  // Helper function to normalize booking reference formats to ensure API compatibility
  // Simply extract the booking reference without any format conversion
  // This ensures we use the EXACT SAME reference ID throughout the entire system
  const normalizeBookingRef = (ref: string): string => {
    console.log('Extracting booking reference, input:', ref);
    
    if (!ref) return '';
    
    // If the reference is a URL, extract the ref parameter
    if (ref.includes('ref=')) {
      try {
        const url = new URL(ref, window.location.origin);
        const bookingRef = url.searchParams.get('ref');
        if (bookingRef) {
          console.log(`📋 Using booking reference from URL: ${bookingRef}`);
          localStorage.setItem('lastBookingRef', bookingRef);
          return bookingRef;
        }
      } catch (e) {
        console.error('Error extracting booking ref from URL', e);
      }
    }
    
    // If not a URL, use the reference as-is
    console.log(`📋 Using provided booking reference: ${ref}`);
    localStorage.setItem('lastBookingRef', ref);
    return ref;
  };

  useEffect(() => {
    // Log the current URL path and query parameters for debugging
    console.log('Current URL:', window.location.href);
    console.log('Booking ref from query param:', bookingRef);
      
    const fetchBookingDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a booking reference from URL or need to check localStorage
      let refToUse = bookingRef;
      console.log('Initial booking reference from URL:', refToUse);
      
      if (!refToUse) {
        console.log('No booking reference in URL, checking localStorage...');
        // Check if we have a stored booking reference from the payment callback
        try {
          const storedBookingRef = localStorage.getItem('lastBookingRef');
          console.log('Raw stored booking ref from localStorage:', storedBookingRef);
          
          if (storedBookingRef) {
            console.log(`📋 Found stored booking reference: ${storedBookingRef}`);
            refToUse = storedBookingRef;
          }
        } catch (e) {
          console.error("Error accessing stored booking reference", e);
        }
      }
      
      // If we still don't have a reference, show error
      if (!refToUse) {
        console.error("No booking reference available from URL or localStorage");
        setError("No booking reference provided - please check your confirmation email")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Normalize the booking reference
        const normalizedRef = normalizeBookingRef(refToUse);
        console.log(`Original booking ref: ${refToUse}, Normalized: ${normalizedRef}`);
        
        // Try to get comprehensive ticket details using the API with normalized ref
        try {
          console.log("Trying to fetch ticket details using API with normalized booking reference:", normalizedRef)
          const ticketData = await getTicketDetails(normalizedRef)
          
          if (ticketData && ticketData.length > 0) {
            console.log("Successfully fetched ticket details from API:", ticketData)
            setTicketDetails(ticketData)
            // Store the first ticket as the booking details for display
            if (ticketData[0]) {
              setBookingDetails(ticketData[0])
            }
            return
          }
        } catch (ticketError) {
          console.error("Error fetching ticket details from new API:", ticketError)
          // Continue to fallback methods if new API fails
        }
        
        // Try to check if this is a payment transaction ID by calling payment status API
        try {
          const response = await fetch('/api/payments/phonepe-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transactionId: bookingRef,
              bookingData: null,
            }),
          })
          
          const data = await response.json()
          console.log("Payment status response:", data)
          
          // If the payment status API returns a booking ID, use that to fetch booking details
          if (data.bookingCreated && data.bookingId) {
            const normalizedApiBookingId = normalizeBookingRef(data.bookingId);
            console.log("Found booking ID from payment API:", data.bookingId, "Normalized to:", normalizedApiBookingId)
            
            // Try to get ticket details with this normalized booking ID
            try {
              const ticketData = await getTicketDetails(normalizedApiBookingId)
              if (ticketData && ticketData.length > 0) {
                console.log("Successfully fetched ticket details using payment API bookingId:", ticketData)
                setTicketDetails(ticketData)
                // Store the first ticket as the booking details for display
                if (ticketData[0]) {
                  setBookingDetails(ticketData[0])
                }
                return
              }
            } catch (ticketError) {
              console.error("Error fetching ticket details with payment API bookingId:", ticketError)
              // Continue to fallback methods if this fails
            }
          }
          
          // If we couldn't get booking ID from the payment API or couldn't fetch it,
          // Try with PPT format as a fallback
          try {
            // Format with PPT prefix + date + ID portion
            if (!refToUse) {
              throw new Error("No booking reference for PPT attempt");
            }
            
            // Try to extract just numbers if reference has other characters
            const numericPart = refToUse.replace(/\D/g, '');
            if (numericPart.length > 0) {
              // Create date variables for PPT format
              const currentDate = new Date();
              const year = currentDate.getFullYear().toString().slice(-2);
              const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
              const day = currentDate.getDate().toString().padStart(2, '0');
              
              const pptRef = `PPT${year}${month}${day}${numericPart.slice(0, 3)}`;
              console.log("Last attempt - trying PPT formatted reference:", pptRef);
              
              const ticketData = await getTicketDetails(pptRef);
              if (ticketData && ticketData.length > 0) {
                console.log("Successfully fetched ticket details using PPT format:", ticketData);
                setTicketDetails(ticketData);
                if (ticketData[0]) {
                  setBookingDetails(ticketData[0]);
                }
                // Store this successful reference
                localStorage.setItem('lastBookingRef', JSON.stringify(pptRef));
                return;
              }
            }
            
            setError("Payment was successful, but booking details could not be found. Please check your email for booking confirmation.");
          } catch (pptError) {
            console.error("Error with PPT format attempt:", pptError);
            setError("Payment was successful, but booking details could not be found. Please check your email for booking confirmation.");
          }
        } catch (paymentError) {
          console.error("Error checking payment status:", paymentError)
          
          // If checking payment status fails, try direct booking lookup as a final attempt
          try {
            // Try ticket details API first
            try {
              if (!refToUse) {
                throw new Error("No booking reference for ticket details");
              }
              const ticketData = await getTicketDetails(refToUse)
              if (ticketData && ticketData.length > 0) {
                console.log("Successfully fetched ticket details as final attempt:", ticketData)
                setTicketDetails(ticketData)
                return
              }
            } catch (ticketError) {
              console.error("Error fetching ticket details as final attempt:", ticketError)
            }
            
            // Nothing more we can try if ticket details API failed
            if (!refToUse) {
              throw new Error("No booking reference for booking details");
            }
            // We've already tried the ticket details API above, so just show error
          } catch (bookingError: any) {
            console.error("Error fetching booking details:", bookingError)
            setError(bookingError.message || "Failed to fetch booking details")
          }
        }
      } catch (error: any) {
        console.error("Error in booking confirmation flow:", error)
        setError(error.message || "Failed to process booking confirmation")
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
            {/* Booking Details Panel */}
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
                  <span className="font-medium">{ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span>{ticketDetails?.[0]?.booking_created_at ? new Date(ticketDetails[0].booking_created_at).toLocaleDateString() : bookingDetails?.booking_created_at ? new Date(bookingDetails.booking_created_at).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">{ticketDetails?.[0]?.booking_status || bookingDetails?.booking_status || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium">{ticketDetails?.[0]?.event_title || bookingDetails?.event_title || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Game:</span>
                  <span>{ticketDetails?.[0]?.game_name || bookingDetails?.game_name || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-green-50/50 rounded-lg">
              <p className="text-lg text-gray-700">
                We've sent a confirmation email with all the details to your registered email address.
              </p>
              <p className="mt-2 text-gray-600">
                Please save your booking reference: <span className="font-bold text-green-700">{ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "N/A"}</span>
              </p>
              <Button 
                onClick={() => setShowTicket(!showTicket)} 
                className="mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                <Ticket className="mr-2 h-4 w-4" />
                {showTicket ? "Hide Ticket" : "View Ticket"}
              </Button>
            </div>
            
            {showTicket && (
              <div className="mt-6 p-6 bg-white rounded-lg border-2 border-green-500/20">
                <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">Your Event Ticket</h3>
              
              <div ref={ticketRef} className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-md overflow-hidden">
                {/* Event Header */}
                <div className="bg-gray-800 text-white p-4">
                  <h3 className="text-xl font-bold">
                    {ticketDetails?.[0]?.event_title || bookingDetails?.event_title || "Event"}
                  </h3>
                  <p className="text-sm">
                    {ticketDetails?.[0]?.event_date ? 
                      `${new Date(ticketDetails[0].event_date).toLocaleDateString()} at ${new Date(ticketDetails[0].event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                      bookingDetails?.event_date ? 
                      `${new Date(bookingDetails.event_date).toLocaleDateString()} at ${new Date(bookingDetails.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                      "Date not available"}
                  </p>
                </div>
                
                {/* Ticket Content */}
                <div className="flex">
                  {/* QR Code Section - Left */}
                  <div className="w-1/3 p-4 flex flex-col items-center justify-center border-r border-gray-200">
                    <QRCodeCanvas 
                      value={JSON.stringify({
                        ref: ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "",
                        id: ticketDetails?.[0]?.booking_id || bookingDetails?.booking_id || 0,
                        name: ticketDetails?.[0]?.child_name || bookingDetails?.child_name || "",
                        game: ticketDetails?.[0]?.game_name || bookingDetails?.game_name || ""
                      })} 
                      size={120} 
                      level="H"
                      includeMargin={true}
                    />
                    <p className="text-xs text-center mt-2">Check in for this event</p>
                  </div>
                  
                  {/* Details Section - Right */}
                  <div className="w-2/3 p-4">
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <div className="text-gray-500 uppercase text-xs">TICKET #</div>
                        <div className="font-medium">{ticketDetails?.[0]?.booking_ref || bookingDetails?.booking_ref || "N/A"}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500 uppercase text-xs">GAMES</div>
                        <div className="font-medium">
                          {ticketDetails ? (
                            <div className="flex flex-col gap-1">
                              {ticketDetails.map((ticket, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span>{ticket.game_name}</span>
                                  <span className="text-xs text-gray-500">(₹{ticket.game_price})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            bookingDetails?.game_name || "N/A"
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500 uppercase text-xs">PARTICIPANT</div>
                        <div className="font-medium">{ticketDetails?.[0]?.child_name || bookingDetails?.child_name || "N/A"}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500 uppercase text-xs">PRICE</div>
                        <div className="font-medium">₹{ticketDetails?.[0]?.game_price || bookingDetails?.total_amount || "0"}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500 uppercase text-xs">VENUE</div>
                        <div className="font-medium">Main Stadium</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500 uppercase text-xs">SECURITY CODE</div>
                        <div className="font-medium">{ticketDetails?.[0]?.booking_id || bookingDetails?.booking_id || "0"}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-xs text-gray-500">
                      <a href="https://nibog.com" className="text-blue-600 hover:underline">https://nibog.com</a>
                    </div>
                  </div>
                </div>
              </div>
              
              {!isLoading && (
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <Button 
                    onClick={handleDownloadImage} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" /> Save Ticket
                  </Button>
                  <Button 
                    onClick={handleDownloadPDF} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <File className="w-4 h-4 mr-2" /> Save as PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              )}
            </div>
          )}
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
