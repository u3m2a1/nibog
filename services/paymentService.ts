// Payment service for handling payment gateway integrations

import { BOOKING_API } from '@/config/api';
import {
  PHONEPE_API,
  PHONEPE_CONFIG,
  PhonePePaymentRequest,
  PhonePePaymentResponse,
  PaymentStatus,
  generateTransactionId,
  generateSHA256Hash,
  base64Encode
} from '@/config/phonepe';

/**
 * Initiate a PhonePe payment
 * @param bookingId The booking ID
 * @param userId The user ID
 * @param amount The payment amount in paise (e.g., ₹100 = 10000 paise)
 * @param mobileNumber The user's mobile number
 * @returns The PhonePe payment URL
 */
export async function initiatePhonePePayment(
  bookingId: string | number,
  userId: string | number,
  amount: number,
  mobileNumber: string
): Promise<string> {
  try {
    console.log(`Initiating PhonePe payment for booking ID: ${bookingId}, amount: ${amount}`);

    // Generate a unique transaction ID
    const merchantTransactionId = generateTransactionId(bookingId);

    // Create the payment request payload
    const paymentRequest: PhonePePaymentRequest = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.toString(),
      amount: amount * 100, // Convert to paise
      redirectUrl: `${window.location.origin}/payment-callback?bookingId=${bookingId}&transactionId=${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${window.location.origin}/api/payments/phonepe-callback`,
      mobileNumber: mobileNumber.replace(/\D/g, ''), // Remove non-numeric characters
    };

    // Convert the payment request to a base64 encoded string
    const payloadString = JSON.stringify(paymentRequest);
    const base64Payload = base64Encode(payloadString);

    // Generate the X-VERIFY header
    const dataToHash = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY;
    const xVerify = await generateSHA256Hash(dataToHash) + '###' + PHONEPE_CONFIG.SALT_INDEX;

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/payments/phonepe-initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
        xVerify: xVerify,
        transactionId: merchantTransactionId,
        bookingId: bookingId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to initiate PhonePe payment. API returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log('PhonePe payment initiation response:', data);

    if (data.success) {
      // Return the payment URL
      return data.data.instrumentResponse.redirectInfo.url;
    } else {
      throw new Error(`PhonePe payment initiation failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error initiating PhonePe payment:', error);
    throw error;
  }
}

/**
 * Check the status of a PhonePe payment
 * @param merchantTransactionId The merchant transaction ID
 * @returns The payment status
 */
export async function checkPhonePePaymentStatus(merchantTransactionId: string): Promise<PaymentStatus> {
  try {
    console.log(`Checking PhonePe payment status for transaction ID: ${merchantTransactionId}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/payments/phonepe-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: merchantTransactionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to check PhonePe payment status. API returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log('PhonePe payment status response:', data);

    if (data.success) {
      // Map PhonePe status to our payment status
      switch (data.data.paymentState) {
        case 'COMPLETED':
          return 'SUCCESS';
        case 'PENDING':
          return 'PENDING';
        case 'FAILED':
          return 'FAILED';
        default:
          return 'FAILED';
      }
    } else {
      throw new Error(`PhonePe payment status check failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error checking PhonePe payment status:', error);
    throw error;
  }
}
