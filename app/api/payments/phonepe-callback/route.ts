import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';
import { sendBookingConfirmationFromServer, BookingConfirmationData } from '@/services/emailNotificationService';

// Cache successful transaction IDs to prevent duplicate processing
let processedTransactions: Set<string> = new Set();

// Clean up old transactions from cache periodically (every hour)
setInterval(() => {
  processedTransactions = new Set<string>();
}, 60 * 60 * 1000);

// Interface for pending booking data
interface PendingBookingData {
  userId: number;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childDob: string;
  schoolName: string;
  gender: string;
  eventId: number;
  gameId: number[];
  gamePrice: number[];
  totalAmount: number;
  paymentMethod: string;
  termsAccepted: boolean;
  addOns?: Array<{
    addOnId: number;
    quantity: number;
    variantId?: string;
  }>;
  promoCode?: string;
}

/**
 * This function is no longer used as we've decoupled post-payment flow from pending booking data.
 * The functionality has been replaced by createBookingAndPaymentDirect which doesn't rely on pending booking data.
 */
async function getPendingBookingData(transactionId: string): Promise<PendingBookingData | null> {
  console.log(`⚠️ getPendingBookingData is deprecated. Using createBookingAndPaymentDirect instead for transaction: ${transactionId}`);
  return null;
}

/**
 * Update existing booking with payment information
 */
async function updateExistingBooking(
  bookingId: string,
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Updating existing booking ${bookingId} with payment information`);

    const paymentStatusMap = {
      COMPLETED: { booking: "Paid", payment: "successful" },
      PENDING: { booking: "Pending", payment: "pending" },
      FAILED: { booking: "Failed", payment: "failed" },
      CANCELLED: { booking: "Failed", payment: "failed" },
    };

    const statusValues = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] ||
                        { booking: "Failed", payment: "failed" };

    // Update booking status using the correct status update endpoint
    console.log(`📋 Updating booking ${bookingId} status to: ${statusValues.booking}`);
    const updateResponse = await fetch(BOOKING_API.UPDATE_STATUS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: parseInt(bookingId),
        status: statusValues.booking,
      }),
    });

    console.log(`📡 Booking update response status: ${updateResponse.status}`);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Failed to update booking status: ${errorText}`);
      return { success: false, error: `Failed to update booking status: ${updateResponse.status} - ${errorText}` };
    }

    const updateResult = await updateResponse.json();
    console.log(`✅ Booking status updated successfully:`, updateResult);

    // Create payment record
    const paymentPayload = {
      booking_id: parseInt(bookingId),
      transaction_id: transactionId,
      phonepe_transaction_id: merchantTransactionId,
      amount: amount / 100,
      payment_method: "PhonePe",
      payment_status: statusValues.payment,
      payment_date: new Date().toISOString(),
      gateway_response: JSON.stringify({
        merchantTransactionId,
        transactionId,
        amount,
        paymentState,
      }),
    };

    console.log(`💳 Creating payment record with payload:`, JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log(`📡 Payment creation response status: ${paymentResponse.status}`);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error(`❌ Failed to create payment record: ${errorText}`);
      return { success: false, error: `Failed to create payment record: ${paymentResponse.status} - ${errorText}` };
    }

    const paymentResult = await paymentResponse.json();
    console.log(`✅ Payment record created successfully:`, paymentResult);

    return { success: true };
  } catch (error) {
    console.error('Error updating existing booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create booking and payment records directly from stored booking data
 */
async function createBookingAndPaymentDirect(
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; bookingId?: number; bookingData?: any; error?: string }> {
  try {
    console.log('🔄 Creating booking and payment records directly...');
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Merchant Transaction ID: ${merchantTransactionId}`);
    console.log(`Amount: ${amount} paise (₹${amount / 100})`);
    console.log(`Payment State: ${paymentState}`);

    // Extract user ID and potential temp booking ID from transaction ID format: NIBOG_USER-ID_TIMESTAMP
    const bookingMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
    const userId = bookingMatch ? parseInt(bookingMatch[1]) : null;
    
    if (!userId) {
      console.error('❌ Could not extract user ID from transaction ID');
      return { success: false, error: 'Invalid transaction ID format' };
    }
    
    console.log(`Extracted User ID from transaction: ${userId}`);

    // We'll create a booking directly with the user ID without trying to fetch any previous booking data
    console.log(`👤 Using user ID ${userId} to create a direct booking for transaction: ${merchantTransactionId}`);

    // Get current date for booking date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Create minimal booking data with user ID
    const finalBookingData = {
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
        gender: "Other",
      },
      booking: {
        event_id: 1,
        booking_date: formattedDate,
        total_amount: amount / 100, // Convert from paise to rupees
        payment_method: "PhonePe",
        payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
        terms_accepted: true,
        transaction_id: transactionId,
        merchant_transaction_id: merchantTransactionId
      },
      booking_games: [
        {
          game_id: 1, // Using game ID 1 which should exist in the baby_games table
          child_index: 0,
          game_price: amount / 100, // Convert from paise to rupees
        }
      ]
    };

    console.log(`📋 Creating DIRECT booking with data:`, JSON.stringify(finalBookingData, null, 2));
    
    // Add timeout and retry logic for creating booking
    let bookingResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          console.log(`⏱️ Retry attempt ${retryCount} for direct booking creation...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        console.log(`Calling booking creation API at: ${BOOKING_API.CREATE}`);
        bookingResponse = await fetch(BOOKING_API.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalBookingData),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        break; // Exit retry loop if no error thrown
      } catch (fetchError: any) {
        console.error(`❌ Fetch error during direct booking creation (attempt ${retryCount + 1}):`, fetchError.message);
        
        if (retryCount >= maxRetries) {
          return { 
            success: false, 
            error: `Failed to create direct booking after ${maxRetries} retries: ${fetchError.message}` 
          };
        }
        retryCount++;
      }
    }

    if (!bookingResponse) {
      return { success: false, error: `Failed to get booking response after retries` };
    }

    console.log(`📡 Direct booking creation response status: ${bookingResponse.status}`);
    
    // Handle response
    let bookingResultText;
    let bookingResultJson;
    
    try {
      bookingResultText = await bookingResponse.text();
      console.log(`📋 Raw booking API response text:`, bookingResultText);
      
      try {
        // Try to parse as JSON
        bookingResultJson = JSON.parse(bookingResultText);
      } catch (parseError) {
        console.error('❌ Failed to parse booking response as JSON:', parseError);
        // If it's not JSON but response is OK, assume success with userId as fallback
        if (bookingResponse.ok && userId) {
          console.log(`⚠️ Non-JSON response but status OK. Using user ID as fallback booking ID: ${userId}`);
          bookingResultJson = { booking_id: userId };
        } else {
          return { 
            success: false, 
            error: `Response isn't valid JSON: ${bookingResultText.substring(0, 200)}` 
          };
        }
      }
    } catch (textError) {
      console.error('❌ Failed to get response text:', textError);
      // If we can't get text but response is OK, use userId as fallback
      if (bookingResponse.ok && userId) {
        console.log(`⚠️ Cannot get response text but status OK. Using user ID as fallback booking ID: ${userId}`);
        bookingResultJson = { booking_id: userId };
      } else {
        return { success: false, bookingData: finalBookingData, error: `Failed to get response text: ${textError.message}` };
      }
    }

    if (!bookingResponse.ok) {
      console.error('❌ Failed to create direct booking:', bookingResultJson || bookingResultText);
      return { 
        success: false, 
        error: `Failed to create direct booking: ${bookingResponse.status} - ${JSON.stringify(bookingResultJson || bookingResultText)}` 
      };
    }

    // Try to extract booking ID from response
    const bookingId = bookingResultJson?.booking_id || 
                    bookingResultJson?.id || 
                    bookingResultJson?.data?.booking_id || 
                    bookingResultJson?.data?.id || 
                    userId; // Fall back to user ID if response doesn't contain booking ID

    if (!bookingId) {
      console.error('❌ No booking ID available from response or transaction ID!');
      console.error('📋 Full booking response:', JSON.stringify(bookingResultJson || bookingResultText, null, 2));
      return { success: false, error: 'No booking ID available for payment creation' };
    }

    console.log(`✅ Direct booking created or identified with ID: ${bookingId}`);

    // Create payment record
    const paymentStatusMap = {
      COMPLETED: 'successful',
      PENDING: 'pending',
      FAILED: 'failed',
      CANCELLED: 'failed',
    };

    const paymentStatus = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] || 'failed';

    const paymentPayload = {
      booking_id: parseInt(bookingId.toString()),
      transaction_id: transactionId,
      phonepe_transaction_id: merchantTransactionId,
      amount: amount / 100, // Convert from paise to rupees
      payment_method: 'PhonePe',
      payment_status: paymentStatus,
      payment_date: new Date().toISOString(),
      gateway_response: JSON.stringify({
        merchantTransactionId,
        transactionId,
        amount,
        paymentState,
        note: 'Created via direct fallback due to missing pending booking data'
      }),
    };

    console.log(`💳 Creating direct payment record with payload:`, JSON.stringify(paymentPayload, null, 2));

    const paymentResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log(`📡 Direct payment creation response status: ${paymentResponse.status}`);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error(`❌ Failed to create direct payment record: ${errorText}`);
      // Booking was created but payment record failed - this needs manual intervention
      return {
        success: false,
        bookingId,
        error: `Direct booking created but payment record failed: ${paymentResponse.status} - ${errorText}`
      };
    }

    const paymentResult = await paymentResponse.json();
    console.log(`✅ Direct payment record created successfully:`, paymentResult);

    return { success: true, bookingId };

  } catch (error) {
    console.error('❌ Error in direct booking and payment creation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error in direct creation' };
  }
}

/**
 * Create booking and payment records
 */
async function createBookingAndPayment(
  bookingData: PendingBookingData,
  transactionId: string,
  merchantTransactionId: string,
  amount: number,
  paymentState: string
): Promise<{ success: boolean; bookingId?: number; error?: string }> {
  try {
    console.log('Creating booking and payment records...');

    // Format booking data for API
    const formattedBookingData = {
      user_id: bookingData.userId,
      parent: {
        parent_name: bookingData.parentName,
        email: bookingData.email,
        additional_phone: bookingData.phone,
      },
      child: {
        full_name: bookingData.childName,
        date_of_birth: bookingData.childDob,
        school_name: bookingData.schoolName,
        gender: bookingData.gender,
      },
      booking: {
        event_id: bookingData.eventId,
        total_amount: bookingData.totalAmount,
        payment_method: bookingData.paymentMethod,
        payment_status: paymentState === 'COMPLETED' ? 'Paid' : 'Pending',
        terms_accepted: bookingData.termsAccepted,
      },
      booking_games: bookingData.gameId.map((gameId, index) => ({
        game_id: gameId,
        child_index: 0, // Assuming single child for now
        game_price: bookingData.gamePrice[index] || 0,
      })),
      // Add-ons if present
      ...(bookingData.addOns && bookingData.addOns.length > 0 && {
        booking_addons: bookingData.addOns.map(addon => ({
          addon_id: addon.addOnId,
          quantity: addon.quantity,
          ...(addon.variantId && { variant_id: addon.variantId }),
        })),
      }),
      // Promo code if present
      ...(bookingData.promoCode && {
        promo_code: bookingData.promoCode,
      }),
    };

    // Create booking with enhanced logging
    console.log(`🔍 Making booking API call to: ${BOOKING_API.CREATE}`);
    console.log(`📦 Booking payload:`, JSON.stringify(formattedBookingData, null, 2));
    
    const bookingResponse = await fetch(BOOKING_API.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedBookingData),
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error(`❌ Failed to create booking: Status ${bookingResponse.status}`);
      console.error(`❌ Error response:`, errorText);
      console.error(`❌ Request headers:`, Object.fromEntries(bookingResponse.headers.entries()));
      return { success: false, error: `Failed to create booking: ${bookingResponse.status} - ${errorText}` };
    }

    const bookingResult = await bookingResponse.json();
    console.log(`✅ Booking API response:`, JSON.stringify(bookingResult, null, 2));
    
    const bookingId = bookingResult.booking_id || bookingResult.id;

    if (!bookingId) {
      console.error('❌ No booking ID returned from booking creation. Full response:', JSON.stringify(bookingResult, null, 2));
      return { success: false, error: 'No booking ID returned from API response' };
    }

    console.log(`✅ Booking created successfully with ID: ${bookingId}`);

    // Create payment record
    const paymentStatusMap = {
      COMPLETED: 'successful',
      PENDING: 'pending',
      FAILED: 'failed',
      CANCELLED: 'failed',
    };

    const paymentStatus = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] || 'failed';

    const paymentResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: parseInt(bookingId),
        transaction_id: transactionId,
        phonepe_transaction_id: merchantTransactionId,
        amount: amount / 100, // Convert from paise to rupees
        payment_method: 'PhonePe',
        payment_status: paymentStatus,
        payment_date: new Date().toISOString(),
        gateway_response: JSON.stringify({
          merchantTransactionId,
          transactionId,
          amount,
          paymentState,
        }),
      }),
    });

    if (!paymentResponse.ok) {
      console.error(`Failed to create payment record: ${paymentResponse.status}`);
      // Booking was created but payment record failed - this needs manual intervention
      return {
        success: false,
        bookingId,
        error: `Booking created but payment record failed: ${paymentResponse.status}`
      };
    }

    console.log('Payment record created successfully');
    return { success: true, bookingId };

  } catch (error) {
    console.error('Error creating booking and payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== PHONEPE SERVER CALLBACK RECEIVED ===");
    console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // More efficient logging in production
    if (process.env.NODE_ENV !== 'production') {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Request headers:", headers);
    }

    // Parse the request body
    const callbackData = await request.json();
    console.log(`Callback data received:`, JSON.stringify(callbackData, null, 2));

    // Verify the callback using X-VERIFY header - skip in non-production for easier testing
    if (process.env.NODE_ENV === 'production') {
      const xVerify = request.headers.get('X-VERIFY');
      if (!xVerify) {
        console.error("Missing X-VERIFY header in callback");
        return NextResponse.json({ error: "Missing X-VERIFY header" }, { status: 400 });
      }

      // Extract the hash and salt index from X-VERIFY
      const [hash, saltIndex] = xVerify.split('###');

      // Verify that the salt index matches
      if (saltIndex !== PHONEPE_CONFIG.SALT_INDEX) {
        console.error(`Salt index mismatch. Expected ${PHONEPE_CONFIG.SALT_INDEX}, got ${saltIndex}`);
        return NextResponse.json({ error: "Invalid salt index" }, { status: 400 });
      }

      // Verify the hash
      const callbackDataString = JSON.stringify(callbackData);
      const expectedHash = await generateSHA256Hash(callbackDataString + PHONEPE_CONFIG.SALT_KEY);

      if (hash !== expectedHash) {
        console.error("Hash verification failed for PhonePe callback");
        return NextResponse.json({ error: "Hash verification failed" }, { status: 400 });
      }
      
      console.log("✅ PhonePe callback verification successful");
    } else {
      console.log("⚠️ Running in development mode - skipping signature verification");
    }


    // Extract the transaction details
    const { merchantTransactionId, transactionId, amount, paymentState } = callbackData;
    console.log(`💰 Payment Details:`);
    console.log(`  - Amount: ${amount} paise (₹${amount / 100})`);
    console.log(`  - State: ${paymentState}`);
    console.log(`  - Transaction ID: ${transactionId}`);
    console.log(`  - Merchant Transaction ID: ${merchantTransactionId}`);

    // Check if this transaction has already been processed
    if (processedTransactions.has(transactionId)) {
      console.log(`⚠️ Transaction ${transactionId} has already been processed. Skipping.`);
      return NextResponse.json({
        status: "SUCCESS", 
        message: "Transaction already processed"
      });
    }

    // Process the transaction based on payment status
    if (paymentState === "COMPLETED") {
      console.log("✅ Payment completed successfully. Creating booking and payment record...");

      // Create booking and payment directly without relying on pending bookings
      const bookingResult = await createBookingAndPaymentDirect(transactionId, merchantTransactionId, amount, paymentState);

      if (bookingResult.success && bookingResult.bookingId) {
        console.log(`✅ Booking and payment successfully created for ID: ${bookingResult.bookingId}`);
        
        // Try to send email notification using the email settings API
        try {
          console.log(`📧 Attempting to get email settings to send confirmation for booking ID: ${bookingResult.bookingId}`);
          // First get email settings
          const emailSettingsResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/email-settings/get', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (emailSettingsResponse.ok && bookingResult.bookingData) {
            const emailSettings = await emailSettingsResponse.json();
            console.log('📧 Retrieved email settings for sending confirmation');
            
            const bookingData = bookingResult.bookingData;
            
            // Now use these settings to send the email
            await sendBookingConfirmationFromServer({
              bookingId: bookingResult.bookingId,
              parentName: bookingData.parent?.parent_name || 'Customer',
              parentEmail: bookingData.parent?.email || '',
              childName: bookingData.child?.full_name || '',
              eventTitle: `Event ${bookingData.booking?.event_id}`,
              eventDate: 'TBD',  // Get from event details
              eventVenue: 'TBD',  // Get from event details
              totalAmount: amount / 100,
              paymentMethod: 'PhonePe',
              transactionId: transactionId,
              gameDetails: bookingData.booking_games?.map(game => ({
                gameName: `Game ${game.game_id}`,
                gameTime: 'TBD',  // Get from game details
                gamePrice: game.game_price || 0,
              })) || [],
              addOns: []
            });
            console.log(`✅ Email notification triggered successfully`);
          } else {
            console.error(`❌ Could not retrieve email settings: ${emailSettingsResponse.status}`);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send email notification: ${emailError}`);
          // Don't fail the transaction if email fails
        }

        // Mark this transaction as processed
        processedTransactions.add(transactionId);

        return NextResponse.json({
          status: "SUCCESS",
          message: "Payment processed successfully",
          booking_id: bookingResult.bookingId
        });
      } else {
        console.error(`❌ Failed to create booking and payment: ${bookingResult.error}`);
        // We still return success to PhonePe as the payment was successful, but we log the error
        return NextResponse.json({
          status: "SUCCESS",
          message: "Payment recorded but failed to create booking",
          error: bookingResult.error
        });
      }
    } else {
      // For non-completed payments, we might still want to log them
      // but we don't create booking records
      return NextResponse.json({
        success: true,
        message: `Payment ${paymentState.toLowerCase()} - no booking created`
      }, { status: 200 });
    }


  } catch (error: any) {
    console.error("❌ Critical error processing PhonePe callback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PhonePe callback" },
      { status: 500 }
    );
  }
}
