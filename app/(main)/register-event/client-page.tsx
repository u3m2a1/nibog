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
import { CalendarIcon, Info, ArrowRight, ArrowLeft, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AddOnSelector from "@/components/add-on-selector"
import { addOns } from "@/data/add-ons"
import { AddOn } from "@/types"

// Helper function to format price
const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`
}

// Mock data - in a real app, this would come from an API
const events = [
  {
    id: "1",
    title: "Baby Crawling",
    description: "Let your little crawler compete in a fun and safe environment.",
    minAgeMonths: 5,
    maxAgeMonths: 13,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/baby-crawling.jpg",
  },
  {
    id: "2",
    title: "Baby Walker",
    description: "Fun-filled baby walker race in a safe environment.",
    minAgeMonths: 5,
    maxAgeMonths: 13,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/baby-walker.jpg",
  },
  {
    id: "3",
    title: "Running Race",
    description: "Exciting running race for toddlers in a fun and safe environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/running-race.jpg",
  },
  {
    id: "4",
    title: "Hurdle Toddle",
    description: "Fun hurdle race for toddlers to develop coordination and balance.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-03-16",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Chennai",
    price: 1800,
    image: "/images/hurdle-toddle.jpg",
  },
  {
    id: "5",
    title: "Cycle Race",
    description: "Exciting cycle race for children to showcase their skills.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-08-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Vizag",
    price: 1800,
    image: "/images/cycle-race.jpg",
  },
  {
    id: "6",
    title: "Ring Holding",
    description: "Fun ring holding game to develop hand-eye coordination.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-10-12",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Bangalore",
    price: 1800,
    image: "/images/ring-holding.jpg",
  },
  {
    id: "7",
    title: "Ball Throw",
    description: "Develop throwing skills and hand-eye coordination in a fun competitive environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-09-18",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Mumbai",
    price: 1800,
    image: "/images/ball-throw.jpg",
  },
  {
    id: "8",
    title: "Balancing Beam",
    description: "Fun balancing activities to develop coordination and confidence.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-11-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Delhi",
    price: 1800,
    image: "/images/balancing-beam.jpg",
  },
  {
    id: "9",
    title: "Frog Jump",
    description: "Exciting jumping competition for toddlers in a fun and safe environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-12-10",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Kolkata",
    price: 1800,
    image: "/images/frog-jump.jpg",
  },
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
  { id: "8", name: "Pune" },
  { id: "9", name: "Patna" },
  { id: "10", name: "Ranchi" },
  { id: "11", name: "Nagpur" },
  { id: "12", name: "Kochi" },
  { id: "13", name: "Indore" },
  { id: "14", name: "Lucknow" },
  { id: "15", name: "Chandigarh" },
  { id: "16", name: "Gurgaon" },
  { id: "17", name: "Jaipur" },
  { id: "18", name: "Ahmedabad" },
  { id: "19", name: "Bhubaneswar" },
  { id: "20", name: "Raipur" },
  { id: "21", name: "Gandhi Nagar" },
]

export default function RegisterEventClientPage() {
  const router = useRouter()
  const [dob, setDob] = useState<Date>()
  const [eventDate, setEventDate] = useState<Date>(new Date("2025-10-26"))
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>("") // Empty string initially
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

  // Mock authentication state - in a real app, this would come from an auth context
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Calculate child's age on event date
  const calculateAge = (birthDate: Date, onDate: Date) => {
    const ageInMonths = differenceInMonths(onDate, birthDate)
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
    if (date && eventDate) {
      const ageInMonths = calculateAge(date, eventDate)
      setChildAgeMonths(ageInMonths)

      // Filter eligible events based on age
      const eligible = events.filter(
        event =>
          event.minAgeMonths <= ageInMonths &&
          event.maxAgeMonths >= ageInMonths &&
          event.city === selectedCity
      )
      setEligibleEvents(eligible)

      // Reset selected event if not eligible
      if (eligible.length > 0 && !eligible.find(e => e.id === selectedEvent)) {
        setSelectedEvent("")
      }

      // Get unique dates for this city
      const dates = eligible.map(event => new Date(event.date))
      const uniqueDates = Array.from(new Set(dates.map(date => date.toISOString())))
        .map(dateStr => new Date(dateStr))
      setAvailableDates(uniqueDates)

      // Set event date to the first available date
      if (uniqueDates.length > 0) {
        setEventDate(uniqueDates[0])
      }
    }
  }

  // Handle event date change when selecting from available dates
  const handleEventDateChange = (date: Date) => {
    setEventDate(date)
    if (dob) {
      const ageInMonths = calculateAge(dob, date)
      setChildAgeMonths(ageInMonths)

      // Filter eligible events based on age and selected date
      const eligible = events.filter(
        event =>
          event.minAgeMonths <= ageInMonths &&
          event.maxAgeMonths >= ageInMonths &&
          event.city === selectedCity &&
          new Date(event.date).toDateString() === date.toDateString()
      )
      setEligibleEvents(eligible)

      // Reset selected event if not eligible
      if (eligible.length > 0 && !eligible.find(e => e.id === selectedEvent)) {
        setSelectedEvent("")
      }
    }
  }

  // Handle city change
  const handleCityChange = (city: string) => {
    setSelectedCity(city)

    // If child's age is already calculated, filter eligible events
    if (childAgeMonths !== null) {
      // Filter eligible events based on age and city
      const eligible = events.filter(
        event =>
          event.minAgeMonths <= childAgeMonths &&
          event.maxAgeMonths >= childAgeMonths &&
          event.city === city
      )
      setEligibleEvents(eligible)

      // Reset selected event if not eligible
      if (eligible.length > 0 && !eligible.find(e => e.id === selectedEvent)) {
        setSelectedEvent("")
      }

      // Get unique dates for this city
      const dates = eligible.map(event => new Date(event.date))
      const uniqueDates = Array.from(new Set(dates.map(date => date.toISOString())))
        .map(dateStr => new Date(dateStr))
      setAvailableDates(uniqueDates)

      // Set event date to the first available date
      if (uniqueDates.length > 0) {
        setEventDate(uniqueDates[0])
      }
    }
  }

  // Get selected event details
  const selectedEventDetails = events.find(event => event.id === selectedEvent)

  // Handle continue to add-ons
  const handleContinueToAddOns = () => {
    if (!isAuthenticated) {
      // Save registration data to sessionStorage
      const registrationData = {
        parentName,
        email,
        phone,
        childName,
        schoolName,
        dob,
        gender,
        eventDate,
        selectedCity,
        selectedEvent,
        childAgeMonths,
        availableDates: availableDates.map(date => date.toISOString())
      }
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData))

      // Redirect to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent('/register-event?step=addons')}`)
    } else {
      // User is authenticated, proceed to add-ons step
      setStep(2)
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

  // Handle continue to payment
  const handleContinueToPayment = () => {
    // Save add-ons to session storage
    saveAddOnsToSession()
    setStep(3)
  }

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

    if (stepParam === 'addons' || stepParam === 'payment') {
      // Try to load saved registration data
      const savedData = sessionStorage.getItem('registrationData')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setParentName(data.parentName || '')
          setEmail(data.email || '')
          setPhone(data.phone || '')
          setChildName(data.childName || '')
          setSchoolName(data.schoolName || '')
          setDob(data.dob ? new Date(data.dob) : undefined)
          setGender(data.gender || 'female')
          setSelectedCity(data.selectedCity || '')
          setSelectedEvent(data.selectedEvent || '')
          setChildAgeMonths(data.childAgeMonths || null)

          // If we have all required data, go to appropriate step
          if (data.selectedCity && data.dob && data.selectedEvent && data.childAgeMonths !== null) {
            // Recalculate eligible events
            const ageInMonths = data.childAgeMonths
            const eligible = events.filter(
              event =>
                event.minAgeMonths <= ageInMonths &&
                event.maxAgeMonths >= ageInMonths &&
                event.city === data.selectedCity
            )
            setEligibleEvents(eligible)

            // Get unique dates for this city
            const dates = eligible.map(event => new Date(event.date))
            const uniqueDates = Array.from(new Set(dates.map(date => date.toISOString())))
              .map(dateStr => new Date(dateStr))

            // Load available dates from saved data or calculate them
            if (data.availableDates && Array.isArray(data.availableDates)) {
              setAvailableDates(data.availableDates.map((dateStr: string) => new Date(dateStr)))
            } else {
              setAvailableDates(uniqueDates)
            }

            // Set event date from saved data or first available date
            if (data.eventDate) {
              setEventDate(new Date(data.eventDate))
            } else if (uniqueDates.length > 0) {
              setEventDate(uniqueDates[0])
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

            // Set the appropriate step based on the URL parameter
            if (stepParam === 'addons') {
              setStep(2) // Add-ons step
            } else if (stepParam === 'payment') {
              setStep(3) // Payment step
            }
          }
        } catch (error) {
          console.error('Error parsing saved registration data:', error)
        }
      }
    }
  }, []) // Empty dependency array means this effect runs once on mount

  return (
    <div className="container py-8 px-4 sm:px-6 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-yellow-200 opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-10 w-32 h-32 rounded-full bg-blue-200 opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-green-200 opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-200 opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/3 w-24 h-24 rounded-full bg-purple-200 opacity-20 animate-pulse delay-300"></div>
      </div>

      <Card className="mx-auto w-full max-w-4xl relative overflow-hidden shadow-lg border-2 border-primary/10 bg-white/90 backdrop-blur-sm">
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
        <CardContent className="space-y-4 sm:px-6">
          {step === 1 && (
            <>
              {/* City Selection - Moved to the top */}
              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
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
                  <Select value={selectedCity} onValueChange={handleCityChange}>
                    <SelectTrigger className={cn(
                      "border-dashed transition-all duration-200",
                      selectedCity ? "border-primary/40 bg-primary/5" : "border-muted-foreground/40 text-muted-foreground"
                    )}>
                      <SelectValue placeholder="Select your city" />
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
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
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
                      className="border-primary/20 focus:border-primary/40 bg-white/90"
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
                      className="border-primary/20 focus:border-primary/40 bg-white/90"
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
                      className="border-primary/20 focus:border-primary/40 bg-white/90"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2">
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
                      className="border-primary/20 focus:border-primary/40 bg-white/90"
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
                    className="border-primary/20 focus:border-primary/40 bg-white/90"
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
                  className="flex gap-4 p-2 border border-dashed rounded-md border-primary/20 bg-white/80"
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

              {selectedCity ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>Event Date</span>
                    <span className="text-xs text-primary/70">(Required)</span>
                  </Label>
                  {availableDates.length > 1 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Multiple event dates available in {selectedCity}. Please select one:</p>
                    <RadioGroup value={eventDate.toISOString()} onValueChange={(value) => setEventDate(new Date(value))} className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {availableDates.map((date) => (
                        <div key={date.toISOString()} className="flex items-center space-x-2 p-2 rounded-md border border-dashed border-primary/20 hover:bg-primary/5">
                          <RadioGroupItem value={date.toISOString()} id={`date-${date.toISOString()}`} />
                          <Label htmlFor={`date-${date.toISOString()}`} className="cursor-pointer">
                            {format(date, "PPP")}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="p-3 rounded-md border border-dashed border-primary/20 bg-primary/5">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      <span>{eventDate ? format(eventDate, "PPP") : "No event date available"}</span>
                    </div>
                  </div>
                )}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
                      <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Please select a city first</h3>
                      <div className="mt-1 text-sm text-blue-700">
                        <p>Select your city from the dropdown above to see available events and dates.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {childAgeMonths !== null && selectedCity && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>Select Event</span>
                    <span className="text-xs text-primary/70">(Required)</span>
                  </Label>
                  {eligibleEvents.length > 0 ? (
                    <RadioGroup value={selectedEvent} onValueChange={setSelectedEvent} className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                      {eligibleEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "flex items-start space-x-3 rounded-lg border-2 p-3 transition-all duration-200",
                            selectedEvent === event.id
                              ? "border-primary/30 bg-primary/5 shadow-md"
                              : "border-dashed border-muted-foreground/20 hover:border-primary/20 hover:bg-primary/5"
                          )}
                        >
                          <RadioGroupItem value={event.id} id={`event-${event.id}`} className="mt-1" />
                          <div className="space-y-1 flex-1">
                            <Label htmlFor={`event-${event.id}`} className="font-medium text-lg">
                              {event.title}
                            </Label>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-sm">
                                <span className="font-medium text-primary">₹{event.price}</span> • {event.venue}, {event.city}
                              </div>
                              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                Age: {event.minAgeMonths}-{event.maxAgeMonths} months
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 dark:from-yellow-950 dark:to-amber-950 border border-yellow-100 dark:border-yellow-900 shadow-inner">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-full p-1">
                          <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">No eligible events</h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <p>
                              There are no events available for a {childAgeMonths} month old child in {selectedCity}.
                              Please try a different city or event date.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start space-x-2 p-3 rounded-lg border border-dashed border-primary/20 bg-white/80">
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
                  (!selectedCity || !dob || !selectedEvent || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                 (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted)
                    ? "opacity-50"
                    : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                )}
                onClick={handleContinueToAddOns}
                disabled={!selectedCity || !dob || !selectedEvent || childAgeMonths === null || !parentName || !email || !phone || !childName ||
                         (childAgeMonths && childAgeMonths >= 36 && !schoolName) || !termsAccepted}
              >
                <span className="relative z-10 flex items-center">
                  Continue to Add-ons <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
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

              <AddOnSelector
                addOns={addOns}
                onAddOnsChange={setSelectedAddOns}
                initialSelectedAddOns={selectedAddOns}
              />

              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="w-full" onClick={handleContinueToPayment}>
                  Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
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
                  {selectedAddOns.length > 0 && (
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

              <div className="space-y-2 mt-6">
                <Label>Payment Method</Label>
                <Tabs defaultValue="card" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">Card</TabsTrigger>
                    <TabsTrigger value="upi">UPI</TabsTrigger>
                    <TabsTrigger value="netbanking">Net Banking</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name-on-card">Name on Card</Label>
                      <Input id="name-on-card" placeholder="Enter name as on card" />
                    </div>
                  </TabsContent>
                  <TabsContent value="upi" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input id="upi-id" placeholder="name@upi" />
                    </div>
                  </TabsContent>
                  <TabsContent value="netbanking" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Bank</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sbi">State Bank of India</SelectItem>
                          <SelectItem value="hdfc">HDFC Bank</SelectItem>
                          <SelectItem value="icici">ICICI Bank</SelectItem>
                          <SelectItem value="axis">Axis Bank</SelectItem>
                          <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="w-full">
                  Pay ₹{calculateTotalPrice()}
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
