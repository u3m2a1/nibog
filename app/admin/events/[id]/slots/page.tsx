"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Users, Pause, Play, X, AlertTriangle } from "lucide-react"
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
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "E001",
    title: "Baby Sensory Play",
    venue: {
      name: "Little Explorers Center",
      city: "Mumbai",
    },
    date: "2025-04-15",
    slots: [
      { 
        id: "S001", 
        startTime: "10:00 AM", 
        endTime: "11:30 AM", 
        price: 799, 
        maxParticipants: 12, 
        currentParticipants: 7, 
        status: "active",
      },
      { 
        id: "S002", 
        startTime: "02:00 PM", 
        endTime: "03:30 PM", 
        price: 799, 
        maxParticipants: 12, 
        currentParticipants: 4, 
        status: "active",
      },
    ],
  },
]

type Props = {
  params: Promise<{ id: string }>
}

export default function EventSlotsPage({ params }: Props) {
  const router = useRouter()

  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params)
  const event = events.find((e) => e.id === resolvedParams.id)

  if (!event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Time Slots</h1>
          <p className="text-muted-foreground">
            {event.title} | {event.venue.name}, {event.venue.city} | {event.date}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Time Slots</CardTitle>
            <CardDescription>Manage time slots for this event</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/admin/events/${resolvedParams.id}/slots/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Slot
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.slots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No time slots defined for this event.
                    </TableCell>
                  </TableRow>
                ) : (
                  event.slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell>₹{slot.price}</TableCell>
                      <TableCell>{slot.maxParticipants}</TableCell>
                      <TableCell>
                        {slot.currentParticipants}/{slot.maxParticipants}
                        <div className="mt-1 h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${(slot.currentParticipants / slot.maxParticipants) * 100}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {slot.status === "active" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                        )}
                        {slot.status === "paused" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                        )}
                        {slot.status === "cancelled" && (
                          <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                        )}
                        {slot.status === "completed" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                        )}
                        {slot.status === "full" && (
                          <Badge className="bg-purple-500 hover:bg-purple-600">Full</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/events/${resolvedParams.id}/slots/${slot.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/events/${resolvedParams.id}/slots/${slot.id}/participants`}>
                              <Users className="mr-2 h-4 w-4" />
                              Participants
                            </Link>
                          </Button>
                          {slot.status === "active" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Pause Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will pause this time slot. No new bookings will be allowed, but existing bookings will be maintained. Are you sure you want to continue?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction>Pause Slot</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {slot.status === "paused" && (
                            <Button variant="ghost" size="sm">
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          {(slot.status === "active" || slot.status === "paused") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {slot.currentParticipants > 0 ? (
                                      <>
                                        <AlertTriangle className="mb-2 h-5 w-5 text-amber-500" />
                                        <p>
                                          This slot has {slot.currentParticipants} existing bookings. Cancelling will notify all participants and may require refunds.
                                        </p>
                                      </>
                                    ) : (
                                      <p>
                                        This will cancel this time slot. Are you sure you want to continue?
                                      </p>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, Keep Slot</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                                    Yes, Cancel Slot
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
