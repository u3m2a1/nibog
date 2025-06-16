"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Plus, Trash2, Move, Loader2, Eye, ChevronLeft, ChevronRight, Zap } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CertificateField, CreateCertificateTemplateRequest } from "@/types/certificate"
import { uploadCertificateBackground, createCertificateTemplate } from "@/services/certificateTemplateService"

export default function NewCertificateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateType, setTemplateType] = useState<"participation" | "winner">("participation")
  const [appreciationText, setAppreciationText] = useState<string>("") 
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("")
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "a3">("a4")
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape")
  const [fields, setFields] = useState<CertificateField[]>([])
  const [defaultFontFamily, setDefaultFontFamily] = useState<string>("Arial")
  const [defaultFontColor, setDefaultFontColor] = useState<string>("#000000")

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
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

    // Define common certificate layout positions - adjusted to avoid overlap with appreciation text
    const positions = {
      // Title area (top)
      title: { x: 50, y: 15, font_size: 32 },  // Certificate Title at top
      subtitle: { x: 50, y: 25, font_size: 20 },

      // Bottom area - positioned to not overlap with central appreciation text
      date: { x: 25, y: 85, font_size: 16 },       // Bottom left
      signature: { x: 75, y: 85, font_size: 16 },  // Bottom right
      certificate_number: { x: 50, y: 92, font_size: 14 }, // Bottom center

      // These fields are now part of the appreciation text
      // and are included here only for backward compatibility
      participant_name: { x: 50, y: 45, font_size: 28 }, 
      event_name: { x: 50, y: 65, font_size: 24 },
      achievement: { x: 50, y: 55, font_size: 20 },

      // Side areas
      venue: { x: 25, y: 75, font_size: 16 },
      city: { x: 75, y: 75, font_size: 16 },
      position: { x: 50, y: 35, font_size: 22 },
      score: { x: 50, y: 75, font_size: 18 },

      // Organization info
      organization: { x: 50, y: 80, font_size: 16 },
      instructor: { x: 25, y: 90, font_size: 14 }
    };

    // Smart field name detection and positioning
    if (name.includes('participant') || name.includes('name') && !name.includes('event')) {
      return positions.participant_name;
    } else if (name.includes('certificate') && name.includes('title')) {
      return positions.title;
    } else if (name.includes('certificate') && name.includes('number')) {
      return positions.certificate_number;
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
    
    // Only include fields that should be positioned separately (not in appreciation text)
    const commonFields = [
      "Certificate Title",
      "Participant Name",
      "Date", 
      "Signature",
      "Certificate Number"
    ]
    
    // Add each common field with smart positioning
    const newFields: CertificateField[] = commonFields.map(fieldName => {
      // Use customized addField function to get proper positioning
      const position = getSmartPosition(0, fieldName)
      
      const newField: CertificateField = {
        id: `field-${Date.now()}-${fieldName.replace(/\s+/g, '-').toLowerCase()}`,
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
      // Include appreciation_text directly now that backend supports it
      const templateData: CreateCertificateTemplateRequest = {
        name: templateName,
        description: templateDescription,
        type: templateType as 'participation' | 'winner' | 'event_specific',
        background_image: backgroundImageUrl,
        paper_size: paperSize as 'a4' | 'letter' | 'a3',
        orientation: orientation as 'landscape' | 'portrait',
        fields: fields,
        appreciation_text: appreciationText
      }
      
      const result = await createCertificateTemplate(templateData)
      
      toast({
        title: "Success",
        description: "Certificate template created successfully"
      })
      
      router.push("/admin/certificate-templates")
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create certificate template",
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
              <Select 
                value={templateType} 
                onValueChange={(value: any) => {
                  setTemplateType(value);
                  // Update default appreciation text based on type - participant name is separate, event and achievement embedded
                  if (value === "participation") {
                    setAppreciationText("In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!");
                  } else if (value === "winner") {
                    setAppreciationText("For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {templateType === "participation" ? "Includes appreciation text for participation." : "Includes achievement recognition text."}
              </p>
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
                        onError={(e) => {
                          console.error('Image failed to load:', e.currentTarget.src);
                        }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBackgroundImage(null)
                          setBackgroundImageUrl("")
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Image
                      </Button>
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

            {/* Default Font Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Default Font Settings</CardTitle>
                <CardDescription>These settings will be applied to new fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFont">Font Family</Label>
                    <Select value={defaultFontFamily} onValueChange={setDefaultFontFamily}>
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
                    <Label htmlFor="defaultColor">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded border" 
                        style={{backgroundColor: defaultFontColor || '#000000'}}
                      ></div>
                      <Input 
                        id="defaultColor" 
                        type="color" 
                        value={defaultFontColor || '#000000'} 
                        onChange={(e) => setDefaultFontColor(e.target.value)} 
                        className="w-full h-10"
                        style={{cursor: 'pointer', padding: '0'}}
                      />
                    </div>
                  </div>
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
                            min="8"
                            max="72"
                            value={field.font_size}
                            onChange={(e) => updateField(field.id, { font_size: parseInt(e.target.value) || 16 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={field.font_family}
                            onValueChange={(value: string) => updateField(field.id, { font_family: value })}
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
                              className="w-6 h-6 rounded border" 
                              style={{backgroundColor: field.color || '#000000'}}
                            ></div>
                            <Input 
                              type="color" 
                              value={field.color || '#000000'}
                              onChange={(e) => updateField(field.id, { color: e.target.value })} 
                              className="w-full h-10"
                              style={{cursor: 'pointer', padding: '0'}}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select
                            value={field.alignment}
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
          <h1 className="text-3xl font-bold tracking-tight">Create Certificate Template</h1>
          <p className="text-muted-foreground">Design a new certificate template for NIBOG events</p>
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
            {currentStep === 1 && "Enter the basic information for your certificate template"}
            {currentStep === 2 && "Upload a background image and configure the layout settings"}
            {currentStep === 3 && "Add and position the fields that will appear on the certificate"}
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
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

