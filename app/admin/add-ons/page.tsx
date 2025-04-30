"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Edit, Trash, Plus, Package, AlertTriangle, BarChart } from "lucide-react"
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
import { AddOn } from "@/types"
import { formatPrice } from "@/lib/utils"

export default function AddOnsPage() {
  const [addOnsList, setAddOnsList] = useState(addOns)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleDeleteAddOn = (id: string) => {
    // In a real app, this would be an API call to delete the add-on
    setAddOnsList(addOnsList.filter(addOn => addOn.id !== id))
  }

  // Filter add-ons based on search query and category
  const filteredAddOns = addOnsList.filter(addOn => {
    const matchesSearch = addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.sku?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || addOn.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-ons</h1>
          <p className="text-muted-foreground">Manage add-ons for NIBOG events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/add-ons/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/add-ons/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Add-on
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search add-ons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="meal">Meal</SelectItem>
              <SelectItem value="merchandise">Merchandise</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAddOns.map((addOn) => (
              <TableRow key={addOn.id}>
                <TableCell>
                  <div className="relative h-10 w-10 overflow-hidden rounded-md">
                    <Image
                      src={addOn.images[0] || "/placeholder.svg"}
                      alt={addOn.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{addOn.name}</span>
                    <span className="text-xs text-muted-foreground">SKU: {addOn.hasVariants ? "Multiple" : addOn.sku}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {addOn.category}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(addOn.price)}</TableCell>
                <TableCell>
                  {addOn.hasVariants ? (
                    <span>
                      {addOn.variants?.reduce((total, variant) => total + variant.stockQuantity, 0)} units
                      <span className="ml-1 text-xs text-muted-foreground">({addOn.variants?.length} variants)</span>
                    </span>
                  ) : (
                    <span>{addOn.stockQuantity} units</span>
                  )}
                </TableCell>
                <TableCell>
                  {addOn.isActive ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/add-ons/${addOn.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/add-ons/${addOn.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
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
                            onClick={() => handleDeleteAddOn(addOn.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAddOns.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-2 text-lg font-medium">No add-ons found</div>
                  <div className="text-sm text-muted-foreground">
                    {searchQuery || categoryFilter !== "all"
                      ? "Try adjusting your search or filter"
                      : "Get started by adding a new add-on"}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
