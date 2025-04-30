"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Printer, Mail, RefreshCw } from "lucide-react"

// Mock data - in a real app, this would come from an API
const payments = [
  {
    id: "P001",
    bookingId: "B001",
    user: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    event: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-20",
    amount: 1800,
    paymentMethod: "Credit Card",
    cardDetails: {
      type: "Visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2027"
    },
    transactionId: "TXN123456789",
    status: "successful",
    timestamp: "2025-10-20T14:32:15",
    gatewayResponse: {
      code: "SUCCESS",
      message: "Payment processed successfully"
    }
  },
  {
    id: "P002",
    bookingId: "B003",
    user: "Srujana",
    email: "srujana@example.com",
    phone: "+91 9876543212",
    event: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-21",
    amount: 3600,
    paymentMethod: "UPI",
    upiDetails: {
      id: "srujana@upi"
    },
    transactionId: "TXN987654321",
    status: "successful",
    timestamp: "2025-10-21T10:15:42",
    gatewayResponse: {
      code: "SUCCESS",
      message: "Payment processed successfully"
    }
  },
  {
    id: "P003",
    bookingId: "B002",
    user: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    event: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-22",
    amount: 1800,
    paymentMethod: "Net Banking",
    bankDetails: {
      bank: "HDFC Bank",
      accountLast4: "1234"
    },
    transactionId: "TXN456789123",
    status: "pending",
    timestamp: "2025-10-22T09:45:30",
    gatewayResponse: {
      code: "PENDING",
      message: "Payment is being processed"
    }
  },
  {
    id: "P004",
    bookingId: "B005",
    user: "Suresh Reddy",
    email: "suresh@example.com",
    phone: "+91 9876543214",
    event: "Cycle Race",
    venue: "Sports Complex",
    city: "Vizag",
    date: "2025-08-10",
    amount: 1800,
    paymentMethod: "Debit Card",
    cardDetails: {
      type: "Mastercard",
      last4: "5678",
      expiryMonth: "09",
      expiryYear: "2026"
    },
    transactionId: "TXN789123456",
    status: "successful",
    timestamp: "2025-08-10T11:22:33",
    gatewayResponse: {
      code: "SUCCESS",
      message: "Payment processed successfully"
    }
  },
  {
    id: "P005",
    bookingId: "B004",
    user: "Ramesh Kumar",
    email: "ramesh@example.com",
    phone: "+91 9876543213",
    event: "Hurdle Toddle",
    venue: "Indoor Stadium",
    city: "Chennai",
    date: "2025-03-10",
    amount: 1800,
    paymentMethod: "Credit Card",
    cardDetails: {
      type: "Visa",
      last4: "9876",
      expiryMonth: "05",
      expiryYear: "2028"
    },
    transactionId: "TXN321654987",
    status: "refunded",
    timestamp: "2025-03-10T16:30:00",
    refundDetails: {
      refundId: "REF123456",
      refundDate: "2025-03-12T10:15:00",
      refundAmount: 1800,
      refundReason: "Customer requested cancellation"
    },
    gatewayResponse: {
      code: "REFUNDED",
      message: "Payment has been refunded"
    }
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "successful":
      return <Badge className="bg-green-500 hover:bg-green-600">Successful</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
    case "refunded":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Props = {
  params: { id: string }
}

export default function PaymentDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const paymentId = unwrappedParams.id
  
  const payment = payments.find((p) => p.id === paymentId)
  const [isLoading, setIsLoading] = useState({
    print: false,
    download: false,
    email: false,
    refresh: false
  })
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    setIsLoading({ ...isLoading, print: true })
    
    // Simulate printing
    setTimeout(() => {
      window.print()
      setIsLoading({ ...isLoading, print: false })
    }, 500)
  }
  
  // Handle download receipt
  const handleDownloadReceipt = () => {
    setIsLoading({ ...isLoading, download: true })
    
    // Simulate download
    setTimeout(() => {
      console.log(`Downloading receipt for payment ${paymentId}`)
      setIsLoading({ ...isLoading, download: false })
      // In a real app, this would trigger a download of a PDF file
      alert("Receipt downloaded successfully!")
    }, 1000)
  }
  
  // Handle email receipt
  const handleEmailReceipt = () => {
    setIsLoading({ ...isLoading, email: true })
    
    // Simulate sending email
    setTimeout(() => {
      console.log(`Emailing receipt for payment ${paymentId} to ${payment?.email}`)
      setIsLoading({ ...isLoading, email: false })
      // In a real app, this would send an email with the receipt
      alert(`Receipt sent to ${payment?.email}`)
    }, 1500)
  }
  
  // Handle refresh payment status
  const handleRefreshStatus = () => {
    setIsLoading({ ...isLoading, refresh: true })
    
    // Simulate refreshing payment status
    setTimeout(() => {
      console.log(`Refreshing payment status for ${paymentId}`)
      setIsLoading({ ...isLoading, refresh: false })
      // In a real app, this would check the payment status with the payment gateway
      alert("Payment status refreshed")
    }, 1000)
  }
  
  if (!payment) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Payment not found</h2>
          <p className="text-muted-foreground">The payment you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/payments")}>
            Back to Payments
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
            <Link href="/admin/payments">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment {payment.id}</h1>
            <p className="text-muted-foreground">{payment.event} - {payment.date}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReceipt} disabled={isLoading.print}>
            <Printer className="mr-2 h-4 w-4" />
            {isLoading.print ? "Printing..." : "Print"}
          </Button>
          <Button variant="outline" onClick={handleDownloadReceipt} disabled={isLoading.download}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading.download ? "Downloading..." : "Download"}
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt} disabled={isLoading.email}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading.email ? "Sending..." : "Email Receipt"}
          </Button>
          {payment.status === "pending" && (
            <Button onClick={handleRefreshStatus} disabled={isLoading.refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoading.refresh ? "Refreshing..." : "Refresh Status"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <div className="mt-2">
              {getStatusBadge(payment.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Transaction Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">{payment.transactionId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date & Time</span>
                    <span className="text-sm">{new Date(payment.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm">{payment.paymentMethod}</span>
                  </div>
                  {payment.cardDetails && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Card</span>
                      <span className="text-sm">
                        {payment.cardDetails.type} **** {payment.cardDetails.last4}
                      </span>
                    </div>
                  )}
                  {payment.upiDetails && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">UPI ID</span>
                      <span className="text-sm">{payment.upiDetails.id}</span>
                    </div>
                  )}
                  {payment.bankDetails && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bank</span>
                      <span className="text-sm">
                        {payment.bankDetails.bank} **** {payment.bankDetails.accountLast4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm">{payment.user}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{payment.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm">{payment.phone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Booking Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booking ID</span>
                  <Link href={`/admin/bookings/${payment.bookingId}`} className="text-sm text-blue-500 hover:underline">
                    {payment.bookingId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event</span>
                  <span className="text-sm">{payment.event}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Venue</span>
                  <span className="text-sm">{payment.venue}, {payment.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm">{payment.date}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Gateway Response</h3>
              <div className="rounded-lg border p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Code</span>
                    <span className="font-mono text-sm">{payment.gatewayResponse.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Message</span>
                    <span className="text-sm">{payment.gatewayResponse.message}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {payment.refundDetails && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Refund Information</h3>
                  <div className="rounded-lg border p-3 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Refund ID</span>
                        <span className="font-mono text-sm">{payment.refundDetails.refundId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Refund Date</span>
                        <span className="text-sm">
                          {new Date(payment.refundDetails.refundDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Refund Amount</span>
                        <span className="text-sm">₹{payment.refundDetails.refundAmount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Reason</span>
                        <span className="text-sm">{payment.refundDetails.refundReason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-xl font-bold">₹{payment.amount}</span>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div>{getStatusBadge(payment.status)}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/bookings/${payment.bookingId}`}>
                  View Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
