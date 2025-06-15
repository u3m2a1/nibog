import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { downloadCertificateHTML } from './certificateGenerationService';
import { CertificateDownloadResponse } from '@/types/certificate';

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
    
    if (!certificateData.success || !certificateData.html) {
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
 * Generate multiple PDFs and download as ZIP (for bulk operations)
 */
export async function generateBulkPDFs(
  certificateIds: number[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    for (let i = 0; i < certificateIds.length; i++) {
      const certificateId = certificateIds[i];
      
      if (onProgress) {
        onProgress(i + 1, certificateIds.length);
      }

      await generateCertificatePDF(certificateId);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Error generating bulk PDFs:', error);
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
    
    if (!certificateData.success || !certificateData.html) {
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
