"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CertificateField, CertificateTemplate, UpdateCertificateTemplateRequest } from "@/types/certificate"
import { 
  getCertificateTemplateById, 
  updateCertificateTemplate, 
  uploadCertificateBackground 
} from "@/services/certificateTemplateService"

export default function EditCertificateTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const templateId = parseInt(params.id as string)
  
  // Form state
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateType, setTemplateType] = useState<"participation" | "winner" | "event_specific">("participation")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("")
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "a3">("a4")
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape")
  const [fields, setFields] = useState<CertificateField[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Load template data
  useEffect(() => {
    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const templateData = await getCertificateTemplateById(templateId)
      setTemplate(templateData)
      
      // Populate form fields
      setTemplateName(templateData.name)
      setTemplateDescription(templateData.description)
      setTemplateType(templateData.type)
      setBackgroundImageUrl(templateData.background_image)
      setPaperSize(templateData.paper_size)
      setOrientation(templateData.orientation)
      setFields(templateData.fields)
    } catch (error) {
      console.error('Error loading template:', error)
      toast({
        title: "Error",
        description: "Failed to load certificate template",
        variant: "destructive"
      })
      router.push("/admin/certificate-templates")
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingBackground(true)
      const imageUrl = await uploadCertificateBackground(file)
      setBackgroundImage(file)
      setBackgroundImageUrl(imageUrl)
      
      toast({
        title: "Success",
        description: "Background image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: "Error",
        description: "Failed to upload background image",
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
    }
  }

  const addField = () => {
    const newField: CertificateField = {
      id: `field-${Date.now()}`,
      name: "New Field",
      type: "text",
      required: true,
      x: 50,
      y: 50,
      font_size: 16,
      font_family: "Arial",
      color: "#000000",
      width: 200,
      height: 30,
      alignment: "center"
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<CertificateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(templateName && templateDescription && templateType)
      case 2:
        return !!(backgroundImageUrl && paperSize && orientation)
      case 3:
        return fields.length > 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const templateData: UpdateCertificateTemplateRequest = {
        id: templateId,
        name: templateName,
        description: templateDescription,
        type: templateType,
        background_image: backgroundImageUrl,
        paper_size: paperSize,
        orientation: orientation,
        fields: fields
      }

      await updateCertificateTemplate(templateData)

      toast({
        title: "Success",
        description: "Certificate template updated successfully"
      })

      router.push("/admin/certificate-templates")
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update certificate template",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Details"
      case 2: return "Background & Layout"
      case 3: return "Field Configuration"
      default: return ""
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/certificate-templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Certificate Template</h1>
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading template...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/certificate-templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Template Not Found</h1>
            <p className="text-muted-foreground">The requested template could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this certificate template"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Certificate Type *</Label>
              <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                  <SelectItem value="event_specific">Event Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Background Image *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {backgroundImageUrl ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={backgroundImageUrl} 
                        alt="Background preview"
                        className="max-w-full h-48 object-contain mx-auto rounded"
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Label htmlFor="background-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Replace Image
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="background-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleBackgroundUpload}
                        disabled={isUploadingBackground}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="background-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload background image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, PDF up to 5MB
                        </span>
                      </Label>
                      <Input
                        id="background-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleBackgroundUpload}
                        disabled={isUploadingBackground}
                      />
                    </div>
                    {isUploadingBackground && (
                      <div className="mt-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size *</Label>
                <Select value={paperSize} onValueChange={(value: any) => setPaperSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="a3">A3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation *</Label>
                <Select value={orientation} onValueChange={(value: any) => setOrientation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Certificate Fields</h3>
                <p className="text-sm text-gray-500">Configure the fields that will appear on the certificate</p>
              </div>
              <Button onClick={addField} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No fields added yet. Click "Add Field" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="Field name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(value: any) => updateField(field.id, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>X Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.x}
                            onChange={(e) => updateField(field.id, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Y Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.y}
                            onChange={(e) => updateField(field.id, { y: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/certificate-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Certificate Template</h1>
          <p className="text-muted-foreground">Update the "{template.name}" template</p>
        </div>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{getStepTitle(currentStep)}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle(currentStep)}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Update the basic information for your certificate template"}
            {currentStep === 2 && "Update the background image and configure the layout settings"}
            {currentStep === 3 && "Modify the fields that will appear on the certificate"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Template"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
