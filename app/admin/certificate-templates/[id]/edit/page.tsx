"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Plus, Trash2, Loader2, ChevronLeft, ChevronRight, Zap } from "lucide-react"
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
  const [certificateTitle, setCertificateTitle] = useState("")
  const [appreciationText, setAppreciationText] = useState("")
  const [achievementOptions, setAchievementOptions] = useState<string[]>([])
  const [positionOptions, setPositionOptions] = useState<string[]>([])
  const [signatureImageUrl, setSignatureImageUrl] = useState("")
  const [defaultFontFamily, setDefaultFontFamily] = useState<string>("Arial")
  const [defaultFontColor, setDefaultFontColor] = useState<string>("#000000")
  
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

      // Load certificate title
      if (templateData.certificate_title) {
        setCertificateTitle(templateData.certificate_title)
      } else {
        // Set default certificate title based on template type
        if (templateData.type === "participation") {
          setCertificateTitle("Certificate of Participation")
        } else if (templateData.type === "winner") {
          setCertificateTitle("Certificate of Achievement")
        }
      }

      // Load appreciation text if available
      if (templateData.appreciation_text) {
        setAppreciationText(templateData.appreciation_text)
      } else {
        // Set default appreciation text based on template type
        if (templateData.type === "participation") {
          setAppreciationText("In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!")
        } else if (templateData.type === "winner") {
          setAppreciationText("For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!")
        }
      }

      // Load achievement and position options
      if (templateData.achievement_options) {
        setAchievementOptions(templateData.achievement_options)
      } else {
        // Set default options based on template type
        if (templateData.type === "participation") {
          setAchievementOptions(["Participation", "Active Participation", "Enthusiastic Participation"])
        } else if (templateData.type === "winner") {
          setAchievementOptions(["Winner", "Champion", "Outstanding Performance", "Excellence", "First Prize", "Second Prize", "Third Prize"])
        }
      }

      if (templateData.position_options) {
        setPositionOptions(templateData.position_options)
      } else {
        // Set default options based on template type
        if (templateData.type === "participation") {
          setPositionOptions(["Participant"])
        } else if (templateData.type === "winner") {
          setPositionOptions(["1st Place", "2nd Place", "3rd Place", "Winner", "Runner-up", "Finalist"])
        }
      }

      // Load signature image
      if (templateData.signature_image) {
        setSignatureImageUrl(templateData.signature_image)
      }
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
        description: `Failed to upload background image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
    }
  }

  // Smart positioning for certificate fields
  const getSmartPosition = (fieldCount: number, fieldName: string = "New Field") => {
    const name = fieldName.toLowerCase();

    // Define positions based on paper size and orientation
    const getPositionsForSize = () => {
      const basePositions = {
        a4: {
          landscape: {
            title: { x: 50, y: 15, font_size: 32 },
            subtitle: { x: 50, y: 25, font_size: 20 },
            participant_name: { x: 50, y: 35, font_size: 28 },
            event_name: { x: 50, y: 45, font_size: 18 },
            achievement: { x: 50, y: 55, font_size: 20 },
            position: { x: 50, y: 60, font_size: 18 },
            venue: { x: 25, y: 75, font_size: 16 },
            city: { x: 75, y: 75, font_size: 16 },
            score: { x: 50, y: 70, font_size: 16 },
            organization: { x: 50, y: 80, font_size: 16 },
            instructor: { x: 25, y: 90, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 12, font_size: 32 },
            subtitle: { x: 50, y: 20, font_size: 20 },
            participant_name: { x: 50, y: 25, font_size: 28 },
            event_name: { x: 50, y: 32, font_size: 18 },
            achievement: { x: 50, y: 38, font_size: 20 },
            position: { x: 50, y: 43, font_size: 18 },
            venue: { x: 25, y: 65, font_size: 16 },
            city: { x: 75, y: 65, font_size: 16 },
            score: { x: 50, y: 48, font_size: 16 },
            organization: { x: 50, y: 70, font_size: 16 },
            instructor: { x: 25, y: 88, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 90, font_size: 14 }
          }
        },
        a3: {
          landscape: {
            title: { x: 50, y: 18, font_size: 36 },
            subtitle: { x: 50, y: 28, font_size: 24 },
            participant_name: { x: 50, y: 38, font_size: 32 },
            event_name: { x: 50, y: 48, font_size: 22 },
            achievement: { x: 50, y: 58, font_size: 24 },
            position: { x: 50, y: 63, font_size: 22 },
            venue: { x: 20, y: 78, font_size: 18 },
            city: { x: 80, y: 78, font_size: 18 },
            score: { x: 50, y: 68, font_size: 18 },
            organization: { x: 50, y: 83, font_size: 18 },
            instructor: { x: 20, y: 92, font_size: 16 },
            date: { x: 20, y: 88, font_size: 18 },
            signature: { x: 80, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 94, font_size: 16 }
          },
          portrait: {
            title: { x: 50, y: 10, font_size: 36 },
            subtitle: { x: 50, y: 18, font_size: 24 },
            participant_name: { x: 50, y: 22, font_size: 32 },
            event_name: { x: 50, y: 28, font_size: 22 },
            achievement: { x: 50, y: 34, font_size: 24 },
            position: { x: 50, y: 38, font_size: 22 },
            venue: { x: 25, y: 60, font_size: 18 },
            city: { x: 75, y: 60, font_size: 18 },
            score: { x: 50, y: 42, font_size: 18 },
            organization: { x: 50, y: 65, font_size: 18 },
            instructor: { x: 25, y: 90, font_size: 16 },
            date: { x: 25, y: 88, font_size: 18 },
            signature: { x: 75, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 92, font_size: 16 }
          }
        },
        letter: {
          landscape: {
            title: { x: 50, y: 16, font_size: 32 },
            subtitle: { x: 50, y: 26, font_size: 20 },
            participant_name: { x: 50, y: 36, font_size: 28 },
            event_name: { x: 50, y: 46, font_size: 18 },
            achievement: { x: 50, y: 56, font_size: 20 },
            position: { x: 50, y: 61, font_size: 18 },
            venue: { x: 22, y: 76, font_size: 16 },
            city: { x: 78, y: 76, font_size: 16 },
            score: { x: 50, y: 66, font_size: 16 },
            organization: { x: 50, y: 81, font_size: 16 },
            instructor: { x: 22, y: 91, font_size: 14 },
            date: { x: 22, y: 86, font_size: 16 },
            signature: { x: 78, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 13, font_size: 32 },
            subtitle: { x: 50, y: 21, font_size: 20 },
            participant_name: { x: 50, y: 26, font_size: 28 },
            event_name: { x: 50, y: 33, font_size: 18 },
            achievement: { x: 50, y: 39, font_size: 20 },
            position: { x: 50, y: 44, font_size: 18 },
            venue: { x: 25, y: 66, font_size: 16 },
            city: { x: 75, y: 66, font_size: 16 },
            score: { x: 50, y: 49, font_size: 16 },
            organization: { x: 50, y: 71, font_size: 16 },
            instructor: { x: 25, y: 89, font_size: 14 },
            date: { x: 25, y: 86, font_size: 16 },
            signature: { x: 75, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 91, font_size: 14 }
          }
        }
      };

      // Get current paper size and orientation from state
      const currentSize = paperSize as keyof typeof basePositions;
      const currentOrientation = orientation as keyof typeof basePositions.a4;

      return basePositions[currentSize]?.[currentOrientation] || basePositions.a4.landscape;
    };

    const positions = getPositionsForSize();

    // Smart field name detection and positioning
    if (name.includes('participant') || (name.includes('name') && !name.includes('event'))) {
      return positions.participant_name;
    } else if ((name.includes('certificate') && name.includes('title')) || name.toLowerCase() === 'certificate title') {
      return positions.title;
    } else if (name.includes('event') && !name.includes('date')) {
      return positions.event_name;
    } else if (name.includes('date')) {
      return positions.date;
    } else if (name.includes('signature')) {
      return positions.signature;
    } else if (name.includes('venue')) {
      return positions.venue;
    } else if (name.includes('city')) {
      return positions.city;
    } else if (name.includes('position') || name.includes('rank')) {
      return positions.position;
    } else if (name.includes('score')) {
      return positions.score;
    } else if (name.includes('achievement')) {
      return positions.achievement;
    } else if (name.includes('organization') || name.includes('company')) {
      return positions.organization;
    } else if (name.includes('instructor') || name.includes('teacher')) {
      return positions.instructor;
    } else if ((name.includes('certificate') && name.includes('number')) || name.toLowerCase() === 'certificate number') {
      return positions.certificate_number;
    } else if (name.includes('title')) {
      return positions.title;
    }

    // Default positioning for unknown fields (stagger them)
    const defaultPositions = [
      { x: 50, y: 30 },
      { x: 50, y: 40 },
      { x: 50, y: 50 },
      { x: 50, y: 60 },
      { x: 50, y: 70 },
      { x: 30, y: 80 },
      { x: 70, y: 80 }
    ];

    const pos = defaultPositions[fieldCount % defaultPositions.length];
    return { ...pos, font_size: 18 };
  };

  const addField = (fieldName = "New Field") => {
    const position = getSmartPosition(fields.length, fieldName);

    const newField: CertificateField = {
      id: `field-${Date.now()}`,
      name: fieldName,
      type: 'text' as 'text' | 'date' | 'image',
      required: true,
      x: position.x,
      y: position.y,
      font_size: position.font_size || 16,
      font_family: defaultFontFamily,
      color: defaultFontColor,
      width: 200,
      height: 30,
      alignment: "center" as 'left' | 'center' | 'right'
    }
    setFields([...fields, newField])
    return newField
  }

  const addCommonFields = () => {
    // Save current fields
    const currentFields = [...fields]

    // Define common fields with their specific configurations
    const commonFieldsConfig = [
      {
        name: "Certificate Title",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        underline: true, // Certificate title should have underline by default
        font_size: 32,
        y: 20
      },
      {
        name: "Participant Name",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 28,
        y: 40
      },
      {
        name: "Date",
        type: 'date' as 'text' | 'date' | 'image' | 'signature',
        font_size: 16,
        y: 85
      },
      {
        name: "Signature",
        type: 'signature' as 'text' | 'date' | 'image' | 'signature',
        signature_type: 'text' as 'text' | 'image',
        font_size: 16,
        y: 85
      },
      {
        name: "Certificate Number",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 12,
        y: 90
      }
    ]

    // Add each common field with smart positioning
    const newFields: CertificateField[] = commonFieldsConfig.map((fieldConfig, index) => {
      // Use customized positioning based on field type
      const position = getSmartPosition(index, fieldConfig.name)

      const newField: CertificateField = {
        id: `field-${Date.now()}-${fieldConfig.name.replace(/\s+/g, '-').toLowerCase()}-${index}`,
        name: fieldConfig.name,
        type: fieldConfig.type,
        required: true,
        x: position.x,
        y: fieldConfig.y || position.y,
        font_size: fieldConfig.font_size || position.font_size || 16,
        font_family: defaultFontFamily,
        color: defaultFontColor,
        width: 200,
        height: 30,
        alignment: "center" as 'left' | 'center' | 'right',
        underline: fieldConfig.underline || false,
        signature_type: fieldConfig.signature_type
      }

      return newField
    })

    // Update fields state with new fields added to existing ones
    setFields([...currentFields, ...newFields])

    toast({
      title: "Success",
      description: `Added ${newFields.length} common certificate fields`
    })
  }

  const updateField = (id: string, updates: Partial<CertificateField>) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, ...updates };

        // If name is being updated, auto-position the field
        if (updates.name && updates.name !== field.name) {
          const position = getSmartPosition(0, updates.name);
          updatedField.x = position.x;
          updatedField.y = position.y;
          updatedField.font_size = position.font_size || field.font_size;
        }

        return updatedField;
      }
      return field;
    }))
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
      // Include all new fields
      const templateData: UpdateCertificateTemplateRequest = {
        id: templateId,
        name: templateName,
        description: templateDescription,
        type: templateType,
        certificate_title: certificateTitle,
        appreciation_text: appreciationText,
        achievement_options: achievementOptions.filter(option => option.trim() !== ''),
        position_options: positionOptions.filter(option => option.trim() !== ''),
        signature_image: signatureImageUrl,
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

            <div className="space-y-2">
              <Label htmlFor="certificateTitle">Certificate Title</Label>
              <Input
                id="certificateTitle"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                placeholder="e.g., Certificate of Participation"
              />
              <p className="text-sm text-gray-500">
                This will be the main title displayed on the certificate. Leave empty to use default based on certificate type.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Achievement Options</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Define the achievement options that can be selected when generating certificates
                </p>
                <div className="space-y-2">
                  {achievementOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...achievementOptions]
                          newOptions[index] = e.target.value
                          setAchievementOptions(newOptions)
                        }}
                        placeholder="Achievement option"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = achievementOptions.filter((_, i) => i !== index)
                          setAchievementOptions(newOptions)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAchievementOptions([...achievementOptions, ''])}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Achievement Option
                  </Button>
                </div>
              </div>

              <div>
                <Label>Position Options</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Define the position options that can be selected when generating certificates
                </p>
                <div className="space-y-2">
                  {positionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...positionOptions]
                          newOptions[index] = e.target.value
                          setPositionOptions(newOptions)
                        }}
                        placeholder="Position option"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = positionOptions.filter((_, i) => i !== index)
                          setPositionOptions(newOptions)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPositionOptions([...positionOptions, ''])}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Position Option
                  </Button>
                </div>
              </div>
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
                        src={backgroundImageUrl.startsWith('http') ? backgroundImageUrl : `http://localhost:3000${backgroundImageUrl}`}
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

            <div className="space-y-2">
              <Label>Signature Image (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {signatureImageUrl ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={signatureImageUrl.startsWith('http') ? signatureImageUrl : `http://localhost:3000${signatureImageUrl}`}
                        alt="Signature preview"
                        className="max-w-full h-24 object-contain mx-auto rounded"
                      />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Label htmlFor="signature-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Replace Signature
                          </span>
                        </Button>
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSignatureImageUrl('')}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                      <Input
                        id="signature-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              const imageUrl = await uploadCertificateBackground(file)
                              setSignatureImageUrl(imageUrl)
                              toast({
                                title: "Success",
                                description: "Signature image uploaded successfully"
                              })
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to upload signature image",
                                variant: "destructive"
                              })
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <Label htmlFor="signature-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-gray-900">
                          Upload signature image
                        </span>
                        <span className="block text-sm text-gray-500">
                          PNG, JPG up to 2MB (optional)
                        </span>
                      </Label>
                      <Input
                        id="signature-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              const imageUrl = await uploadCertificateBackground(file)
                              setSignatureImageUrl(imageUrl)
                              toast({
                                title: "Success",
                                description: "Signature image uploaded successfully"
                              })
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to upload signature image",
                                variant: "destructive"
                              })
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload a signature image that can be used in signature fields. This is optional and can be used instead of text signatures.
              </p>
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
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-lg font-medium">Field Defaults</h3>
                <p className="text-sm text-gray-500">Set default styling for new fields</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Font</Label>
                  <Select value={defaultFontFamily} onValueChange={(value: any) => setDefaultFontFamily(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Standard Fonts */}
                      <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                      <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                      <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                      <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                      <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                      <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                      <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                      <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                      <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                      <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                      <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                      <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                      <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                      <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                      <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                      <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                      <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                      <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                      <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                      <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                      
                      {/* Decorative Cursive Fonts */}
                      <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                      <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                      <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 border rounded-md cursor-pointer" 
                      style={{ backgroundColor: defaultFontColor }}
                    />
                    <Input
                      type="color"
                      value={defaultFontColor}
                      onChange={(e) => setDefaultFontColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Certificate Fields</h3>
                <p className="text-sm text-gray-500">Configure the fields that will appear on the certificate</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => addField()} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
                <Button onClick={(e) => addCommonFields()} variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Quick Add Common Fields
                </Button>
              </div>
            </div>
            
            {/* Appreciation Text */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Appreciation Text</CardTitle>
                <CardDescription>This text will appear below the participant name</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    id="appreciationText"
                    value={appreciationText}
                    onChange={(e) => setAppreciationText(e.target.value)}
                    placeholder="Enter appreciation text that will appear on the certificate"
                    rows={5}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can use these placeholders in your text: <code>{`{event_name}`}</code>, <code>{`{achievement}`}</code>, and <code>{`{position}`}</code>.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Note: The participant name will appear separately above this appreciation text, so you don't need to include it here.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Tip:</span> Keep these fields out of your certificate template: <code>Event Name</code> and <code>Achievement</code>. Use the placeholders above instead.
                  </p>
                </div>
              </CardContent>
            </Card>

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
                              <SelectItem value="signature">Signature</SelectItem>
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
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            min="10"
                            max="72"
                            value={field.font_size}
                            onChange={(e) => updateField(field.id, { font_size: parseInt(e.target.value) || 16 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select 
                            value={field.font_family} 
                            onValueChange={(value: any) => updateField(field.id, { font_family: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Standard Fonts */}
                              <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                              <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                              <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                              <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                              <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                              <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                              <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                              <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                              <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                              <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                              <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                              <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                              <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                              <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                              <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                              <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                              <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                              <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                              <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                              <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                              
                              {/* Decorative Cursive Fonts */}
                              <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                              <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                              <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 border rounded-md cursor-pointer" 
                              style={{ backgroundColor: field.color }}
                            />
                            <Input
                              type="color"
                              value={field.color}
                              onChange={(e) => updateField(field.id, { color: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Text Alignment</Label>
                          <Select
                            value={field.alignment || "center"}
                            onValueChange={(value: any) => updateField(field.id, { alignment: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Underline option */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`underline-${field.id}`}
                              checked={field.underline || false}
                              onChange={(e) => updateField(field.id, { underline: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`underline-${field.id}`}>Underline</Label>
                          </div>
                        </div>

                        {/* Signature type selection for signature fields */}
                        {field.type === 'signature' && (
                          <div className="space-y-2">
                            <Label>Signature Type</Label>
                            <Select
                              value={field.signature_type || "text"}
                              onValueChange={(value: any) => updateField(field.id, { signature_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Signature</SelectItem>
                                <SelectItem value="image">Image Signature</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
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
