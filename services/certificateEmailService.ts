/**
 * Certificate Email Service
 * Handles sending certificates via email
 */

/**
 * Options for sending certificate emails
 */
export interface SendCertificateEmailOptions {
  certificateIds: number[];
  customMessage?: string;
  includeLink?: boolean;
  includePdf?: boolean;
  replyTo?: string;
}

/**
 * Response from the email sending API
 */
export interface SendCertificateEmailResponse {
  success: boolean;
  sent: number;
  failed: number;
  failedEmails?: string[];
}

/**
 * Send certificate(s) via email
 */
export async function sendCertificatesViaEmail(options: SendCertificateEmailOptions): Promise<SendCertificateEmailResponse> {
  try {
    const response = await fetch('/api/certificates/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificateIds: options.certificateIds,
        customMessage: options.customMessage,
        includeLink: options.includeLink !== false, // Default to true
        includePdf: options.includePdf !== false, // Default to true
        replyTo: options.replyTo,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to send certificate emails: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending certificate emails:', error);
    throw error;
  }
}
