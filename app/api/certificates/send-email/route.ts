import { NextRequest, NextResponse } from 'next/server';

export interface SendCertificateEmailRequest {
  certificateIds: number[];
  customMessage?: string;
  includeLink?: boolean;
  includePdf?: boolean;
  replyTo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SendCertificateEmailRequest;
    
    if (!body.certificateIds || !Array.isArray(body.certificateIds) || body.certificateIds.length === 0) {
      return NextResponse.json({ error: 'Certificate IDs are required' }, { status: 400 });
    }
    
    // Build the query parameters for the external API
    const apiUrl = 'https://ai.alviongs.com/webhook/v1/nibog/certificates/send-email';
    
    // Make the external API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificate_ids: body.certificateIds,
        custom_message: body.customMessage || '',
        include_link: body.includeLink !== false, // Default to true
        include_pdf: body.includePdf !== false, // Default to true
        reply_to: body.replyTo || '',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n certificates/send-email error:', errorText);
      throw new Error(`Failed to send certificate emails: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending certificate emails:', error);
    return NextResponse.json({ error: 'Failed to send certificate emails' }, { status: 500 });
  }
}
