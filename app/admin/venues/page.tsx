"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle } from "lucide-react"
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

// Mock cities data
const cities = [
  { id: "1", name: "Hyderabad" },
  { id: "2", name: "Bangalore" },
  { id: "3", name: "Chennai" },
  { id: "4", name: "Vizag" },
  { id: "5", name: "Mumbai" },
  { id: "6", name: "Delhi" },
  { id: "7", name: "Kolkata" },
  { id: "8", name: "Pune" },
  { id: "9", name: "Patna" },
  { id: "10", name: "Ranchi" },
]

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [venuesList, setVenuesList] = useState(venues)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Handle venue deletion
  const handleDeleteVenue = (id: string) => {
    setIsDeleting(id)

    // Simulate API call to delete the venue
    setTimeout(() => {
      // In a real app, this would be an API call to delete the venue
      setVenuesList(venuesList.filter(venue => venue.id !== id))
      setIsDeleting(null)
    }, 1000)
  }

  // Filter venues based on search and city filter
  const filteredVenues = venuesList.filter((venue) => {
    // Search query filter
    if (
      searchQuery &&
      !venue.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // City filter
    if (selectedCity !== "all" && venue.city !== selectedCity) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Venues</h1>
          <p className="text-muted-foreground">Manage venues where NIBOG events are held</p>
        </div>
        <Button asChild>
          <Link href="/admin/venues/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Venue
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venue</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No venues found.
                </TableCell>
              </TableRow>
            ) : (
              filteredVenues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell>{venue.city}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{venue.address}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>{venue.events}</TableCell>
                  <TableCell>
                    {venue.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/venues/${venue.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/venues/${venue.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
                              onClick={() => handleDeleteVenue(venue.id)}
                              disabled={isDeleting === venue.id}
                            >
                              {isDeleting === venue.id ? "Deleting..." : "Delete Venue"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
