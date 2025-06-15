"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash, Copy, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"
import { CertificateTemplate } from "@/types/certificate"
import {
  getAllCertificateTemplates,
  deleteCertificateTemplate,
  duplicateCertificateTemplate
} from "@/services/certificateTemplateService"

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<CertificateTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const { toast } = useToast()

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter templates when search term or type filter changes
  useEffect(() => {
    let filtered = templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (typeFilter !== "all") {
      filtered = filtered.filter(template => template.type === typeFilter)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, typeFilter])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await getAllCertificateTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificate templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (templateId: number) => {
    try {
      setDeleteLoading(templateId)
      await deleteCertificateTemplate(templateId)

      // Remove from local state
      setTemplates(prev => prev.filter(t => t.id !== templateId))

      toast({
        title: "Success",
        description: "Certificate template deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete certificate template",
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDuplicate = async (template: CertificateTemplate) => {
    try {
      const newName = `${template.name} (Copy)`
      const duplicatedTemplate = await duplicateCertificateTemplate(template.id, newName)

      // Add to local state
      setTemplates(prev => [duplicatedTemplate, ...prev])

      toast({
        title: "Success",
        description: "Certificate template duplicated successfully"
      })
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate certificate template",
        variant: "destructive"
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'participation':
        return 'bg-blue-100 text-blue-800'
      case 'winner':
        return 'bg-yellow-100 text-yellow-800'
      case 'event_specific':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading templates...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
                <SelectItem value="event_specific">Event Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Templates</CardTitle>
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
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="relative h-16 w-24 overflow-hidden rounded-md border">
                      {template.background_image ? (
                        <img
                          src={template.background_image}
                          alt={template.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/admin/certificate-templates/${template.id}/edit`} className="hover:underline">
                      {template.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description}
                  </TableCell>
                  <TableCell>
                    {formatDate(template.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/certificate-templates/${template.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicate</span>
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
                              onClick={() => handleDelete(template.id)}
                              disabled={deleteLoading === template.id}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {deleteLoading === template.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || typeFilter !== "all"
                          ? "No templates match your search criteria"
                          : "No certificate templates found"
                        }
                      </p>
                      {(!searchTerm && typeFilter === "all") && (
                        <Button asChild variant="outline">
                          <Link href="/admin/certificate-templates/new">
                            Create your first template
                          </Link>
                        </Button>
                      )}
                    </div>
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
