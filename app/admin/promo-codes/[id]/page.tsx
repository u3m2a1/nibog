"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, Copy, AlertTriangle, Calendar, Tag, Percent, DollarSign } from "lucide-react"
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    case "inactive":
      return <Badge variant="outline">Inactive</Badge>
    case "expired":
      return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

type Props = {
  params: { id: string }
}

export default function PromoCodeDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const promoCodeId = unwrappedParams.id
  
  const promoCode = promoCodes.find((p) => p.id === promoCodeId)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  
  // Handle copy promo code
  const handleCopyPromoCode = () => {
    if (!promoCode) return
    
    setIsProcessing("copy")
    
    navigator.clipboard.writeText(promoCode.code)
      .then(() => {
        setIsProcessing(null)
        alert(`Promo code ${promoCode.code} copied to clipboard!`)
      })
      .catch(err => {
        setIsProcessing(null)
        console.error('Failed to copy: ', err)
      })
  }
  
  // Handle delete promo code
  const handleDeletePromoCode = () => {
    setIsProcessing("delete")
    
    // Simulate API call to delete the promo code
    setTimeout(() => {
      console.log(`Deleting promo code ${promoCodeId}`)
      setIsProcessing(null)
      // In a real app, you would delete the promo code and then redirect
      router.push("/admin/promo-codes")
    }, 1000)
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
  
  // Calculate usage percentage
  const usagePercentage = Math.round((promoCode.usageCount / promoCode.usageLimit) * 100)
  
  // Check if promo code is expired
  const isExpired = new Date(promoCode.validTo) < new Date()
  
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
            <h1 className="text-3xl font-bold tracking-tight">{promoCode.code}</h1>
            <p className="text-muted-foreground">
              {promoCode.discountType === "percentage" 
                ? `${promoCode.discount}% off` 
                : `₹${promoCode.discount} off`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopyPromoCode}
            disabled={isProcessing === "copy"}
          >
            <Copy className="mr-2 h-4 w-4" />
            {isProcessing === "copy" ? "Copying..." : "Copy Code"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Promo Code
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash className="mr-2 h-4 w-4" />
                Delete Promo Code
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the promo code "{promoCode.code}".
                        {promoCode.usageCount > 0 ? (
                          <>
                            <br />
                            This code has been used {promoCode.usageCount} time{promoCode.usageCount !== 1 ? "s" : ""}.
                            Deleting it may affect reporting and analytics.
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeletePromoCode}
                  disabled={isProcessing === "delete"}
                >
                  {isProcessing === "delete" ? "Deleting..." : "Delete Promo Code"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Promo Code Details</CardTitle>
            <div className="mt-2 flex gap-2">
              {getStatusBadge(promoCode.status)}
              {isExpired && promoCode.status !== "expired" && (
                <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Discount Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {promoCode.discountType === "percentage" ? (
                      <Percent className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p>
                        {promoCode.discountType === "percentage" 
                          ? `${promoCode.discount}% off` 
                          : `₹${promoCode.discount} off`}
                      </p>
                      {promoCode.maxDiscount && promoCode.discountType === "percentage" && (
                        <p className="text-sm text-muted-foreground">
                          Maximum discount: ₹{promoCode.maxDiscount}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Minimum purchase: ₹{promoCode.minPurchase}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Validity Period</h3>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">From: {promoCode.validFrom}</p>
                    <p className="text-sm text-muted-foreground">To: {promoCode.validTo}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Usage Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usage Count</span>
                  <span className="font-medium">{promoCode.usageCount} / {promoCode.usageLimit}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {usagePercentage}% of total limit used
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 font-medium">Applicable Events</h3>
              <div className="space-y-2">
                {promoCode.applicableEvents.length === 1 && promoCode.applicableEvents[0] === "All" ? (
                  <p className="text-sm text-muted-foreground">This promo code is applicable to all events.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {promoCode.applicableEvents.map((event, index) => (
                      <Badge key={index} variant="outline">{event}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {promoCode.description && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-2 font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{promoCode.description}</p>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Created By</h3>
                <p className="text-sm text-muted-foreground">
                  {promoCode.createdBy} on {promoCode.createdAt}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium">Last Updated By</h3>
                <p className="text-sm text-muted-foreground">
                  {promoCode.lastUpdatedBy} on {promoCode.lastUpdatedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Promo Code
              </Link>
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleCopyPromoCode}
              disabled={isProcessing === "copy"}
            >
              <Copy className="mr-2 h-4 w-4" />
              {isProcessing === "copy" ? "Copying..." : "Copy Code"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" 
                  variant="outline"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Promo Code
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div className="space-y-2">
                        <div className="font-medium">This action cannot be undone.</div>
                        <div>
                          This will permanently delete the promo code "{promoCode.code}".
                          {promoCode.usageCount > 0 ? (
                            <>
                              <br />
                              This code has been used {promoCode.usageCount} time{promoCode.usageCount !== 1 ? "s" : ""}.
                              Deleting it may affect reporting and analytics.
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDeletePromoCode}
                    disabled={isProcessing === "delete"}
                  >
                    {isProcessing === "delete" ? "Deleting..." : "Delete Promo Code"}
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
