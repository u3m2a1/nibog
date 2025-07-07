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
 * Exactly mirrors the booking confirmation page layout shown in the email image
 * Uses only half of the A4 page to match the exact ticket design
 */
async function generateTicketPDF(htmlContent: string, bookingRef: string, qrCodeBuffer?: number[], ticketDetails?: any[]): Promise<Buffer> {
  try {
    const ticketData = validateAndExtractTicketData(ticketDetails, bookingRef);
    const ticket = ticketDetails && ticketDetails[0] ? ticketDetails[0] : {};

    // PDF setup - using A4 dimensions (595.28 x 841.89 points)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Card dimensions - further increased width to match the confirmation ticket design from the email
    const cardWidth = 550; // Increased from 500 to 550
    const cardHeight = 380;
    const cardX = (pageWidth - cardWidth) / 2;
    const cardY = 100;

    // Card border with white background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(1);
    pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, 'FD');

    // Dark blue header
    const headerHeight = 60;
    pdf.setFillColor(18, 35, 58); // Exact dark blue from image
    pdf.rect(cardX, cardY, cardWidth, headerHeight, 'F');
    
    // Header text
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('NEW INDIA BABY OLYMPIC GAMES VIZAG SEASON-2', cardX + cardWidth/2, cardY + 30, { align: 'center' });
    
    // Date text
    pdf.setFontSize(12);
    pdf.text('12/8/2025 at 12:00 am', cardX + cardWidth/2, cardY + 48, { align: 'center' });
    
    // Content area starts after header
    const contentStartY = cardY + headerHeight;
    
    // Left section - QR Code
    const qrSize = 140;
    const qrX = cardX + 30;
    const qrY = contentStartY + 30;
    
    if (qrCodeBuffer && Array.isArray(qrCodeBuffer)) {
      try {
        const qrBuffer = Buffer.from(qrCodeBuffer);
        const qrBase64 = qrBuffer.toString('base64');
        pdf.addImage(`data:image/png;base64,${qrBase64}`, 'PNG', qrX, qrY, qrSize, qrSize);
      } catch {
        // Fallback if QR code can't be added
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(qrX, qrY, qrSize, qrSize, 5, 5, 'F');
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(14);
        pdf.text('QR CODE', qrX + qrSize/2, qrY + qrSize/2, { align: 'center' });
      }
    }
    
    // "Check in for this event" text under QR code
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Check in for this event', qrX + qrSize/2, qrY + qrSize + 15, { align: 'center' });
    
    // Right side content - Details section with 2x3 grid layout exactly like the image
    const rightSectionX = cardX + qrSize + 70; // Adjusted for increased card width
    const rightSectionWidth = cardWidth - qrSize - 100; // Adjusted for increased card width
    const columnGap = rightSectionWidth / 2;
    
    // Grid layout - first row
    let labelY = contentStartY + 30;
    
    // TICKET # (top left)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('TICKET #', rightSectionX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    // Use security code with PPT prefix - make it dynamic
    const formattedTicketNumber = `PPT${ticketData.securityCode}`;
    pdf.text(formattedTicketNumber, rightSectionX, labelY + 18);
    
    // GAMES (top right)
    const rightColumnX = rightSectionX + columnGap;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('GAMES', rightColumnX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    // Format game name with exact spacing as in the image
    // Each character has a space between, with double spaces between words
    const gameWords = ticketData.gameName.toUpperCase().split(' ');
    const formattedGameName = gameWords.map(word => word.split('').join(' ')).join('   ');
    pdf.text(formattedGameName, rightColumnX, labelY + 18);
    
    // TIME (below GAMES)
    pdf.setFontSize(9);
    pdf.setTextColor(34, 197, 94); // Green color for time
    pdf.text('10:00:00 - 20:00:00', rightColumnX, labelY + 32);
    
    // Grid layout - second row
    labelY += 55;
    
    // PARTICIPANT (middle left)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('PARTICIPANT', rightSectionX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    pdf.text('Pitti Sunil Kumar', rightSectionX, labelY + 18);
    
    // PRICE (middle right)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('PRICE', rightColumnX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    // Format price with exact spacing between each character as in the image
    // Using the correct Unicode for Indian Rupee symbol (₹) - U+20B9
    const priceValue = ticketData.gamePrice.toFixed(2);
    const priceDigits = priceValue.toString().split('');
    let formattedPrice = '₹';
    
    // Add two spaces after the rupee symbol
    formattedPrice += '  ';
    
    // Add each digit with two spaces between them
    for (let i = 0; i < priceDigits.length; i++) {
      formattedPrice += priceDigits[i];
      if (i < priceDigits.length - 1) {
        formattedPrice += '  ';
      }
    }
    
    pdf.text(formattedPrice, rightColumnX, labelY + 18);
    
    // Grid layout - third row
    labelY += 55;
    
    // VENUE (bottom left)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('VENUE', rightSectionX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    pdf.text('S3 Sports Arena', rightSectionX, labelY + 18);
    
    // Venue address (smaller text)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    const venueAddress = "Besides, Women's College Grounds, MVP Main Rd, Sector 8, MVP Colony, Visakhapatnam, Andhra Pradesh 530017, Vizag, AP";
    const maxWidth = 180; // Increased width for better text wrapping
    const textLines = pdf.splitTextToSize(venueAddress, maxWidth);
    for (let i = 0; i < textLines.length; i++) {
      pdf.text(textLines[i], rightSectionX, labelY + 28 + (i * 8));
    }
    
    // SECURITY CODE (bottom right)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('SECURITY CODE', rightColumnX, labelY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(50, 50, 50);
    pdf.setFontSize(11);
    pdf.text(ticketData.securityCode, rightColumnX, labelY + 18);
    
    // Dashed separator line
    const footerY = cardY + cardHeight - 70;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineDashPattern([1, 1], 0);
    pdf.line(cardX + 50, footerY, cardX + cardWidth - 50, footerY); // Adjusted for increased card width
    pdf.setLineDashPattern([], 0);
    
    // https://nibog.com URL (centered)
    pdf.setFontSize(10);
    pdf.setTextColor(59, 130, 246); // Blue for URL
    pdf.text('https://nibog.com', cardX + cardWidth/2, footerY + 20, { align: 'center' });
    
    // Thank you message (centered, green)
    pdf.setFontSize(12);
    pdf.setTextColor(39, 199, 90); // Exact green color from image
    pdf.setFont('helvetica', 'bold');
    pdf.text('Thank you for choosing NIBOG!', cardX + cardWidth/2, footerY + 40, { align: 'center' });
    
    // "We can't wait" text (centered, gray)
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'normal');
    pdf.text("We can't wait to see you at the event!", cardX + cardWidth/2, footerY + 55, { align: 'center' });
    
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
