"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Download } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const payments = [
  {
    id: "P001",
    bookingId: "B001",
    user: "Harikrishna",
    event: "Baby Crawling",
    date: "2025-10-20",
    amount: 1800,
    paymentMethod: "Credit Card",
    transactionId: "TXN123456789",
    status: "successful",
  },
  {
    id: "P002",
    bookingId: "B003",
    user: "Srujana",
    event: "Running Race",
    date: "2025-10-21",
    amount: 3600,
    paymentMethod: "UPI",
    transactionId: "TXN987654321",
    status: "successful",
  },
  {
    id: "P003",
    bookingId: "B002",
    user: "Durga Prasad",
    event: "Baby Walker",
    date: "2025-10-22",
    amount: 1800,
    paymentMethod: "Net Banking",
    transactionId: "TXN456789123",
    status: "pending",
  },
  {
    id: "P004",
    bookingId: "B005",
    user: "Suresh Reddy",
    event: "Cycle Race",
    date: "2025-08-10",
    amount: 1800,
    paymentMethod: "Debit Card",
    transactionId: "TXN789123456",
    status: "successful",
  },
  {
    id: "P005",
    bookingId: "B004",
    user: "Ramesh Kumar",
    event: "Hurdle Toddle",
    date: "2025-03-10",
    amount: 1800,
    paymentMethod: "Credit Card",
    transactionId: "TXN321654987",
    status: "refunded",
  },
]

// Payment methods
const paymentMethods = [
  { id: "1", name: "Credit Card" },
  { id: "2", name: "Debit Card" },
  { id: "3", name: "UPI" },
  { id: "4", name: "Net Banking" },
  { id: "5", name: "Wallet" },
]

// Payment statuses
const statuses = [
  { id: "1", name: "successful" },
  { id: "2", name: "pending" },
  { id: "3", name: "failed" },
  { id: "4", name: "refunded" },
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

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [paymentsList, setPaymentsList] = useState(payments)

  // Handle export payments
  const handleExportPayments = () => {
    console.log("Exporting payments...")
    // In a real app, this would trigger a download of a CSV or Excel file
    alert("Payments exported successfully!")
  }

  // Handle clear date filter
  const handleClearDate = () => {
    setSelectedDate(undefined)
  }

  // Filter payments based on search and filters
  const filteredPayments = paymentsList.filter((payment) => {
    // Search query filter
    if (
      searchQuery &&
      !payment.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.user.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.event.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Payment method filter
    if (selectedMethod !== "all" && payment.paymentMethod !== selectedMethod) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && payment.status !== selectedStatus) {
      return false
    }

    // Date filter
    if (selectedDate && payment.date !== format(selectedDate, "yyyy-MM-dd")) {
      return false
    }

    return true
  })

  // Calculate total amount
  const totalAmount = filteredPayments.reduce((sum, payment) => {
    if (payment.status === "successful") {
      return sum + payment.amount
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage NIBOG event payments</p>
        </div>
        <Button onClick={handleExportPayments}>
          <Download className="mr-2 h-4 w-4" />
          Export Payments
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold">₹{totalAmount}</div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold">
              {filteredPayments.filter((p) => p.status === "successful").length}
            </div>
            <p className="text-sm text-muted-foreground">Successful Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold">
              {filteredPayments.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold">
              {filteredPayments.filter((p) => p.status === "refunded").length}
            </div>
            <p className="text-sm text-muted-foreground">Refunded Payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal md:w-[150px]",
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
                  {selectedDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs"
                        onClick={handleClearDate}
                      >
                        Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.bookingId}</TableCell>
                  <TableCell>{payment.user}</TableCell>
                  <TableCell>{payment.event}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
