"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash, AlertTriangle, Loader2 } from "lucide-react"
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
import { getAllCities, deleteCity, City } from "@/services/cityService"
import { toast } from "@/components/ui/use-toast"

export default function CitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [citiesList, setCitiesList] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching all cities...")
        const cities = await getAllCities()
        console.log("Cities data received:", cities)
        setCitiesList(cities)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch cities:", err)
        setError(`Failed to load cities: ${err.message || "Please try again later."}`)
        toast({
          title: "Error",
          description: `Failed to load cities: ${err.message || "Please try again later."}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCities()
  }, [])

  // Handle city deletion
  const handleDeleteCity = async (id: number) => {
    try {
      setIsDeleting(id)
      console.log(`Initiating delete for city ID: ${id}`)

      // Add a delay to ensure UI feedback
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call the delete API
      const result = await deleteCity(id)
      console.log(`Delete result:`, result)

      if (result && result.success) {
        // Always refresh the list from the server to ensure data consistency
        try {
          console.log("Refreshing city list after deletion...")
          const refreshedCities = await getAllCities()
          setCitiesList(refreshedCities)

          // Check if the city was actually deleted
          const cityStillExists = refreshedCities.some(city => city.id === id)

          if (cityStillExists) {
            console.error(`City with ID ${id} still exists after deletion!`)
            throw new Error("City was not deleted from the database. Please try again.")
          } else {
            toast({
              title: "Success",
              description: "City deleted successfully",
            })
          }
        } catch (refreshErr: any) {
          console.error("Failed to refresh cities after deletion:", refreshErr)

          // If we can't verify the deletion, assume it worked but warn the user
          toast({
            title: "Warning",
            description: "City may have been deleted, but we couldn't verify. Please refresh the page.",
            variant: "destructive",
          })

          // Remove the city from the local state as a fallback
          setCitiesList(prevList => prevList.filter(city => city.id !== id))
        }
      } else {
        throw new Error("Failed to delete city: API returned unsuccessful result")
      }
    } catch (err: any) {
      console.error(`Failed to delete city with ID ${id}:`, err)
      toast({
        title: "Error",
        description: `Failed to delete city: ${err.message || "Please try again later."}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter cities based on search
  const filteredCities = citiesList.filter((city) => {
    if (searchQuery) {
      return (
        city.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Cities</h1>
          <p className="text-muted-foreground">Manage cities where NIBOG events are held</p>
        </div>
        <Button asChild>
          <Link href="/admin/cities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New City
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              className="h-9 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Venues</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading cities...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p>No cities found.</p>
                    <Button asChild>
                      <Link href="/admin/cities/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First City
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (() => {
                const displayCities = filteredCities
                  .filter(city =>
                    (city.city_name && city.city_name !== "No venues") &&
                    (city.venues && city.venues > 0)
                  );
                if (displayCities.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <p>No cities found.</p>
                          <Button asChild>
                            <Link href="/admin/cities/new">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Your First City
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
                return displayCities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.city_name}</TableCell>
                    <TableCell>{city.state}</TableCell>
                    <TableCell>
                      {city.venues && city.venues > 0
                        ? city.venues
                        : "No venues"}
                    </TableCell>
                    <TableCell>{city.events || 0}</TableCell>
                    <TableCell>
                      {city.is_active ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/cities/${city.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/cities/${city.id}/edit`}>
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
                              <AlertDialogTitle>Delete City</AlertDialogTitle>
                              <AlertDialogDescription>
                                <span>
                                  <strong>This action cannot be undone.</strong>
                                  <br />
                                  This will permanently delete the city "{city.city_name}" and all associated data.
                                  <br />
                                  {(city.venues && city.venues > 0) || (city.events && city.events > 0) ? (
                                    <>
                                      This city has {city.venues || 0} venue{(city.venues || 0) !== 1 ? "s" : ""} and {city.events || 0} event{(city.events || 0) !== 1 ? "s" : ""}.
                                      Deleting it may affect existing data.
                                    </>
                                  ) : (
                                    <>This city has no venues or events.</>
                                  )}
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteCity(city.id!)}
                                disabled={isDeleting === city.id}
                              >
                                {isDeleting === city.id ? "Deleting..." : "Delete City"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })()
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
