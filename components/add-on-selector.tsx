"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, ShoppingCart, AlertCircle, Package, Tag } from "lucide-react"
import { AddOn, AddOnVariant } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddOnSelectorProps {
  addOns: AddOn[]
  onAddOnsChange: (selectedAddOns: { addOn: AddOn; quantity: number; variantId?: string }[]) => void
  initialSelectedAddOns?: { addOn: AddOn; quantity: number; variantId?: string }[]
}

export default function AddOnSelector({
  addOns,
  onAddOnsChange,
  initialSelectedAddOns = [],
}: AddOnSelectorProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>(
    initialSelectedAddOns
  )
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const handleAddOnToggle = (addOn: AddOn, isChecked: boolean) => {
    let updatedAddOns = [...selectedAddOns]

    if (isChecked) {
      // Add the add-on if it doesn't exist
      if (!updatedAddOns.some((item) => item.addOn.id === addOn.id)) {
        if (addOn.hasVariants && addOn.variants && addOn.variants.length > 0) {
          // For variants, select the first variant by default
          const defaultVariant = addOn.variants[0]
          updatedAddOns.push({ addOn, quantity: 1, variantId: defaultVariant.id })
          setSelectedVariants(prev => ({ ...prev, [addOn.id]: defaultVariant.id }))
        } else {
          updatedAddOns.push({ addOn, quantity: 1 })
        }
      }
    } else {
      // Remove the add-on
      updatedAddOns = updatedAddOns.filter((item) => item.addOn.id !== addOn.id)

      // Clean up selected variant
      if (addOn.id in selectedVariants) {
        const updatedVariants = { ...selectedVariants }
        delete updatedVariants[addOn.id]
        setSelectedVariants(updatedVariants)
      }
    }

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const handleVariantChange = (addOnId: string, variantId: string) => {
    // Update selected variant
    setSelectedVariants(prev => ({ ...prev, [addOnId]: variantId }))

    // Update selected add-ons with the new variant
    const updatedAddOns = selectedAddOns.map(item => {
      if (item.addOn.id === addOnId) {
        return { ...item, variantId }
      }
      return item
    })

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const handleQuantityChange = (addOnId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    // Check if we're exceeding available stock
    const addOn = addOns.find(a => a.id === addOnId)
    if (!addOn) return

    let maxAvailable = 999 // Default high value

    if (addOn.hasVariants && addOn.variants) {
      const variantId = selectedVariants[addOnId]
      const variant = addOn.variants.find(v => v.id === variantId)
      if (variant) {
        maxAvailable = variant.stockQuantity
      }
    } else if (addOn.stockQuantity !== undefined) {
      maxAvailable = addOn.stockQuantity
    }

    // Limit quantity to available stock
    const limitedQuantity = Math.min(newQuantity, maxAvailable)

    const updatedAddOns = selectedAddOns.map((item) => {
      if (item.addOn.id === addOnId) {
        return { ...item, quantity: limitedQuantity }
      }
      return item
    })

    setSelectedAddOns(updatedAddOns)
    onAddOnsChange(updatedAddOns)
  }

  const isSelected = (addOnId: string) => {
    return selectedAddOns.some((item) => item.addOn.id === addOnId)
  }

  const getQuantity = (addOnId: string) => {
    const item = selectedAddOns.find((item) => item.addOn.id === addOnId)
    return item ? item.quantity : 0
  }

  const getSelectedVariant = (addOnId: string) => {
    return selectedVariants[addOnId] || ""
  }

  const getVariantById = (addOn: AddOn, variantId: string) => {
    if (!addOn.hasVariants || !addOn.variants) return null
    return addOn.variants.find(v => v.id === variantId) || null
  }

  const getStockStatus = (addOn: AddOn) => {
    if (addOn.hasVariants && addOn.variants) {
      const variantId = selectedVariants[addOn.id]
      const variant = addOn.variants.find(v => v.id === variantId)

      if (!variant) return { status: "unknown", quantity: 0 }

      if (variant.stockQuantity <= 0) {
        return { status: "out-of-stock", quantity: 0 }
      } else if (variant.stockQuantity <= 5) {
        return { status: "low-stock", quantity: variant.stockQuantity }
      } else {
        return { status: "in-stock", quantity: variant.stockQuantity }
      }
    } else {
      if (!addOn.stockQuantity || addOn.stockQuantity <= 0) {
        return { status: "out-of-stock", quantity: 0 }
      } else if (addOn.stockQuantity <= 10) {
        return { status: "low-stock", quantity: addOn.stockQuantity }
      } else {
        return { status: "in-stock", quantity: addOn.stockQuantity }
      }
    }
  }

  const getDiscountedPrice = (addOn: AddOn, quantity: number) => {
    if (!addOn.bundleDiscount || quantity < addOn.bundleDiscount.minQuantity) {
      return addOn.price
    }

    const discountMultiplier = 1 - (addOn.bundleDiscount.discountPercentage / 100)
    return addOn.price * discountMultiplier
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Enhance Your Experience</h3>
        {selectedAddOns.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {selectedAddOns.reduce((total, item) => total + item.quantity, 0)} items
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addOn) => {
          const stockStatus = getStockStatus(addOn)
          const isOutOfStock = stockStatus.status === "out-of-stock"
          const isLowStock = stockStatus.status === "low-stock"
          const quantity = getQuantity(addOn.id)
          const hasDiscount = addOn.bundleDiscount && quantity >= addOn.bundleDiscount.minQuantity
          const discountedPrice = hasDiscount ? getDiscountedPrice(addOn, quantity) : addOn.price

          return (
            <Card
              key={addOn.id}
              className={`${isSelected(addOn.id) ? "border-primary" : ""} ${isOutOfStock ? "opacity-60" : ""}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{addOn.name}</CardTitle>
                      {addOn.hasVariants && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          Variants
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{addOn.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    {hasDiscount ? (
                      <>
                        <Badge className="bg-green-500 hover:bg-green-600 mb-1">
                          {addOn.bundleDiscount?.discountPercentage}% OFF
                        </Badge>
                        <div className="flex flex-col items-end">
                          <span className="text-xs line-through text-muted-foreground">
                            {formatPrice(addOn.price)}
                          </span>
                          <Badge>{formatPrice(discountedPrice)}</Badge>
                        </div>
                      </>
                    ) : (
                      <Badge>{formatPrice(addOn.price)}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {addOn.images && addOn.images.length > 0 && (
                  <div className="relative mb-3 h-32 w-full overflow-hidden rounded-md">
                    <Image
                      src={addOn.images[0]}
                      alt={addOn.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${addOn.id}`}
                      checked={isSelected(addOn.id)}
                      onCheckedChange={(checked) => handleAddOnToggle(addOn, checked as boolean)}
                      disabled={isOutOfStock}
                    />
                    <Label htmlFor={`addon-${addOn.id}`} className="text-sm font-medium">
                      Add to booking
                    </Label>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {isOutOfStock ? (
                            <Badge variant="outline" className="bg-red-50 text-red-500">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Out of Stock
                            </Badge>
                          ) : isLowStock ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-500">
                              <Package className="mr-1 h-3 w-3" />
                              Low Stock: {stockStatus.quantity}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-500">
                              <Package className="mr-1 h-3 w-3" />
                              In Stock
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isOutOfStock
                          ? "This item is currently out of stock"
                          : isLowStock
                          ? `Only ${stockStatus.quantity} units left in stock`
                          : `${stockStatus.quantity} units available`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {addOn.bundleDiscount && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Buy {addOn.bundleDiscount.minQuantity}+ for {addOn.bundleDiscount.discountPercentage}% off
                  </div>
                )}

                {isSelected(addOn.id) && addOn.hasVariants && addOn.variants && (
                  <div className="mt-2">
                    <Label htmlFor={`variant-${addOn.id}`} className="text-xs font-medium mb-1 block">
                      Select Option
                    </Label>
                    <Select
                      value={getSelectedVariant(addOn.id)}
                      onValueChange={(value) => handleVariantChange(addOn.id, value)}
                    >
                      <SelectTrigger id={`variant-${addOn.id}`} className="h-8 text-xs">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {addOn.variants.map((variant) => (
                          <SelectItem
                            key={variant.id}
                            value={variant.id}
                            disabled={variant.stockQuantity <= 0}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{variant.name}</span>
                              {variant.price !== addOn.price && (
                                <Badge className="ml-2">{formatPrice(variant.price)}</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
              {isSelected(addOn.id) && (
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => handleQuantityChange(addOn.id, getQuantity(addOn.id) - 1)}
                      disabled={getQuantity(addOn.id) <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={getQuantity(addOn.id)}
                      onChange={(e) => handleQuantityChange(addOn.id, parseInt(e.target.value) || 1)}
                      className="h-8 w-12 rounded-none border-x-0 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => handleQuantityChange(addOn.id, getQuantity(addOn.id) + 1)}
                      disabled={isOutOfStock || (addOn.hasVariants && addOn.variants
                        ? getQuantity(addOn.id) >= (addOn.variants.find(v => v.id === getSelectedVariant(addOn.id))?.stockQuantity || 0)
                        : addOn.stockQuantity ? getQuantity(addOn.id) >= addOn.stockQuantity : false)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-medium">
                    {hasDiscount ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs line-through text-muted-foreground">
                          {formatPrice(addOn.price * getQuantity(addOn.id))}
                        </span>
                        <span>{formatPrice(discountedPrice * getQuantity(addOn.id))}</span>
                      </div>
                    ) : (
                      formatPrice(addOn.price * getQuantity(addOn.id))
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
