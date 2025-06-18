import { NextRequest, NextResponse } from 'next/server';
import { getCertificateTemplateById } from '@/services/certificateTemplateService';
import { CertificateTemplate, CertificateField } from '@/types/certificate';

export async function POST(request: NextRequest) {
  try {
    // Parse request body to get certificate_id and template_id
    const body = await request.json();
    const { certificate_id, template_id } = body;

    if (!certificate_id || !template_id) {
      return NextResponse.json(
        { error: 'certificate_id and template_id are required' },
        { status: 400 }
      );
    }

    console.log(`Fetching certificate preview for certificate_id: ${certificate_id}, template_id: ${template_id}`);

    // First, fetch the certificate data
    const certificateResponse = await fetch(
      `https://ai.alviongs.com/webhook/v1/nibog/certificates/get`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: certificate_id }),
      }
    );
    
    if (!certificateResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch certificate data' }, { status: 500 });
    }
    
    const certificatesData = await certificateResponse.json();
    
    // Check if certificate exists
    if (!Array.isArray(certificatesData) || certificatesData.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }
    
    const certificate = certificatesData[0];
    
    // Get certificate template with its fields and background image
    let template: CertificateTemplate;
    try {
      template = await getCertificateTemplateById(template_id);
      console.log('Using template:', template.name);
    } catch (templateError) {
      console.error('Error fetching template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch certificate template' }, { status: 500 });
    }

    // Prepare the certificate data (from the generated certificate)
    const certData = certificate.certificate_data || {};
    
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
    };
    
    // Generate HTML preview based on the template structure
    const htmlPreview = `
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
    
    return NextResponse.json({
      html: htmlPreview,
      certificate_id,
      template_id,
    });
  } catch (error) {
    console.error('Error generating certificate preview:', error);
    return NextResponse.json(
      { 
        error: 'Error generating certificate preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
