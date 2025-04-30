"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Trash, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

export default function NewCertificateTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("participation")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [fields, setFields] = useState([
    { id: "1", name: "Participant Name", type: "text", required: true, x: 50, y: 40 },
    { id: "2", name: "Event Name", type: "text", required: true, x: 50, y: 50 },
    { id: "3", name: "Date", type: "date", required: true, x: 50, y: 60 },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    
    // Simulate file upload
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }
  
  const handleRemoveImage = () => {
    setPreviewImage(null)
  }
  
  const addField = () => {
    const newField = {
      id: `${Date.now()}`,
      name: `Field ${fields.length + 1}`,
      type: "text",
      required: false,
      x: 50,
      y: 70,
    }
    setFields([...fields, newField])
  }
  
  const updateField = (id: string, updates: Partial<typeof fields[0]>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }
  
  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call to create the template
    setTimeout(() => {
      console.log({
        name,
        description,
        type,
        previewImage: previewImage ? "Image uploaded" : null,
        fields,
      })
      
      setIsSubmitting(false)
      
      // Redirect to the templates list
      router.push("/admin/certificate-templates")
    }, 1500)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/certificate-templates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Certificate Template</h1>
          <p className="text-muted-foreground">Design a new certificate template for NIBOG events</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="design">Design & Layout</TabsTrigger>
            <TabsTrigger value="fields">Certificate Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>
                  Basic information about the certificate template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Participation Certificate"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and usage of this certificate template"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Certificate Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participation">Participation</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("design")}>
                  Continue to Design
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Design</CardTitle>
                <CardDescription>
                  Upload and customize the certificate template design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Certificate Background</Label>
                  
                  {!previewImage ? (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG or PDF (max. 5MB)
                          </p>
                        </div>
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,application/pdf"
                          id="certificate-upload"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          onClick={() => document.getElementById("certificate-upload")?.click()}
                        >
                          {isUploading ? "Uploading..." : "Select File"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-md border overflow-hidden">
                      <img 
                        src={previewImage} 
                        alt="Certificate Preview" 
                        className="w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paper-size">Paper Size</Label>
                    <Select defaultValue="a4">
                      <SelectTrigger id="paper-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                        <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select defaultValue="landscape">
                      <SelectTrigger id="orientation">
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landscape">Landscape</SelectItem>
                        <SelectItem value="portrait">Portrait</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("fields")}>
                  Continue to Fields
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Fields</CardTitle>
                <CardDescription>
                  Configure the fields that will appear on the certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-md border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Field {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                            <Input
                              id={`field-name-${field.id}`}
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger id={`field-type-${field.id}`}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`field-x-${field.id}`}>X Position (%)</Label>
                            <Input
                              id={`field-x-${field.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={field.x}
                              onChange={(e) => updateField(field.id, { x: parseInt(e.target.value) })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`field-y-${field.id}`}>Y Position (%)</Label>
                            <Input
                              id={`field-y-${field.id}`}
                              type="number"
                              min="0"
                              max="100"
                              value={field.y}
                              onChange={(e) => updateField(field.id, { y: parseInt(e.target.value) })}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`field-required-${field.id}`}
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`field-required-${field.id}`}>Required Field</Label>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addField}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("design")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <FileText className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating Template..." : "Create Template"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
