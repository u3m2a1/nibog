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
              gateway_response: JSON.stringify({
                merchantTransactionId,
                transactionId,
                amount,
                paymentState,
              }),
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
          
          // Delete pending booking data
          try {
            const deleteResponse = await fetch('/api/pending-bookings/delete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ transaction_id: transactionId }),
            });
            
            if (deleteResponse.ok) {
              console.log(`Server API route: Pending booking data cleaned up successfully`);
            } else {
              console.warn(`Server API route: Failed to clean up pending booking data: ${deleteResponse.status}`);
            }
          } catch (deleteError) {
            console.error(`Server API route: Error cleaning up pending booking:`, deleteError);
          }
          
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