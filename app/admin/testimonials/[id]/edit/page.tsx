"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
  { id: "1", name: "published", label: "Published" },
  { id: "2", name: "pending", label: "Pending" },
  { id: "3", name: "rejected", label: "Rejected" },
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

type Props = {
  params: { id: string }
}

export default function EditTestimonialPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const testimonialId = unwrappedParams.id
  
  const [testimonial, setTestimonial] = useState<any>(null)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [event, setEvent] = useState("")
  const [rating, setRating] = useState("")
  const [testimonialText, setTestimonialText] = useState("")
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the testimonial data
    const foundTestimonial = testimonials.find(t => t.id === testimonialId)
    if (foundTestimonial) {
      setTestimonial(foundTestimonial)
      setName(foundTestimonial.name)
      setCity(foundTestimonial.city)
      setEvent(foundTestimonial.event)
      setRating(foundTestimonial.rating.toString())
      setTestimonialText(foundTestimonial.testimonial)
      setStatus(foundTestimonial.status)
      setDate(foundTestimonial.date)
    }
  }, [testimonialId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to update the testimonial
    setTimeout(() => {
      // In a real app, this would be an API call to update the testimonial
      console.log({
        id: testimonialId,
        name,
        city,
        event,
        rating: parseInt(rating),
        testimonial: testimonialText,
        status,
        date
      })
      
      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the testimonial details page
        router.push(`/admin/testimonials/${testimonialId}`)
      }, 1500)
    }, 1000)
  }

  if (!testimonial) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Testimonial not found</h2>
          <p className="text-muted-foreground">The testimonial you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/testimonials")}>
            Back to Testimonials
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
            <Link href={`/admin/testimonials/${testimonialId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Testimonial</h1>
            <p className="text-muted-foreground">Update testimonial from {testimonial.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Update the testimonial details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={city} onValueChange={setCity} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={event} onValueChange={setEvent} required>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.name}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <RadioGroup 
                id="rating" 
                value={rating} 
                onValueChange={setRating}
                className="flex space-x-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`rating-${value}`} 
                      className="sr-only" 
                    />
                    <label 
                      htmlFor={`rating-${value}`}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${
                        parseInt(rating) >= value 
                          ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/20" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Star className={`h-6 w-6 ${parseInt(rating) >= value ? "fill-yellow-500" : ""}`} />
                    </label>
                    <span className="text-xs">{value}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testimonialText">Testimonial</Label>
              <Textarea 
                id="testimonialText" 
                value={testimonialText} 
                onChange={(e) => setTestimonialText(e.target.value)} 
                placeholder="Enter testimonial text"
                rows={5}
                required
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/testimonials/${testimonialId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
