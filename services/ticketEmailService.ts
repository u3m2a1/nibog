/**
 * Ticket Email Service
 * Handles sending ticket details with QR codes to parents after booking confirmation
 */

import { TicketDetails } from './bookingService';
import QRCode from 'qrcode';

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

    // Get email settings by calling the API function directly (same as booking email service)
    const { GET: getEmailSettings } = await import('@/app/api/emailsetting/get/route');
    const emailSettingsResponse = await getEmailSettings();

    if (!emailSettingsResponse.ok) {
      console.error('🎫 Failed to get email settings');
      return {
        success: false,
        error: "Email settings not configured"
      };
    }

    const emailSettings = await emailSettingsResponse.json();
    if (!emailSettings || emailSettings.length === 0) {
      console.error('🎫 No email settings found');
      return {
        success: false,
        error: "No email settings found"
      };
    }

    const settings = emailSettings[0];

    console.log('🎫 Email settings retrieved successfully');

    // Generate ticket HTML content
    const htmlContent = await generateTicketHTML(ticketData);

    console.log(`🎫 HTML content generated with embedded QR code, sending ticket email...`);

    // Send email using regular email API since QR code is now embedded in HTML
    const emailResponse = await fetch('http://localhost:3000/api/send-receipt-email', {
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
async function generateTicketHTML(ticketData: TicketEmailData): Promise<string> {
  // Generate QR code as base64 data URL directly in the HTML for better email client compatibility
  console.log('🎫 Generating ticket HTML with embedded QR code');
  const qrCodeDataURL = await generateQRCodeDataURL(ticketData.qrCodeData);
  
  // Generate ticket details HTML
  const ticketDetailsHtml = ticketData.ticketDetails.map((ticket, index) => {
    // Determine the game/slot name with proper fallbacks
    const gameName = ticket.custom_title || ticket.slot_title || ticket.game_name || `Game ${ticket.booking_game_id || ticket.game_id || index + 1}`;

    // Determine the price with proper fallbacks
    const gamePrice = Number(ticket.custom_price || ticket.slot_price || ticket.game_price || 0).toFixed(2);

    return `
    <div style="background: white; border: 2px dashed #007bff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 18px; font-weight: bold;">
            🎮 ${gameName}
          </h3>
          ${ticket.custom_description || ticket.slot_description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${ticket.custom_description || ticket.slot_description}</p>` : ''}
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
            💰 ₹${gamePrice}
          </p>
        </div>
        <div style="text-align: center; margin-left: 20px;">
          <div style="background: white; padding: 10px; border: 1px solid #ddd; border-radius: 8px; display: inline-block;">
            <img src="${qrCodeDataURL}" width="200" height="200" alt="QR Code for ${ticketData.bookingRef}" style="display: block; max-width: 200px; max-height: 200px; border: none;" />
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666; font-weight: bold;">📱 Scan this QR code at the venue</p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">Booking: ${ticketData.bookingRef}</p>
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
    `
  }).join('');

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
 * Generate QR Code as base64 data URL using the qrcode library
 */
async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    console.log('🎫 Generating QR code for data:', data);
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 120,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('🎫 QR code generated successfully, length:', qrCodeDataURL.length);
    console.log('🎫 QR code starts with:', qrCodeDataURL.substring(0, 50));
    return qrCodeDataURL;
  } catch (error) {
    console.error('🎫 Error generating QR code:', error);
    // Fallback to a simple placeholder that should definitely work
    const fallbackSvg = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white" stroke="#ddd" stroke-width="2"/>
        <rect x="20" y="20" width="80" height="80" fill="none" stroke="#333" stroke-width="2"/>
        <text x="60" y="65" text-anchor="middle" font-size="12" fill="#333">QR CODE</text>
        <text x="60" y="80" text-anchor="middle" font-size="8" fill="#666">PLACEHOLDER</text>
      </svg>`;
    const fallbackDataURL = 'data:image/svg+xml;base64,' + Buffer.from(fallbackSvg).toString('base64');
    console.log('🎫 Using fallback QR code placeholder');
    return fallbackDataURL;
  }
}
