"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { useToast } from "@/hooks/use-toast"
import { BOOKING_API, PAYMENT_API } from "@/config/api"
import { getAllCities, City } from "@/services/cityService"
import { getAllAddOns, AddOn, AddOnVariant } from "@/services/addOnService"



// Interface for selected addon
interface SelectedAddon {
  addon: AddOn;
  variant?: AddOnVariant;
  quantity: number;
}

// Interface for event from API
interface Event {
  id: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface for game from API
interface Game {
  id: number;
  name: string;
  description: string;
  min_age: number;
  max_age: number;
  duration_minutes: number;
  categories: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for event game slot from API
interface EventGameSlot {
  id: number;
  event_id: number;
  game_id: number;
  custom_title: string;
  custom_description: string;
  custom_price: string;
  start_time: string;
  end_time: string;
  slot_price: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
}

// Interface for time slot selection
interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  custom_title: string;
  slot_price: string;
  max_participants: number;
}

// Generate unique transaction ID
const generateUniqueTransactionId = (prefix: string = "TXN") => {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  const extraRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${timestamp}_${randomPart}_${extraRandom}`
}

export default function NewBookingPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Parent Information
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Child Information
  const [childName, setChildName] = useState("")
  const [childDateOfBirth, setChildDateOfBirth] = useState("")
  const [childGender, setChildGender] = useState("")
  const [schoolName, setSchoolName] = useState("")

  // Hierarchical Selection State
  const [selectedCityId, setSelectedCityId] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState("")

  // Data state
  const [cities, setCities] = useState<City[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [eventGameSlots, setEventGameSlots] = useState<EventGameSlot[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddon[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)


  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingData(true)

        // Fetch all cities and add-ons in parallel
        const [citiesData, addOnsData] = await Promise.all([
          getAllCities(),
          getAllAddOns()
        ])

        console.log("Cities data loaded:", citiesData)
        console.log("Add-ons data loaded:", addOnsData)

        setCities(citiesData.filter(city => city.is_active))
        setAddOns(addOnsData.filter(addon => addon.is_active))

      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchInitialData()
  }, [toast])

  // Handle city selection - fetch events for selected city
  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedEventId("")
    setSelectedGameIds([])
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setEvents([])
    setGames([])
    setEventGameSlots([])
    setAvailableDates([])
    setAvailableTimeSlots([])

    if (!cityId) return

    try {
      setIsLoadingEvents(true)

      // Fetch events for the selected city
      const response = await fetch('/api/events/get-by-city', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city_id: parseInt(cityId) }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch events for city")
      }

      const eventsData = await response.json()
      console.log("Events for city loaded:", eventsData)

      if (!Array.isArray(eventsData) || eventsData.length === 0) {
        console.log("No events found for this city")
        setEvents([])
        setEventGameSlots([])
        return
      }

      // The API returns event-registration data with nested games
      // Each item in the response represents an event with its games
      const events: Event[] = eventsData.map((eventData: any) => ({
        id: eventData.event_id,
        title: eventData.event_title,
        description: eventData.event_description,
        city_id: eventData.city_id,
        venue_id: eventData.venue_id,
        event_date: eventData.event_date,
        status: eventData.event_status,
        created_at: eventData.event_created_at,
        updated_at: eventData.event_updated_at
      }))

      console.log("Processed events:", events)
      setEvents(events)

      // Store the full event data for later use (contains games data)
      setEventGameSlots(eventsData)

    } catch (error) {
      console.error("Error fetching events for city:", error)
      toast({
        title: "Error",
        description: "Failed to load events for selected city",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Handle event selection - fetch games for selected event
  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId)
    setSelectedGameIds([])
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setGames([])
    setAvailableDates([])
    setAvailableTimeSlots([])

    if (!eventId) return

    try {
      setIsLoadingGames(true)

      // Find the selected event data from the stored event data
      const selectedEventData: any = eventGameSlots.find((eventData: any) => eventData.event_id === parseInt(eventId))
      console.log("Selected event data:", selectedEventData)

      if (!selectedEventData || !selectedEventData.games) {
        console.log("No games found for this event")
        setGames([])
        return
      }

      // Extract games from the event data
      const games: Game[] = selectedEventData.games.map((gameData: any) => ({
        id: gameData.game_id,
        name: gameData.game_title,
        description: gameData.game_description,
        min_age: gameData.min_age,
        max_age: gameData.max_age,
        duration_minutes: gameData.game_duration_minutes,
        categories: gameData.categories || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      console.log("Processed games:", games)
      setGames(games)

    } catch (error) {
      console.error("Error processing games for event:", error)
      toast({
        title: "Error",
        description: "Failed to load games for selected event",
        variant: "destructive",
      })
    } finally {
      setIsLoadingGames(false)
    }
  }

  // Handle game selection - support multiple games
  const handleGameToggle = (gameId: string) => {
    setSelectedGameIds(prev => {
      if (prev.includes(gameId)) {
        // Remove game if already selected
        return prev.filter(id => id !== gameId)
      } else {
        // Add game if not selected
        return [...prev, gameId]
      }
    })

    // Reset date and time slot selection when games change
    setSelectedDate("")
    setSelectedTimeSlotId("")
    setAvailableDates([])
    setAvailableTimeSlots([])
  }

  // Handle date selection - fetch time slots for selected games
  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlotId("")
    setAvailableTimeSlots([])

    if (!date || selectedGameIds.length === 0 || !selectedEventId) return

    try {
      setIsLoadingTimeSlots(true)

      // Find the selected event data
      const selectedEventData: any = eventGameSlots.find((eventData: any) => eventData.event_id === parseInt(selectedEventId))

      if (!selectedEventData || !selectedEventData.games) {
        console.log("No event or games data found")
        setAvailableTimeSlots([])
        return
      }

      // Create time slots for all selected games
      const timeSlots: TimeSlot[] = []

      for (const gameId of selectedGameIds) {
        const selectedGameData = selectedEventData.games.find((gameData: any) => gameData.game_id === parseInt(gameId))

        if (selectedGameData) {
          const timeSlot: TimeSlot = {
            id: selectedGameData.game_id, // Using game_id as slot id
            start_time: selectedGameData.start_time,
            end_time: selectedGameData.end_time,
            custom_title: selectedGameData.custom_title,
            slot_price: selectedGameData.slot_price.toString(),
            max_participants: selectedGameData.max_participants
          }
          timeSlots.push(timeSlot)
        }
      }

      console.log("Created time slots for selected games:", timeSlots)
      setAvailableTimeSlots(timeSlots)

    } catch (error) {
      console.error("Error processing time slots for date:", error)
      toast({
        title: "Error",
        description: "Failed to load time slots for selected date",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTimeSlots(false)
    }
  }

  // Update available dates when games are selected
  useEffect(() => {
    if (selectedGameIds.length > 0 && selectedEventId) {
      try {
        setIsLoadingDates(true)

        // Find the selected event data
        const selectedEventData: any = eventGameSlots.find((eventData: any) => eventData.event_id === parseInt(selectedEventId))

        if (!selectedEventData) {
          console.log("No event data found")
          setAvailableDates([])
          return
        }

        // For the selected games, we'll use the event date
        // In this structure, each event has a single date
        const eventDate = selectedEventData.event_date.split('T')[0] // Get YYYY-MM-DD format
        setAvailableDates([eventDate])

      } catch (error) {
        console.error("Error processing dates for games:", error)
        toast({
          title: "Error",
          description: "Failed to load dates for selected games",
          variant: "destructive",
        })
      } finally {
        setIsLoadingDates(false)
      }
    } else {
      setAvailableDates([])
    }
  }, [selectedGameIds, selectedEventId, eventGameSlots, toast])



  // Handle add-on selection
  const handleAddOnSelect = (addon: AddOn, variant?: AddOnVariant, quantity: number = 1) => {
    console.log("handleAddOnSelect called:", {
      addon_id: addon.id,
      addon_name: addon.name,
      has_variants: addon.has_variants,
      variant_id: variant?.id,
      variant_name: variant?.name,
      quantity
    })

    const existingIndex = selectedAddOns.findIndex(item =>
      item.addon.id === addon.id &&
      (variant ? item.variant?.id === variant.id : !item.variant)
    )

    if (existingIndex >= 0) {
      // Update existing selection
      const updatedAddOns = [...selectedAddOns]
      if (quantity === 0) {
        // Remove if quantity is 0
        updatedAddOns.splice(existingIndex, 1)
      } else {
        updatedAddOns[existingIndex].quantity = quantity
      }
      setSelectedAddOns(updatedAddOns)
    } else if (quantity > 0) {
      // Add new selection
      setSelectedAddOns([...selectedAddOns, { addon, variant, quantity }])
    }

    console.log("Updated selectedAddOns:", selectedAddOns)
  }

  // Calculate total amount including add-ons
  const calculateTotalAmount = () => {
    let total = 0

    // Add game price
    const selectedSlot = availableTimeSlots.find(slot => slot.id.toString() === selectedTimeSlotId)
    if (selectedSlot) {
      total += parseFloat(selectedSlot.slot_price)
    }

    // Add add-ons price
    selectedAddOns.forEach(item => {
      const basePrice = parseFloat(item.addon.price)
      const variantModifier = item.variant ? item.variant.price_modifier : 0
      const itemPrice = basePrice + variantModifier
      total += itemPrice * item.quantity
    })

    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!parentName || !email || !phone || !childName || !childDateOfBirth || !childGender) {
        throw new Error("Please fill in all required fields")
      }

      if (!selectedEventId || selectedGameIds.length === 0 || !selectedTimeSlotId) {
        throw new Error("Please complete the event selection")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate date of birth
      const birthDate = new Date(childDateOfBirth)
      const today = new Date()
      if (birthDate >= today) {
        throw new Error("Date of birth must be in the past")
      }

      // Validate addon selections
      for (const selectedAddon of selectedAddOns) {
        if (selectedAddon.addon.has_variants && !selectedAddon.variant) {
          throw new Error(`Please select a variant for ${selectedAddon.addon.name}`)
        }
        if (!selectedAddon.addon.has_variants && selectedAddon.variant) {
          throw new Error(`${selectedAddon.addon.name} does not have variants`)
        }
      }

      // Find selected data
      const selectedEvent = events.find(e => e.id.toString() === selectedEventId)
      const selectedGames = games.filter(g => selectedGameIds.includes(g.id.toString()))
      const selectedSlot = availableTimeSlots.find(slot => slot.id.toString() === selectedTimeSlotId)

      if (!selectedEvent || selectedGames.length === 0 || !selectedSlot) {
        throw new Error("Invalid selection. Please try again.")
      }

      // Generate unique transaction IDs for payment
      const transactionId = generateUniqueTransactionId("TXN")
      const phonepeTransactionId = generateUniqueTransactionId("PHPE")

      // Create booking request (without payment data)
      const baseBookingRequest = {
        user_id: 4,
        parent: {
          parent_name: parentName,
          email: email,
          additional_phone: phone.startsWith('+') ? phone : `+91${phone}`
        },
        child: {
          full_name: childName,
          date_of_birth: childDateOfBirth,
          school_name: schoolName || "Not Specified",
          gender: childGender
        },
        booking: {
          event_id: selectedEvent.id,
          payment_method: "PhonePe",
          payment_status: "pending",
          terms_accepted: true
        },
        booking_games: selectedGames.map(game => ({ game_id: game.id }))
      }

      // Process booking_addons according to API documentation structure
      const processedAddons: any[] = []

      if (selectedAddOns.length > 0) {
        // Group addons by addon_id to handle multiple variants of the same addon
        const addonGroups = new Map<number, any>()

        selectedAddOns.forEach(item => {
          const addonId = Number(item.addon.id)

          if (item.addon.has_variants && item.variant) {
            // For addons with variants, group by addon_id and collect variants
            if (!addonGroups.has(addonId)) {
              addonGroups.set(addonId, {
                addon_id: addonId,
                variants: []
              })
            }
            addonGroups.get(addonId).variants.push({
              variant_id: Number(item.variant.id),
              quantity: item.quantity
            })
          } else if (!item.addon.has_variants) {
            // For addons without variants, simple structure
            addonGroups.set(addonId, {
              addon_id: addonId,
              quantity: item.quantity
            })
          }
        })

        // Convert map to array
        processedAddons.push(...Array.from(addonGroups.values()))
      }

      const bookingRequest = {
        ...baseBookingRequest,
        booking_addons: processedAddons
      }

      console.log("=== BOOKING CREATION DEBUG ===")
      console.log("API Endpoint:", BOOKING_API.CREATE)
      console.log("Selected add-ons count:", selectedAddOns.length)
      console.log("Processed booking_addons:", processedAddons)
      console.log("Selected add-ons details:", selectedAddOns.map(item => ({
        addon_id: item.addon.id,
        addon_name: item.addon.name,
        has_variants: item.addon.has_variants,
        variant_id: item.variant?.id,
        variant_name: item.variant?.name,
        quantity: item.quantity
      })))
      console.log("Event ID:", selectedEvent.id)
      console.log("Selected Game IDs:", selectedGames.map(g => g.id))
      console.log("Full booking payload:")
      console.log(JSON.stringify(bookingRequest, null, 2))
      console.log("=== END DEBUG ===")

      // Call the real booking creation API
      console.log("Making API call to:", BOOKING_API.CREATE)
      const response = await fetch(BOOKING_API.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      })

      console.log("API Response status:", response.status)
      console.log("API Response statusText:", response.statusText)
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorText = ""
        let errorData: any = null

        try {
          errorText = await response.text()
          console.log("Raw error response:", errorText)
        } catch (textError) {
          console.error("Failed to read error response as text:", textError)
          errorText = "Unable to read error response"
        }

        console.error("Booking creation failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          requestPayload: JSON.stringify(bookingRequest, null, 2)
        })

        let errorMessage = `Failed to create booking (${response.status}): ${response.statusText}`

        // Try to parse error as JSON
        if (errorText) {
          try {
            errorData = JSON.parse(errorText)
            console.log("Parsed error data:", errorData)

            if (errorData.error) {
              errorMessage = errorData.error
            } else if (errorData.message) {
              errorMessage = errorData.message
            } else if (typeof errorData === 'string') {
              errorMessage = errorData
            } else {
              errorMessage = `Failed to create booking: ${errorText}`
            }
          } catch (parseError) {
            console.error("Failed to parse error as JSON:", parseError)
            // Use raw error text if JSON parsing fails
            errorMessage = errorText || errorMessage
          }
        }

        throw new Error(errorMessage)
      }

      const bookingResult = await response.json()
      console.log("Booking created successfully:", bookingResult)

      // Extract booking_id from the response
      let bookingId = null
      if (Array.isArray(bookingResult) && bookingResult.length > 0) {
        bookingId = bookingResult[0].booking_id
      } else if (bookingResult.booking_id) {
        bookingId = bookingResult.booking_id
      }

      if (!bookingId) {
        console.error("Could not extract booking_id from response:", bookingResult)
        throw new Error("Booking created but could not get booking ID for payment")
      }

      console.log("Extracted booking_id:", bookingId)

      // Now create the payment record
      const totalAmount = calculateTotalAmount()
      const paymentData = {
        booking_id: bookingId,
        transaction_id: transactionId,
        phonepe_transaction_id: phonepeTransactionId,
        amount: totalAmount,
        payment_method: "PhonePe",
        payment_status: "pending",
        payment_date: new Date().toISOString().slice(0, 19) + "+05:30",
        gateway_response: {
          bank: "XYZ Bank",
          upi_id: "admin@upi"
        }
      }

      console.log("Creating payment with data:", JSON.stringify(paymentData, null, 2))

      // Call payment creation API
      const paymentResponse = await fetch('/api/payments/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!paymentResponse.ok) {
        const paymentErrorText = await paymentResponse.text()
        console.error("Payment creation failed:", {
          status: paymentResponse.status,
          statusText: paymentResponse.statusText,
          errorText: paymentErrorText,
          paymentData: paymentData
        })

        // Don't fail the entire process if payment creation fails
        // The booking was already created successfully
        console.warn("Booking created successfully but payment record creation failed")
        toast({
          title: "Warning",
          description: "Booking created successfully but payment record creation failed. Please check the payment manually.",
          variant: "destructive",
        })
      } else {
        const paymentResult = await paymentResponse.json()
        console.log("Payment created successfully:", paymentResult)

        toast({
          title: "Success",
          description: "Booking and payment created successfully",
        })
      }

      // Redirect to the bookings list
      router.push("/admin/bookings")

    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
              <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading events and venues...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
            <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Enter the parent details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter the child details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={childDateOfBirth}
                    onChange={(e) => setChildDateOfBirth(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={childGender} onValueChange={setChildGender} required>
                    <SelectTrigger id="childGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Select city, event, game, date and time slot in order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={selectedCityId} onValueChange={handleCityChange} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id!.toString()}>
                        {city.city_name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select
                  value={selectedEventId}
                  onValueChange={handleEventChange}
                  required
                  disabled={!selectedCityId || isLoadingEvents}
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedCityId
                        ? "Select city first"
                        : isLoadingEvents
                          ? "Loading events..."
                          : events.length === 0
                            ? "No events available"
                            : "Select event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEvents ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    ) : events.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No events available for this city
                      </div>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Games (Select multiple based on child's age)</Label>
                {!selectedEventId ? (
                  <p className="text-sm text-muted-foreground">Select event first</p>
                ) : isLoadingGames ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading games...</span>
                  </div>
                ) : games.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No games available for this event</p>
                ) : (
                  <div className="space-y-3">
                    {games.map((game) => {
                      // Calculate child age in months for comparison
                      const childAge = childDateOfBirth ?
                        Math.floor((new Date().getTime() - new Date(childDateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 0

                      const isEligible = childAge >= game.min_age && childAge <= game.max_age
                      const isSelected = selectedGameIds.includes(game.id.toString())

                      return (
                        <div key={game.id} className={`flex items-start space-x-3 p-3 border rounded-lg ${
                          isEligible ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <input
                            type="checkbox"
                            id={`game-${game.id}`}
                            checked={isSelected}
                            onChange={() => handleGameToggle(game.id.toString())}
                            disabled={!isEligible}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`game-${game.id}`}
                              className={`block text-sm font-medium cursor-pointer ${
                                isEligible ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {game.name}
                            </label>
                            <p className={`text-xs ${isEligible ? 'text-gray-600' : 'text-gray-400'}`}>
                              Ages {game.min_age}-{game.max_age} months
                              {childDateOfBirth && (
                                <span className="ml-2">
                                  (Child: {childAge} months - {isEligible ? 'Eligible' : 'Not eligible'})
                                </span>
                              )}
                            </p>
                            {game.description && (
                              <p className={`text-xs mt-1 ${isEligible ? 'text-gray-500' : 'text-gray-400'}`}>
                                {game.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {selectedGameIds.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          Selected {selectedGameIds.length} game{selectedGameIds.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Select
                    value={selectedDate}
                    onValueChange={handleDateChange}
                    required
                    disabled={selectedGameIds.length === 0 || isLoadingDates}
                  >
                    <SelectTrigger id="date">
                      <SelectValue placeholder={
                        selectedGameIds.length === 0
                          ? "Select games first"
                          : isLoadingDates
                            ? "Loading dates..."
                            : availableDates.length === 0
                              ? "No dates available"
                              : "Select date"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDates ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading dates...
                        </div>
                      ) : availableDates.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No dates available for this game
                        </div>
                      ) : (
                        availableDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), "PPP")}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select
                    value={selectedTimeSlotId}
                    onValueChange={setSelectedTimeSlotId}
                    required
                    disabled={!selectedDate || isLoadingTimeSlots}
                  >
                    <SelectTrigger id="timeSlot">
                      <SelectValue placeholder={
                        !selectedDate
                          ? "Select date first"
                          : isLoadingTimeSlots
                            ? "Loading time slots..."
                            : availableTimeSlots.length === 0
                              ? "No time slots available"
                              : "Select time slot"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTimeSlots ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading time slots...
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No time slots available for this date
                        </div>
                      ) : (
                        availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id.toString()}>
                            <div className="flex flex-col">
                              <span>{slot.start_time} - {slot.end_time}</span>
                              <span className="text-xs text-muted-foreground">
                                {slot.custom_title} (₹{slot.slot_price})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTimeSlotId && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <div className="text-sm">
                    <p className="font-medium">Selected Time Slot Details:</p>
                    {(() => {
                      const slot = availableTimeSlots.find(s =>
                        s.id.toString() === selectedTimeSlotId
                      )
                      return slot ? (
                        <div className="mt-1 space-y-1">
                          <p>Game: {slot.custom_title}</p>
                          <p>Time: {slot.start_time} - {slot.end_time}</p>
                          <p>Price: ₹{slot.slot_price}</p>
                          <p>Max Participants: {slot.max_participants}</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-ons Selection</CardTitle>
              <CardDescription>Select optional add-ons for your booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading add-ons...</span>
                  </div>
                </div>
              ) : addOns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No add-ons available
                </div>
              ) : (
                <div className="space-y-4">
                  {addOns.map((addon) => (
                    <div key={addon.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                          {addon.images && addon.images.length > 0 ? (
                            <img
                              src={addon.images[0]}
                              alt={addon.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <span className="text-xs">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-muted-foreground">{addon.description}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium">₹{parseFloat(addon.price).toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground capitalize">• {addon.category}</span>
                              </div>
                            </div>
                          </div>

                          {addon.has_variants ? (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium">Variants:</p>
                              {addon.variants?.map((variant) => {
                                const finalPrice = parseFloat(addon.price) + variant.price_modifier
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addon.id === addon.id && item.variant?.id === variant.id
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{variant.name}</span>
                                      <div className="text-xs text-muted-foreground">
                                        ₹{finalPrice.toLocaleString()}
                                        {variant.price_modifier !== 0 && (
                                          <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                            {" "}({variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier})
                                          </span>
                                        )}
                                        {" "}• Stock: {variant.stock_quantity}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnSelect(addon, variant, Math.max(0, currentQuantity - 1))}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnSelect(addon, variant, currentQuantity + 1)}
                                        disabled={currentQuantity >= variant.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-3">
                              {(() => {
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addon.id === addon.id && !item.variant
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                      Stock: {addon.stock_quantity} units
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnSelect(addon, undefined, Math.max(0, currentQuantity - 1))}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnSelect(addon, undefined, currentQuantity + 1)}
                                        disabled={currentQuantity >= addon.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedAddOns.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-3">Selected Add-ons:</h4>
                  <div className="space-y-2">
                    {selectedAddOns.map((item, index) => {
                      const basePrice = parseFloat(item.addon.price)
                      const variantModifier = item.variant ? item.variant.price_modifier : 0
                      const itemPrice = basePrice + variantModifier
                      const totalPrice = itemPrice * item.quantity

                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.addon.name}
                            {item.variant && ` - ${item.variant.name}`}
                            {" "}× {item.quantity}
                          </span>
                          <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                      )
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotalAmount().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/bookings">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
