"use client"

import { useState } from "react"
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

export default function NewTestimonialPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [event, setEvent] = useState("")
  const [rating, setRating] = useState("5")
  const [testimonialText, setTestimonialText] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to create the testimonial
    setTimeout(() => {
      // In a real app, this would be an API call to create the testimonial
      console.log({
        name,
        city,
        event,
        rating: parseInt(rating),
        testimonial: testimonialText,
        status: "pending",
        date
      })
      
      setIsLoading(false)
      
      // Redirect to the testimonials list
      router.push("/admin/testimonials")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Testimonial</h1>
            <p className="text-muted-foreground">Create a new customer testimonial</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Enter the details for the new testimonial</CardDescription>
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
              <p className="text-sm text-muted-foreground">
                Enter the customer's testimonial about their experience with NIBOG events.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
              <p className="text-sm text-muted-foreground">
                The date when this testimonial was received.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/testimonials">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Testimonial
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
