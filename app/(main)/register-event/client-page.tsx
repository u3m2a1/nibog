"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, differenceInMonths, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Info, ArrowRight, ArrowLeft, MapPin, AlertTriangle, Loader2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import AddOnSelector from "@/components/add-on-selector"
import { addOns } from "@/data/add-ons"
import { AddOn } from "@/types"
import { getAllCities } from "@/services/cityService"
import { getEventsByCityId, getGamesByAgeAndEvent, EventListItem, EventGameListItem } from "@/services/eventService"
import { getGamesByAge, Game } from "@/services/gameService"
import { registerBooking, formatBookingDataForAPI } from "@/services/bookingRegistrationService"
import { initiatePhonePePayment } from "@/services/paymentService"

// Helper function to format price.
const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`
}

// Cities will be fetched from API

export default function RegisterEventClientPage() {
  const router = useRouter()
  const [dob, setDob] = useState<Date>()
  const [eventDate, setEventDate] = useState<Date>(new Date("2025-10-26"))
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>("") // Empty string initially
  const [selectedEventType, setSelectedEventType] = useState<string>("") // New state for event type dropdown
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [eligibleEvents, setEligibleEvents] = useState<any[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [step, setStep] = useState(1)
  const [parentName, setParentName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [childName, setChildName] = useState<string>('')
  const [gender, setGender] = useState<string>('female')
  const [schoolName, setSchoolName] = useState<string>('')
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>([])
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false)
  const [eventError, setEventError] = useState<string | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [eligibleGames, setEligibleGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)

  // Get authentication state from auth context
  const { isAuthenticated, user } = useAuth()

  // Calculate child's age based on current date
  const calculateAge = (birthDate: Date) => {
    const currentDate = new Date()
    const ageInMonths = differenceInMonths(currentDate, birthDate)
    return ageInMonths
  }

  // Calculate total price including add-ons and GST
  const calculateTotalPrice = () => {
    if (!selectedEventDetails) return 0

    const eventPrice = selectedEventDetails.price
    const addOnsTotal = selectedAddOns.reduce((total, item) => total + (item.addOn.price * item.quantity), 0)
    const subtotal = eventPrice + addOnsTotal
    const gst = Math.round(subtotal * 0.18)

    return subtotal + gst
  }

  // Calculate GST amount
  const calculateGST = () => {
    if (!selectedEventDetails) return 0

    const eventPrice = selectedEventDetails.price
    const addOnsTotal = selectedAddOns.reduce((total, item) => total + (item.addOn.price * item.quantity), 0)
    const subtotal = eventPrice + addOnsTotal

    return Math.round(subtotal * 0.18)
  }

  // Calculate add-ons subtotal
  const calculateAddOnsTotal = () => {
    return selectedAddOns.reduce((total, item) => {
      let price = item.addOn.price

      // Check if this is a variant with a different price
      if (item.variantId && item.addOn.hasVariants && item.addOn.variants) {
        const variant = item.addOn.variants.find(v => v.id === item.variantId)
        if (variant) {
          price = variant.price
        }
      }

      // Apply bundle discount if applicable
      if (item.addOn.bundleDiscount && item.quantity >= item.addOn.bundleDiscount.minQuantity) {
        const discountMultiplier = 1 - (item.addOn.bundleDiscount.discountPercentage / 100)
        price = price * discountMultiplier
      }

      return total + (price * item.quantity)
    }, 0)
  }

  // Handle DOB change
  const handleDobChange = (date: Date | undefined) => {
    setDob(date)
    
    if (date) {
      // Calculate child's age in months based on the current date
      const ageInMonths = calculateAge(date)
      setChildAgeMonths(ageInMonths)
      
      console.log(`Child's age: ${ageInMonths} months`)
      
      // If an event is already selected, fetch games for this age
      if (selectedEventType) {
        const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
        if (selectedApiEvent) {
          fetchGamesByEventAndAge(selectedApiEvent.event_id, ageInMonths);
        }
      }
    } else {
      // Reset age if DOB is cleared
      setChildAgeMonths(null)
    }
  }

  // Handle event date change when selecting from available dates
  const handleEventDateChange = (date: Date) => {
    setEventDate(date)
    // Note: Child age is now based on current date, not event date
    // We're not updating the child age when event date changes
  }

  // Handle city change and fetch events for the selected city
  const handleCityChange = async (city: string) => {
    setSelectedCity(city)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedEvent("") // Reset selected event when city changes
    setEligibleEvents([]) // Reset eligible events
    setEligibleGames([]) // Reset eligible games
    setSelectedGame("") // Reset selected game

    // Find city ID from the cities list
    const cityObj = cities.find(c => c.name === city)
    if (!cityObj) return

    const cityId = cityObj.id
    setSelectedCityId(cityId);

    // Fetch events for the selected city
    try {
      setIsLoadingEvents(true);
      setEventError(null);

      console.log(`Fetching events for city ID: ${cityId}`);
      const eventsData = await getEventsByCityId(cityId);
      console.log("Events data from API:", eventsData);

      setApiEvents(eventsData);

      // No need to filter events by age anymore - games will be fetched separately
      // when both event and DOB are selected
      
      // Convert API events to the format expected by the UI for display purposes
      if (eventsData.length > 0) {
        const apiEventsMapped = eventsData.map(event => ({
          id: event.event_id.toString(),
          title: event.event_title,
          description: event.event_description,
          minAgeMonths: 5, // Default min age if not specified in API data
          maxAgeMonths: 84, // Default max age if not specified in API data
          date: event.event_date.split('T')[0], // Format the date
          time: "9:00 AM - 8:00 PM", // Default time
          venue: event.venue_name || "Venue TBD",
          city: event.city_name || city,
          price: 1800, // Default price
          image: "/images/baby-crawling.jpg" // Default image
        }));
        
        // Set all events as eligible without age filtering
        setEligibleEvents(apiEventsMapped);
        
        // Get unique dates for this city from API events
        const dates = apiEventsMapped.map(event => new Date(event.date));
        const uniqueDates = Array.from(new Set(dates.map(date => date.toISOString())))
          .map(dateStr => new Date(dateStr));
        setAvailableDates(uniqueDates);

        // Set event date to the first available date
        if (uniqueDates.length > 0) {
          setEventDate(uniqueDates[0]);
        }
      }
    } catch (error: any) {
      console.error(`Failed to fetch events for city ID ${cityId}:`, error);
      setEventError("Failed to load events. Please try again.");
      
      // Clear events on error
      setEligibleEvents([]);
      setAvailableDates([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }

  // Handle event type change
  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType)
    setSelectedEvent("") // Reset selected event when event type changes
    setEligibleGames([]) // Reset games when event type changes

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find(event => event.event_title === eventType);

    if (selectedApiEvent) {
      console.log("Selected event:", selectedApiEvent);

      // Create a mock event from the API event data to maintain compatibility with the rest of the form
      const mockEvent = {
        id: selectedApiEvent.event_id.toString(),
        title: selectedApiEvent.event_title,
        description: selectedApiEvent.event_description,
        minAgeMonths: 5, // Default values since API might not have these
        maxAgeMonths: 84, // Default values since API might not have these
        date: selectedApiEvent.event_date.split('T')[0], // Format the date
        time: "9:00 AM - 8:00 PM", // Default time
        venue: selectedApiEvent.venue_name,
        city: selectedApiEvent.city_name,
        price: 1800, // Default price
        image: "/images/baby-crawling.jpg", // Default image
      };

      // Set this as the only eligible event
      setEligibleEvents([mockEvent]);
      setSelectedEvent(mockEvent.id);

      // Set event date
      if (selectedApiEvent.event_date) {
        const eventDate = new Date(selectedApiEvent.event_date);
        setEventDate(eventDate);
        setAvailableDates([eventDate]);

        // If DOB is set, use the already calculated age (based on current date)
        if (dob && childAgeMonths !== null) {
          // Fetch games for this event and child age
          fetchGamesByEventAndAge(selectedApiEvent.event_id, childAgeMonths);
        }
      }
    } else {
      // If no matching event found, clear eligible events
      setEligibleEvents([]);
    }
  }
  
  // Fetch games based on event ID and child age
  const fetchGamesByEventAndAge = async (eventId: number, childAge: number) => {
    if (!eventId || childAge === null) return;
    
    setIsLoadingGames(true);
    setGameError("");
    
    try {
      console.log(`Fetching games for event ID: ${eventId} and child age: ${childAge} months`);
      
      // Call the new API to get games by age and event
      const gamesData = await getGamesByAgeAndEvent(eventId, childAge);
      
      if (gamesData && gamesData.length > 0) {
        console.log(`Found ${gamesData.length} games for event ${eventId} and age ${childAge} months`);
        console.log('Game data from API:', gamesData);
        
        // Format games to match the Game interface structure, using API data only
        const formattedGames: Game[] = gamesData.map((game: any) => ({
          id: Number(game.slot_id || 0),
          game_title: game.title || '',
          game_description: game.description || '',
          min_age: game.min_age || 0,
          max_age: game.max_age || 0,
          game_duration_minutes: game.duration_minutes || 0,
          categories: game.categories || [],
          custom_price: game.listed_price || 0,
          slot_price: game.slot_price || 0,
          start_time: game.start_time || '',
          end_time: game.end_time || '',
          custom_title: game.title || '',
          custom_description: game.description || '',
          max_participants: game.max_participants || 0
        }));
        
        setEligibleGames(formattedGames);
      } else {
        console.log(`No games found for event ${eventId} and age ${childAge} months`);
        setEligibleGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGameError("Failed to load games. Please try again.");
      setEligibleGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }

  // Handle game selection
  const handleGameSelection = (gameId: string) => {
    setSelectedGame(gameId)
    console.log(`Selected game ID: ${gameId}`)

    // Find the selected game
    const game = eligibleGames.find(g => g.id.toString() === gameId)
    if (game) {
      console.log("Selected game:", game)
    }
  }

  // Get unique event titles from API events
  const getUniqueEventTypes = () => {
    if (apiEvents.length === 0) return []

    // Extract event titles from the API response
    const eventTitles = apiEvents.map(event => event.event_title);
    return Array.from(new Set(eventTitles));
  }

  // Get selected event details from eligible events
  const selectedEventDetails = eligibleEvents.find(event => event.id === selectedEvent);

  // Handle registration - now focuses on authentication check and navigation
  const handleRegistration = async () => {
    if (!isAuthenticated) {
      // Save complete registration data to sessionStorage including add-ons
      const registrationData = {
        parentName,
        email,
        phone,
        childName,
        schoolName,
        dob: dob?.toISOString(),
        gender,
        eventDate: eventDate.toISOString(),
        selectedCity,
        selectedEventType,
        selectedEvent,
        selectedGame,
        childAgeMonths,
        availableDates: availableDates.map(date => date.toISOString()),
        step: 1, // Current step
        termsAccepted
      }
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData))

      // Save add-ons to session storage
      saveAddOnsToSession()

      // Show user-friendly message about login requirement
      alert("Please log in to continue with your registration. Your progress will be saved.")

      // Redirect to login with return URL that includes step information
      router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
    } else {
      // User is authenticated, proceed to add-ons step
      saveAddOnsToSession()
      setStep(2)
    }
  }

  // Handle authentication check and proceed to payment
  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      // Save complete registration data including current step
      const registrationData = {
        parentName,
        email,
        phone,
        childName,
        schoolName,
        dob: dob?.toISOString(),
        gender,
        eventDate: eventDate.toISOString(),
        selectedCity,
        selectedEventType,
        selectedEvent,
        selectedGame,
        childAgeMonths,
        availableDates: availableDates.map(date => date.toISOString()),
        step: 3, // Payment step
        termsAccepted
      }
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData))

      // Save add-ons to session storage
      saveAddOnsToSession()

      // Show user-friendly message about login requirement
      alert("Please log in to proceed with payment. Your registration details will be saved.")

      // Redirect to login with return URL that includes payment step
      router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
    } else {
      // User is authenticated, proceed to payment step
      saveAddOnsToSession()
      setStep(3)
    }
  }

  // Save add-ons to session storage
  const saveAddOnsToSession = () => {
    const addOnsData = selectedAddOns.map(item => ({
      addOnId: item.addOn.id,
      quantity: item.quantity,
      variantId: item.variantId
    }))
    sessionStorage.setItem('selectedAddOns', JSON.stringify(addOnsData))
  }

  // Handle continue to payment - now includes authentication check
  const handleContinueToPayment = () => {
    handleProceedToPayment()
  }

  // Handle payment and booking registration
  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true)
      setPaymentError(null)

      // Get the selected game details
      const selectedGameObj = eligibleGames.find(game => game.id.toString() === selectedGame)
      if (!selectedGameObj) {
        throw new Error("Selected game not found")
      }

      // Get the selected event details
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType)
      if (!selectedApiEvent) {
        throw new Error("Selected event not found")
      }

      // Get the user ID from the auth context
      const userId = user?.user_id
      if (!userId) {
        throw new Error("User ID not found. Please log in again.")
      }

      // Format the booking data for the API
      const bookingData = formatBookingDataForAPI({
        userId,
        parentName,
        email,
        phone,
        childName,
        childDob: dob!,
        schoolName,
        gender,
        eventId: selectedApiEvent.event_id,
        gameId: selectedGameObj.id,
        gamePrice: selectedGameObj.custom_price || selectedGameObj.slot_price || 0,
        totalAmount: calculateTotalPrice(),
        paymentMethod: "PhonePe", // Using PhonePe as the payment method
        paymentStatus: "Pending", // Set to pending initially
        termsAccepted
      })

      console.log("Formatted booking data:", bookingData)

      // Register the booking
      const response = await registerBooking(bookingData)
      console.log("Booking registration response:", response)

      if (!response || response.length === 0) {
        throw new Error("Failed to create booking. Please try again.")
      }

      const bookingId = response[0].booking_id.toString()
      setBookingReference(bookingId)

      console.log("=== PHONEPE PAYMENT INITIATION ===")
      console.log("Booking ID:", bookingId)
      console.log("User ID:", userId)
      console.log("Phone:", phone)

      // Get the total amount in rupees
      const totalAmount = calculateTotalPrice()
      console.log("Total Amount (₹):", totalAmount)

      // Initiate the payment
      console.log("🚀 Calling initiatePhonePePayment...")
      const paymentUrl = await initiatePhonePePayment(
        bookingId,
        userId,
        totalAmount,
        phone
      )

      console.log("✅ PhonePe payment URL received:", paymentUrl)
      console.log("🔄 Redirecting to PhonePe payment page...")

      // Clear saved registration data since we're proceeding to payment
      sessionStorage.removeItem('registrationData')
      sessionStorage.removeItem('selectedAddOns')

      // Redirect to the PhonePe payment page
      window.location.href = paymentUrl
    } catch (error: any) {
      console.error("Error processing payment and booking:", error)

      // Provide more specific error messages
      let errorMessage = "Failed to process payment and booking. Please try again."

      if (error.message?.includes("User ID not found")) {
        errorMessage = "Authentication expired. Please log in again to continue."
        // Redirect to login if authentication failed
        setTimeout(() => {
          router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=payment')}`)
        }, 2000)
      } else if (error.message?.includes("booking")) {
        errorMessage = "Failed to create booking. Please check your details and try again."
      } else if (error.message?.includes("payment")) {
        errorMessage = "Failed to initiate payment. Please try again or contact support."
      } else if (error.message) {
        errorMessage = error.message
      }

      setPaymentError(errorMessage)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Fetch cities from API when component mounts
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true)
        setCityError(null)

        console.log("Fetching cities from API...")
        const citiesData = await getAllCities()
        console.log("Cities data from API:", citiesData)

        // Map the API response to the format expected by the dropdown
        const formattedCities = citiesData.map(city => ({
          id: city.id || 0,
          name: city.city_name
        }))

        console.log("Formatted cities for dropdown:", formattedCities)
        setCities(formattedCities)
      } catch (error: any) {
        console.error("Failed to fetch cities:", error)
        setCityError("Failed to load cities. Please try again.")
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, []) // Empty dependency array means this effect runs once on mount

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Authentication state:", isAuthenticated)
  }, [isAuthenticated])

  // Load city from URL or saved registration data
  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const cityParam = urlParams.get('city')
    const stepParam = urlParams.get('step')

    // If city is provided in URL, set it
    if (cityParam) {
      setSelectedCity(cityParam)
    }

    // Try to load saved registration data
    const savedData = sessionStorage.getItem('registrationData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)

        // Restore all form data
        setParentName(data.parentName || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setChildName(data.childName || '')
        setSchoolName(data.schoolName || '')
        setDob(data.dob ? new Date(data.dob) : undefined)
        setGender(data.gender || 'female')
        setSelectedCity(data.selectedCity || cityParam || '')
        setSelectedEventType(data.selectedEventType || '')
        setSelectedEvent(data.selectedEvent || '')
        setSelectedGame(data.selectedGame || '')
        setChildAgeMonths(data.childAgeMonths || null)
        setTermsAccepted(data.termsAccepted || false)

        // Restore event date
        if (data.eventDate) {
          setEventDate(new Date(data.eventDate))
        }

        // Load available dates from saved data
        if (data.availableDates && Array.isArray(data.availableDates)) {
          setAvailableDates(data.availableDates.map((dateStr: string) => new Date(dateStr)))
        }

        // Load saved add-ons if available
        const savedAddOns = sessionStorage.getItem('selectedAddOns')
        if (savedAddOns) {
          try {
            const addOnsData = JSON.parse(savedAddOns)
            const loadedAddOns = addOnsData.map((item: { addOnId: string; quantity: number; variantId?: string }) => ({
              addOn: addOns.find(addon => addon.id === item.addOnId) as AddOn,
              quantity: item.quantity,
              variantId: item.variantId
            })).filter((item: { addOn: AddOn | undefined }) => item.addOn !== undefined)

            setSelectedAddOns(loadedAddOns)
          } catch (error) {
            console.error('Error parsing saved add-ons data:', error)
          }
        }

        // Determine the appropriate step
        if (stepParam === 'payment' && isAuthenticated) {
          // User is authenticated and wants to go to payment
          setStep(3)
        } else if (stepParam === 'addons' || (data.step && data.step >= 2)) {
          // Go to add-ons step
          setStep(2)
        } else {
          // Stay on registration step
          setStep(1)
        }

        // Clear the URL parameters to clean up the URL
        if (stepParam) {
          const newUrl = window.location.pathname + (cityParam ? `?city=${cityParam}` : '')
          window.history.replaceState({}, '', newUrl)
        }
      } catch (error) {
        console.error('Error parsing saved registration data:', error)
      }
    } else if (stepParam === 'payment' || stepParam === 'addons') {
      // If no saved data but step parameter exists, redirect to start
      router.push('/register-event' + (cityParam ? `?city=${cityParam}` : ''))
    }
  }, [isAuthenticated, router]) // Include isAuthenticated and router in dependencies

  return (
    <div className="container py-8 px-4 sm:px-6 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:opacity-20">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-yellow-200 opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-green-200 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-200 opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/3 w-24 h-24 rounded-full bg-purple-200 opacity-20 animate-pulse delay-300"></div>
      </div>

      <Card className="mx-auto w-full max-w-4xl relative overflow-hidden shadow-lg border-2 border-primary/10 bg-white/90 backdrop-blur-sm dark:bg-gray-800 dark:border-gray-700">
        {/* Decorative top pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

        {/* Decorative baby-themed elements */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-yellow-100 opacity-50"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-blue-100 opacity-50"></div>

        <CardHeader className="space-y-1 relative">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Register for NIBOG Event</CardTitle>
              <CardDescription>
                {selectedCity
                  ? `Register your child for exciting baby games in ${selectedCity}`
                  : "Register your child for exciting baby games"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Authentication Status Indicator */}
        {!isAuthenticated ? (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-blue-800 dark:text-blue-200">Login Required</span>
                <p className="text-blue-600 dark:text-blue-300 mt-1">
                  You'll need to log in to complete your registration and payment. Your progress will be saved.
                </p>
              </div>
            </div>
          </div>
        ) : user && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-800 dark:text-green-200">Welcome back, {user.full_name}!</span>
                <p className="text-green-600 dark:text-green-300 mt-1">
                  You're logged in and ready to complete your registration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mx-6 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 1 ? "bg-primary text-white" : step > 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 1 ? "bg-white text-primary" : step > 1 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span>Registration</span>
            </div>

            <div className={cn(
              "w-8 h-0.5 transition-all",
              step > 1 ? "bg-green-500" : "bg-gray-300"
            )}></div>

            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 2 ? "bg-primary text-white" : step > 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 2 ? "bg-white text-primary" : step > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {step > 2 ? "✓" : "2"}
              </span>
              <span>Add-ons</span>
            </div>

            <div className={cn(
              "w-8 h-0.5 transition-all",
              step > 2 ? "bg-green-500" : "bg-gray-300"
            )}></div>

            <div className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all",
              step === 3 ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
            )}>
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                step === 3 ? "bg-white text-primary" : "bg-gray-300 text-gray-600"
              )}>
                3
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 sm:px-6">
          {step === 1 && (
            <>
              {/* City Selection - Moved to the top */}
              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  Parent Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="parent-name" className="flex items-center gap-1">
                      <span>Parent's Full Name</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    <Input
                      id="parent-name"
                      placeholder="Enter your full name"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary/40 bg-white/90 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <span>Email</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary/40 bg-white/90 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <span>Mobile Number</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Enter your 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary/40 bg-white/90 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M9 12h.01"></path>
                      <path d="M15 12h.01"></path>
                      <path d="M10 16c.5.3 1.1.5 2 .5s1.5-.2 2-.5"></path>
                      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
                    </svg>
                  </div>
                  Child Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="child-name" className="flex items-center gap-1">
                      <span>Child's Full Name</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    <Input
                      id="child-name"
                      placeholder="Enter your child's full name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary/40 bg-white/90 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>Child's Date of Birth</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-dashed transition-all duration-200",
                            !dob ? "text-muted-foreground border-muted-foreground/40" : "border-primary/40 bg-primary/5"
                          )}
                        >
                          <CalendarIcon className={cn("mr-2 h-4 w-4", dob ? "text-primary" : "text-muted-foreground")} />
                          {dob ? format(dob, "PPP") : "Select date of birth"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/10 shadow-xl">
                        <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10">
                          <h3 className="text-sm font-medium text-primary">Select Child's Birthday</h3>
                        </div>
                        <Calendar
                          mode="single"
                          selected={dob}
                          onSelect={handleDobChange}
                          disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                          initialFocus
                          fromYear={2020}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-name" className="flex items-center gap-1">
                    <span>School Name</span>
                    {childAgeMonths && childAgeMonths >= 36 ? (
                      <span className="text-xs text-primary/70">(Required)</span>
                    ) : (
                      <span className="text-xs text-amber-500">(Optional)</span>
                    )}
                  </Label>
                  <Input
                    id="school-name"
                    placeholder={childAgeMonths && childAgeMonths < 36 ? "Home, Daycare, or Playschool" : "Enter school name"}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required={childAgeMonths ? childAgeMonths >= 36 : false}
                    className="border-primary/20 focus:border-primary/40 bg-white/90 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                  />
                  {childAgeMonths && childAgeMonths < 36 && (
                    <p className="text-xs text-muted-foreground mt-1">For children under 3 years, you can enter "Home", "Daycare", or the name of their playschool</p>
                  )}
                </div>
              </div>

              {/* Display child's age in months when DOB is selected */}
              {dob && childAgeMonths !== null && (
                <div className="mt-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <path d="M12 2v6.5l3-3"></path>
                        <path d="M12 2v6.5l-3-3"></path>
                        <path d="M12 22v-6.5l3 3"></path>
                        <path d="M12 22v-6.5l-3 3"></path>
                        <path d="M2 12h6.5l-3 3"></path>
                        <path d="M2 12h6.5l-3-3"></path>
                        <path d="M22 12h-6.5l3 3"></path>
                        <path d="M22 12h-6.5l3-3"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Child's Age: </span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span>
                      <span className="text-xs text-blue-600 ml-2">({Math.floor(childAgeMonths / 12)} years, {childAgeMonths % 12} months)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <span>Gender</span>
                  <span className="text-xs text-primary/70">(Required)</span>
                </Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex gap-4 p-2 border border-dashed rounded-md border-primary/20 bg-white/80 dark:bg-black dark:border-gray-700 dark:text-gray-50"
                >
                  <div className="flex items-center space-x-2 flex-1 p-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                    <RadioGroupItem value="male" id="male" className="text-blue-500" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1 p-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                    <RadioGroupItem value="female" id="female" className="text-pink-500" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
                <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  Select Your City
                </h3>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>City</span>
                    <span className="text-xs text-primary/70">(Required)</span>
                  </Label>
                  {isLoadingCities ? (
                    <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="text-muted-foreground">Loading cities...</span>
                    </div>
                  ) : cityError ? (
                    <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                      {cityError}
                    </div>
                  ) : (
                    <Select value={selectedCity} onValueChange={handleCityChange} disabled={cities.length === 0}>
                      <SelectTrigger className={cn(
                        "border-dashed transition-all duration-200",
                        selectedCity ? "border-primary/40 bg-primary/5" : "border-muted-foreground/40 text-muted-foreground"
                      )}>
                        <SelectValue placeholder={cities.length === 0 ? "No cities available" : "Select your city"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto border-2 border-primary/10 shadow-xl">
                        <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10 sticky top-0 z-10">
                          <h3 className="text-sm font-medium text-primary">Select Your City</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.name} className="rounded-md hover:bg-primary/5 transition-colors duration-200">
                              {city.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedCity && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-primary/10">
                    <Label className="flex items-center gap-1">
                      <span>Event</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    {isLoadingEvents ? (
                      <div className="flex h-10 items-center rounded-md border border-input px-3 py-2 text-sm">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-muted-foreground">Loading events...</span>
                      </div>
                    ) : eventError ? (
                      <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                        {eventError}
                      </div>
                    ) : getUniqueEventTypes().length > 0 ? (
                      <Select
                        value={selectedEventType}
                        onValueChange={handleEventTypeChange}
                        disabled={getUniqueEventTypes().length === 0}
                      >
                        <SelectTrigger className={cn(
                          "border-dashed transition-all duration-200",
                          selectedEventType ? "border-primary/40 bg-primary/5" : "border-muted-foreground/40 text-muted-foreground"
                        )}>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-primary/10 shadow-xl">
                          <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10 sticky top-0 z-10">
                            <h3 className="text-sm font-medium text-primary">Select an Event</h3>
                          </div>
                          {getUniqueEventTypes().map((eventType) => (
                            <SelectItem key={eventType} value={eventType} className="rounded-md hover:bg-primary/5 transition-colors duration-200">
                              {eventType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex h-10 items-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                        No events found for this city
                      </div>
                    )}
                  </div>
                )}

                {selectedCity && selectedEventType && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-primary/10">
                    <Label className="flex items-center gap-1">
                      <span>Event Details</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    {eligibleEvents.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-1">
                        {eligibleEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-start space-x-3 rounded-lg border-2 p-3 transition-all duration-200 border-primary/30 bg-primary/5 shadow-md"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="font-medium text-lg">
                                {format(new Date(event.date), "PPP")}
                              </div>
                              <p className="text-sm text-muted-foreground">{event.venue}</p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-sm">
                                  <span className="font-medium text-primary">₹{event.price}</span> • {event.city}
                                </div>
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                  Age: {event.minAgeMonths}-{event.maxAgeMonths} months
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                            <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              No event details available
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                              <p>
                                Could not load details for {selectedEventType} in {selectedCity}.
                                Please try a different event or city.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Games Section - Only shown when child age and event are selected */}
                {selectedCity && selectedEventType && childAgeMonths !== null && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-dashed border-primary/10">
                    <Label className="flex items-center gap-1">
                      <span>Available Games</span>
                      <span className="text-xs text-primary/70">(Required)</span>
                    </Label>
                    
                    {isLoadingGames ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading games...</span>
                      </div>
                    ) : gameError ? (
                      <div className="rounded-lg bg-gradient-to-r from-red-50 to-rose-50 p-4 dark:from-red-950 dark:to-rose-950 border border-red-100 dark:border-red-900 shadow-inner">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-1">
                            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                              Error loading games
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                              <p>{gameError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : eligibleGames.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-1">
                        {eligibleGames.map((game) => (
                          <div
                            key={game.id}
                            className={cn(
                              "flex items-start space-x-3 rounded-lg border-2 p-3 transition-all duration-200 cursor-pointer",
                              selectedGame === game.id
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-muted hover:border-primary/30 hover:bg-primary/5"
                            )}
                            onClick={() => handleGameSelection(game.id)}
                          >
                            <RadioGroup value={selectedGame} onValueChange={handleGameSelection} className="flex-1">
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem value={game.id} id={`game-${game.id}`} className="mt-1" />
                                <div className="space-y-1 flex-1">
                                  <Label htmlFor={`game-${game.id}`} className="font-medium cursor-pointer">
                                    {game.custom_title || game.game_title}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{game.custom_description || game.game_description}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                      {game.start_time} {game.end_time ? `- ${game.end_time}` : ''}
                                    </div>
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                      {game.game_duration_minutes} min
                                    </div>
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                      Age: {game.min_age}-{game.max_age} months
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <span className="font-medium text-primary">₹{game.slot_price || game.custom_price || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                            <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                              No games available
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                              <p>
                                No games found for {selectedEventType} in {selectedCity} for a child of {childAgeMonths} months.
                                Please try a different event or contact support for assistance.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {dob && selectedCity && (
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950 border border-blue-100 dark:border-blue-900 shadow-inner">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-1">
                      <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Child's Age Information</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        <p>
                          Based on the date of birth, your child will be{" "}
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span> old on the event date ({format(eventDate, "PPP")}).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Child age information is displayed above, no games section needed */}

              {/* Event date selection has been integrated into the event selection */}

              {/* Event selection has been moved to the city selection section */}

              <div className="flex items-start space-x-2 p-3 rounded-lg border border-dashed border-primary/20 bg-white/80 dark:bg-black dark:border-gray-700 dark:text-gray-50">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                      terms and conditions
                    </Link>
                  </Label>
                  <p className="text-xs text-muted-foreground">By registering, you agree to NIBOG's terms of service and privacy policy.</p>
                </div>
              </div>

              <Button
                className={cn(
                  "w-full relative overflow-hidden group transition-all duration-300",
                  (!selectedCity || !dob || !selectedEventType || !selectedEvent || !selectedGame || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                 (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted || isProcessingPayment)
                    ? "opacity-50"
                    : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                )}
                onClick={handleRegistration}
                disabled={!selectedCity || !dob || !selectedEventType || !selectedEvent || !selectedGame || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                         (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted || isProcessingPayment}
              >
                <span className="relative z-10 flex items-center">
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isAuthenticated ? "Continue to Add-ons" : "Continue (Login Required)"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></span>
              </Button>
            </>
          )}

          {step === 2 && selectedEventDetails && (
            <>
              <div className="rounded-md bg-muted p-4 mb-6">
                <h3 className="font-semibold">Registration Summary</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{selectedEventDetails.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(eventDate, "PPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Venue:</span>
                    <span>{selectedEventDetails.venue}, {selectedEventDetails.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Child's Age on Event Date:</span>
                    <span>{childAgeMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">School:</span>
                    <span>{schoolName || (childAgeMonths && childAgeMonths < 36 ? "Home" : "Not specified")}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons Section with Optional Indicator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Add-ons</h3>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhance your experience with optional add-ons. You can skip this step and proceed directly to payment if you prefer.
                </p>

                <AddOnSelector
                  addOns={addOns}
                  onAddOnsChange={setSelectedAddOns}
                  initialSelectedAddOns={selectedAddOns}
                />
              </div>

              {/* Show different messaging based on add-ons selection */}
              {selectedAddOns.length === 0 && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      No add-ons selected. You can proceed to payment or add some optional extras above.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="w-full" onClick={handleContinueToPayment}>
                  {selectedAddOns.length === 0
                    ? (isAuthenticated ? "Skip Add-ons & Proceed to Payment" : "Skip Add-ons & Continue (Login Required)")
                    : (isAuthenticated ? "Proceed to Payment" : "Continue to Payment (Login Required)")
                  }
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && selectedEventDetails && (
            <>
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-semibold">Registration Summary</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event:</span>
                      <span className="font-medium">{selectedEventDetails.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{format(eventDate, "PPP")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span>{selectedEventDetails.venue}, {selectedEventDetails.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Child's Age on Event Date:</span>
                      <span>{childAgeMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School:</span>
                      <span>{schoolName || (childAgeMonths && childAgeMonths < 36 ? "Home" : "Not specified")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Registration Fee:</span>
                      <span>₹{selectedEventDetails.price}</span>
                    </div>
                    {selectedAddOns.length > 0 ? (
                    <>
                      {selectedAddOns.map((item) => {
                        let price = item.addOn.price
                        let variantName = ""

                        // Check if this is a variant with a different price
                        if (item.variantId && item.addOn.hasVariants && item.addOn.variants) {
                          const variant = item.addOn.variants.find(v => v.id === item.variantId)
                          if (variant) {
                            price = variant.price
                            variantName = ` - ${variant.name}`
                          }
                        }

                        // Apply bundle discount if applicable
                        let discountedPrice = price
                        let hasDiscount = false

                        if (item.addOn.bundleDiscount && item.quantity >= item.addOn.bundleDiscount.minQuantity) {
                          hasDiscount = true
                          const discountMultiplier = 1 - (item.addOn.bundleDiscount.discountPercentage / 100)
                          discountedPrice = price * discountMultiplier
                        }

                        return (
                          <div key={item.addOn.id} className="flex justify-between">
                            <div>
                              <span>{item.addOn.name}{variantName} {item.quantity > 1 ? `(${item.quantity})` : ""}</span>
                              {hasDiscount && (
                                <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-xs">
                                  {item.addOn.bundleDiscount?.discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                            <div>
                              {hasDiscount ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-xs line-through text-muted-foreground">
                                    {formatPrice(price * item.quantity)}
                                  </span>
                                  <span>{formatPrice(discountedPrice * item.quantity)}</span>
                                </div>
                              ) : (
                                <span>{formatPrice(price * item.quantity)}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-between font-medium">
                        <span>Add-ons Subtotal:</span>
                        <span>₹{calculateAddOnsTotal()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Add-ons:</span>
                      <span>None selected</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>GST (18%):</span>
                    <span>₹{calculateGST()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="promo">Promo Code</Label>
                  <div className="flex space-x-2">
                    <Input id="promo" placeholder="Enter promo code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                </div>

                {paymentError && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-100 shadow-inner mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
                        <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{paymentError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-6">
                  <Label>Payment Method</Label>
                  <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
                    <div className="flex items-center justify-center">
                      <div className="bg-[#5f259f] p-4 rounded-lg text-white font-bold text-xl flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v13c0 1.1-.9 2-2 2h-3.5"></path>
                          <path d="M2 10h20"></path>
                          <path d="M7 15h.01"></path>
                          <path d="M11 15h2"></path>
                          <path d="M10.5 20a2.5 2.5 0 1 1 5 0 2.5 2.5 0 1 1-5 0z"></path>
                        </svg>
                        PhonePe
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      You will be redirected to PhonePe to complete your payment securely.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                          <line x1="2" x2="22" y1="10" y2="10"></line>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16.7 8A3 3 0 0 0 14 6h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1-2.7-2"></path>
                          <path d="M12 18V6"></path>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20"></path>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                          <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                          <path d="M16 11h0"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>Pay with PhonePe ₹{calculateTotalPrice()}</>
                    )}
                  </Button>
                </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-dashed border-primary/10 bg-gradient-to-b from-white/0 to-primary/5 sm:px-6">
          <div className="text-center text-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-primary/20"></div>
              <div className="h-1 w-1 rounded-full bg-primary/30"></div>
              <div className="h-1 w-1 rounded-full bg-primary/40"></div>
              <div className="h-1 w-1 rounded-full bg-primary/50"></div>
              <div className="h-1 w-1 rounded-full bg-primary/40"></div>
              <div className="h-1 w-1 rounded-full bg-primary/30"></div>
              <div className="h-1 w-1 rounded-full bg-primary/20"></div>
            </div>
            <div className="text-muted-foreground">
              Need help? Contact us at{" "}
              <Link href="mailto:support@nibog.in" className="text-primary font-medium underline-offset-4 hover:underline transition-colors">
                support@nibog.in
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}