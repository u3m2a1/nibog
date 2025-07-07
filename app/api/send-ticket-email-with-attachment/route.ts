import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { jsPDF } from 'jspdf'

// Comprehensive ticket data interface
interface ValidatedTicketData {
  eventTitle: string;
  eventDate: string;
  eventDateTime: string;
  childName: string;
  parentName: string;
  eventVenue: string;
  venueAddress: string;
  gameName: string;
  gameDescription: string;
  gamePrice: number;
  formattedPrice: string;
  slotTiming: string;
  startTime: string;
  endTime: string;
  securityCode: string;
  hasCompleteData: boolean;
  missingFields: string[];
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, settings, qrCodeBuffer, bookingRef, ticketDetails } = await request.json()

    // Validate required fields
    if (!to || !subject || !html || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🎫 Sending ticket email with QR code attachment to:', to);
    console.log('🎫 Booking Ref:', bookingRef);
    console.log('🎫 Ticket Details received:', ticketDetails ? `${ticketDetails.length} tickets` : 'No ticket details');
    if (ticketDetails && ticketDetails.length > 0) {
      console.log('🎫 First ticket sample:', {
        parent_name: ticketDetails[0].parent_name,
        child_name: ticketDetails[0].child_name,
        event_title: ticketDetails[0].event_title,
        start_time: ticketDetails[0].start_time,
        end_time: ticketDetails[0].end_time,
        slot_title: ticketDetails[0].slot_title,
        custom_title: ticketDetails[0].custom_title
      });
    }

    // Create transporter using the email settings
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    })

    // Verify transporter configuration
    try {
      await transporter.verify()
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Email server configuration error' },
        { status: 500 }
      )
    }

    // Prepare attachments
    const attachments = []
    
    // Generate PDF ticket and add as attachment
    try {
      console.log('📄 Generating PDF ticket for booking:', bookingRef);
      const pdfBuffer = await generateTicketPDF(html, bookingRef, qrCodeBuffer, ticketDetails);
      attachments.push({
        filename: `NIBOG_Ticket_${bookingRef || 'ticket'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
      console.log('📄 PDF ticket attachment added, size:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('❌ Error generating PDF ticket:', pdfError);
      // Continue without PDF attachment - at least send email with QR code
    }
    
    // Add QR code as attachment if provided
    if (qrCodeBuffer && Array.isArray(qrCodeBuffer)) {
      const qrBuffer = Buffer.from(qrCodeBuffer)
      attachments.push({
        filename: `ticket-qr-${bookingRef || 'code'}.png`,
        content: qrBuffer,
        contentType: 'image/png',
        cid: 'qrcode' // Content ID for embedding in HTML
      })
      console.log('🎫 QR code attachment added, size:', qrBuffer.length);
    }

    // Update HTML to reference the attached QR code instead of inline base64
    console.log('🎫 Original HTML contains QR placeholder:', html.includes('data:image/png;base64,placeholder'));
    const updatedHtml = html.replace(
      /src="data:image\/png;base64,[^"]*"/g,
      'src="cid:qrcode"'
    );
    console.log('🎫 HTML replacement completed, contains cid:qrcode:', updatedHtml.includes('cid:qrcode'));

    // Email options
    const mailOptions = {
      from: `"${settings.sender_name}" <${settings.sender_email}>`,
      to: to,
      subject: subject,
      html: updatedHtml,
      attachments: attachments
    }

    console.log('🎫 Sending email with', attachments.length, 'attachments');

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('🎫 Ticket email sent successfully, messageId:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Ticket email sent successfully with PDF ticket and QR code attachments',
      messageId: info.messageId,
      attachments: attachments.length
    })

  } catch (error) {
    console.error('Error sending ticket email with attachment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send ticket email' },
      { status: 500 }
    )
  }
}

/**
 * Generate clean PDF with proper formatting that matches the website design
 */
async function generateTicketPDF(htmlContent: string, bookingRef: string, qrCodeBuffer?: number[], ticketDetails?: any[]): Promise<Buffer> {
  try {
    const ticketData = validateAndExtractTicketData(ticketDetails, bookingRef);
    const ticket = ticketDetails && ticketDetails[0] ? ticketDetails[0] : {};

    // PDF setup
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [612, 792] });
    const pageWidth = 612;
    const cardWidth = 540;
    const cardX = (pageWidth - cardWidth) / 2;
    let y = 80;

    // Card border and shadow effect
    pdf.setDrawColor(229, 231, 235); // border-gray-200
    pdf.setLineWidth(1.5);
    pdf.roundedRect(cardX, y, cardWidth, 320, 14, 14, 'S');

    // Header: dark background, event title, date/time
    pdf.setFillColor(31, 41, 55); // bg-gray-800
    pdf.rect(cardX, y, cardWidth, 48, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(ticketData.eventTitle, cardX + 20, y + 28);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(13);
    pdf.text(ticketData.eventDateTime || ticketData.eventDate, cardX + 20, y + 42);
    y += 48;

    // Main content: 2 columns
    // Left: QR code
    const qrSectionWidth = cardWidth * 0.33;
    const detailsSectionWidth = cardWidth - qrSectionWidth;
    const qrX = cardX;
    const detailsX = cardX + qrSectionWidth;
    const sectionY = y;
    const sectionHeight = 180;

    // QR code box
    pdf.setDrawColor(229, 231, 235);
    pdf.rect(qrX, sectionY, qrSectionWidth, sectionHeight, 'S');
    if (qrCodeBuffer && Array.isArray(qrCodeBuffer)) {
      try {
        const qrBuffer = Buffer.from(qrCodeBuffer);
        const qrBase64 = qrBuffer.toString('base64');
        pdf.addImage(`data:image/png;base64,${qrBase64}`, 'PNG', qrX + (qrSectionWidth - 120) / 2, sectionY + 18, 120, 120);
      } catch {
        pdf.setFontSize(12);
        pdf.setTextColor(120, 120, 120);
        pdf.text('QR CODE', qrX + qrSectionWidth / 2, sectionY + 80, { align: 'center' });
      }
    }
    pdf.setFontSize(11);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Check in for this event', qrX + qrSectionWidth / 2, sectionY + 145, { align: 'center' });

    // Right: Details grid
    let gridY = sectionY + 10;
    // Define labelColor, valueColor, col1X, col2X, rowH in this scope
    const labelColor = [107, 114, 128];
    const valueColor = [17, 24, 39];
    const col1X = detailsX + 18;
    const col2X = detailsX + detailsSectionWidth / 2 + 8;
    const rowH = 28;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    // TICKET #
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('TICKET #', col1X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(bookingRef, col1X, gridY + 13);
    // GAMES
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('GAMES', col2X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.gameName + (ticketData.gamePrice ? ` (₹${ticketData.gamePrice.toFixed(2)})` : ''), col2X, gridY + 13);
    if (ticketData.slotTiming) {
      pdf.setFontSize(9);
      pdf.setTextColor(34, 197, 94);
      pdf.text(`⏰ ${ticketData.slotTiming}`, col2X, gridY + 25);
      pdf.setFontSize(10);
    }
    // PARTICIPANT
    gridY += rowH;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('PARTICIPANT', col1X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.childName, col1X, gridY + 13);
    // PRICE
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('PRICE', col2X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.formattedPrice, col2X, gridY + 13);
    // VENUE
    gridY += rowH;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('VENUE', col1X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.eventVenue, col1X, gridY + 13);
    if (ticketData.venueAddress) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(ticketData.venueAddress, col1X, gridY + 23);
      pdf.setFontSize(10);
    }
    // SECURITY CODE
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    pdf.text('SECURITY CODE', col2X, gridY);
    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.securityCode, col2X, gridY + 13);

    // Dashed border and website link (footer)
    let footerY = sectionY + sectionHeight + 18;
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineDashPattern([3, 2], 0);
    pdf.line(cardX + 18, footerY, cardX + cardWidth - 18, footerY);
    pdf.setLineDashPattern([], 0);
    pdf.setFontSize(11);
    pdf.setTextColor(37, 99, 235);
    pdf.text('https://nibog.com', cardX + 24, footerY + 16);

    // Thank you message (optional, small)
    pdf.setFontSize(12);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Thank you for choosing NIBOG!', cardX + cardWidth / 2, footerY + 38, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text('We can\'t wait to see you at the event!', cardX + cardWidth / 2, footerY + 50, { align: 'center' });

    // Return PDF as buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    
    // Create a fallback PDF that still looks good
    const fallbackPdf = new jsPDF();
    fallbackPdf.setFontSize(20);
    fallbackPdf.text('🎫 NIBOG Event Ticket', 105, 30, { align: 'center' });
    fallbackPdf.setFontSize(14);
    fallbackPdf.text(`Booking Reference: ${bookingRef}`, 105, 50, { align: 'center' });
    fallbackPdf.setFontSize(12);
    fallbackPdf.text('Your ticket details are available in the email content.', 105, 70, { align: 'center' });
    fallbackPdf.text('Please show this PDF or the email at the venue.', 105, 85, { align: 'center' });
    
    const fallbackArrayBuffer = fallbackPdf.output('arraybuffer');
    return Buffer.from(fallbackArrayBuffer);
  }
}

/**
 * Comprehensive data validation and extraction function
 */
function validateAndExtractTicketData(ticketDetails?: any[], bookingRef?: string): ValidatedTicketData {
  const missingFields: string[] = [];
  
  // Initialize with safe defaults
  let result: ValidatedTicketData = {
    eventTitle: 'NIBOG Event',
    eventDate: 'Event Date',
    eventDateTime: '',
    childName: 'Participant',
    parentName: 'Valued Customer',
    eventVenue: 'Event Venue',
    venueAddress: '',
    gameName: 'Event Games',
    gameDescription: '',
    gamePrice: 0,
    formattedPrice: '₹0.00',
    slotTiming: '',
    startTime: '',
    endTime: '',
    securityCode: bookingRef?.replace(/[^0-9]/g, '') || '000',
    hasCompleteData: false,
    missingFields: []
  };

  if (!ticketDetails || ticketDetails.length === 0) {
    missingFields.push('ticketDetails');
    result.missingFields = missingFields;
    return result;
  }

  const ticket = ticketDetails[0];
  console.log('📄 Raw ticket data received:', ticket);

  // Extract and validate all fields
  if (ticket.event_title?.trim()) {
    result.eventTitle = ticket.event_title.trim();
  } else {
    missingFields.push('event_title');
  }

  // Event date with proper formatting
  if (ticket.event_date) {
    try {
      const date = new Date(ticket.event_date);
      if (!isNaN(date.getTime())) {
        result.eventDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        result.eventDateTime = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      missingFields.push('valid_event_date');
    }
  } else {
    missingFields.push('event_date');
  }

  // Participant information
  result.childName = ticket.child_name?.trim() || 'Participant';
  result.parentName = ticket.parent_name?.trim() || ticket.user_full_name?.trim() || 'Valued Customer';

  // Venue information
  result.eventVenue = ticket.venue_name?.trim() || 'Event Venue';
  
  // Build comprehensive venue address
  const addressParts = [];
  if (ticket.venue_address?.trim()) addressParts.push(ticket.venue_address.trim());
  if (ticket.city_name?.trim()) addressParts.push(ticket.city_name.trim());
  if (ticket.state?.trim()) addressParts.push(ticket.state.trim());
  result.venueAddress = addressParts.join(', ');

  // Game information with priority
  result.gameName = ticket.custom_title?.trim() || ticket.slot_title?.trim() || ticket.game_name?.trim() || 'Event Games';
  result.gameDescription = ticket.custom_description?.trim() || ticket.slot_description?.trim() || ticket.game_description?.trim() || '';

  // Pricing with priority
  const priceValue = parseFloat(ticket.custom_price || ticket.slot_price || ticket.game_price || '0') || 0;
  result.gamePrice = priceValue;
  result.formattedPrice = `₹${priceValue.toFixed(2)}`;

  // Slot timing
  if (ticket.start_time && ticket.end_time) {
    result.startTime = ticket.start_time.toString().trim();
    result.endTime = ticket.end_time.toString().trim();
    result.slotTiming = `${result.startTime} - ${result.endTime}`;
  }

  result.hasCompleteData = missingFields.length === 0;
  result.missingFields = missingFields;

  console.log('📄 Validated data:', {
    hasCompleteData: result.hasCompleteData,
    missingFields: missingFields,
    gameName: result.gameName,
    gameDescription: result.gameDescription,
    slotTiming: result.slotTiming,
    formattedPrice: result.formattedPrice
  });

  return result;
}
