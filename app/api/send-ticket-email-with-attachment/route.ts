import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { to, subject, html, settings, qrCodeBuffer, bookingRef } = await request.json()

    // Validate required fields
    if (!to || !subject || !html || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🎫 Sending ticket email with QR code attachment to:', to);

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
      message: 'Ticket email sent successfully with QR code attachment',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('Error sending ticket email with attachment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send ticket email' },
      { status: 500 }
    )
  }
}
