import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { downloadCertificateHTML } from './certificateGenerationService';
import { CertificateDownloadResponse, CertificateTemplate, CertificateData } from '@/types/certificate';

/**
 * Generate and download PDF from certificate HTML
 */
export async function generateCertificatePDF(
  certificateId: number,
  filename?: string
): Promise<void> {
  try {
    // Get HTML from API
    const certificateData = await downloadCertificateHTML(certificateId);

    if (!certificateData || !certificateData.html) {
      throw new Error('Failed to get certificate HTML');
    }

    // Generate PDF from HTML
    await generatePDFFromHTML(
      certificateData.html,
      filename || certificateData.filename || `certificate_${certificateId}.pdf`
    );
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
}

/**
 * Generate PDF from HTML string
 */
export async function generatePDFFromHTML(
  html: string,
  filename: string
): Promise<void> {
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1123px'; // A4 landscape width in pixels
    tempContainer.style.height = '794px'; // A4 landscape height in pixels
    tempContainer.style.backgroundColor = 'white';
    
    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794,
      scrollX: 0,
      scrollY: 0
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}

/**
 * Wait for all images in container to load
 */
function waitForImages(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = container.querySelectorAll('img');
    
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete; // Continue even if image fails to load
      }
    });

    // Fallback timeout
    setTimeout(resolve, 5000);
  });
}

/**
 * Preview certificate HTML in a modal
 */
export function previewCertificateHTML(html: string): void {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 8px;
    max-width: 95%;
    max-height: 95%;
    overflow: auto;
    position: relative;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 10000;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create iframe for preview
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 1000px;
    height: 750px;
    border: none;
    border-radius: 8px;
  `;

  // Set iframe content
  iframe.onload = () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    }
  };

  // Close modal function
  const closeModal = () => {
    document.body.removeChild(overlay);
  };

  // Event listeners
  closeButton.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Escape key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble modal
  modal.appendChild(closeButton);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Trigger iframe load
  iframe.src = 'about:blank';
}

/**
 * Generate certificate preview from template and sample data
 */
export async function generateCertificatePreview(
  template: CertificateTemplate,
  sampleData: CertificateData
): Promise<void> {
  try {
    // Generate HTML for the certificate
    const html = generateCertificateHTML(template, sampleData);

    // Show preview in modal
    previewCertificateHTML(html);
  } catch (error) {
    console.error('Error generating certificate preview:', error);
    throw error;
  }
}

/**
 * Parse variables in text and replace them with actual certificate data
 */
function parseVariables(text: string, data: CertificateData, template?: CertificateTemplate, positionOverride?: string, achievementOverride?: string): string {
  if (!text) return text;

  // Get achievement from template options or fallback to certificate data
  let achievement = achievementOverride || data.achievement || 'Outstanding Performance';
  if (template?.achievement_options && template.achievement_options.length > 0) {
    // Use the first achievement option as default, or find matching one
    achievement = template.achievement_options.find(option =>
      option.toLowerCase() === achievement.toLowerCase()
    ) || template.achievement_options[0];
  }

  // Get position from template options or fallback to certificate data
  let position = positionOverride || data.position || '1st Place';
  if (template?.position_options && template.position_options.length > 0) {
    // Use the first position option as default, or find matching one
    position = template.position_options.find(option =>
      option.toLowerCase() === position.toLowerCase()
    ) || template.position_options[0];
  }

  // Define variable mappings
  const variables: Record<string, string> = {
    'participant_name': data.participant_name || 'John Doe',
    'event_name': data.event_name || 'Baby Crawling Championship 2024',
    'game_name': data.game_name || '',
    'venue_name': data.venue_name || 'Sports Arena',
    'city_name': data.city_name || 'New York',
    'certificate_number': data.certificate_number || 'CERT-001',
    'event_date': data.event_date || new Date().toLocaleDateString(),
    'date': data.event_date || new Date().toLocaleDateString(),
    'position': position,
    'score': data.score || '',
    'achievement': achievement,
    'instructor': data.instructor || '',
    'organization': data.organization || 'Nibog Events',
  };

  // Replace variables in the format {variable_name}
  let parsedText = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    parsedText = parsedText.replace(regex, value);
  });

  return parsedText;
}

/**
 * Generate HTML for certificate from template and data
 */
function generateCertificateHTML(
  template: CertificateTemplate,
  data: CertificateData
): string {
  const backgroundImageUrl = template.background_image.startsWith('http')
    ? template.background_image
    : `http://localhost:3000${template.background_image}`;

  // Extract data values
  const participantName = data.participant_name || 'John Doe';

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
        ${parseVariables(titleText, data, template)}
      </div>
    `;
  }

  // Get default appreciation text based on template type
  let defaultAppreciationText = '';
  if (template.type === 'participation') {
    defaultAppreciationText = `In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!`;
  } else if (template.type === 'winner') {
    defaultAppreciationText = `For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!`;
  }

  // Get position from template fields or options
  let positionText = '';
  const positionField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('position') || field.name.toLowerCase().includes('rank')
  );

  if (positionField) {
    // Use position from certificate data first, then fallback to template options
    positionText = data.position || '';
    if (!positionText && template.position_options && template.position_options.length > 0) {
      positionText = template.position_options[0]; // Use first position option as fallback
    }
    if (!positionText) {
      positionText = '1st Place'; // Final fallback
    }
  }

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

  // Get achievement from template fields or options
  let achievementText = '';
  const achievementField = template.fields.find((field: any) =>
    field.name.toLowerCase().includes('achievement') || field.name.toLowerCase().includes('award')
  );

  if (achievementField) {
    // Use achievement from certificate data first, then fallback to template options
    achievementText = data.achievement || '';
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

  // Use custom appreciation text if available, otherwise use default text
  let appreciationContent = template.appreciation_text || defaultAppreciationText;

  // Parse variables in the appreciation text using position and achievement from template
  appreciationContent = parseVariables(appreciationContent, data, template, positionText, achievementText);

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

    if (fieldName.includes('date')) {
      value = data.event_date || new Date().toLocaleDateString();
    } else if (fieldName.includes('venue')) {
      value = data.venue_name || 'Sports Arena';
    } else if (fieldName.includes('city')) {
      value = data.city_name || 'New York';
    } else if (fieldName.includes('certificate') && fieldName.includes('number')) {
      value = data.certificate_number || 'CERT-001';
    } else {
      // For other fields, try to get value from data object or use field name
      value = (data as any)[fieldName] ||
              (data as any)[field.name.toLowerCase().replace(/\s+/g, '_')] ||
              (data as any)[field.name] ||
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

/**
 * Generate multiple PDFs and download as ZIP (for bulk operations)
 */
export async function generateBulkPDFs(
  certificateIds: number[],
  zipFilename: string = 'certificates.zip',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    const zip = new JSZip();
    let completedCount = 0;
    
    // Create a folder inside the zip
    const certificatesFolder = zip.folder('certificates');
    
    if (!certificatesFolder) {
      throw new Error('Failed to create certificates folder');
    }
    
    // Process certificates in sequence to avoid memory issues
    for (let i = 0; i < certificateIds.length; i++) {
      const certificateId = certificateIds[i];
      
      try {
        // Get certificate data
        const certificateData = await downloadCertificateHTML(certificateId);
        
        if (!certificateData || !certificateData.html) {
          console.error(`Failed to get HTML for certificate ID ${certificateId}`);
          continue;
        }
        
        // Generate PDF from HTML
        const pdf = await generatePDFFromHTML_ToBlob(certificateData.html);
        
        // Add to zip with unique filename
        const filename = certificateData.filename || `certificate_${certificateId}.pdf`;
        certificatesFolder.file(filename, pdf);
        
        completedCount++;
        
        if (onProgress) {
          onProgress(i + 1, certificateIds.length);
        }
      } catch (err) {
        console.error(`Error processing certificate ID ${certificateId}:`, err);
        // Continue with other certificates even if one fails
      }
    }
    
    if (completedCount === 0) {
      throw new Error('No certificates were successfully processed');
    }
    
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 } 
    }, (_metadata: { percent: number }) => {
      if (onProgress) {
        // Indicate zip compression progress after all PDFs are created
        onProgress(certificateIds.length, certificateIds.length);
      }
    });
    
    // Download the zip file
    saveAs(zipBlob, zipFilename);
    
  } catch (error) {
    console.error('Error generating bulk PDFs:', error);
    throw error;
  }
}

/**
 * Generate PDF from HTML and return as Blob (for bulk downloads)
 */
async function generatePDFFromHTML_ToBlob(html: string): Promise<Blob> {
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1123px'; // A4 landscape width in pixels
    tempContainer.style.height = '794px'; // A4 landscape height in pixels
    tempContainer.style.backgroundColor = 'white';
    
    // Add to DOM temporarily
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794,
      scrollX: 0,
      scrollY: 0
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}

/**
 * Download certificate as image (PNG)
 */
export async function downloadCertificateAsImage(
  certificateId: number,
  filename?: string
): Promise<void> {
  try {
    const certificateData = await downloadCertificateHTML(certificateId);

    if (!certificateData || !certificateData.html) {
      throw new Error('Failed to get certificate HTML');
    }

    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = certificateData.html;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1123px';
    tempContainer.style.height = '794px';
    
    document.body.appendChild(tempContainer);

    // Wait for images to load
    await waitForImages(tempContainer);

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const imageName = filename || `certificate_${certificateId}.png`;
        saveAs(blob, imageName);
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Error downloading certificate as image:', error);
    throw error;
  }
}
