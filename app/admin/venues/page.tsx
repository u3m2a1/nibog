"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, Loader2 } from "lucide-react"
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
import { getAllVenuesWithCity, deleteVenue } from "@/services/venueService"
import { getAllCities } from "@/services/cityService"
import { useToast } from "@/components/ui/use-toast"

// Interface for venue with city details
interface VenueWithCity {
  venue_id: number;
  venue_name: string;
  address: string;
  capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
  city_id: number;
  city_name: string;
  state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  events?: number; // This is not in the API but we'll add it for UI consistency
}

export default function VenuesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [venuesList, setVenuesList] = useState<VenueWithCity[]>([])
  const [cities, setCities] = useState<Array<{ id: number, city_name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch venues and cities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch venues with city details
        const venuesData = await getAllVenuesWithCity()

        console.log("Venues data received:", venuesData)

        // Check if we have valid data
        if (!Array.isArray(venuesData) || venuesData.length === 0) {
          console.log("No venues data found or invalid data format")
          setVenuesList([])
        } else {
          // Normalize the data to ensure it matches our expected structure
          const normalizedVenues = venuesData
            .filter(venue =>
              (venue.venue_id || venue.id) &&
              (venue.venue_name || venue.name) &&
              (venue.address || "") !== "" &&
              (venue.city_name || "") !== ""
            )
            .map(venue => {
              // Log the venue data to help diagnose issues
              console.log("Processing venue:", venue)
      
              // Create a normalized venue object with all required fields
              return {
                venue_id: venue.venue_id || venue.id || 0,
                venue_name: venue.venue_name || venue.name || "Unknown Venue",
                address: venue.address || "No address provided",
                capacity: venue.capacity || 0,
                venue_is_active: venue.venue_is_active !== undefined ? venue.venue_is_active :
                                (venue.is_active !== undefined ? venue.is_active : false),
                venue_created_at: venue.venue_created_at || venue.created_at || new Date().toISOString(),
                venue_updated_at: venue.venue_updated_at || venue.updated_at || new Date().toISOString(),
                city_id: venue.city_id || 0,
                city_name: venue.city_name || "Unknown City",
                state: venue.state || "",
                city_is_active: venue.city_is_active !== undefined ? venue.city_is_active : true,
                city_created_at: venue.city_created_at || new Date().toISOString(),
                city_updated_at: venue.city_updated_at || new Date().toISOString(),
                events: Number(venue.event_count) || 0 // Use event_count from API
              }
            })
    
          console.log("Normalized venues:", normalizedVenues)
          setVenuesList(normalizedVenues)
        }

        // Fetch cities for the filter dropdown
        const citiesData = await getAllCities()
        console.log("Cities data received:", citiesData)
        setCities(
          citiesData
            .filter(city => typeof city.id === "number")
            .map(city => ({ id: city.id ?? 0, city_name: city.city_name }))
        )
      } catch (error: any) {
        console.error("Failed to fetch data:", error)
        setError(error.message || "Failed to load venues. Please try again.")
        toast({
          title: "Error",
          description: error.message || "Failed to load venues. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Removed toast from dependency array to prevent infinite loop

  // Handle venue deletion
  const handleDeleteVenue = async (id: number) => {
    try {
      setIsDeleting(id)

      // Call the API to delete the venue
      const result = await deleteVenue(id)

      if (result.success) {
        // Remove the deleted venue from the list
        setVenuesList(venuesList.filter(venue => venue.venue_id !== id))

        toast({
          title: "Success",
          description: "Venue deleted successfully",
        })
      } else {
        throw new Error("Failed to delete venue. Please try again.")
      }
    } catch (error: any) {
      console.error("Error deleting venue:", error)

      toast({
        title: "Error",
        description: error.message || "Failed to delete venue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter venues based on search and city filter
  const filteredVenues = venuesList.filter((venue) => {
    // Search query filter
    if (searchQuery) {
      const venueName = venue.venue_name || "Unknown Venue";
      const venueAddress = venue.address || "No address";

      if (!venueName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !venueAddress.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    // City filter
    if (selectedCity !== "all") {
      const cityName = venue.city_name || "Unknown City";
      if (cityName !== selectedCity) {
        return false;
      }
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
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={isLoading}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.city_name}>
                      {city.city_name}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading venues...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-red-500">
                  <div className="flex justify-center items-center">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    <span>{error}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredVenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p>No venues found.</p>
                    <Button asChild>
                      <Link href="/admin/venues/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Venue
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVenues.map((venue) => (
                <TableRow key={venue.venue_id}>
                  <TableCell className="font-medium">{venue.venue_name}</TableCell>
                  <TableCell>{venue.city_name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{venue.address}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>
                    {venue.events && venue.events > 0
                      ? venue.events
                      : "No events"}
                  </TableCell>
                  <TableCell>
                    {venue.venue_is_active ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/venues/${venue.venue_id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/venues/${venue.venue_id}/edit`}>
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
                                    This will permanently delete the venue "{venue.venue_name}" in {venue.city_name} and all associated data.
                                    {venue.events && venue.events > 0 ? (
                                      <>
                                        {" "}This venue has {venue.events} event{venue.events !== 1 ? "s" : ""}.
                                        Deleting it may affect existing data.
                                      </>
                                    ) : (
                                      " This venue has no events."
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
                              onClick={() => handleDeleteVenue(venue.venue_id)}
                              disabled={isDeleting === venue.venue_id}
                            >
                              {isDeleting === venue.venue_id ? "Deleting..." : "Delete Venue"}
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
