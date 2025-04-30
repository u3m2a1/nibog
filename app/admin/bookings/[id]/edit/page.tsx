"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const bookings = [
  {
    id: "B001",
    user: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    event: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "confirmed",
    childDetails: [
      {
        name: "Arjun",
        age: "14 months",
        gender: "Male"
      }
    ],
    paymentDetails: {
      method: "Credit Card",
      transactionId: "TXN123456789",
      paidOn: "2025-10-20"
    },
    bookingDate: "2025-10-20"
  },
  {
    id: "B002",
    user: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    event: "Baby Walker",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 1,
    amount: 1800,
    status: "pending_payment",
    childDetails: [
      {
        name: "Aarav",
        age: "16 months",
        gender: "Male"
      }
    ],
    paymentDetails: null,
    bookingDate: "2025-10-21"
  },
  {
    id: "B003",
    user: "Srujana",
    email: "srujana@example.com",
    phone: "+91 9876543212",
    event: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-10-26",
    time: "9:00 AM",
    children: 2,
    amount: 3600,
    status: "confirmed",
    childDetails: [
      {
        name: "Ananya",
        age: "3 years",
        gender: "Female"
      },
      {
        name: "Advika",
        age: "5 years",
        gender: "Female"
      }
    ],
    paymentDetails: {
      method: "UPI",
      transactionId: "UPI987654321",
      paidOn: "2025-10-19"
    },
    bookingDate: "2025-10-19"
  }
]

// Mock events data
const events = [
  { id: "1", name: "Baby Crawling" },
  { id: "2", name: "Baby Walker" },
  { id: "3", name: "Running Race" },
  { id: "4", name: "Hurdle Toddle" },
  { id: "5", name: "Cycle Race" },
  { id: "6", name: "Ring Holding" },
]

// Mock venues data
const venues = [
  {
    id: "1",
    name: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
  },
  {
    id: "2",
    name: "Indoor Stadium",
    city: "Chennai",
  },
  {
    id: "3",
    name: "Indoor Stadium",
    city: "Bangalore",
  },
  {
    id: "4",
    name: "Sports Complex",
    city: "Vizag",
  },
]

// Booking statuses
const statuses = [
  { id: "1", name: "confirmed", label: "Confirmed" },
  { id: "2", name: "pending_payment", label: "Pending Payment" },
  { id: "3", name: "cancelled_by_user", label: "Cancelled by User" },
  { id: "4", name: "cancelled_by_admin", label: "Cancelled by Admin" },
  { id: "5", name: "attended", label: "Attended" },
  { id: "6", name: "no_show", label: "No Show" },
]

type Props = {
  params: { id: string }
}

export default function EditBookingPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const bookingId = unwrappedParams.id
  
  const [booking, setBooking] = useState<any>(null)
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [event, setEvent] = useState("")
  const [venue, setVenue] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [status, setStatus] = useState("")
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [childGender, setChildGender] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the booking data
    const foundBooking = bookings.find(b => b.id === bookingId)
    if (foundBooking) {
      setBooking(foundBooking)
      setUserName(foundBooking.user)
      setEmail(foundBooking.email)
      setPhone(foundBooking.phone)
      setEvent(foundBooking.event)
      setVenue(foundBooking.venue)
      setDate(new Date(foundBooking.date))
      setTime(foundBooking.time)
      setStatus(foundBooking.status)
      
      if (foundBooking.childDetails && foundBooking.childDetails.length > 0) {
        setChildName(foundBooking.childDetails[0].name)
        setChildAge(foundBooking.childDetails[0].age)
        setChildGender(foundBooking.childDetails[0].gender)
      }
    }
  }, [bookingId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to update the booking
    setTimeout(() => {
      // In a real app, this would be an API call to update the booking
      console.log({
        id: bookingId,
        user: userName,
        email,
        phone,
        event,
        venue,
        date: date ? format(date, "yyyy-MM-dd") : "",
        time,
        status,
        childDetails: [
          {
            name: childName,
            age: childAge,
            gender: childGender
          }
        ]
      })
      
      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the booking details page
        router.push(`/admin/bookings/${bookingId}`)
      }, 1500)
    }, 1000)
  }

  if (!booking) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Booking not found</h2>
          <p className="text-muted-foreground">The booking you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/bookings")}>
            Back to Bookings
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
            <Link href={`/admin/bookings/${bookingId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
            <p className="text-muted-foreground">Update booking information for {booking.id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Update the customer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Customer Name</Label>
                <Input 
                  id="userName" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Update the event details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={event} onValueChange={setEvent} required>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.name}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Select value={venue} onValueChange={setVenue} required>
                  <SelectTrigger id="venue">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}, {v.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={time} onValueChange={setTime} required>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                      <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                      <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                      <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Update the child details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name</Label>
                <Input 
                  id="childName" 
                  value={childName} 
                  onChange={(e) => setChildName(e.target.value)} 
                  placeholder="Enter child name"
                  required
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="childAge">Child Age</Label>
                  <Input 
                    id="childAge" 
                    value={childAge} 
                    onChange={(e) => setChildAge(e.target.value)} 
                    placeholder="e.g., 14 months, 3 years"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={childGender} onValueChange={setChildGender} required>
                    <SelectTrigger id="childGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/bookings/${bookingId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
