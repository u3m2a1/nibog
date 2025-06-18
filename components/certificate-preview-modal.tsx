"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CertificateListItem, CertificateTemplate } from "@/types/certificate"
import { getCertificateTemplateById } from "@/services/certificateTemplateService"

interface CertificatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: CertificateListItem | null
}

export function CertificatePreviewModal({
  isOpen,
  onClose,
  certificate
}: CertificatePreviewModalProps) {
  const [loading, setLoading] = useState(true)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCertificatePreview() {
      if (!certificate) {
        setHtml(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Get certificate template directly
        const template = await getCertificateTemplateById(certificate.template_id)
        
        // Prepare the certificate data
        const certData = certificate.certificate_data || {}
        
        // Create a combined data object that the template fields can reference
        const fieldData: Record<string, any> = {
          ...certificate,
          ...certData,
          // Common field mappings
          participant_name: certificate.child_name || certData.participant_name,
          event_name: certData.event_name || certificate.event_title,
          game_name: certificate.game_name || certData.game_name,
          venue_name: certData.venue_name,
          city_name: certData.city_name,
          certificate_number: certData.certificate_number,
          date: certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
        }
        
        // Generate HTML preview based on the template structure
        const previewHtml = `
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f5f5f5;
              }
              
              .certificate-container {
                position: relative;
                ${template.paper_size === 'a4' ? 'width: 210mm; height: 297mm;' : ''}
                ${template.paper_size === 'letter' ? 'width: 215.9mm; height: 279.4mm;' : ''}
                ${template.paper_size === 'a3' ? 'width: 297mm; height: 420mm;' : ''}
                ${template.orientation === 'landscape' ? 'transform: rotate(90deg);' : ''}
                background-image: url('${template.background_image}');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-color: white;
                margin: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              
              .certificate-field {
                position: absolute;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <div class="certificate-container">
              ${template.fields.map(field => {
                // Get the field value from the certificate data
                let fieldValue = fieldData[field.name] || '';
                
                // Format the field based on its type
                let fieldContent = '';
                if (field.type === 'text') {
                  fieldContent = `<div style="
                    font-family: ${field.font_family || 'Arial, sans-serif'};
                    font-size: ${field.font_size || 16}px;
                    color: ${field.color || 'black'};
                    text-align: ${field.alignment || 'left'};
                  ">${fieldValue}</div>`;
                } else if (field.type === 'date') {
                  // Format date if needed
                  fieldContent = `<div style="
                    font-family: ${field.font_family || 'Arial, sans-serif'};
                    font-size: ${field.font_size || 16}px;
                    color: ${field.color || 'black'};
                    text-align: ${field.alignment || 'left'};
                  ">${fieldValue}</div>`;
                } else if (field.type === 'image') {
                  fieldContent = `<img src="${fieldValue}" style="width: 100%; height: 100%; object-fit: contain;" />`;
                }
                
                return `<div class="certificate-field" style="
                  left: ${field.x}%;
                  top: ${field.y}%;
                  width: ${field.width || 'auto'}px;
                  height: ${field.height || 'auto'}px;
                ">${fieldContent}</div>`;
              }).join('')}
              
              ${template.appreciation_text ? `<div class="certificate-field" style="
                left: 50%;
                top: 70%;
                transform: translate(-50%, -50%);
                width: 80%;
                text-align: center;
                font-family: Arial, sans-serif;
                font-size: 18px;
              ">${template.appreciation_text}</div>` : ''}
            </div>
          </body>
          </html>
        `;
        
        setHtml(previewHtml);
      } catch (error) {
        console.error('Error loading certificate preview:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && certificate) {
      loadCertificatePreview()
    }
  }, [isOpen, certificate])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
          <DialogDescription>
            {certificate?.child_name ? `Preview for ${certificate.child_name}'s certificate` : 'Certificate preview'}
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Loading certificate preview...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading preview: {error}</p>
            </div>
          ) : !html ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No preview available</p>
            </div>
          ) : (
            <div 
              className="certificate-preview border rounded-lg overflow-hidden" 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
