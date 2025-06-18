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
import { getAllAddOns } from '@/services/addOnService'
import { AddOn } from '@/types'
import { getAllCities } from '@/services/cityService'
import { getEventsByCityId, EventListItem, EventGameListItem } from '@/services/eventService'
import { getGamesByAge, Game } from '@/services/gameService'
import { registerBooking, formatBookingDataForAPI } from '@/services/bookingRegistrationService'
import { initiatePhonePePayment } from '@/services/paymentService'
import { getPromoCodesByEventAndGames, validatePromoCodePreview, PromoCodeDetail } from '@/services/promoCodeService'

// Define interfaces
interface City {
  id: string | number;
  name: string;
  state?: string;
  country?: string;
}

interface EligibleEvent {
  id: string | number;
  title: string;
  description?: string;
  city_id: string | number;
  venue_id?: string | number;
  event_date: string;
  status?: string;
  games?: EventGameListItem[];
  // Optional UI fields
  venue?: string;
  city?: string;
  price?: number;
  image?: string;
  minAgeMonths?: number;
  maxAgeMonths?: number;
  time?: string;
  date?: string;
}

// Helper function for calculating age in months
const calculateAgeInMonths = (birthdate: Date | null): number | null => {
  if (!birthdate) return null;
  
  const today = new Date();
  let months = (today.getFullYear() - birthdate.getFullYear()) * 12;
  months -= birthdate.getMonth();
  months += today.getMonth();
  
  // Adjust for day of month
  if (today.getDate() < birthdate.getDate()) {
    months--;
  }
  
  return months;
}

// Helper function to format price.
const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`
}

// Events, games and pricing will be fetched from API

// Cities will be fetched from API

export default function RegisterEventClientPage() {
  const router = useRouter()
  const { user } = useAuth()
  // Page step management
  const [step, setStep] = useState<number>(1)
  const [currentStep, setCurrentStep] = useState<string>('child')
  
  // Parent and child details
  const [parentName, setParentName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [childName, setChildName] = useState<string>('')
  const [gender, setGender] = useState<string>('Female')
  const [schoolName, setSchoolName] = useState<string>('')
  const [dob, setDob] = useState<Date | null>(null)
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)
  
  // City selection
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('') // City name
  const [selectedCityId, setSelectedCityId] = useState<string | number>('') // City ID for API calls
  
  // Event selection
  const [eventDate, setEventDate] = useState<Date>(new Date())
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [selectedEventType, setSelectedEventType] = useState<string>('') // Event type dropdown
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [eligibleEvents, setEligibleEvents] = useState<EligibleEvent[]>([])
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false)
  const [eventError, setEventError] = useState<string | null>(null)
  
  // Game selection
  const [games, setGames] = useState<Game[]>([])
  const [eligibleGames, setEligibleGames] = useState<Game[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  
  // Add-ons
  const [loadingAddOns, setLoadingAddOns] = useState<boolean>(false)
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>([])
  
  // Terms and payment
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  
  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('')
  const [validPromoCode, setValidPromoCode] = useState<PromoCodeDetail | null>(null)
  const [isCheckingPromoCode, setIsCheckingPromoCode] = useState<boolean>(false)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [availablePromoCodes, setAvailablePromoCodes] = useState<PromoCodeDetail[]>([])
  const [isLoadingPromoCodes, setIsLoadingPromoCodes] = useState<boolean>(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>('')
  const [promoCodeMessage, setPromoCodeMessage] = useState<string>('')
  const [promoCodeSuccess, setPromoCodeSuccess] = useState<boolean>(false)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [showPromoOptions, setShowPromoOptions] = useState<boolean>(false)

  // Get authentication state from auth context
  const { isAuthenticated } = useAuth()

  // Calculate child's age on event date
  const calculateAge = (birthDate: Date, onDate: Date) => {
    const ageInMonths = differenceInMonths(onDate, birthDate)
    return ageInMonths
  }

  // Calculate total price including add-ons and GST
  const calculateTotalPrice = () => {
    if (!selectedEventDetails) return 0

    const eventPrice = selectedEventDetails.price
    const addOnsTotal = calculateAddOnsTotal() // Using the more detailed add-on calculator
    const subtotal = eventPrice + addOnsTotal
    const gst = Math.round(subtotal * 0.18)
    const totalBeforeDiscount = subtotal + gst
    
    // Apply promo code discount if valid and fix to 2 decimal places
    if (promoCodeSuccess && discountAmount > 0) {
      const discountedAmount = Math.max(0, totalBeforeDiscount - discountAmount)
      return Number(discountedAmount.toFixed(2)) // Convert to number with 2 decimal places
    }
    
    return totalBeforeDiscount
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
  const handleDobChange = async (date: Date | undefined) => {
    if (date) {
      setDob(date)
      setSelectedEventType("") // Reset event type when DOB changes
      setSelectedEvent("") // Reset selected event
      setSelectedGames([]) // Reset selected games
      setGames([]) // Clear any previously loaded games

      if (eventDate) {
        const calculatedAge = calculateAgeInMonths(date)
        setChildAgeMonths(calculatedAge)

        // We now only calculate and display the age
        // Games will be loaded only after city and event are selected
        console.log(`Child's age: ${calculatedAge} months`)
        
        // Reset event-related fields
        setEligibleEvents([])
        setAvailableDates([])
      }
    }
  }

  // Handle event date change when selecting from available dates
  const handleEventDateChange = (date: Date) => {
    setEventDate(date)
    if (dob) {
      const ageInMonths = calculateAgeInMonths(dob)
      setChildAgeMonths(ageInMonths)

      // Filter eligible events based on age and selected date
      if (apiEvents.length > 0 && selectedCity) {
        const eligible = apiEvents.filter((event: EventListItem) => {
          // Filter events that match the selected city and date
          return event.city_id.toString() === selectedCityId.toString() &&
                 new Date(event.event_date).toDateString() === date.toDateString()
        }).map((event: EventListItem) => ({
          id: event.id,
          title: event.event_title,
          description: event.event_description,
          city_id: event.city_id,
          venue_id: event.venue_id,
          event_date: event.event_date,
          games: event.games
        }));
        
        setEligibleEvents(eligible)

        // Reset selected event if not eligible anymore
        if (eligible.length > 0 && !eligible.find(e => e.id.toString() === selectedEvent)) {
          setSelectedEvent("")
        }
      }
    }
  }

  // Placeholder to maintain file structure - this function will be replaced by the one below
  // The actual implementation is the one after fetchGamesForEventAndCity function

  // Function to fetch games based on selected event and city
  const fetchGamesForEventAndCity = async () => {
    if (!selectedEvent || !selectedCity || !dob) return;
    
    try {
      setGameError(null);
      setIsLoadingGames(true);
      
      // Get the selected event details
      const selectedEventObj = apiEvents.find((event) => event.event_id.toString() === selectedEvent);
      
      if (!selectedEventObj) {
        console.error("Selected event not found in API events");
        setSelectedEventType("");
        setSelectedEvent("");
        setSelectedGames([]);
        return;
      }
      
      // Calculate child age in months if DOB is available
      let ageInMonths: number | null = null;
      if (dob) {
        ageInMonths = calculateAgeInMonths(dob);
      }
      
      // Fetch games from the API using event-registration/get endpoint
      const response = await fetch('/api/event-registration/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: selectedEventObj.event_id,
          child_age_months: ageInMonths,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching games:', errorText);
        throw new Error('Failed to fetch games for this event');
      }
      
      const data = await response.json();
      console.log("API response for event games:", data);
      
      // Extract games from the API response
      const eventGames = data.event_games || [];
      console.log(`Found ${eventGames.length} games for the selected event`);
      
      // Filter games by child's age if we have a DOB
      const filteredGames = ageInMonths ?
        eventGames.filter((game: EventGameListItem) => {
          const minAgeInMonths = typeof game.min_age === 'string' ? parseInt(game.min_age, 10) * 12 : game.min_age * 12;
          const maxAgeInMonths = typeof game.max_age === 'string' ? parseInt(game.max_age, 10) * 12 : game.max_age * 12;
          return ageInMonths !== null && ageInMonths >= minAgeInMonths && ageInMonths <= maxAgeInMonths;
        }) : eventGames;
      
      console.log(`Found ${filteredGames.length} games for the selected event and age`);
      // Convert to Game type expected by the UI
      const formattedGames = filteredGames.map((game: EventGameListItem) => ({
        id: game.game_id,
        game_title: game.game_title,
        game_description: game.game_description || '',
        min_age: typeof game.min_age === 'string' ? parseInt(game.min_age, 10) : game.min_age,
        max_age: typeof game.max_age === 'string' ? parseInt(game.max_age, 10) : game.max_age,
        game_duration_minutes: game.game_duration_minutes,
        categories: game.categories || [],
        custom_title: game.custom_title || '',
        custom_description: game.custom_description || '',
        custom_price: game.custom_price,
        slot_price: game.slot_price,
        start_time: game.start_time,
        end_time: game.end_time,
        max_participants: game.max_participants
      } as Game));
      
      setGames(formattedGames);
      setEligibleGames(formattedGames);
    } catch (error: any) {
      console.error("Error fetching games:", error);
      setGameError(error.message || "Error fetching games");
    } finally {
      setIsLoadingGames(false);
    }
  };

  // Handle event type change
  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType)
    setSelectedEvent("") // Reset selected event when event type changes
    setSelectedGames([]) // Reset selected games

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find((event) => event.event_title === eventType);

    if (selectedApiEvent) {
      console.log("Selected event:", selectedApiEvent);

      // Create an event object from the API event data to maintain compatibility with the rest of the form
      const eventObj: EligibleEvent = {
        id: selectedApiEvent.event_id.toString(),
        title: selectedApiEvent.event_title,
        description: selectedApiEvent.event_description,
        city_id: selectedApiEvent.city_id,
        venue_id: selectedApiEvent.venue_id,
        event_date: selectedApiEvent.event_date,
        status: selectedApiEvent.event_status,
        games: selectedApiEvent.games,
        // Additional UI fields
        minAgeMonths: 5, // Default values since API might not have these directly
        maxAgeMonths: 84, // Default values since API might not have these directly
        date: selectedApiEvent.event_date.split('T')[0], // Format the date
        time: "9:00 AM - 8:00 PM", // Default time
        venue: selectedApiEvent.venue_name,
        city: selectedApiEvent.city_name,
        price: selectedApiEvent.games && selectedApiEvent.games.length > 0 
          ? selectedApiEvent.games[0].slot_price 
          : 1800, // Use game price if available, otherwise default
        image: "/images/baby-crawling.jpg" // Default image
      };

      // Set this as the only eligible event
      setEligibleEvents([eventObj]);
      setSelectedEvent(eventObj.id.toString());

      // Set event date
      if (selectedApiEvent.event_date) {
        const eventDate = new Date(selectedApiEvent.event_date);
        setEventDate(eventDate);
        setAvailableDates([eventDate]);

        // If DOB is set, calculate age for this event date
        if (dob) {
          const ageInMonths = calculateAgeInMonths(dob);
          setChildAgeMonths(ageInMonths);
          
          // Now that we have both city and event selected, fetch the games
          if (selectedCity) {
            // Delay fetching games until the state updates are complete
            setTimeout(() => fetchGamesForEventAndCity(), 0);
          }
        }
      }
    } else {
      // If no matching event found, clear eligible events
      setEligibleEvents([]);
    }
  }

  // Handle city selection change
  const handleCityChange = async (cityName: string) => {
    setSelectedCity(cityName)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedEvent("") // Reset selected event
    setSelectedGames([]) // Reset selected games
    setGames([]) // Clear any previously loaded games
    
    // Find the city object from the list of cities
    const cityObj = cities.find(city => city.name === cityName)
    if (cityObj) {
      setSelectedCityId(cityObj.id)
      
      // Load events for this city
      try {
        setIsLoadingEvents(true)
        setEventError(null)
        
        const eventsData = await getEventsByCityId(cityObj.id)
        setApiEvents(eventsData)
        
        // Get unique event types from the API events
        const uniqueEventTypes = [...new Set(eventsData.map((event: EventListItem) => event.event_title))]
        console.log("Unique event types:", uniqueEventTypes)
        
        if (uniqueEventTypes.length === 0) {
          setEventError("No events found for this city")
        }
      } catch (error: any) {
        console.error("Error fetching events:", error)
        setEventError(error.message || "Failed to load events")
      } finally {
        setIsLoadingEvents(false)
      }
    }
  }

  // Handle game selection
  const handleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      // If already selected, remove it
      setSelectedGames(selectedGames.filter(id => id !== gameId))
    } else {
      // If not selected, add it
      setSelectedGames([...selectedGames, gameId])
    }
    console.log(`Selected game ID: ${gameId}`)
  }

  // Get unique event titles from API events
  const getUniqueEventTypes = () => {
    if (apiEvents.length === 0) return []

    // Extract event titles from the API response
    const eventTitles = apiEvents.map((event: EventListItem) => event.event_title);
    return Array.from(new Set(eventTitles));
  }

  // Get selected event details from eligible events or API events
  const selectedEventDetails = eligibleEvents.find(event => event.id.toString() === selectedEvent) || 
    apiEvents.find((event: EventListItem) => event.event_id.toString() === selectedEvent) || null;

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
        selectedGames,
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
        selectedGames,
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
    setIsProcessingPayment(true)
    try {
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

      // Get promo code from input field if it exists
      const promoCodeInput = document.getElementById('promo') as HTMLInputElement | null;
      const promoCodeValue = promoCodeInput?.value || promoCode;

      // Format the booking data for the API
      // Find the selected game from eligibleGames array using selectedGame ID
      const selectedGameObjs = eligibleGames.filter(game => selectedGames.includes(game.id.toString()));
      
      if (!selectedGameObjs || selectedGameObjs.length === 0) {
        throw new Error("Selected game not found. Please select a game and try again.");
      }
      
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
        gameId: selectedGameObjs.map(game => game.id),
        gamePrice: selectedGameObjs.reduce((total, game) => total + (game.custom_price || game.slot_price || 0), 0),
        totalAmount: calculateTotalPrice(),
        paymentMethod: "PhonePe", // Using PhonePe as the payment method
        paymentStatus: "successful", // Status is set to successful now since we're using the new API
        termsAccepted,
        selectedAddOns: selectedAddOns, // Include selected add-ons
        promoCode: promoCodeValue || undefined // Include promo code if entered
      })

      console.log("Formatted booking data:", bookingData)

      // Register the booking
      const response = await registerBooking(bookingData)
      console.log("Booking registration response:", response)

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to create booking. Please try again.")
      }
      
      // Get booking ID from response, assuming the structure matches the API schema
      // The exact path will depend on the actual response format
      const bookingId = response.booking_id?.toString() || Date.now().toString()
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
      window.location.href = paymentUrl;
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

  // Function to validate a promo code
  const validatePromoCode = async (code: string) => {
    if (!code) {
      setPromoCodeMessage('Please enter a promo code')
      setPromoCodeSuccess(false)
      return
    }
    
    if (!selectedGames.length || !selectedEventType) {
      setPromoCodeMessage('Please select an event and game first')
      setPromoCodeSuccess(false)
      return
    }
    
    try {
      setIsLoadingPromoCodes(true)
      setPromoCodeMessage('')
      
      const selectedGameObjs = eligibleGames.filter(game => selectedGames.includes(game.id.toString()));
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      
      if (!selectedGameObjs || !selectedApiEvent) {
        setPromoCodeMessage('Invalid event or game selection')
        setPromoCodeSuccess(false)
        return
      }
      
      // Calculate original amount before promo
      const originalAmount = calculateTotalPrice() + discountAmount
      
      // Validate the promo code with all selected game IDs
      const selectedGameIds = selectedGameObjs.map(game => game.id);
      const result = await validatePromoCodePreview(
        code,
        selectedApiEvent.event_id,
        selectedGameIds,
        originalAmount
      )
      
      setPromoCodeMessage(result.message)
      setPromoCodeSuccess(result.isValid)
      
      if (result.isValid) {
        setDiscountAmount(result.discountAmount)
      } else {
        setDiscountAmount(0)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoCodeMessage('Failed to validate promo code')
      setPromoCodeSuccess(false)
      setDiscountAmount(0)
    } finally {
      setIsLoadingPromoCodes(false)
    }
  }

  // Fetch promo codes when event and game are selected
  useEffect(() => {
    const fetchPromoCodes = async () => {
      if (!selectedGames.length || !selectedEventType) {
        setAvailablePromoCodes([])
        return
      }
      
      const selectedGameObjs = eligibleGames.filter(game => selectedGames.includes(game.id.toString()));
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
      
      if (!selectedGameObjs || !selectedApiEvent) {
        return
      }
      
      try {
        setIsLoadingPromoCodes(true)
        setPromoCodeMessage('')
        const gameIds = selectedGameObjs.map(game => game.id)
        const eventId = selectedApiEvent.event_id
        
        const promoCodes = await getPromoCodesByEventAndGames(eventId, gameIds)
        setAvailablePromoCodes(promoCodes)
        
        // Reset any previously applied promo code when fetching new ones
        setSelectedPromoCode('')
        setDiscountAmount(0)
        setPromoCodeSuccess(false)
      } catch (error) {
        console.error('Error fetching promo codes:', error)
        setPromoCodeMessage('Failed to load available promo codes')
      } finally {
        setIsLoadingPromoCodes(false)
      }
    }
    
    fetchPromoCodes()
  }, [selectedGames, selectedEventType, eligibleGames, apiEvents])
  
  // Fetch add-ons from API
  useEffect(() => {
    async function fetchAddOns() {
      setLoadingAddOns(true)
      try {
        const apiAddOns = await getAllAddOns()
        
        // Transform API response format to match the expected AddOn type
        const formattedAddOns = apiAddOns.map(apiAddon => {
          // Format variants to match expected structure
          const formattedVariants = apiAddon.variants?.map(variant => ({
            id: variant.id?.toString() || `variant-${Math.random()}`,
            name: variant.name,
            price: apiAddon.price ? parseFloat(apiAddon.price) + variant.price_modifier : variant.price_modifier,
            attributes: { size: variant.name }, // Assuming variant name can be used as attribute
            stockQuantity: variant.stock_quantity,
            sku: variant.sku
          })) || []
          
          return {
            id: apiAddon.id.toString(),
            name: apiAddon.name,
            description: apiAddon.description,
            price: parseFloat(apiAddon.price),
            images: apiAddon.images || [],
            category: apiAddon.category,
            isActive: apiAddon.is_active,
            hasVariants: apiAddon.has_variants,
            stockQuantity: apiAddon.stock_quantity,
            sku: apiAddon.sku,
            bundleDiscount: {
              minQuantity: apiAddon.bundle_min_quantity,
              discountPercentage: parseFloat(apiAddon.bundle_discount_percentage)
            },
            variants: apiAddon.has_variants ? formattedVariants : undefined,
            createdAt: apiAddon.created_at || new Date().toISOString(),
            updatedAt: apiAddon.updated_at || new Date().toISOString(),
          }
        })
        
        setAddOns(formattedAddOns)
      } catch (error) {
        console.error("Failed to fetch add-ons:", error)
        // Fallback to empty array if fetch fails
        setAddOns([])
      } finally {
        setLoadingAddOns(false)
      }
    }
    
    fetchAddOns()
  }, [])

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
        setSelectedGames(data.selectedGames || [])
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
                    <RadioGroupItem value="Male" id="male" className="text-blue-500" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1 p-2 rounded-md hover:bg-primary/5 transition-colors duration-200">
                    <RadioGroupItem value="Female" id="female" className="text-pink-500" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              {dob && (
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950 border border-blue-100 dark:border-blue-900 shadow-inner">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-1">
                      <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Child's Age Information</h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                        <p>
                          Based on the date of birth, your child is{" "}
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{childAgeMonths} months</span> old.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* City Selection */}
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
              </div>

              {/* Games section will be shown after event selection */}
              {selectedEventType && dob && childAgeMonths !== null && (
                <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
                  <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
                    Games for {childAgeMonths} Months
                  </h3>

                  {isLoadingGames ? (
                    <div className="flex h-20 items-center justify-center rounded-md border border-input px-3 py-2">
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="text-muted-foreground">Loading games for your child's age...</span>
                    </div>
                  ) : gameError ? (
                    <div className="flex h-20 items-center justify-center rounded-md border border-destructive px-3 py-2 text-sm text-destructive">
                      {gameError}
                    </div>
                  ) : eligibleGames.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Choose Games (Select multiple)</Label>
                        <p className="text-xs text-muted-foreground">Select one or more games suitable for your child's age</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                        {eligibleGames.map((game) => (
                          <div
                            key={game.id}
                            className="flex items-start space-x-3 rounded-lg border-2 p-3 transition-all duration-200 border-primary/30 bg-primary/5 shadow-md"
                          >
                            <Checkbox 
                              id={`game-${game.id}`} 
                              checked={selectedGames.includes(game.id.toString())}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedGames(prev => [...prev, game.id.toString()])
                                } else {
                                  setSelectedGames(prev => prev.filter(id => id !== game.id.toString()))
                                }
                              }}
                            />
                            <div className="space-y-1 flex-1">
                              <div className="font-medium text-lg">
                                {game.game_title}
                              </div>
                              <p className="text-sm text-muted-foreground">{game.game_description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-sm">
                                  <span className="font-medium text-primary">₹{game.custom_price || game.slot_price}</span> • {game.game_duration_minutes} min
                                </div>
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                  Age: {game.min_age}-{game.max_age} months
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                          <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            No games found
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <p>
                              We couldn't find any games suitable for a {childAgeMonths} month old child.
                              Please try a different age range or contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  (!selectedCity || !dob || !selectedEventType || !selectedEvent || !selectedGames.length || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                 (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted || isProcessingPayment)
                    ? "opacity-50"
                    : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                )}
                onClick={handleRegistration}
                disabled={!selectedCity || !dob || !selectedEventType || !selectedEvent || !selectedGames.length || childAgeMonths === null || !parentName || !email || !phone || !childName ||
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

                {loadingAddOns ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-2 text-xl">Loading add-ons...</p>
                  </div>
                ) : (
                  <AddOnSelector
                    addOns={addOns}
                    onAddOnsChange={setSelectedAddOns}
                    initialSelectedAddOns={selectedAddOns}
                  />
                )}
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
                  
                  {/* Show subtotal before discount */}
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>₹{(selectedEventDetails.price + calculateAddOnsTotal() + calculateGST()).toFixed(2)}</span>
                  </div>
                  
                  {/* Show promo code discount if valid */}
                  {promoCodeSuccess && discountAmount > 0 && (
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Promo Code Discount ({selectedPromoCode}):</span>
                      <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                  {promoCodeSuccess && discountAmount > 0 && (
                    <div className="text-sm text-green-600 text-right">
                      You saved ₹{discountAmount.toFixed(2)} with this promo code!
                    </div>
                  )}
                  </div>
                </div>

                <div className="grid grid-cols-1 py-4 gap-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="promo" className="font-semibold">Promo Code</label>
                    {availablePromoCodes.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setShowPromoOptions(!showPromoOptions)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showPromoOptions ? 'Hide available codes' : 'Show available codes'}
                      </button>
                    )}
                  </div>
                  
                  {showPromoOptions && availablePromoCodes.length > 0 && (
                    <div className="mb-2 bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm mb-2 font-medium">Available Promo Codes:</p>
                      <div className="flex flex-wrap gap-2">
                        {availablePromoCodes.map((promo) => (
                          <button
                            key={promo.id}
                            type="button"
                            onClick={() => {
                              setSelectedPromoCode(promo.promo_code);
                              validatePromoCode(promo.promo_code);
                              setShowPromoOptions(false);
                            }}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                          >
                            {promo.promo_code} - {promo.description || 
                              `${promo.type === 'percentage' ? promo.value + '%' : '₹' + promo.value} off`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="promo" 
                      name="promo" 
                      value={selectedPromoCode}
                      onChange={(e) => setSelectedPromoCode(e.target.value)}
                      className="py-2 px-2 border border-gray-300 rounded-lg flex-grow text-black"
                      placeholder="Enter promo code" 
                    />
                    <button
                      type="button"
                      onClick={() => validatePromoCode(selectedPromoCode)}
                      disabled={isLoadingPromoCodes || !selectedPromoCode}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {isLoadingPromoCodes ? (
                        <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating</span>
                      ) : 'Apply'}
                    </button>
                  </div>
                  
                  {promoCodeMessage && (
                    <div className={`text-sm ${promoCodeSuccess ? 'text-green-600' : 'text-red-500'}`}>
                      {promoCodeMessage}
                      {promoCodeSuccess && discountAmount > 0 && ` (-₹${discountAmount.toFixed(2)})`}
                    </div>
                  )}
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
