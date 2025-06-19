import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';

// Cache successful transaction IDs to prevent duplicate processing
let processedTransactions = new Set<string>();

// Clean up old transactions from cache periodically (every hour)
setInterval(() => {
  processedTransactions = new Set<string>();
}, 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    // More efficient logging in production
    if (process.env.NODE_ENV !== 'production') {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Server API route: Received PhonePe callback");
      console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
    }

    // Parse the request body
    const callbackData = await request.json();
    console.log(`Server API route: Callback data: ${JSON.stringify(callbackData)}`);

    // Verify the callback using X-VERIFY header
    const xVerify = request.headers.get('X-VERIFY');
    if (!xVerify) {
      console.error("Server API route: Missing X-VERIFY header");
      return NextResponse.json({ error: "Missing X-VERIFY header" }, { status: 400 });
    }

    // Extract the hash and salt index from X-VERIFY
    const [hash, saltIndex] = xVerify.split('###');

    // Verify that the salt index matches
    if (saltIndex !== PHONEPE_CONFIG.SALT_INDEX) {
      console.error(`Server API route: Salt index mismatch. Expected ${PHONEPE_CONFIG.SALT_INDEX}, got ${saltIndex}`);
      return NextResponse.json({ error: "Invalid salt index" }, { status: 400 });
    }

    // Verify the hash
    const callbackDataString = JSON.stringify(callbackData);
    const expectedHash = await generateSHA256Hash(callbackDataString + PHONEPE_CONFIG.SALT_KEY);

    if (hash !== expectedHash) {
      console.error("Server API route: Hash verification failed");
      return NextResponse.json({ error: "Hash verification failed" }, { status: 400 });
    }

    // Extract the transaction details
    const { merchantTransactionId, transactionId, amount, paymentState } = callbackData;

    // Find the booking associated with this transaction
    // This would typically involve a database lookup
    // For now, we'll assume the merchantTransactionId contains the booking ID
    const bookingIdMatch = merchantTransactionId.match(/NIBOG_(\d+)_/);
    if (!bookingIdMatch) {
      console.error(`Server API route: Could not extract booking ID from transaction ID: ${merchantTransactionId}`);
      return NextResponse.json({ error: "Invalid transaction ID format" }, { status: 400 });
    }

    const bookingId = bookingIdMatch[1];
    console.log(`Server API route: Extracted booking ID: ${bookingId}`);

    // Check if we've already processed this transaction to prevent duplicates
    if (processedTransactions.has(transactionId)) {
      console.log(`Transaction ${transactionId} already processed, skipping duplicate processing`);
      return NextResponse.json({ success: true, message: "Transaction already processed" }, { status: 200 });
    }
    
    // Payment status mapping for consistent values
    const paymentStatusMap = {
      COMPLETED: { booking: "Paid", payment: "successful" },
      PENDING: { booking: "Pending", payment: "pending" },
      FAILED: { booking: "Failed", payment: "failed" },
      CANCELLED: { booking: "Failed", payment: "failed" },
    };
    
    // Get the appropriate status from the map or fallback to Failed
    const statusValues = paymentStatusMap[paymentState as keyof typeof paymentStatusMap] || 
                        { booking: "Failed", payment: "failed" };
    
    try {
      // Process both API calls in parallel for better performance
      const [updateResponse, paymentResponse] = await Promise.all([
        // 1. Update booking status API call
        fetch(`${BOOKING_API.UPDATE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_status: statusValues.booking,
            transaction_id: transactionId,
          }),
        }),
        
        // 2. Create payment record API call - run in parallel
        fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: parseInt(bookingId),
            transaction_id: transactionId,
            phonepe_transaction_id: merchantTransactionId,
            amount: amount / 100, // Convert from paise to rupees
            payment_method: "PhonePe",
            payment_status: statusValues.payment,
            payment_date: new Date().toISOString(),
            gateway_response: JSON.stringify(callbackData), // Convert to string to avoid potential circular reference issues
          })
          // We can implement retry logic separately if needed
        })
      ]);

      // Check responses
      const success = updateResponse.ok && paymentResponse.ok;
      
      if (success && paymentState === 'COMPLETED') {
        // If transaction was successful, add to processed list to prevent duplicates
        processedTransactions.add(transactionId);
      }
      
      if (!success) {
        // Log only on error
        if (!updateResponse.ok) {
          console.error(`Failed to update booking status. API returned status: ${updateResponse.status}`);
        }
        if (!paymentResponse.ok) {
          console.error(`Failed to create payment record. API returned status: ${paymentResponse.status}`);
        }
        // If one API failed but another succeeded, we may want to implement retry logic or compensation transaction
      }
      
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error processing payment callbacks:", error);
      return NextResponse.json({ error: "Failed to process payment callbacks" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Server API route: Error processing PhonePe callback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PhonePe callback" },
      { status: 500 }
    );
  }
}
