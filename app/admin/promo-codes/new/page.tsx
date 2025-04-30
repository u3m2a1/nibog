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
import { ArrowLeft, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Discount types
const discountTypes = [
  { id: "1", name: "percentage", label: "Percentage" },
  { id: "2", name: "fixed", label: "Fixed Amount" },
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

export default function NewPromoCodePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [minPurchase, setMinPurchase] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validTo, setValidTo] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to create the promo code
    setTimeout(() => {
      // In a real app, this would be an API call to create the promo code
      console.log({
        code,
        discount: parseFloat(discount),
        discountType,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        minPurchase: parseFloat(minPurchase),
        validFrom,
        validTo,
        usageLimit: parseInt(usageLimit),
        status: "active",
        applicableEvents: applyToAll ? ["All"] : selectedEvents,
        description
      })
      
      setIsLoading(false)
      
      // Redirect to the promo codes list
      router.push("/admin/promo-codes")
    }, 1000)
  }

  const handleEventChange = (event: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, event])
    } else {
      setSelectedEvents(selectedEvents.filter(e => e !== event))
    }
  }

  // Generate a random promo code
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'NIBOG'
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setCode(result)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/promo-codes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Promo Code</h1>
            <p className="text-muted-foreground">Add a new promo code for NIBOG events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Information</CardTitle>
            <CardDescription>Enter the details for the new promo code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Promo Code</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={generateRandomCode}
                >
                  Generate Random Code
                </Button>
              </div>
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
              <Link href="/admin/promo-codes">
                Cancel
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (applyToAll === false && selectedEvents.length === 0)}
            >
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Promo Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
