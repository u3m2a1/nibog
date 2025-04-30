import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, this would come from an API
const recentBookings = [
  {
    id: "B001",
    user: "Harikrishna",
    event: "Baby Crawling",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
  },
  {
    id: "B002",
    user: "Durga Prasad",
    event: "Baby Walker",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "pending_payment",
  },
  {
    id: "B003",
    user: "Srujana",
    event: "Running Race",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 2,
    amount: 3600,
    status: "confirmed",
  },
  {
    id: "B004",
    user: "Ramesh Kumar",
    event: "Hurdle Toddle",
    date: "2025-03-16",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "cancelled_by_user",
  },
  {
    id: "B005",
    user: "Suresh Reddy",
    event: "Cycle Race",
    date: "2025-08-15",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
  },
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

export default function AdminRecentBookings() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.id}</TableCell>
              <TableCell>{booking.user}</TableCell>
              <TableCell>{booking.event}</TableCell>
              <TableCell>
                {booking.date} at {booking.time}
              </TableCell>
              <TableCell>{booking.children}</TableCell>
              <TableCell>₹{booking.amount}</TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <a href={`/admin/bookings/${booking.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
