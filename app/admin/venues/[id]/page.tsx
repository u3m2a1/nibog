"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, MapPin } from "lucide-react"
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
const venues = [
  {
    id: "1",
    name: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    address: "Gachibowli, Hyderabad, Telangana 500032",
    capacity: 500,
    events: 12,
    isActive: true,
  },
  {
    id: "2",
    name: "Indoor Stadium",
    city: "Chennai",
    address: "Jawaharlal Nehru Stadium, Chennai, Tamil Nadu 600003",
    capacity: 300,
    events: 6,
    isActive: true,
  },
  {
    id: "3",
    name: "Indoor Stadium",
    city: "Bangalore",
    address: "Koramangala, Bangalore, Karnataka 560034",
    capacity: 250,
    events: 8,
    isActive: true,
  },
  {
    id: "4",
    name: "Sports Complex",
    city: "Vizag",
    address: "Beach Road, Visakhapatnam, Andhra Pradesh 530017",
    capacity: 200,
    events: 4,
    isActive: true,
  },
  {
    id: "5",
    name: "Indoor Stadium",
    city: "Mumbai",
    address: "Andheri Sports Complex, Mumbai, Maharashtra 400053",
    capacity: 350,
    events: 5,
    isActive: true,
  },
  {
    id: "6",
    name: "Sports Complex",
    city: "Delhi",
    address: "Indira Gandhi Sports Complex, Delhi 110002",
    capacity: 400,
    events: 6,
    isActive: true,
  },
  {
    id: "7",
    name: "Indoor Stadium",
    city: "Kolkata",
    address: "Salt Lake Stadium, Kolkata, West Bengal 700098",
    capacity: 300,
    events: 3,
    isActive: true,
  },
]

// Mock events data
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-04-15",
    registrations: 45,
    status: "upcoming",
  },
  {
    id: "E002",
    title: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-05-20",
    registrations: 38,
    status: "upcoming",
  },
  {
    id: "E003",
    title: "Running Race",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-06-10",
    registrations: 52,
    status: "upcoming",
  },
]

type Props = {
  params: { id: string }
}

export default function VenueDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const venueId = unwrappedParams.id
  
  const venue = venues.find((v) => v.id === venueId)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Handle venue deletion
  const handleDeleteVenue = () => {
    setIsDeleting(true)
    
    // Simulate API call to delete the venue
    setTimeout(() => {
      console.log(`Deleting venue ${venueId}`)
      setIsDeleting(false)
      // In a real app, you would delete the venue and then redirect
      router.push("/admin/venues")
    }, 1000)
  }
  
  if (!venue) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Venue not found</h2>
          <p className="text-muted-foreground">The venue you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/venues")}>
            Back to Venues
          </Button>
        </div>
      </div>
    )
  }
  
  // Filter events for this venue
  const venueEvents = events.filter(e => e.venue === venue.name && e.city === venue.city)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{venue.name}</h1>
            <p className="text-muted-foreground">{venue.city}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/venues/${venue.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Venue
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Venue
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the venue "{venue.name}" in {venue.city} and all associated data.
                        {venue.events > 0 ? (
                          <>
                            This venue has {venue.events} event{venue.events !== 1 ? "s" : ""}.
                            Deleting it may affect existing data.
                          </>
                        ) : (
                          "This venue has no events."
                        )}
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteVenue}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Venue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{venue.address}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">City</h3>
                <p className="text-sm text-muted-foreground">{venue.city}</p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Capacity</h3>
                <p className="text-sm text-muted-foreground">{venue.capacity} participants</p>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Status</h3>
              {venue.isActive ? (
                <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
              <p className="mt-2 text-2xl font-bold">{venue.events}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
              <p className="mt-2 text-2xl font-bold">{Math.floor(venue.events * 0.7)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Past Events</h3>
              <p className="mt-2 text-2xl font-bold">{Math.floor(venue.events * 0.3)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Upcoming Events</h2>
          <p className="text-muted-foreground">Events scheduled at this venue</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venueEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No events found for this venue.
                  </TableCell>
                </TableRow>
              ) : (
                venueEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.registrations}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/events/${event.id}`}>
                          View
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
    </div>
  )
}
