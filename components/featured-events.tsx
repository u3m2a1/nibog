import { useState, useEffect } from "react"
import Link from "next/link"

const STORAGE_KEY = 'nibog_saved_events'
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Heart } from "lucide-react"
import { formatPrice } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const featuredEvents = [
  {
    id: "1",
    title: "Hyderabad Kids Olympics",
    description: "Join us for an exciting day of baby games including crawling races, baby walker competitions, and running races in Hyderabad.",
    ageRange: "5-84 months",
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/baby-crawling.jpg",
    spotsLeft: 15,
    totalSpots: 50,
    isOlympics: true,
    games: ["Baby Crawling", "Baby Walker", "Running Race"],
  },
  {
    id: "2",
    title: "Chennai Little Champions",
    description: "A fun-filled event for toddlers featuring hurdle races, obstacle courses, and interactive games in Chennai.",
    ageRange: "13-84 months",
    date: "2025-03-16",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Chennai",
    price: 1800,
    image: "/images/hurdle-toddle.jpg",
    spotsLeft: 22,
    totalSpots: 40,
    isOlympics: true,
    games: ["Hurdle Toddle", "Running Race", "Ring Holding"],
  },
  {
    id: "3",
    title: "Vizag Kids Fun Fiesta",
    description: "Exciting games and activities for children including cycle races, balancing games, and more in Vizag.",
    ageRange: "13-84 months",
    date: "2025-08-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Vizag",
    price: 1800,
    image: "/images/cycle-race.jpg",
    spotsLeft: 18,
    totalSpots: 30,
    isOlympics: true,
    games: ["Cycle Race", "Balancing Beam", "Ball Throw"],
  },
  {
    id: "4",
    title: "Bangalore Kiddyz Carnival",
    description: "A carnival of games and activities for children including ring holding, frog jump, and more in Bangalore.",
    ageRange: "13-84 months",
    date: "2025-10-12",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Bangalore",
    price: 1800,
    image: "/images/ring-holding.jpg",
    spotsLeft: 25,
    totalSpots: 45,
    isOlympics: true,
    games: ["Ring Holding", "Frog Jump", "Running Race"],
  },
  {
    id: "5",
    title: "Mumbai Mini Olympics",
    description: "Mumbai's biggest baby Olympics featuring a variety of games for children of all ages.",
    ageRange: "5-84 months",
    date: "2025-09-18",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Mumbai",
    price: 1800,
    image: "/images/ball-throw.jpg",
    spotsLeft: 30,
    totalSpots: 60,
    isOlympics: true,
    games: ["Ball Throw", "Baby Crawling", "Running Race"],
  },
  {
    id: "6",
    title: "Delhi Tiny Tots Tournament",
    description: "A special tournament for tiny tots featuring balancing beam, baby crawling, and more in Delhi.",
    ageRange: "5-84 months",
    date: "2025-11-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Delhi",
    price: 1800,
    image: "/images/balancing-beam.jpg",
    spotsLeft: 20,
    totalSpots: 40,
    isOlympics: true,
    games: ["Balancing Beam", "Baby Crawling", "Baby Walker"],
  },
]

export default function FeaturedEvents() {
  const [savedEvents, setSavedEvents] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)

  // Load saved events from localStorage on component mount
  useEffect(() => {
    setIsClient(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSavedEvents(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load saved events:', error)
    }
  }, [])

  // Save to localStorage whenever savedEvents changes
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEvents))
      } catch (error) {
        console.error('Failed to save events:', error)
      }
    }
  }, [savedEvents, isClient])

  const toggleSaveEvent = (eventId: string) => {
    setSavedEvents(prev => {
      const newState = {
        ...prev,
        [eventId]: !prev[eventId]
      }
      return newState
    })
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredEvents.map((event) => (
        <Card 
          key={event.id} 
          className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] transform-gpu"
        >
          <div className="relative h-48 overflow-hidden">
            <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-110">
              <Image 
                src={event.image || "/placeholder.svg"} 
                alt={event.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="absolute right-2 top-2 flex gap-2">
              {event.isOlympics && <Badge className="bg-yellow-500 hover:bg-yellow-600">NIBOG Olympics</Badge>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary/10"
              aria-label={savedEvents[event.id] ? "Unsave event" : "Save event"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleSaveEvent(event.id)
              }}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${savedEvents[event.id] ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} 
              />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold transition-colors duration-300 group-hover:text-primary">{event.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
                <Clock className="ml-2 h-3 w-3" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>
                  {event.venue}, {event.city}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {event.games.map((game, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs transition-all duration-300 group-hover:bg-primary/10 group-hover:text-foreground"
                  >
                    {game}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline">
                  Age: {event.ageRange}
                </Badge>
                <span className="font-medium">{formatPrice(event.price)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground">
              <span className={event.spotsLeft <= 10 ? "text-red-500 font-medium" : ""}>
                {event.spotsLeft} spots left
              </span>
              <div className="mt-1 h-1.5 w-16 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${event.spotsLeft <= 10 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${(event.spotsLeft / event.totalSpots) * 100}%` }}
                />
              </div>
            </div>
            <Button 
              size="sm" 
              asChild
              className="transition-all duration-300 hover:scale-105"
            >
              <Link href={`/register-event?city=${event.city}`}>Register Now</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
