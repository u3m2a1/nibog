"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data - in a real app, this would come from an API
const promoCodes = [
  {
    id: "1",
    code: "NIBOG25",
    discount: 25,
    discountType: "percentage",
    maxDiscount: 500,
    minPurchase: 1000,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    usageLimit: 1000,
    usageCount: 250,
    status: "active",
    applicableEvents: ["All"],
    createdBy: "Admin User",
    createdAt: "2024-12-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-12-20",
    description: "25% off on all NIBOG events. Maximum discount of ₹500."
  },
  {
    id: "2",
    code: "WELCOME500",
    discount: 500,
    discountType: "fixed",
    maxDiscount: null,
    minPurchase: 1800,
    validFrom: "2025-01-01",
    validTo: "2025-03-31",
    usageLimit: 500,
    usageCount: 320,
    status: "active",
    applicableEvents: ["Baby Crawling", "Baby Walker"],
    createdBy: "Admin User",
    createdAt: "2024-12-10",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-12-12",
    description: "₹500 off on Baby Crawling and Baby Walker events. Minimum purchase of ₹1800."
  },
  {
    id: "3",
    code: "SUMMER20",
    discount: 20,
    discountType: "percentage",
    maxDiscount: 400,
    minPurchase: 1800,
    validFrom: "2025-04-01",
    validTo: "2025-06-30",
    usageLimit: 800,
    usageCount: 150,
    status: "active",
    applicableEvents: ["All"],
    createdBy: "Admin User",
    createdAt: "2025-03-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2025-03-15",
    description: "Summer special! 20% off on all NIBOG events. Maximum discount of ₹400."
  }
]

// Discount types
const discountTypes = [
  { id: "1", name: "percentage", label: "Percentage" },
  { id: "2", name: "fixed", label: "Fixed Amount" },
]

// Promo code statuses
const statuses = [
  { id: "1", name: "active", label: "Active" },
  { id: "2", name: "inactive", label: "Inactive" },
  { id: "3", name: "expired", label: "Expired" },
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

type Props = {
  params: { id: string }
}

export default function EditPromoCodePage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const promoCodeId = unwrappedParams.id
  
  const [promoCode, setPromoCode] = useState<any>(null)
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [minPurchase, setMinPurchase] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [status, setStatus] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the promo code data
    const foundPromoCode = promoCodes.find(p => p.id === promoCodeId)
    if (foundPromoCode) {
      setPromoCode(foundPromoCode)
      setCode(foundPromoCode.code)
      setDiscount(foundPromoCode.discount.toString())
      setDiscountType(foundPromoCode.discountType)
      setMaxDiscount(foundPromoCode.maxDiscount ? foundPromoCode.maxDiscount.toString() : "")
      setMinPurchase(foundPromoCode.minPurchase.toString())
      setValidFrom(foundPromoCode.validFrom)
      setValidTo(foundPromoCode.validTo)
      setUsageLimit(foundPromoCode.usageLimit.toString())
      setStatus(foundPromoCode.status)
      setDescription(foundPromoCode.description || "")
      
      if (foundPromoCode.applicableEvents.length === 1 && foundPromoCode.applicableEvents[0] === "All") {
        setApplyToAll(true)
        setSelectedEvents([])
      } else {
        setApplyToAll(false)
        setSelectedEvents(foundPromoCode.applicableEvents)
      }
    }
  }, [promoCodeId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to update the promo code
    setTimeout(() => {
      // In a real app, this would be an API call to update the promo code
      console.log({
        id: promoCodeId,
        code,
        discount: parseFloat(discount),
        discountType,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        minPurchase: parseFloat(minPurchase),
        validFrom,
        validTo,
        usageLimit: parseInt(usageLimit),
        status,
        applicableEvents: applyToAll ? ["All"] : selectedEvents,
        description
      })
      
      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the promo code details page
        router.push(`/admin/promo-codes/${promoCodeId}`)
      }, 1500)
    }, 1000)
  }

  const handleEventChange = (event: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, event])
    } else {
      setSelectedEvents(selectedEvents.filter(e => e !== event))
    }
  }

  if (!promoCode) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Promo code not found</h2>
          <p className="text-muted-foreground">The promo code you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/promo-codes")}>
            Back to Promo Codes
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
            <Link href={`/admin/promo-codes/${promoCodeId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Promo Code</h1>
            <p className="text-muted-foreground">Update promo code details for {promoCode.code}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Information</CardTitle>
            <CardDescription>Update the promo code details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code</Label>
              <Input 
                id="code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="Enter promo code"
                required
              />
              <p className="text-sm text-muted-foreground">
                This is the code that users will enter during checkout.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountType} onValueChange={setDiscountType} required>
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Value</Label>
                <Input 
                  id="discount" 
                  type="number"
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)} 
                  placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Maximum Discount (Optional)</Label>
                <Input 
                  id="maxDiscount" 
                  type="number"
                  value={maxDiscount} 
                  onChange={(e) => setMaxDiscount(e.target.value)} 
                  placeholder="Enter maximum discount amount"
                  min="0"
                  disabled={discountType !== "percentage"}
                />
                <p className="text-sm text-muted-foreground">
                  Only applicable for percentage discounts.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Minimum Purchase</Label>
                <Input 
                  id="minPurchase" 
                  type="number"
                  value={minPurchase} 
                  onChange={(e) => setMinPurchase(e.target.value)} 
                  placeholder="Enter minimum purchase amount"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input 
                  id="validFrom" 
                  type="date"
                  value={validFrom} 
                  onChange={(e) => setValidFrom(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input 
                  id="validTo" 
                  type="date"
                  value={validTo} 
                  onChange={(e) => setValidTo(e.target.value)} 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input 
                id="usageLimit" 
                type="number"
                value={usageLimit} 
                onChange={(e) => setUsageLimit(e.target.value)} 
                placeholder="Enter usage limit"
                min="1"
                required
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of times this promo code can be used.
              </p>
            </div>
            
            <Separator className="my-4" />
            
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
              <p className="text-sm text-muted-foreground">
                Inactive promo codes cannot be used. Expired codes are automatically disabled.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <Label>Applicable Events</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="applyToAll" 
                  checked={applyToAll} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEvents([])
                    }
                    setApplyToAll(!!checked)
                  }} 
                />
                <label
                  htmlFor="applyToAll"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apply to all events
                </label>
              </div>
              
              {!applyToAll && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`event-${event.id}`} 
                        checked={selectedEvents.includes(event.name)} 
                        onCheckedChange={(checked) => handleEventChange(event.name, !!checked)} 
                      />
                      <label
                        htmlFor={`event-${event.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {event.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {!applyToAll && selectedEvents.length === 0 && (
                <p className="text-sm text-red-500">
                  Please select at least one event or apply to all events.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter description"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                This description is for internal use only.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/promo-codes/${promoCodeId}`}>
                Cancel
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSaved || (applyToAll === false && selectedEvents.length === 0)}
            >
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

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>View usage statistics for this promo code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Usage Count</h3>
                  <p className="mt-2 text-2xl font-bold">{promoCode.usageCount}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Usage Limit</h3>
                  <p className="mt-2 text-2xl font-bold">{promoCode.usageLimit}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Usage Progress</h3>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(promoCode.usageCount / promoCode.usageLimit) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round((promoCode.usageCount / promoCode.usageLimit) * 100)}% of total limit used
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
