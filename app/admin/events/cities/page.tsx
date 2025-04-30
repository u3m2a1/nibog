"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, MapPin, Building, Calendar, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// We'll implement animations without framer-motion

// Mock data - in a real app, this would come from an API
const cities = [
  {
    id: "C001",
    name: "Hyderabad",
    state: "Telangana",
    activeEvents: 5,
    upcomingEvents: 3,
    totalVenues: 4,
    totalGames: 12,
  },
  {
    id: "C002",
    name: "Mumbai",
    state: "Maharashtra",
    activeEvents: 4,
    upcomingEvents: 2,
    totalVenues: 3,
    totalGames: 10,
  },
  {
    id: "C003",
    name: "Bangalore",
    state: "Karnataka",
    activeEvents: 6,
    upcomingEvents: 4,
    totalVenues: 5,
    totalGames: 15,
  },
  {
    id: "C004",
    name: "Chennai",
    state: "Tamil Nadu",
    activeEvents: 3,
    upcomingEvents: 2,
    totalVenues: 3,
    totalGames: 8,
  },
  {
    id: "C005",
    name: "Delhi",
    state: "Delhi",
    activeEvents: 7,
    upcomingEvents: 5,
    totalVenues: 6,
    totalGames: 18,
  },
  {
    id: "C006",
    name: "Pune",
    state: "Maharashtra",
    activeEvents: 3,
    upcomingEvents: 2,
    totalVenues: 2,
    totalGames: 7,
  },
  {
    id: "C007",
    name: "Kolkata",
    state: "West Bengal",
    activeEvents: 4,
    upcomingEvents: 3,
    totalVenues: 3,
    totalGames: 9,
  },
  {
    id: "C008",
    name: "Ahmedabad",
    state: "Gujarat",
    activeEvents: 2,
    upcomingEvents: 1,
    totalVenues: 2,
    totalGames: 5,
  },
]

// Mock venues data
const venues = {
  "Hyderabad": [
    { id: "V001", name: "Gachibowli Indoor Stadium", address: "Gachibowli, Hyderabad", activeEvents: 2, upcomingEvents: 1 },
    { id: "V002", name: "Hitex Exhibition Center", address: "Madhapur, Hyderabad", activeEvents: 1, upcomingEvents: 1 },
    { id: "V003", name: "Kids Paradise", address: "Banjara Hills, Hyderabad", activeEvents: 1, upcomingEvents: 0 },
    { id: "V004", name: "Little Stars Center", address: "Jubilee Hills, Hyderabad", activeEvents: 1, upcomingEvents: 1 },
  ],
  "Mumbai": [
    { id: "V005", name: "Aqua Sports Complex", address: "Andheri, Mumbai", activeEvents: 1, upcomingEvents: 0 },
    { id: "V006", name: "Kids World", address: "Bandra, Mumbai", activeEvents: 2, upcomingEvents: 1 },
    { id: "V007", name: "Play Zone", address: "Juhu, Mumbai", activeEvents: 1, upcomingEvents: 1 },
  ],
}

export default function EventsCitiesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter cities based on search query
  const filteredCities = cities.filter(city => {
    if (!searchQuery) return true

    return (
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
            <p className="text-muted-foreground">Manage events by city</p>
          </div>
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
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="transition-all duration-300 ease-in-out space-y-6">
          {filteredCities.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border">
              <p className="text-muted-foreground">No cities found matching your search.</p>
            </div>
          ) : (
            filteredCities.map((city) => (
              <Card key={city.id} className="overflow-hidden">
                <div
                  className="flex cursor-pointer items-center justify-between border-b p-4 hover:bg-muted/50"
                  onClick={() => router.push(`/admin/events/cities/${encodeURIComponent(city.name)}`)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {city.state} • {city.totalVenues} venues • {city.totalGames} games
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Active Events</div>
                      <div className="font-semibold">{city.activeEvents}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Upcoming Events</div>
                      <div className="font-semibold">{city.upcomingEvents}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {venues[city.name] && (
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Active Events</TableHead>
                          <TableHead>Upcoming Events</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venues[city.name].map((venue) => (
                          <TableRow key={venue.id}>
                            <TableCell className="font-medium">{venue.name}</TableCell>
                            <TableCell>{venue.address}</TableCell>
                            <TableCell>
                              <Badge variant={venue.activeEvents > 0 ? "default" : "outline"}>
                                {venue.activeEvents}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {venue.upcomingEvents}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/events/venues/${encodeURIComponent(venue.name)}`}>
                                  View Games
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            ))
          )}
      </div>
    </div>
  )
}
