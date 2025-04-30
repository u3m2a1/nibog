"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, Star, AlertTriangle, Check, X } from "lucide-react"
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
const testimonials = [
  {
    id: "1",
    name: "Harikrishna",
    city: "Hyderabad",
    event: "Baby Crawling",
    rating: 5,
    testimonial:
      "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    status: "published",
    date: "2025-10-15",
  },
  {
    id: "2",
    name: "Durga Prasad",
    city: "Bangalore",
    event: "Baby Walker",
    rating: 5,
    testimonial:
      "New India Baby Olympic games has been a great experience for my kids. They love competing with other kids and showing off their skills, and it's been great for their hand-eye coordination and fine motor skills. I love that they're learning important life skills like teamwork and sportsmanship while they're having fun.",
    status: "published",
    date: "2025-10-16",
  },
  {
    id: "3",
    name: "Srujana",
    city: "Vizag",
    event: "Running Race",
    rating: 4,
    testimonial:
      "My kids love participating in games. It's been great for their problem-solving skills, as they get to tackle different challenges and puzzles. They've also developed their critical thinking skills.",
    status: "published",
    date: "2025-10-17",
  },
  {
    id: "4",
    name: "Ramesh Kumar",
    city: "Chennai",
    event: "Hurdle Toddle",
    rating: 5,
    testimonial:
      "NIBOG events are well-organized and the staff is very professional. My child had a great time participating in the hurdle toddle event. We'll definitely be back for more events!",
    status: "pending",
    date: "2025-03-10",
  },
  {
    id: "5",
    name: "Suresh Reddy",
    city: "Mumbai",
    event: "Cycle Race",
    rating: 4,
    testimonial:
      "The cycle race was a fantastic experience for my child. The venue was great and the event was well-organized. Looking forward to more NIBOG events in the future.",
    status: "pending",
    date: "2025-08-10",
  },
]

// Testimonial statuses
const statuses = [
  { id: "1", name: "published" },
  { id: "2", name: "pending" },
  { id: "3", name: "rejected" },
]

// Events
const events = [
  { id: "1", name: "Baby Crawling" },
  { id: "2", name: "Baby Walker" },
  { id: "3", name: "Running Race" },
  { id: "4", name: "Hurdle Toddle" },
  { id: "5", name: "Cycle Race" },
  { id: "6", name: "Ring Holding" },
]

// Cities
const cities = [
  { id: "1", name: "Hyderabad" },
  { id: "2", name: "Bangalore" },
  { id: "3", name: "Chennai" },
  { id: "4", name: "Vizag" },
  { id: "5", name: "Mumbai" },
  { id: "6", name: "Delhi" },
  { id: "7", name: "Kolkata" },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [testimonialsList, setTestimonialsList] = useState(testimonials)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Handle delete testimonial
  const handleDeleteTestimonial = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to delete the testimonial
    setTimeout(() => {
      // In a real app, this would be an API call to delete the testimonial
      setTestimonialsList(testimonialsList.filter(testimonial => testimonial.id !== id))
      setIsProcessing(null)
    }, 1000)
  }

  // Handle approve testimonial
  const handleApproveTestimonial = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to approve the testimonial
    setTimeout(() => {
      // In a real app, this would be an API call to update the testimonial status
      setTestimonialsList(testimonialsList.map(testimonial => {
        if (testimonial.id === id) {
          return {
            ...testimonial,
            status: "published"
          }
        }
        return testimonial
      }))
      setIsProcessing(null)
    }, 1000)
  }

  // Handle reject testimonial
  const handleRejectTestimonial = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to reject the testimonial
    setTimeout(() => {
      // In a real app, this would be an API call to update the testimonial status
      setTestimonialsList(testimonialsList.map(testimonial => {
        if (testimonial.id === id) {
          return {
            ...testimonial,
            status: "rejected"
          }
        }
        return testimonial
      }))
      setIsProcessing(null)
    }, 1000)
  }

  // Filter testimonials based on search and filters
  const filteredTestimonials = testimonialsList.filter((testimonial) => {
    // Search query filter
    if (
      searchQuery &&
      !testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !testimonial.testimonial.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && testimonial.status !== selectedStatus) {
      return false
    }

    // Event filter
    if (selectedEvent !== "all" && testimonial.event !== selectedEvent) {
      return false
    }

    // City filter
    if (selectedCity !== "all" && testimonial.city !== selectedCity) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage parent testimonials for NIBOG events</p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Testimonial
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
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

              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.name}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
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
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Testimonial</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No testimonials found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.name}</TableCell>
                  <TableCell>{testimonial.city}</TableCell>
                  <TableCell>{testimonial.event}</TableCell>
                  <TableCell>{getRatingStars(testimonial.rating)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{testimonial.testimonial}</TableCell>
                  <TableCell>{testimonial.date}</TableCell>
                  <TableCell>{getStatusBadge(testimonial.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/testimonials/${testimonial.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {testimonial.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproveTestimonial(testimonial.id)}
                          disabled={isProcessing === testimonial.id}
                          title="Approve"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Approve</span>
                        </Button>
                      )}
                      {testimonial.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRejectTestimonial(testimonial.id)}
                          disabled={isProcessing === testimonial.id}
                          title="Reject"
                        >
                          <X className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                                <div className="space-y-2">
                                  <div className="font-medium">This action cannot be undone.</div>
                                  <div>
                                    This will permanently delete the testimonial from {testimonial.name}.
                                    Are you sure you want to continue?
                                  </div>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              disabled={isProcessing === testimonial.id}
                            >
                              {isProcessing === testimonial.id ? "Deleting..." : "Delete Testimonial"}
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
