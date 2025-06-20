import { NextRequest, NextResponse } from 'next/server';
import { getCertificateTemplateById } from '@/services/certificateTemplateService';
import { CertificateTemplate, CertificateField } from '@/types/certificate';

/**
 * Parse variables in text and replace them with actual certificate data
 */
function parseVariables(text: string, certificate: any, template?: CertificateTemplate, positionOverride?: string, achievementOverride?: string): string {
  if (!text) return text;

  const certData = certificate.certificate_data || {};

  // Get achievement from template options or fallback to certificate data
  let achievement = achievementOverride || certData.achievement || certData.award || 'Outstanding Performance';
  if (template?.achievement_options && template.achievement_options.length > 0) {
    // Use the first achievement option as default, or find matching one
    achievement = template.achievement_options.find(option =>
      option.toLowerCase() === achievement.toLowerCase()
    ) || template.achievement_options[0];
  }

  // Get position from template options or fallback to certificate data
  let position = positionOverride || certData.position || certData.rank || '1st Place';
  if (template?.position_options && template.position_options.length > 0) {
    // Use the first position option as default, or find matching one
    position = template.position_options.find(option =>
      option.toLowerCase() === position.toLowerCase()
    ) || template.position_options[0];
  }

  // Define variable mappings
  const variables: Record<string, string> = {
    'participant_name': certificate.child_name || certData.participant_name || certificate.parent_name || 'Participant',
    'event_name': certData.event_name || certificate.event_title || 'Event',
    'game_name': certificate.game_name || certData.game_name || '',
    'venue_name': certData.venue_name || certificate.venue_name || '',
    'city_name': certData.city_name || certificate.city_name || '',
    'certificate_number': certData.certificate_number || certificate.certificate_number || '',
    'event_date': certificate.event_date || certData.event_date || new Date().toLocaleDateString(),
    'date': certificate.generated_at ? new Date(certificate.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
    'position': position,
    'score': certData.score || certData.points || '',
    'achievement': achievement,
    'instructor': certData.instructor || certData.teacher || '',
    'organization': certData.organization || 'Nibog Events',
  };

  // Replace variables in the format {variable_name}
  let parsedText = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    parsedText = parsedText.replace(regex, value);
  });

  return parsedText;
}

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

    // Generate HTML using the same approach as the frontend
    const htmlPreview = generateCertificateHTML(template, certificate);

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

/**
 * Generate HTML for certificate from template and certificate data
 */
function generateCertificateHTML(
  template: CertificateTemplate,
  certificate: any
): string {
  const backgroundImageUrl = template.background_image.startsWith('http')
    ? template.background_image
    : `http://localhost:3000${template.background_image}`;

  // Extract data values
  const participantName = certificate.child_name || certificate.certificate_data?.participant_name || 'Participant';

  // Generate certificate title - check for title field in template fields first
  let certificateTitle = '';
  let titleText = '';

  // First, look for a "Certificate Title" field in the template fields
  const titleField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('certificate') && field.name.toLowerCase().includes('title')
  );

  if (titleField) {
    // Use the title from the field, but don't render it as a regular field (we'll skip it later)
    titleText = titleField.name === 'Certificate Title'
      ? `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`
      : titleField.name;
  } else if (template.certificate_title) {
    // Fallback to template.certificate_title if it exists
    titleText = template.certificate_title;
  } else {
    // Default title based on template type
    titleText = `Certificate of ${template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence')}`;
  }

  if (titleText) {
    // Check if title field has underline styling
    const titleFieldUnderline = titleField?.underline || false;

    certificateTitle = `
      <div class="certificate-title" style="
        position: absolute;
        left: 50%;
        top: 15%;
        transform: translateX(-50%);
        text-align: center;
        width: 90%;
        font-family: Arial, sans-serif;
        font-size: 32px;
        font-weight: bold;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 2px;
        ${titleFieldUnderline ? 'text-decoration: underline;' : ''}
      ">
        ${parseVariables(titleText, certificate, template)}
      </div>
    `;
  }

  // Get position from template fields or options
  let positionText = '';
  const positionField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('position') || field.name.toLowerCase().includes('rank')
  );

  if (positionField) {
    // Use position from certificate data first, then fallback to template options
    positionText = certificate.certificate_data?.position || '';
    if (!positionText && template.position_options && template.position_options.length > 0) {
      positionText = template.position_options[0]; // Use first position option as fallback
    }
    if (!positionText) {
      positionText = '1st Place'; // Final fallback
    }
  }

  // Get achievement from template fields or options
  let achievementText = '';
  const achievementField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('achievement') || field.name.toLowerCase().includes('award')
  );

  if (achievementField) {
    // Use achievement from certificate data first, then fallback to template options
    achievementText = certificate.certificate_data?.achievement || '';
    if (!achievementText && template.achievement_options && template.achievement_options.length > 0) {
      achievementText = template.achievement_options[0]; // Use first achievement option as fallback
    }
    if (!achievementText) {
      achievementText = 'Outstanding Performance'; // Final fallback
    }
  }

  // Generate achievement field HTML if achievement field exists
  const achievementHTML = achievementField ? `
    <div class="achievement-field" style="
      position: absolute;
      left: ${achievementField.x}%;
      top: ${achievementField.y}%;
      transform: translate(-50%, -50%);
      font-size: ${achievementField.font_size || 20}px;
      font-weight: bold;
      color: ${achievementField.color || '#333333'};
      font-family: '${achievementField.font_family || 'Arial'}', sans-serif;
      text-align: ${achievementField.alignment || 'center'};
      ${achievementField.underline ? 'text-decoration: underline;' : ''}
    ">
      ${achievementText}
    </div>
  ` : '';

  // Generate position field HTML if position field exists
  const positionHTML = positionField ? `
    <div class="position-field" style="
      position: absolute;
      left: ${positionField.x}%;
      top: ${positionField.y}%;
      transform: translate(-50%, -50%);
      font-size: ${positionField.font_size || 18}px;
      font-weight: bold;
      color: ${positionField.color || '#333333'};
      font-family: '${positionField.font_family || 'Arial'}', sans-serif;
      text-align: ${positionField.alignment || 'center'};
      ${positionField.underline ? 'text-decoration: underline;' : ''}
    ">
      ${positionText}
    </div>
  ` : '';

  // Get default appreciation text based on template type
  let defaultAppreciationText = '';
  if (template.type === 'participation') {
    defaultAppreciationText = `In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!`;
  } else if (template.type === 'winner') {
    defaultAppreciationText = `For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!`;
  }

  // Use custom appreciation text if available, otherwise use default text
  let appreciationContent = template.appreciation_text || defaultAppreciationText;

  // Parse variables in the appreciation text using position and achievement from template
  appreciationContent = parseVariables(appreciationContent, certificate, template, positionText, achievementText);

  // Format the text with line breaks converted to <br> tags
  const formattedText = appreciationContent.replace(/\n/g, '<br>');

  // Find the participant name field to use its styling properties
  let participantNameField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('participant') && field.name.toLowerCase().includes('name')
  );

  // Set default position and styling if field doesn't exist
  const nameFieldStyle = participantNameField || {
    x: 50,
    y: 40,
    font_size: 28,
    font_family: 'Arial',
    color: '#333333',
    alignment: 'center'
  };

  // Create the participant name element separately above the appreciation text with custom styling
  const participantNameHTML = `
    <div class="participant-name" style="
      position: absolute;
      left: ${nameFieldStyle.x}%;
      top: ${nameFieldStyle.y}%;
      transform: translate(-50%, -50%);
      font-size: ${nameFieldStyle.font_size}px;
      font-weight: bold;
      color: ${nameFieldStyle.color || '#333333'};
      font-family: '${nameFieldStyle.font_family || 'Arial'}', sans-serif;
      text-align: ${nameFieldStyle.alignment || 'center'};
      width: 90%;
      ${participantNameField && (participantNameField as any).underline ? 'text-decoration: underline;' : ''}
    ">
      ${participantName}
    </div>
  `;

  // Add the appreciation text below the participant name
  // Position it dynamically based on participant name field position
  const appreciationTopPosition = participantNameField ? participantNameField.y + 20 : 65;

  const appreciationTextHTML = `
    <div class="appreciation-text" style="
      position: absolute;
      left: 50%;
      top: ${appreciationTopPosition}%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #333333;
      font-family: Arial, sans-serif;
      text-align: center;
      width: 80%;
      line-height: 1.6;
      white-space: pre-line;
    ">
      <div style="margin-top: 15px; margin-bottom: 20px;">
        ${formattedText}
      </div>
    </div>
  `;

  // Combine the certificate title, participant name, achievement, position and appreciation text
  const combinedContent = certificateTitle + participantNameHTML + achievementHTML + positionHTML + appreciationTextHTML;

  let fieldsHTML = '';

  // Process each field in the template
  template.fields.forEach((field: any) => {
    // Skip fields that are already handled separately
    const fieldName = field.name.toLowerCase();
    if (fieldName.includes('achievement') || fieldName.includes('position') ||
        (fieldName.includes('event') && fieldName.includes('name')) ||
        (fieldName.includes('certificate') && fieldName.includes('title')) ||
        fieldName.includes('participant') || (fieldName.includes('name') && !fieldName.includes('event') && !fieldName.includes('venue') && !fieldName.includes('city'))) {
      // Skip these fields as they're already included elsewhere
      return;
    }

    // Map field names to data keys
    let value = '';
    const certData = certificate.certificate_data || {};

    if (fieldName.includes('date')) {
      value = certificate.event_date || certData.event_date || new Date().toLocaleDateString();
    } else if (fieldName.includes('venue')) {
      value = certData.venue_name || certificate.venue_name || 'Sports Arena';
    } else if (fieldName.includes('city')) {
      value = certData.city_name || certificate.city_name || 'New York';
    } else if (fieldName.includes('certificate') && fieldName.includes('number')) {
      value = certData.certificate_number || certificate.certificate_number || 'CERT-001';
    } else {
      // For other fields, try to get value from data object or use field name
      value = certData[fieldName] ||
              certData[field.name.toLowerCase().replace(/\s+/g, '_')] ||
              certData[field.name] ||
              certificate[fieldName] ||
              certificate[field.name] ||
              field.name;
    }

    fieldsHTML += `
      <div class="field" style="
        position: absolute;
        left: ${field.x}%;
        top: ${field.y}%;
        font-size: ${field.font_size || 24}px;
        color: ${field.color || '#000000'};
        font-family: '${field.font_family || 'Arial'}', sans-serif;
        font-weight: bold;
        text-align: ${field.alignment || 'center'};
        transform: translate(-50%, -50%);
        ${field.underline ? 'text-decoration: underline;' : ''}
      ">
        ${value}
      </div>
    `;
  });

  // Calculate container dimensions based on paper size and orientation
  let containerWidth, containerHeight;

  if (template.paper_size === 'a4') {
    if (template.orientation === 'landscape') {
      containerWidth = '297mm';
      containerHeight = '210mm';
    } else {
      containerWidth = '210mm';
      containerHeight = '297mm';
    }
  } else if (template.paper_size === 'a3') {
    if (template.orientation === 'landscape') {
      containerWidth = '420mm';
      containerHeight = '297mm';
    } else {
      containerWidth = '297mm';
      containerHeight = '420mm';
    }
  } else if (template.paper_size === 'letter') {
    if (template.orientation === 'landscape') {
      containerWidth = '11in';
      containerHeight = '8.5in';
    } else {
      containerWidth = '8.5in';
      containerHeight = '11in';
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: ${template.paper_size} ${template.orientation};
      margin: 0;
    }
    body {
      margin: 0;
      font-family: Arial;
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    .certificate-container {
      width: ${containerWidth};
      height: ${containerHeight};
      background-image: url('${backgroundImageUrl}');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .field {
      position: absolute;
      text-align: center;
    }
    .certificate-title {
      position: absolute;
      text-align: center;
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .appreciation-text {
      position: absolute;
      text-align: center;
      width: 80%;
      left: 50%;
      transform: translateX(-50%);
      line-height: 1.5;
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    ${fieldsHTML}
    ${combinedContent}
  </div>
</body>
</html>
  `;
}
