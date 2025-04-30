"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, User, Mail, Phone, MapPin, Calendar, X, Check } from "lucide-react"
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
const users = [
  {
    id: "1",
    name: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    city: "Hyderabad",
    bookings: 3,
    role: "user",
    status: "active",
    registeredOn: "2025-01-15",
    lastLogin: "2025-03-20",
    bookingHistory: [
      {
        id: "B001",
        event: "Baby Crawling",
        date: "2025-10-26",
        venue: "Gachibowli Indoor Stadium",
        amount: 1800,
        status: "confirmed"
      },
      {
        id: "B002",
        event: "Baby Walker",
        date: "2025-11-15",
        venue: "Gachibowli Indoor Stadium",
        amount: 1800,
        status: "confirmed"
      },
      {
        id: "B003",
        event: "Running Race",
        date: "2025-12-05",
        venue: "Gachibowli Indoor Stadium",
        amount: 1800,
        status: "confirmed"
      }
    ]
  },
  {
    id: "2",
    name: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    city: "Bangalore",
    bookings: 2,
    role: "user",
    status: "active",
    registeredOn: "2025-02-10",
    lastLogin: "2025-03-18",
    bookingHistory: [
      {
        id: "B004",
        event: "Baby Crawling",
        date: "2025-10-26",
        venue: "Indoor Stadium",
        amount: 1800,
        status: "confirmed"
      },
      {
        id: "B005",
        event: "Baby Walker",
        date: "2025-11-15",
        venue: "Indoor Stadium",
        amount: 1800,
        status: "confirmed"
      }
    ]
  },
  {
    id: "6",
    name: "Admin User",
    email: "admin@nibog.in",
    phone: "+91 9876543215",
    city: "Hyderabad",
    bookings: 0,
    role: "admin",
    status: "active",
    registeredOn: "2025-01-01",
    lastLogin: "2025-03-21",
    bookingHistory: []
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

export default function UserDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const userId = unwrappedParams.id
  
  const user = users.find((u) => u.id === userId)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  
  // Handle delete user
  const handleDeleteUser = () => {
    setIsProcessing("delete")
    
    // Simulate API call to delete the user
    setTimeout(() => {
      console.log(`Deleting user ${userId}`)
      setIsProcessing(null)
      // In a real app, you would delete the user and then redirect
      router.push("/admin/users")
    }, 1000)
  }
  
  // Handle block/unblock user
  const handleToggleUserStatus = () => {
    if (!user) return
    
    setIsProcessing("status")
    
    // Simulate API call to update the user status
    setTimeout(() => {
      console.log(`Toggling status for user ${userId} from ${user.status} to ${user.status === "active" ? "blocked" : "active"}`)
      setIsProcessing(null)
      // In a real app, you would update the user status and refresh the page
      router.refresh()
    }, 1000)
  }
  
  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">The user you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/users")}>
            Back to Users
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
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
          
          {user.role !== "admin" && (
            <>
              {user.status === "active" ? (
                <Button 
                  variant="outline"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                  onClick={handleToggleUserStatus}
                  disabled={isProcessing === "status"}
                >
                  <X className="mr-2 h-4 w-4" />
                  {isProcessing === "status" ? "Blocking..." : "Block User"}
                </Button>
              ) : user.status === "blocked" ? (
                <Button 
                  variant="outline"
                  className="text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                  onClick={handleToggleUserStatus}
                  disabled={isProcessing === "status"}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isProcessing === "status" ? "Unblocking..." : "Unblock User"}
                </Button>
              ) : null}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                        <div className="space-y-2">
                          <div className="font-medium">This action cannot be undone.</div>
                          <div>
                            This will permanently delete the user account for {user.name} ({user.email}).
                            {user.bookings > 0 ? (
                              <>
                                <br />
                                This user has {user.bookings} booking{user.bookings !== 1 ? "s" : ""}.
                                Deleting this user may affect existing booking data.
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleDeleteUser}
                      disabled={isProcessing === "delete"}
                    >
                      {isProcessing === "delete" ? "Deleting..." : "Delete User"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <div className="mt-2 flex gap-2">
              {user.role === "admin" ? (
                <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
              ) : (
                <Badge variant="outline">User</Badge>
              )}
              
              {user.status === "active" ? (
                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              ) : user.status === "inactive" ? (
                <Badge variant="outline">Inactive</Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600">Blocked</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p>{user.name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{user.city}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Registered on: {user.registeredOn}</p>
                      <p className="text-sm text-muted-foreground">Last login: {user.lastLogin}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Booking Statistics</h3>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Bookings</span>
                    <span className="text-xl font-bold">{user.bookings}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User Details
              </Link>
            </Button>
            
            {user.bookings > 0 && (
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/users/${user.id}/bookings`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Bookings
                </Link>
              </Button>
            )}
            
            {user.role !== "admin" && user.status === "active" && (
              <Button 
                className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                variant="outline"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Blocking..." : "Block User"}
              </Button>
            )}
            
            {user.role !== "admin" && user.status === "blocked" && (
              <Button 
                className="w-full justify-start text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20" 
                variant="outline"
                onClick={handleToggleUserStatus}
                disabled={isProcessing === "status"}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "status" ? "Unblocking..." : "Unblock User"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {user.bookings > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Booking History</h2>
            <p className="text-muted-foreground">Recent bookings made by this user</p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.bookingHistory.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.event}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.venue}</TableCell>
                    <TableCell>₹{booking.amount}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
