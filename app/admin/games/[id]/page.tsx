"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, AlertTriangle } from "lucide-react"
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
const gameTemplates = [
  {
    id: "1",
    name: "Baby Crawling",
    description: "Let your little crawler compete in a fun and safe environment. This engaging activity is designed for babies aged 5-13 months. During this 60-minute session, babies will explore their crawling abilities in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    minAge: 5,
    maxAge: 13,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 12,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "2",
    name: "Baby Walker",
    description: "Fun-filled baby walker race in a safe environment. This exciting activity is designed for babies aged 5-13 months who are beginning to use walkers. During this 60-minute session, babies will develop balance and coordination skills while having fun. Parents will assist their little ones through a specially designed course.",
    minAge: 5,
    maxAge: 13,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 8,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "3",
    name: "Running Race",
    description: "Exciting running race for toddlers in a fun and safe environment. This activity is perfect for children aged 13-84 months who are confident walkers and beginning runners. During this 60-minute session, children will participate in age-appropriate races that develop coordination, balance, and healthy competition.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 15,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "4",
    name: "Hurdle Toddle",
    description: "Fun hurdle race for toddlers to develop coordination and balance. This activity is designed for children aged 13-84 months who are confident walkers. During this 60-minute session, children will navigate through a course with small, safe hurdles that help develop gross motor skills and spatial awareness.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 10,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "5",
    name: "Cycle Race",
    description: "Exciting cycle race for children to showcase their skills. This activity is perfect for children aged 13-84 months who can ride tricycles or bicycles with or without training wheels. During this 60-minute session, children will navigate through a safe course that develops balance, coordination, and confidence.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 7,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "6",
    name: "Ring Holding",
    description: "Fun ring holding game to develop hand-eye coordination. This activity is designed for children aged 13-84 months. During this 60-minute session, children will practice fine motor skills and hand-eye coordination by holding and placing rings on targets. The game progressively increases in difficulty to challenge growing skills.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "coordination"],
    isActive: true,
    events: 9,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
]

type Props = {
  params: { id: string }
}

export default function GameDetailPage({ params }: Props) {
  const router = useRouter()

  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const gameId = unwrappedParams.id

  const game = gameTemplates.find((g) => g.id === gameId)

  if (!game) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game Not Found</h2>
          <p className="text-muted-foreground">The game template you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/games">Back to Games</Link>
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
            <Link href="/admin/games">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
            <p className="text-muted-foreground">
              {game.minAge}-{game.maxAge} months | {game.duration} minutes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/games/${game.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Game
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Game Template</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the "{game.name}" game template. This template is used in {game.events} events.
                        Deleting it will not affect existing events, but you won't be able to create new events with this template.
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{game.description}</p>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h3 className="mb-2 font-medium">Age Range</h3>
                <p className="text-sm text-muted-foreground">
                  {game.minAge}-{game.maxAge} months
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Duration</h3>
                <p className="text-sm text-muted-foreground">{game.duration} minutes</p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Status</h3>
                {game.isActive ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Created By</h3>
                <p className="text-sm text-muted-foreground">
                  {game.createdBy} on {game.createdAt}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Last Updated By</h3>
                <p className="text-sm text-muted-foreground">
                  {game.lastUpdatedBy} on {game.lastUpdatedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
              <p className="mt-2 text-2xl font-bold">{game.events}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
              <p className="mt-2 text-2xl font-bold">{Math.floor(game.events * 0.7)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Past Events</h3>
              <p className="mt-2 text-2xl font-bold">{Math.floor(game.events * 0.3)}</p>
            </div>
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/admin/events?game=${game.id}`}>
                View All Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
