"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Edit, Trash, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

// Mock certificate template data - in a real app, this would come from an API
const certificateTemplates = [
  {
    id: "cert-1",
    name: "Baby Crawling Champion",
    description: "Certificate for baby crawling competition winners",
    thumbnail: "/images/certificates/crawling-cert-thumb.jpg",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-20T14:45:00Z",
  },
  {
    id: "cert-2",
    name: "Participation Certificate",
    description: "General participation certificate for all NIBOG events",
    thumbnail: "/images/certificates/participation-cert-thumb.jpg",
    createdAt: "2025-01-10T09:15:00Z",
    updatedAt: "2025-01-10T09:15:00Z",
  },
  {
    id: "cert-3",
    name: "Baby Walker Award",
    description: "Certificate for baby walker competition participants",
    thumbnail: "/images/certificates/walker-cert-thumb.jpg",
    createdAt: "2025-01-05T11:20:00Z",
    updatedAt: "2025-01-18T16:30:00Z",
  },
]

export default function CertificateTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Filter templates based on search query
  const filteredTemplates = certificateTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleDeleteTemplate = (id: string) => {
    setIsDeleting(id)
    
    // In a real app, this would be an API call
    // await fetch(`/api/admin/certificate-templates/${id}`, { method: "DELETE" })
    
    console.log(`Deleting template: ${id}`)
    
    // Reset deleting state after a short delay to simulate API call
    setTimeout(() => {
      setIsDeleting(null)
    }, 1000)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Templates</h1>
          <p className="text-muted-foreground">Manage certificate templates for NIBOG events</p>
        </div>
        <Button asChild>
          <Link href="/admin/certificate-templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="h-9 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>All Certificate Templates</CardTitle>
          <CardDescription>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="relative h-16 w-24 overflow-hidden rounded-md border">
                      {/* In a real app, use actual thumbnail images */}
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">Preview</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/admin/certificate-templates/${template.id}`} className="hover:underline">
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/certificate-templates/${template.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/certificate-templates/${template.id}/duplicate`}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Duplicate</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Certificate Template</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={isDeleting === template.id}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isDeleting === template.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredTemplates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No certificate templates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
