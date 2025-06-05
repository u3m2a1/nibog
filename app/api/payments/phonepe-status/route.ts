import { NextResponse } from 'next/server';
import { PHONEPE_API, PHONEPE_CONFIG, generateSHA256Hash } from '@/config/phonepe';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting PhonePe payment status check request");
    console.log(`PhonePe Environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);

    // Parse the request body
    const { transactionId } = await request.json();
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
