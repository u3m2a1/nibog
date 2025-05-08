import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting booking status update request");

    // Parse the request body
    const { bookingId, transactionId, status } = await request.json();
    console.log(`Server API route: Updating booking ID: ${bookingId}, status: ${status}, transaction ID: ${transactionId}`);

    // Forward the request to the external API
    const apiUrl = BOOKING_API.UPDATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: bookingId,
        payment_status: status,
        transaction_id: transactionId,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();
    console.log("Server API route: Booking status update response:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server API route: Error updating booking status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking status" },
      { status: 500 }
    );
  }
}
