"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, Copy, AlertTriangle, BarChart, Loader2 } from "lucide-react"
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

// Types for API response
interface PromoCodeAPI {
  id: number
  promo_code: string
  type: "percentage" | "fixed"
  value: string
  valid_from: string
  valid_to: string
  usage_limit: number
  usage_count: number
  minimum_purchase_amount: string
  maximum_discount_amount: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Internal type for component
interface PromoCode {
  id: string
  code: string
  discount: number
  discountType: "percentage" | "fixed"
  maxDiscount: number | null
  minPurchase: number
  validFrom: string
  validTo: string
  usageLimit: number
  usageCount: number
  status: "active" | "inactive" | "expired"
  description: string
}

// API function to fetch promo codes
const fetchPromoCodes = async (): Promise<PromoCode[]> => {
  try {
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/promo-codes/get-all?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch promo codes')
    }
    const data: PromoCodeAPI[] = await response.json()

    // Transform API data to component format
    return data.map((item) => {
      const validFrom = new Date(item.valid_from).toISOString().split('T')[0]
      const validTo = new Date(item.valid_to).toISOString().split('T')[0]
      const currentDate = new Date()
      const validToDate = new Date(item.valid_to)

      // Determine status
      let status: "active" | "inactive" | "expired" = "inactive"
      if (item.is_active) {
        status = validToDate < currentDate ? "expired" : "active"
      }

      return {
        id: item.id.toString(),
        code: item.promo_code,
        discount: parseFloat(item.value),
        discountType: item.type,
        maxDiscount: item.maximum_discount_amount ? parseFloat(item.maximum_discount_amount) : null,
        minPurchase: parseFloat(item.minimum_purchase_amount),
        validFrom,
        validTo,
        usageLimit: item.usage_limit,
        usageCount: item.usage_count,
        status,
        description: item.description
      }
    })
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    throw error
  }
}

// Discount types
const discountTypes = [
  { id: "1", name: "percentage" },
  { id: "2", name: "fixed" },
]

// Promo code statuses
const statuses = [
  { id: "1", name: "active" },
  { id: "2", name: "inactive" },
  { id: "3", name: "expired" },
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

export default function PromoCodesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [promoCodesList, setPromoCodesList] = useState<PromoCode[]>([])
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch promo codes on component mount
  useEffect(() => {
    const loadPromoCodes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const codes = await fetchPromoCodes()
        setPromoCodesList(codes)
      } catch (err) {
        setError('Failed to load promo codes. Please try again.')
        console.error('Error loading promo codes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPromoCodes()
  }, [])

  // Handle copy promo code
  const handleCopyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert(`Promo code ${code} copied to clipboard!`)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
      })
  }

  // Handle delete promo code
  const handleDeletePromoCode = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to delete the promo code
    setTimeout(() => {
      // In a real app, this would be an API call to delete the promo code
      setPromoCodesList(promoCodesList.filter((code: PromoCode) => code.id !== id))
      setIsProcessing(null)
    }, 1000)
  }

  // Filter promo codes based on search and filters
  const filteredPromoCodes = promoCodesList.filter((promoCode: PromoCode) => {
    // Search query filter
    if (
      searchQuery &&
      !promoCode.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && promoCode.status !== selectedStatus) {
      return false
    }

    // Discount type filter
    if (selectedType !== "all" && promoCode.discountType !== selectedType) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">Manage discount codes for NIBOG events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/promo-codes/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/promo-codes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Promo Code
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promo codes..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Discount Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Discount Types</SelectItem>
                  {discountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name === "percentage" ? "Percentage" : "Fixed Amount"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading promo codes...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="text-red-500">{error}</div>
                </TableCell>
              </TableRow>
            ) : filteredPromoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No promo codes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoCodes.map((promoCode: PromoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-medium">{promoCode.code}</TableCell>
                  <TableCell>
                    {promoCode.discountType === "percentage"
                      ? `${promoCode.discount}%`
                      : `₹${promoCode.discount}`}
                    {promoCode.maxDiscount && (
                      <div className="text-xs text-muted-foreground">
                        Max: ₹{promoCode.maxDiscount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>₹{promoCode.minPurchase}</TableCell>
                  <TableCell>
                    {promoCode.validFrom} to {promoCode.validTo}
                  </TableCell>
                  <TableCell>
                    {promoCode.usageCount}/{promoCode.usageLimit}
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(promoCode.usageCount / promoCode.usageLimit) * 100}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(promoCode.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/promo-codes/${promoCode.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/promo-codes/${promoCode.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyPromoCode(promoCode.code)}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
                              onClick={() => handleDeletePromoCode(promoCode.id)}
                              disabled={isProcessing === promoCode.id}
                            >
                              {isProcessing === promoCode.id ? "Deleting..." : "Delete Promo Code"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
