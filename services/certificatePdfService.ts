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
    max-width: 90%;
    max-height: 90%;
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
    width: 800px;
    height: 600px;
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
 * Generate HTML for certificate from template and data
 */
function generateCertificateHTML(
  template: CertificateTemplate,
  data: CertificateData
): string {
  const backgroundImageUrl = template.background_image.startsWith('http')
    ? template.background_image
    : `http://localhost:3000${template.background_image}`;

  // Initialize variables to track which fields will be displayed as separate items vs included in appreciation text
  const fieldsToSkipInMain: string[] = [];
  let appreciationText = '';
  
  // Extract data values that will be displayed in the appreciation text
  const participantName = data.participant_name || 'John Doe';
  const eventName = data.event_name || 'Baby Crawling Championship 2024';
  const achievement = data.achievement || 'Outstanding Performance';
  const position = data.position || '1st Place';
  
  // Get default text based on template type first - exclude participant name from text but include event and achievement
  let defaultAppreciationText = '';
  if (template.type === 'participation') {
    defaultAppreciationText = `In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!`;
  } else if (template.type === 'winner') {
    defaultAppreciationText = `For achieving {achievement} in {event_name}.\nYour dedication, talent, and outstanding performance at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!`;
  }

  // Use custom appreciation text if available, otherwise use default text
  let appreciationContent = template.appreciation_text || defaultAppreciationText;
  
  // Replace placeholders in the appreciation text with actual values
  appreciationContent = appreciationContent
    .replace(/\{participant_name\}/g, participantName)
    .replace(/\{event_name\}/g, eventName)
    .replace(/\{achievement\}/g, achievement)
    .replace(/\{position\}/g, position);
  
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
    ">
      ${participantName}
    </div>
  `;

  // Add the appreciation text below the participant name
  appreciationText = `
    <div class="appreciation-text" style="
      position: absolute;
      left: 50%;
      top: 55%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #333333;
      font-family: Arial, sans-serif;
      text-align: center;
      width: 80%;
      line-height: 1.7;
    ">
      <div style="margin-top: 15px; margin-bottom: 20px;">
        ${formattedText}
      </div>
    </div>
  `;
  
  // Combine the participant name and appreciation text
  appreciationText = participantNameHTML + appreciationText;

  let fieldsHTML = '';

  // Process each field in the template
  template.fields.forEach((field: any) => {
    // Skip fields that are already included in the appreciation text
    const fieldName = field.name.toLowerCase();
    if (fieldName.includes('achievement') || fieldName.includes('position') || 
        (fieldName.includes('event') && fieldName.includes('name'))) {
      // Skip these fields as they're already included in the appreciation text
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
    } else if (fieldName.includes('title')) { 
      value = 'Certificate of ' + (template.type === 'participation' ? 'Participation' : (template.type === 'winner' ? 'Achievement' : 'Excellence'));
    } else if (fieldName.includes('participant') || (fieldName.includes('name') && !fieldName.includes('event') && !fieldName.includes('venue') && !fieldName.includes('city'))) {
      // Skip participant name field as it's handled separately
      return;
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
      ">
        ${value}
      </div>
    `;
  });

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
    }
    .certificate-container {
      width: 100%;
      height: 100vh;
      background-image: url('${backgroundImageUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }
    .field {
      position: absolute;
      text-align: center;
    }
    .appreciation-text {
      position: absolute;
      text-align: center;
      width: 80%;
      left: 50%;
      transform: translateX(-50%);
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    ${fieldsHTML}
    ${appreciationText}
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
    }, (metadata: { percent: number }) => {
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
