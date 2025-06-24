import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting booking status update request");

    // Parse the request body
    const { bookingId, status } = await request.json();
    console.log(`Server API route: Updating booking ID: ${bookingId}, status: ${status}`);

    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and status are required" },
        { status: 400 }
      );
    }

    // Call the external API to update the booking status
    const apiUrl = BOOKING_API.UPDATE_STATUS;
    console.log("Server API route: Calling external API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: bookingId,
        status: status
      }),
      cache: "no-store",
    });

    console.log(`External API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);
      throw new Error(`External API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("External API response data:", data);

    // Return the response from the external API
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating booking status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking status" },
      { status: 500 }
    );
  }
}
