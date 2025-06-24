import { NextResponse } from 'next/server';
import { PHONEPE_API, PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';
import { BOOKING_API } from '@/config/api';
import { validateGameData, formatGamesForAPI, createFallbackGame } from '@/utils/gameIdValidation';

/**
 * Maps user-provided gender values to database-allowed values
 * Database constraint requires specific values like 'Male', 'Female', 'Other'
 */
function mapGenderToAllowedValue(gender?: string): string {
  if (!gender) return 'Other';
  
  // Debug the incoming gender value
  console.log(`Server API route: Mapping gender value: '${gender}'`);
  
  // Normalize the gender value by converting to lowercase
  const normalizedGender = gender.toLowerCase().trim();
  
  // Map to allowed database values (likely case-sensitive in the DB)
  let mappedGender: string;
  
  switch (normalizedGender) {
    case 'male':
    case 'm':
      mappedGender = 'Male';
      break;
    case 'female':
    case 'f':
      mappedGender = 'Female'; 
      break;
    case 'non-binary':
    case 'nonbinary':
    case 'non binary':
      mappedGender = 'Non-Binary';
      break;
    default:
      // For any other value, default to 'Other' which is likely a safe value in the DB
      mappedGender = 'Other';
  }
  
  console.log(`Server API route: Mapped gender from '${gender}' to '${mappedGender}'`);
  return mappedGender;
}

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting PhonePe payment status check request");
    console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);

    // Parse the request body
    const { transactionId, bookingData } = await request.json();
    console.log("Server API route: Received booking data:", bookingData ? "Yes" : "No");
    console.log(`Server API route: Checking status for transaction ID: ${transactionId}`);

    // Determine the API URL based on environment (production vs sandbox)
    const apiUrl = PHONEPE_CONFIG.IS_TEST_MODE
      ? `${PHONEPE_API.TEST.STATUS}/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`
      : `${PHONEPE_API.PROD.STATUS}/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`;

    console.log(`Server API route: Using ${PHONEPE_CONFIG.ENVIRONMENT} environment`);
    console.log("Server API route: Calling PhonePe API URL:", apiUrl);

    // Generate the X-VERIFY header
    const dataToHash = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}` + PHONEPE_CONFIG.SALT_KEY;
    const xVerify = await generateSHA256Hash(dataToHash) + '###' + PHONEPE_CONFIG.SALT_INDEX;

    // Call the PhonePe API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_CONFIG.MERCHANT_ID,
      },
    });

    console.log(`Server API route: PhonePe payment status response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: PhonePe payment status response:", responseData);

      // Update the transaction status in your database here
      // Example: await updateTransactionStatus(transactionId, responseData.data.paymentState);

      // If payment was successful, create booking and payment records
      // In test environment, we need to be more lenient with status codes
      // PhonePe sandbox might return different codes than production
      const isSuccess = responseData.success && (
        responseData.code === 'PAYMENT_SUCCESS' || 
        (responseData.data && responseData.data.state === 'COMPLETED') ||
        (responseData.data && responseData.data.paymentState === 'COMPLETED') ||
        // For sandbox testing, also consider these as success
        (PHONEPE_CONFIG.IS_TEST_MODE && (
          responseData.code === 'PAYMENT_PENDING' || // Sometimes test UI returns this despite selecting success
          responseData.code?.includes('SUCCESS')
        ))
      );
      
      console.log("Server API route: Payment success check result:", isSuccess);
      console.log("Server API route: Response code:", responseData.code);
      console.log("Server API route: Payment state:", responseData.data?.paymentState || responseData.data?.state);
      
      if (isSuccess) {
        console.log("Server API route: Payment was successful, creating booking and payment records");
        
        try {
          // Extract transaction info
          const transactionId = responseData.data.transactionId;
          const merchantTransactionId = responseData.data.merchantTransactionId;
          const amount = responseData.data.amount;
          const paymentState = responseData.data.state;
          
          // The client-side now stores booking data in localStorage and handles the main booking creation
          // Here we'll just extract user ID from transaction ID as a fallback mechanism
          console.log(`Server API route: Processing payment success for transaction: ${transactionId}`);  
          
          // Extract user ID from transaction ID if it follows our new format: NIBOG_<userId>_<timestamp>
          const bookingMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
          const userId = bookingMatch ? parseInt(bookingMatch[1]) : null;
          
          if (!userId) {
            console.error('Server API route: Could not extract user ID from transaction ID');
            return NextResponse.json({
              ...responseData,
              message: "Payment successful. The client-side will handle booking creation.",
              bookingCreated: false
            }, { status: 200 });
          }
          
          console.log(`Server API route: Extracted User ID from transaction: ${userId}`);
          
          // Get current date for booking date
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          
          // Use booking data from client if available, otherwise create fallback booking data
          // Define interface with all possible booking data properties
          interface BookingDataPayload {
            user_id: any;
            parent: {
              parent_name: any;
              email: any;
              additional_phone: any;
            };
            child: {
              full_name: any;
              date_of_birth: any;
              school_name: any;
              gender: any;
            };
            booking: {
              event_id: any;
              booking_date: string;
              total_amount: any;
              payment_method: string;
              payment_status: string;
              terms_accepted: boolean;
              transaction_id: any;
              merchant_transaction_id: any;
              booking_ref?: string;
              status: string;
            };
            booking_games: any[];
            booking_addons?: any[];
          }
          
          let finalBookingData: BookingDataPayload;
          
          if (bookingData) {
            console.log("Server API route: Using booking data from client localStorage");
            
            // Extract the necessary data from the client-provided booking data
            // and ensure it has all required fields in the expected format
            finalBookingData = {
              user_id: bookingData.userId || userId,
              parent: {
                parent_name: bookingData.parentName || "PhonePe Customer",
                email: bookingData.email || `customer-${userId}@example.com`,
                additional_phone: bookingData.phone || "",
              },
              child: {
                full_name: bookingData.childName || `Child ${userId}`,
                date_of_birth: bookingData.dob ? bookingData.dob : "2015-01-01",
                school_name: bookingData.schoolName || "Unknown School",
                gender: mapGenderToAllowedValue(bookingData.gender || ''),
              },
              booking: {
                event_id: bookingData.eventId || 1,
                booking_date: formattedDate,
                total_amount: bookingData.totalAmount || (amount / 100), // Use stored amount or convert from paise to rupees
                payment_method: "PhonePe",
                payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
                terms_accepted: true,
                transaction_id: transactionId,
                merchant_transaction_id: merchantTransactionId,
                booking_ref: bookingData.bookingRef || `PP${transactionId.substring(0, 10)}`.substring(0, 12),  // Ensure it fits VARCHAR(12)
                status: "Confirmed" // Always set status to Confirmed for successful payments
              },
              booking_games: (() => {
                console.log(`Server API route: Processing booking games from booking data`);
                console.log(`Server API route: bookingData.gameId:`, bookingData.gameId);
                console.log(`Server API route: bookingData.gamePrice:`, bookingData.gamePrice);

                // Use validation utility to process game data
                if (bookingData.gameId && bookingData.gamePrice) {
                  const totalAmountInRupees = amount / 100; // Convert from paise to rupees
                  const validationResult = validateGameData(
                    bookingData.gameId,
                    bookingData.gamePrice,
                    totalAmountInRupees
                  );

                  if (validationResult.isValid && validationResult.validGames.length > 0) {
                    console.log(`Server API route: Successfully validated ${validationResult.validGames.length} games`);
                    return formatGamesForAPI(validationResult.validGames);
                  } else {
                    console.error(`Server API route: Game validation failed:`, validationResult.errors);
                  }
                } else {
                  console.log(`Server API route: Missing game data in booking data`);
                }

                // Fallback: create a single game entry
                console.log(`Server API route: Using fallback game`);
                return [createFallbackGame(amount / 100)];
              })()
            };

            // Handle add-ons if present
            if (bookingData.addOns && bookingData.addOns.length > 0) {
              finalBookingData.booking_addons = bookingData.addOns.map((addon: any) => ({
                addon_id: addon.addOnId,
                quantity: addon.quantity,
                variant_id: addon.variantId || null,
                price: 0 // Price calculation happens on the server
              }));
            }
          } else {
            console.log("Server API route: Using fallback booking data");
            
            // Create fallback booking data with user ID
            finalBookingData = {
              user_id: userId,
              parent: {
                parent_name: "PhonePe Customer", 
                email: `customer-${userId}@example.com`,
                additional_phone: "",
              },
              child: {
                full_name: `Child ${userId}`,
                date_of_birth: "2015-01-01",
                school_name: "Unknown School",
                gender: "Male", // Using 'Male' as fallback to match DB constraints
              },
              booking: {
                event_id: 1,
                booking_date: formattedDate,
                total_amount: amount / 100, // Convert from paise to rupees
                payment_method: "PhonePe",
                payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
                terms_accepted: true,
                transaction_id: transactionId,
                merchant_transaction_id: merchantTransactionId,
                booking_ref: `PP${transactionId.substring(0, 10)}`.substring(0, 12),  // Ensure it fits VARCHAR(12)
                status: "Confirmed" // Always set status to Confirmed for successful payments
              },
              booking_games: [
                {
                  game_id: 1, // Using game ID 1 which should exist in the baby_games table
                  child_index: 0, // Add child_index to match schema requirements
                  game_price: amount / 100 // Convert from paise to rupees
                }
              ]
            };
          }
          
          // Force gender to be one of the allowed values before sending to API
          // This is a safety check to ensure we're sending a valid gender value
          if (finalBookingData.child && finalBookingData.child.gender) {
            finalBookingData.child.gender = mapGenderToAllowedValue(finalBookingData.child.gender);
          }
          
          console.log(`Server API route: Creating booking with data:`, JSON.stringify(finalBookingData, null, 2));
          console.log(`Server API route: Child gender being sent:`, finalBookingData.child?.gender);
          
          // Create booking
          console.log(`Server API route: Calling booking creation API at: ${BOOKING_API.CREATE}`);
          const bookingResponse = await fetch(BOOKING_API.CREATE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalBookingData),
          });
          
          console.log(`Server API route: Booking creation response status: ${bookingResponse.status}`);
          
          // Handle booking response
          if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.error(`Server API route: Failed to create booking: ${bookingResponse.status}`);
            console.error(`Server API route: Error response:`, errorText);
            return NextResponse.json({
              ...responseData,
              bookingCreated: false,
              error: `Failed to create booking: ${bookingResponse.status}`
            }, { status: 200 });
          }
          
          const bookingResult = await bookingResponse.json();
          console.log(`Server API route: Booking created successfully:`, bookingResult);

          // Handle both array and object responses from the booking API
          let bookingId;
          if (Array.isArray(bookingResult) && bookingResult.length > 0) {
            // API returned an array, get booking_id from first element
            bookingId = bookingResult[0].booking_id || bookingResult[0].id;
            console.log(`Server API route: Extracted booking ID from array response: ${bookingId}`);
          } else if (bookingResult.booking_id || bookingResult.id) {
            // API returned an object directly
            bookingId = bookingResult.booking_id || bookingResult.id;
            console.log(`Server API route: Extracted booking ID from object response: ${bookingId}`);
          }

          if (!bookingId) {
            console.error('Server API route: No booking ID returned from API response');
            console.error('Server API route: Full response structure:', JSON.stringify(bookingResult, null, 2));
            return NextResponse.json({
              ...responseData,
              bookingCreated: false,
              error: 'No booking ID returned from API response'
            }, { status: 200 });
          }
          
          // Create payment record
          console.log(`Server API route: Creating payment record for booking ID: ${bookingId}`);
          
          const paymentResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              booking_id: parseInt(bookingId.toString()),
              transaction_id: transactionId,
              phonepe_transaction_id: merchantTransactionId,
              amount: amount / 100, // Convert from paise to rupees
              payment_method: 'PhonePe',
              payment_status: 'successful',
              payment_date: new Date().toISOString(),
              gateway_response: {
                // Send as object, not stringified JSON
                code: "PAYMENT_SUCCESS",
                merchantId: "NIBOGONLINE", // Your merchant ID
                merchantTransactionId,
                transactionId,
                amount,
                state: paymentState,
              },
            }),
          });
          
          console.log(`Server API route: Payment creation response status: ${paymentResponse.status}`);
          
          if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error(`Server API route: Failed to create payment record: ${errorText}`);
            return NextResponse.json({
              ...responseData,
              bookingCreated: true,
              bookingId,
              paymentCreated: false,
              error: 'Booking created but payment record failed'
            }, { status: 200 });
          }
          
          const paymentResult = await paymentResponse.json();
          console.log(`Server API route: Payment record created successfully:`, paymentResult);

          // Email notification is handled by the payment-callback page with rich data from localStorage
          // No need to send email here to avoid duplicates
          console.log(`Server API route: Email notification will be handled by payment-callback page with rich data`);

          console.log(`Server API route: Booking and payment process completed successfully`);

          return NextResponse.json({
            ...responseData,
            bookingCreated: true,
            bookingId,
            paymentCreated: true
          }, { status: 200 });
          
        } catch (error) {
          console.error("Server API route: Error creating booking and payment:", error);
          return NextResponse.json({
            ...responseData,
            bookingCreated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 200 });
        }
      }
      
      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails but we got a 200 status, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      // Otherwise, return the error
      return NextResponse.json(
        {
          error: "Failed to parse PhonePe API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Server API route: Error checking PhonePe payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check PhonePe payment status" },
      { status: 500 }
    );
  }
}

/**
 * Send booking confirmation email using existing booking data (no additional API calls needed)
 */
async function sendBookingConfirmationWithExistingData(
  bookingId: string | number,
  bookingData: any,
  transactionId: string,
  totalAmount: number
) {
  try {
    console.log(`📧 Preparing booking confirmation email with existing data...`);
    console.log(`📧 Booking data available:`, JSON.stringify(bookingData, null, 2));

    // Use the event and venue data we already have from the booking process
    // No need to make additional API calls - we have everything we need!

    // Extract game details from the rich booking data - no API calls needed!
    const gameDetails = [];

    console.log(`📧 Available booking data keys:`, Object.keys(bookingData || {}));
    console.log(`📧 Selected games objects:`, bookingData?.selectedGamesObj);

    // Use the rich game data we now have
    if (bookingData?.selectedGamesObj && Array.isArray(bookingData.selectedGamesObj)) {
      bookingData.selectedGamesObj.forEach((game: any, index: number) => {
        const gamePrice = bookingData.gamePrice?.[index] || game.slot_price || game.custom_price || 0;
        gameDetails.push({
          gameName: game.custom_title || game.game_title || `Game ${game.game_id || game.id}`,
          gameDescription: game.custom_description || game.game_description || '',
          gamePrice: gamePrice,
          gameDuration: game.game_duration_minutes || 0,
          gameTime: game.start_time && game.end_time ?
            `${game.start_time} - ${game.end_time}` : 'TBD',
          slotPrice: game.slot_price || 0,
          maxParticipants: game.max_participants || 0,
          customPrice: game.custom_price || 0
        });
      });
      console.log(`📧 Extracted ${gameDetails.length} rich games from booking data`);
    } else {
      // Fallback to basic game data if rich data not available
      const gameIds = bookingData?.gameId || [];
      const gamePrices = bookingData?.gamePrice || [];

      gameIds.forEach((gameId: number, index: number) => {
        const gamePrice = gamePrices[index] || 0;
        gameDetails.push({
          gameName: `Game ${gameId}`,
          gameDescription: '',
          gamePrice: gamePrice,
          gameDuration: 0,
          gameTime: 'TBD',
          slotPrice: gamePrice,
          maxParticipants: 0,
          customPrice: gamePrice
        });
      });
      console.log(`📧 Used fallback game data for ${gameDetails.length} games`);
    }

    console.log(`📧 Prepared ${gameDetails.length} games for email:`, gameDetails);

    // Prepare email data using the rich booking data - now with real event and game details!
    const emailData = {
      bookingId: parseInt(bookingId.toString()),
      parentName: bookingData?.parentName || 'Valued Customer',
      parentEmail: bookingData?.email || '',
      childName: bookingData?.childName || '',
      eventTitle: bookingData?.eventTitle || `Event ${bookingData?.eventId}`,
      eventDate: bookingData?.eventDate || 'TBD',
      eventVenue: bookingData?.eventVenue || 'TBD',
      eventCity: bookingData?.eventCity || '',
      totalAmount: totalAmount,
      paymentMethod: 'PhonePe',
      transactionId: transactionId,
      gameDetails: gameDetails,
      addOns: bookingData?.addOns || [],
      bookingRef: `NIBOG_${bookingId}_${Date.now()}`, // Generate a booking reference
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid'
    };

    console.log(`📧 Prepared email data:`, JSON.stringify(emailData, null, 2));

    // Get email settings
    const emailSettingsResponse = await fetch('/api/emailsetting/get');
    if (!emailSettingsResponse.ok) {
      throw new Error('Email settings not configured');
    }

    const emailSettings = await emailSettingsResponse.json();
    if (!emailSettings || emailSettings.length === 0) {
      throw new Error('No email settings found');
    }

    const settings = emailSettings[0];

    // Generate email HTML
    const htmlContent = generateBookingConfirmationHTML(emailData);

    // Send email
    const emailResponse = await fetch('/api/send-receipt-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.parentEmail,
        subject: `🎉 Booking Confirmed - ${emailData.eventTitle} | NIBOG`,
        html: htmlContent,
        settings: settings
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    console.log(`📧 Booking confirmation email sent successfully to ${emailData.parentEmail}`);
    return { success: true };

  } catch (error) {
    console.error(`📧 Error sending booking confirmation email:`, error);
    throw error;
  }
}

/**
 * Generate HTML content for booking confirmation email
 */
function generateBookingConfirmationHTML(emailData: any): string {
  const gameDetailsHtml = emailData.gameDetails.map((game: any) =>
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${game.gameName}</strong>
        ${game.gameDescription ? `<br><small style="color: #666;">${game.gameDescription}</small>` : ''}
        ${game.gameDuration > 0 ? `<br><small style="color: #666;">Duration: ${game.gameDuration} minutes</small>` : ''}
        ${game.gameTime !== 'TBD' ? `<br><small style="color: #007bff;">⏰ ${game.gameTime}</small>` : ''}
        ${game.maxParticipants > 0 ? `<br><small style="color: #28a745;">👥 Max ${game.maxParticipants} participants</small>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${game.gamePrice.toFixed(2)}
      </td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - NIBOG</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for choosing NIBOG</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="margin: 0 0 15px 0; color: #495057; font-size: 20px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 40%;">Booking ID:</td>
          <td style="padding: 8px 0;">#${emailData.bookingId}</td>
        </tr>
        ${emailData.bookingRef ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #007bff;">${emailData.bookingRef}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Parent Name:</td>
          <td style="padding: 8px 0;">${emailData.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Child Name:</td>
          <td style="padding: 8px 0;">${emailData.childName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Event:</td>
          <td style="padding: 8px 0;">${emailData.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Date:</td>
          <td style="padding: 8px 0;">${emailData.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Venue:</td>
          <td style="padding: 8px 0;">${emailData.eventVenue}${emailData.eventCity ? `, ${emailData.eventCity}` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${emailData.transactionId}</td>
        </tr>
      </table>
    </div>

    ${emailData.gameDetails.length > 0 ? `
    <div style="margin-bottom: 25px;">
      <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px;">Selected Games</h3>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Game Details</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${gameDetailsHtml}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 18px; font-weight: bold;">Total Amount:</span>
        <span style="font-size: 24px; font-weight: bold; color: #28a745;">₹${emailData.totalAmount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>Payment Method:</span>
        <span style="font-weight: bold;">${emailData.paymentMethod}</span>
      </div>
    </div>

    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
      <strong>✅ Payment Successful!</strong><br>
      Your booking has been confirmed and payment has been processed successfully.
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        If you have any questions, please contact us at support@nibog.com
      </p>
      <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
        Thank you for choosing NIBOG! 🎮
      </p>
    </div>
  </div>
</body>
</html>`;
}
