"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, XCircle, Download, Mail, Printer, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
const completedEvents = [
  {
    id: "CE001",
    title: "Baby Crawling Championship",
    gameTemplate: "Baby Crawling",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    date: "2025-08-15",
    registrations: 45,
    attendance: 42,
    attendanceRate: 93,
    revenue: 35955,
    status: "completed",
    description: "A fun and exciting baby crawling competition for babies aged 5-13 months. Parents and children enjoyed a day full of activities and friendly competition.",
    participants: [
      { id: "P001", parentName: "Rahul Sharma", childName: "Arjun Sharma", childAge: 8, attended: true, addons: ["T-Shirt", "Photo Package"] },
      { id: "P002", parentName: "Priya Patel", childName: "Aarav Patel", childAge: 7, attended: true, addons: ["T-Shirt"] },
      { id: "P003", parentName: "Neha Singh", childName: "Ishaan Singh", childAge: 9, attended: true, addons: ["Meal Pack", "Photo Package"] },
      { id: "P004", parentName: "Amit Kumar", childName: "Vihaan Kumar", childAge: 6, attended: true, addons: ["T-Shirt", "Meal Pack"] },
      { id: "P005", parentName: "Deepa Reddy", childName: "Aadhya Reddy", childAge: 10, attended: true, addons: ["Photo Package"] },
      { id: "P006", parentName: "Kiran Joshi", childName: "Ananya Joshi", childAge: 8, attended: false, addons: ["T-Shirt"] },
      { id: "P007", parentName: "Sanjay Gupta", childName: "Aanya Gupta", childAge: 7, attended: true, addons: ["Meal Pack"] },
      { id: "P008", parentName: "Meera Verma", childName: "Advait Verma", childAge: 9, attended: true, addons: ["T-Shirt", "Photo Package"] },
      { id: "P009", parentName: "Rajesh Malhotra", childName: "Advik Malhotra", childAge: 8, attended: true, addons: [] },
      { id: "P010", parentName: "Anita Kapoor", childName: "Avni Kapoor", childAge: 6, attended: false, addons: ["T-Shirt", "Meal Pack"] },
    ],
    addonSales: [
      { name: "T-Shirt", sold: 18, collected: 16, revenue: 8982 },
      { name: "Meal Pack", sold: 15, collected: 14, revenue: 4485 },
      { name: "Photo Package", sold: 12, collected: 12, revenue: 11988 },
    ],
    winners: [
      { position: 1, childName: "Arjun Sharma", parentName: "Rahul Sharma", prize: "Gold Medal + Gift Hamper" },
      { position: 2, childName: "Aadhya Reddy", parentName: "Deepa Reddy", prize: "Silver Medal + Gift Hamper" },
      { position: 3, childName: "Ishaan Singh", parentName: "Neha Singh", prize: "Bronze Medal + Gift Hamper" },
    ],
    certificatesSent: 40,
    feedbackRating: 4.8,
  },
  {
    id: "CE002",
    title: "Baby Walker Race",
    gameTemplate: "Baby Walker",
    venue: "Hitex Exhibition Center",
    city: "Hyderabad",
    date: "2025-08-10",
    registrations: 38,
    attendance: 35,
    attendanceRate: 92,
    revenue: 30362,
    status: "completed",
    description: "An exciting baby walker race for babies aged 5-13 months. The event featured multiple race categories and fun activities for the whole family.",
    participants: [
      { id: "P011", parentName: "Vikram Mehta", childName: "Aarav Mehta", childAge: 10, attended: true, addons: ["T-Shirt", "Photo Package"] },
      { id: "P012", parentName: "Pooja Agarwal", childName: "Anaya Agarwal", childAge: 9, attended: true, addons: ["Meal Pack"] },
      { id: "P013", parentName: "Suresh Nair", childName: "Advait Nair", childAge: 11, attended: true, addons: ["T-Shirt"] },
      { id: "P014", parentName: "Kavita Menon", childName: "Anika Menon", childAge: 8, attended: false, addons: ["T-Shirt", "Meal Pack"] },
      { id: "P015", parentName: "Rajiv Saxena", childName: "Vihaan Saxena", childAge: 10, attended: true, addons: ["Photo Package"] },
    ],
    addonSales: [
      { name: "T-Shirt", sold: 15, collected: 13, revenue: 7485 },
      { name: "Meal Pack", sold: 12, collected: 11, revenue: 3588 },
      { name: "Photo Package", sold: 10, collected: 10, revenue: 9990 },
    ],
    winners: [
      { position: 1, childName: "Aarav Mehta", parentName: "Vikram Mehta", prize: "Gold Medal + Gift Hamper" },
      { position: 2, childName: "Advait Nair", parentName: "Suresh Nair", prize: "Silver Medal + Gift Hamper" },
      { position: 3, childName: "Anaya Agarwal", parentName: "Pooja Agarwal", prize: "Bronze Medal + Gift Hamper" },
    ],
    certificatesSent: 33,
    feedbackRating: 4.6,
  },
]

export default function CompletedEventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("participants")

  // Find the event
  const event = completedEvents.find(e => e.id === eventId)

  if (!event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event Not Found</h2>
          <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/completed-events">Back to Completed Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Filter participants based on search query
  const filteredParticipants = event.participants.filter(participant => {
    if (!searchQuery) return true

    return (
      participant.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.childName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/completed-events">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {event.venue}, {event.city} • {format(new Date(event.date), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/completed-events/venues/${encodeURIComponent(event.venue)}`}>
              <MapPin className="mr-2 h-4 w-4" />
              View Venue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/completed-events/cities/${encodeURIComponent(event.city)}`}>
              <Calendar className="mr-2 h-4 w-4" />
              View City
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">Event Summary</CardTitle>
                <CardDescription>Overview of event performance</CardDescription>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Registrations</div>
                  <div className="text-2xl font-bold">{event.registrations}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Attendance</div>
                  <div className="text-2xl font-bold">{event.attendance}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Attendance Rate</div>
                  <div className="text-2xl font-bold">{event.attendanceRate}%</div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold">{formatCurrency(event.revenue)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Feedback Rating</div>
                  <div className="text-2xl font-bold">{event.feedbackRating}/5.0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Winners</CardTitle>
              <CardDescription>Top performers in the event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.winners.map((winner) => (
                  <div key={winner.position} className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      winner.position === 1 ? "bg-yellow-100 text-yellow-700" :
                      winner.position === 2 ? "bg-gray-100 text-gray-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {winner.position}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{winner.childName}</div>
                      <div className="text-sm text-muted-foreground">{winner.parentName}</div>
                    </div>
                    <div className="text-sm">{winner.prize}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Attendance Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Certificates
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Event Summary
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-on Sales</CardTitle>
              <CardDescription>Summary of add-on products sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.addonSales.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {addon.sold} sold • {addon.collected} collected
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(addon.revenue)}</div>
                  </div>
                ))}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="font-medium">Total Add-on Revenue</div>
                  <div className="font-bold">
                    {formatCurrency(event.addonSales.reduce((sum, addon) => sum + addon.revenue, 0))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Certificates Generated</div>
                  <div className="font-medium">{event.attendance}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Certificates Sent</div>
                  <div className="font-medium">{event.certificatesSent}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Pending</div>
                  <div className="font-medium">{event.attendance - event.certificatesSent}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {event.attendance > event.certificatesSent && (
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Pending Certificates
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Details</CardTitle>
          <CardDescription>
            {event.attendance} out of {event.registrations} registered participants attended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search participants..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-[400px] grid-cols-3">
                <TabsTrigger value="participants">All</TabsTrigger>
                <TabsTrigger value="attended">Attended</TabsTrigger>
                <TabsTrigger value="no-show">No-Show</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="transition-all duration-300 ease-in-out">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Child Name</TableHead>
                      <TableHead>Child Age</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Add-ons</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants
                      .filter(p => {
                        if (activeTab === "participants") return true
                        if (activeTab === "attended") return p.attended
                        if (activeTab === "no-show") return !p.attended
                        return true
                      })
                      .map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">{participant.parentName}</TableCell>
                          <TableCell>{participant.childName}</TableCell>
                          <TableCell>{participant.childAge} months</TableCell>
                          <TableCell>
                            {participant.attended ? (
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Attended</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>No-show</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {participant.addons.length > 0 ? (
                                participant.addons.map((addon, index) => (
                                  <Badge key={index} variant="outline">{addon}</Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                    {filteredParticipants
                      .filter(p => {
                        if (activeTab === "participants") return true
                        if (activeTab === "attended") return p.attended
                        if (activeTab === "no-show") return !p.attended
                        return true
                      })
                      .length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No participants found.
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
