import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';
import { PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Received PhonePe callback");
    console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);

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

    // Update the booking status based on the payment state
    if (paymentState === 'COMPLETED') {
      // Payment was successful, update the booking status to confirmed
      // This would typically involve a call to your booking API
      console.log(`Server API route: Payment successful for booking ID: ${bookingId}`);

      // Example: Update booking status to confirmed
      try {
        const updateResponse = await fetch(`${BOOKING_API.UPDATE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_status: "Paid",
            transaction_id: transactionId,
          }),
        });

        if (!updateResponse.ok) {
          console.error(`Server API route: Failed to update booking status. API returned status: ${updateResponse.status}`);
        } else {
          console.log(`Server API route: Successfully updated booking status for booking ID: ${bookingId}`);
        }
      } catch (updateError) {
        console.error("Server API route: Error updating booking status:", updateError);
      }
    } else {
      // Payment failed or is pending, update the booking status accordingly
      console.log(`Server API route: Payment not successful for booking ID: ${bookingId}. Status: ${paymentState}`);

      // Example: Update booking status to payment_failed
      try {
        const updateResponse = await fetch(`${BOOKING_API.UPDATE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_status: "Failed",
            transaction_id: transactionId,
          }),
        });

        if (!updateResponse.ok) {
          console.error(`Server API route: Failed to update booking status. API returned status: ${updateResponse.status}`);
        } else {
          console.log(`Server API route: Successfully updated booking status for booking ID: ${bookingId}`);
        }
      } catch (updateError) {
        console.error("Server API route: Error updating booking status:", updateError);
      }
    }

    // Return a success response to PhonePe
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error processing PhonePe callback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PhonePe callback" },
      { status: 500 }
    );
  }
}
