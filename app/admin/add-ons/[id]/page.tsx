"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash, AlertTriangle, Package, Tag, ShoppingCart } from "lucide-react"
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
import { addOns } from "@/data/add-ons"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Props = {
  params: { id: string }
}

export default function AddOnDetailPage({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const addOnId = unwrappedParams.id
  
  const addOn = addOns.find((a) => a.id === addOnId)
  
  const handleDeleteAddOn = () => {
    // In a real app, this would be an API call to delete the add-on
    console.log(`Deleting add-on ${addOnId}`)
    
    // Redirect to the add-ons list
    router.push("/admin/add-ons")
  }

  if (!addOn) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/add-ons">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{addOn.name}</h1>
            <p className="text-muted-foreground">
              {addOn.category.charAt(0).toUpperCase() + addOn.category.slice(1)} • 
              SKU: {addOn.hasVariants ? "Multiple" : addOn.sku}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/add-ons/${addOn.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Add-on
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-2">
                      <div className="font-medium">This action cannot be undone.</div>
                      <div>
                        This will permanently delete the "{addOn.name}" add-on.
                        Deleting it will not affect existing bookings, but it will no longer be available for new bookings.
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteAddOn}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add-on Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="mt-1">{addOn.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="mt-1 capitalize">{addOn.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Base Price</h3>
                  <p className="mt-1">{formatPrice(addOn.price)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    {addOn.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
                {!addOn.hasVariants && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                      <p className="mt-1">{addOn.sku}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Stock Quantity</h3>
                      <p className="mt-1">{addOn.stockQuantity} units</p>
                    </div>
                  </>
                )}
                {addOn.bundleDiscount && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Bundle Discount</h3>
                    <p className="mt-1">
                      {addOn.bundleDiscount.discountPercentage}% off when ordering {addOn.bundleDiscount.minQuantity} or more
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{addOn.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {addOn.images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${addOn.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {addOn.hasVariants && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Manage product variants and their inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Attributes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addOn.variants?.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>{formatPrice(variant.price)}</TableCell>
                        <TableCell>
                          {variant.stockQuantity <= 5 ? (
                            <span className="text-red-500">{variant.stockQuantity} units</span>
                          ) : (
                            <span>{variant.stockQuantity} units</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <Badge key={key} variant="outline">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Add-on Details
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/inventory`}>
                  <Package className="mr-2 h-4 w-4" />
                  Manage Inventory
                </Link>
              </Button>
              {addOn.hasVariants && (
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/admin/add-ons/${addOn.id}/variants`}>
                    <Tag className="mr-2 h-4 w-4" />
                    Manage Variants
                  </Link>
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/admin/add-ons/${addOn.id}/orders`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {addOn.hasVariants ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Variants</div>
                    <div className="mt-1 text-2xl font-bold">{addOn.variants?.length}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Stock</div>
                    <div className="mt-1 text-2xl font-bold">
                      {addOn.variants?.reduce((total, variant) => total + variant.stockQuantity, 0)} units
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Low Stock Variants</div>
                    <div className="mt-1 text-2xl font-bold">
                      {addOn.variants?.filter(v => v.stockQuantity <= 5).length || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Current Stock</div>
                    <div className="mt-1 text-2xl font-bold">{addOn.stockQuantity} units</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Stock Status</div>
                    <div className="mt-1">
                      {addOn.stockQuantity === 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-500">Out of Stock</Badge>
                      ) : addOn.stockQuantity <= 10 ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-500">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-500">In Stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
