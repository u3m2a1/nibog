"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, Star, AlertTriangle, Check, X } from "lucide-react"
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
          className={`h-5 w-5 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

type Props = {
  params: { id: string }
}

export default function TestimonialDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const testimonialId = unwrappedParams.id
  
  const testimonial = testimonials.find((t) => t.id === testimonialId)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  
  // Handle delete testimonial
  const handleDeleteTestimonial = () => {
    setIsProcessing("delete")
    
    // Simulate API call to delete the testimonial
    setTimeout(() => {
      console.log(`Deleting testimonial ${testimonialId}`)
      setIsProcessing(null)
      // In a real app, you would delete the testimonial and then redirect
      router.push("/admin/testimonials")
    }, 1000)
  }
  
  // Handle approve testimonial
  const handleApproveTestimonial = () => {
    setIsProcessing("approve")
    
    // Simulate API call to approve the testimonial
    setTimeout(() => {
      console.log(`Approving testimonial ${testimonialId}`)
      setIsProcessing(null)
      // In a real app, you would update the testimonial status and refresh the page
      router.refresh()
    }, 1000)
  }
  
  // Handle reject testimonial
  const handleRejectTestimonial = () => {
    setIsProcessing("reject")
    
    // Simulate API call to reject the testimonial
    setTimeout(() => {
      console.log(`Rejecting testimonial ${testimonialId}`)
      setIsProcessing(null)
      // In a real app, you would update the testimonial status and refresh the page
      router.refresh()
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
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testimonial</h1>
            <p className="text-muted-foreground">From {testimonial.name} - {testimonial.event}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {testimonial.status === "pending" && (
            <>
              <Button 
                variant="default"
                onClick={handleApproveTestimonial}
                disabled={isProcessing !== null}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing === "approve" ? "Approving..." : "Approve"}
              </Button>
              <Button 
                variant="outline"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                onClick={handleRejectTestimonial}
                disabled={isProcessing !== null}
              >
                <X className="mr-2 h-4 w-4" />
                {isProcessing === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </>
          )}
          <Button variant="outline" asChild>
            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete
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
                  onClick={handleDeleteTestimonial}
                  disabled={isProcessing === "delete"}
                >
                  {isProcessing === "delete" ? "Deleting..." : "Delete Testimonial"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Testimonial Content</CardTitle>
            <div className="mt-2 flex items-center gap-4">
              {getStatusBadge(testimonial.status)}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                {getRatingStars(testimonial.rating)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="italic text-muted-foreground">"{testimonial.testimonial}"</p>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{testimonial.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">City</span>
                    <span>{testimonial.city}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Event Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Event</span>
                    <span>{testimonial.event}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span>{testimonial.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Testimonial
              </Link>
            </Button>
            
            {testimonial.status === "pending" && (
              <>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleApproveTestimonial}
                  disabled={isProcessing !== null}
                >
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {isProcessing === "approve" ? "Approving..." : "Approve Testimonial"}
                </Button>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                  onClick={handleRejectTestimonial}
                  disabled={isProcessing !== null}
                >
                  <X className="mr-2 h-4 w-4" />
                  {isProcessing === "reject" ? "Rejecting..." : "Reject Testimonial"}
                </Button>
              </>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Testimonial
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
                    onClick={handleDeleteTestimonial}
                    disabled={isProcessing === "delete"}
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete Testimonial"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
