import Link from "next/link"
import { Button } from "@/components/ui/button"
import TicketClient from "./ticket-client"

// Mock data - in a real app, this would come from an API
const bookings = [
  {
    id: "B001",
    eventName: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    venue: {
      name: "Little Explorers Center",
      address: "123 Play Street, Andheri West",
      city: "Mumbai",
    },
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    child: {
      name: "Aryan",
      dob: "2023-02-15",
      ageAtEvent: "14 months",
    },
    status: "confirmed",
    price: 799,
    bookingDate: "2025-03-10",
    paymentStatus: "paid",
    ticketCode: "NIBOG-B001-E001-S001",
    qrCode: "/placeholder.svg?height=200&width=200&text=QR+Code",
    instructions: "Please arrive 15 minutes before the event starts. Parents must stay with their children throughout the event. Wear comfortable clothes.",
  },
]

type Props = {
  params: { id: string }
}

export default function TicketPage({ params }: Props) {
  const booking = bookings.find((b) => b.id === params.id)

  if (!booking) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Not Found</h2>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <TicketClient booking={booking} id={params.id} />
}
