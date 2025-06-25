/**
 * Ticket Email Service
 * Handles sending ticket details with QR codes to parents after booking confirmation
 */

import { TicketDetails } from './bookingService';

export interface TicketEmailData {
  bookingId: number;
  bookingRef: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity?: string;
  ticketDetails: TicketDetails[];
  qrCodeData: string;
}

/**
 * Send ticket email to parent with QR code and ticket details
 */
export async function sendTicketEmail(ticketData: TicketEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🎫 Starting ticket email process for booking ID: ${ticketData.bookingId}`);
    console.log(`🎫 Recipient: ${ticketData.parentEmail}`);

    // Get email settings by calling the API function directly
    const { GET: getEmailSettings } = await import('@/app/api/emailsetting/get/route');
    const emailSettingsResponse = await getEmailSettings();

    if (!emailSettingsResponse.ok) {
      console.error('🎫 Failed to get email settings');
      throw new Error('Email settings not configured');
    }

    const emailSettings = await emailSettingsResponse.json();
    if (!emailSettings || emailSettings.length === 0) {
      console.error('🎫 No email settings found');
      throw new Error('No email settings found');
    }

    const settings = emailSettings[0];
    console.log('🎫 Email settings retrieved successfully');

    // Generate ticket HTML content
    const htmlContent = generateTicketHTML(ticketData);

    console.log(`🎫 HTML content generated, sending ticket email...`);

    // Send email using existing send-receipt-email API function directly
    const { POST: sendReceiptEmail } = await import('@/app/api/send-receipt-email/route');
    const emailRequest = new Request('http://localhost:3000/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ticketData.parentEmail,
        subject: `🎫 Your Tickets - ${ticketData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: settings
      }),
    });

    const emailResponse = await sendReceiptEmail(emailRequest);

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error(`🎫 Ticket email sending failed:`, errorData);
      return {
        success: false,
        error: errorData.error || `Failed to send ticket email: ${emailResponse.status}`
      };
    }

    console.log(`🎫 Ticket email sent successfully to ${ticketData.parentEmail}`);
    return { success: true };

  } catch (error) {
    console.error(`🎫 Error sending ticket email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate HTML content for ticket email with QR code
 */
function generateTicketHTML(ticketData: TicketEmailData): string {
  // Generate QR code data URL (base64 encoded SVG)
  const qrCodeSvg = generateQRCodeSVG(ticketData.qrCodeData);
  
  // Generate ticket details HTML
  const ticketDetailsHtml = ticketData.ticketDetails.map((ticket, index) => `
    <div style="background: white; border: 2px dashed #007bff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 18px; font-weight: bold;">
            🎮 ${ticket.custom_title || ticket.game_name || `Game ${ticket.game_id}`}
          </h3>
          ${ticket.custom_description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${ticket.custom_description}</p>` : ''}
          ${ticket.start_time && ticket.end_time ? `
            <p style="margin: 0 0 5px 0; color: #28a745; font-weight: bold;">
              ⏰ ${ticket.start_time} - ${ticket.end_time}
            </p>
          ` : ''}
          ${ticket.max_participants ? `
            <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 14px;">
              👥 Max ${ticket.max_participants} participants
            </p>
          ` : ''}
          <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 16px;">
            💰 ₹${(ticket.custom_price || ticket.slot_price || 0).toFixed(2)}
          </p>
        </div>
        <div style="text-align: center; margin-left: 20px;">
          <div style="background: white; padding: 10px; border: 1px solid #ddd; border-radius: 8px; display: inline-block;">
            ${qrCodeSvg}
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Scan at venue</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: bold; color: #007bff; font-family: monospace;">
            ${ticketData.bookingRef}
          </p>
        </div>
      </div>
      
      <div style="border-top: 1px dashed #ddd; padding-top: 15px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <div>
            <strong>Child:</strong> ${ticketData.childName}<br>
            <strong>Booking ID:</strong> #${ticketData.bookingId}
          </div>
          <div style="text-align: right;">
            <strong>Event:</strong> ${ticketData.eventTitle}<br>
            <strong>Date:</strong> ${ticketData.eventDate}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tickets - NIBOG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎫 Your Event Tickets</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Ready for your NIBOG experience!</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #007bff;">
      <h2 style="margin: 0 0 15px 0; color: #0056b3; font-size: 20px;">Event Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 30%;">Parent:</td>
          <td style="padding: 8px 0;">${ticketData.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Child:</td>
          <td style="padding: 8px 0;">${ticketData.childName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Event:</td>
          <td style="padding: 8px 0;">${ticketData.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${ticketData.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Venue:</td>
          <td style="padding: 8px 0;">${ticketData.eventVenue}${ticketData.eventCity ? `, ${ticketData.eventCity}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Booking Ref:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #007bff;">${ticketData.bookingRef}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 20px 0; color: #0056b3; font-size: 18px;">🎟️ Your Tickets</h3>
      ${ticketDetailsHtml}
    </div>

    <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📱 Important Instructions:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Show this email or scan the QR code at the venue entrance</li>
        <li>Arrive 15 minutes before your scheduled game time</li>
        <li>Keep your booking reference handy: <strong>${ticketData.bookingRef}</strong></li>
        <li>Contact support if you have any questions</li>
      </ul>
    </div>

    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
      <strong>✅ Tickets Confirmed!</strong><br>
      Your tickets are ready. We can't wait to see you at the event!
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        If you have any questions, please contact us at support@nibog.com
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        Have an amazing time at NIBOG! 🎮🎉
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate QR Code as SVG string (simple implementation)
 * In production, you would use a proper QR code library like 'qrcode' npm package
 */
function generateQRCodeSVG(data: string): string {
  // Simple placeholder QR code representation
  // In a real implementation, you would use:
  // import QRCode from 'qrcode'
  // const qrCodeDataURL = await QRCode.toDataURL(data)
  // return `<img src="${qrCodeDataURL}" width="80" height="80" alt="QR Code" />`

  const encodedData = encodeURIComponent(data);

  return `<svg width="80" height="80" viewBox="0 0 80 80" style="border: 1px solid #ddd;">
    <rect width="80" height="80" fill="white"/>
    <rect x="10" y="10" width="60" height="60" fill="none" stroke="#333" stroke-width="2"/>
    <rect x="15" y="15" width="10" height="10" fill="#333"/>
    <rect x="55" y="15" width="10" height="10" fill="#333"/>
    <rect x="15" y="55" width="10" height="10" fill="#333"/>
    <rect x="30" y="30" width="20" height="20" fill="none" stroke="#333" stroke-width="1"/>
    <text x="40" y="45" text-anchor="middle" font-size="6" fill="#333">TICKET</text>
  </svg>`;
}
