"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash, X, Upload, Edit } from "lucide-react"
import { addOns } from "@/data/add-ons"
import { AddOn, AddOnVariant } from "@/types"
import { formatPrice } from "@/lib/utils"

type Props = {
  params: { id: string }
}

export default function EditAddOnPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const addOnId = unwrappedParams.id
  
  const addOnData = addOns.find((a) => a.id === addOnId)
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState<"meal" | "merchandise" | "service" | "other">("other")
  const [isActive, setIsActive] = useState(true)
  const [sku, setSku] = useState("")
  const [stockQuantity, setStockQuantity] = useState(0)
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<AddOnVariant[]>([])
  const [images, setImages] = useState<string[]>([])
  const [bundleDiscount, setBundleDiscount] = useState<{ minQuantity: number; discountPercentage: number } | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // New variant form state
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPrice, setNewVariantPrice] = useState(0)
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantStock, setNewVariantStock] = useState(0)
  const [newVariantAttributes, setNewVariantAttributes] = useState<Record<string, string>>({})
  const [newAttributeKey, setNewAttributeKey] = useState("")
  const [newAttributeValue, setNewAttributeValue] = useState("")

  // Bundle discount form state
  const [minQuantity, setMinQuantity] = useState(2)
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [hasBundleDiscount, setHasBundleDiscount] = useState(false)

  useEffect(() => {
    if (addOnData) {
      setName(addOnData.name)
      setDescription(addOnData.description)
      setPrice(addOnData.price)
      setCategory(addOnData.category)
      setIsActive(addOnData.isActive)
      setHasVariants(addOnData.hasVariants)
      setImages([...addOnData.images])
      
      if (addOnData.hasVariants && addOnData.variants) {
        setVariants([...addOnData.variants])
      } else {
        setSku(addOnData.sku || "")
        setStockQuantity(addOnData.stockQuantity || 0)
      }
      
      if (addOnData.bundleDiscount) {
        setHasBundleDiscount(true)
        setMinQuantity(addOnData.bundleDiscount.minQuantity)
        setDiscountPercentage(addOnData.bundleDiscount.discountPercentage)
        setBundleDiscount(addOnData.bundleDiscount)
      }
    }
  }, [addOnData])

  const handleAddAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setNewVariantAttributes({
        ...newVariantAttributes,
        [newAttributeKey.trim()]: newAttributeValue.trim()
      })
      setNewAttributeKey("")
      setNewAttributeValue("")
    }
  }

  const handleRemoveAttribute = (key: string) => {
    const updatedAttributes = { ...newVariantAttributes }
    delete updatedAttributes[key]
    setNewVariantAttributes(updatedAttributes)
  }

  const handleAddVariant = () => {
    if (newVariantName.trim() && newVariantSku.trim() && newVariantPrice > 0) {
      const newVariant: AddOnVariant = {
        id: `variant-${Date.now()}`,
        name: newVariantName.trim(),
        price: newVariantPrice,
        sku: newVariantSku.trim(),
        stockQuantity: newVariantStock,
        attributes: { ...newVariantAttributes }
      }
      
      setVariants([...variants, newVariant])
      
      // Reset form
      setNewVariantName("")
      setNewVariantPrice(0)
      setNewVariantSku("")
      setNewVariantStock(0)
      setNewVariantAttributes({})
    }
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleAddImage = () => {
    // In a real app, this would open a file picker or media library
    const newImage = `/placeholder.svg?height=200&width=300&text=Image ${images.length + 1}`
    setImages([...images, newImage])
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare bundle discount data
    const bundleDiscountData = hasBundleDiscount ? {
      minQuantity,
      discountPercentage
    } : null
    
    // In a real app, this would be an API call
    const updatedAddOn: Partial<AddOn> = {
      id: addOnId,
      name,
      description,
      price,
      category,
      isActive,
      hasVariants,
      images,
      ...(hasVariants ? { variants } : { sku, stockQuantity }),
      ...(bundleDiscountData ? { bundleDiscount: bundleDiscountData } : {}),
      updatedAt: new Date().toISOString()
    }
    
    console.log("Saving add-on:", updatedAddOn)

    // Show saved state
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      // Redirect to the add-on details page
      router.push(`/admin/add-ons/${addOnId}`)
    }, 1500)
  }

  if (!addOnData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Add-on Not Found</h2>
          <p className="text-muted-foreground">The add-on you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/add-ons">Back to Add-ons</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/add-ons/${addOnId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Add-on</h1>
          <p className="text-muted-foreground">Update the details for {addOnData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants" disabled={!hasVariants}>Variants</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Discounts</TabsTrigger>
          </TabsList>
          
          {/* Basic Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Details</CardTitle>
                <CardDescription>Edit the basic information for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter add-on name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter add-on description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meal">Meal</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-variants">Has Variants</Label>
                    <Switch
                      id="has-variants"
                      checked={hasVariants}
                      onCheckedChange={setHasVariants}
                    />
                  </div>
                  
                  {!hasVariants && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Enter SKU"
                          required={!hasVariants}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                          required={!hasVariants}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Images</CardTitle>
                <CardDescription>Manage the images for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="flex aspect-square h-full w-full flex-col items-center justify-center rounded-md border border-dashed"
                    onClick={handleAddImage}
                    type="button"
                  >
                    <Upload className="mb-2 h-6 w-6" />
                    <span>Add Image</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Manage the variants for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Attributes</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>{formatPrice(variant.price)}</TableCell>
                          <TableCell>{variant.stockQuantity}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <Badge key={key} variant="outline">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVariant(variant.id)}
                              type="button"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {variants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <p className="text-muted-foreground">No variants added yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="variant-name">Variant Name</Label>
                        <Input
                          id="variant-name"
                          value={newVariantName}
                          onChange={(e) => setNewVariantName(e.target.value)}
                          placeholder="e.g., Small - Red"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-sku">SKU</Label>
                        <Input
                          id="variant-sku"
                          value={newVariantSku}
                          onChange={(e) => setNewVariantSku(e.target.value)}
                          placeholder="e.g., TS-S-RED"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-price">Price (₹)</Label>
                        <Input
                          id="variant-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newVariantPrice || ""}
                          onChange={(e) => setNewVariantPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-stock">Stock Quantity</Label>
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          value={newVariantStock || ""}
                          onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Attributes</Label>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(newVariantAttributes).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="flex items-center gap-1">
                            {key}: {value}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleRemoveAttribute(key)}
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Input
                          placeholder="Key (e.g., Size)"
                          value={newAttributeKey}
                          onChange={(e) => setNewAttributeKey(e.target.value)}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Value (e.g., Medium)"
                          value={newAttributeValue}
                          onChange={(e) => setNewAttributeValue(e.target.value)}
                          className="w-1/3"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddAttribute}
                          disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
                        >
                          Add Attribute
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!newVariantName.trim() || !newVariantSku.trim() || newVariantPrice <= 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pricing & Discounts Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Discounts</CardTitle>
                <CardDescription>Manage pricing and discount options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-bundle-discount">Bundle Discount</Label>
                    <Switch
                      id="has-bundle-discount"
                      checked={hasBundleDiscount}
                      onCheckedChange={setHasBundleDiscount}
                    />
                  </div>
                  
                  {hasBundleDiscount && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="min-quantity">Minimum Quantity</Label>
                        <Input
                          id="min-quantity"
                          type="number"
                          min="2"
                          value={minQuantity}
                          onChange={(e) => setMinQuantity(parseInt(e.target.value) || 2)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum quantity required to apply the discount
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                        <Input
                          id="discount-percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage discount to apply when minimum quantity is reached
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/add-ons/${addOnId}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaved}>
            {isSaved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
