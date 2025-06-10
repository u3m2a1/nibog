import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    console.log(`Server API route: Fetching booking with ID: ${bookingId}`);

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // For now, we'll get the booking from the get-all endpoint and filter by ID
    // since there's no specific get-by-id endpoint in the API documentation
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Server API route: Get all bookings response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response size: ${responseText.length} characters`);
    
    let allBookings;
    try {
      // Try to parse the response as JSON
      allBookings = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${allBookings.length} total bookings`);
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText.substring(0, 500) 
        },
        { status: 500 }
      );
    }

    // Find the specific booking by ID
    const booking = allBookings.find((b: any) => 
      String(b.booking_id) === String(bookingId)
    );

    if (!booking) {
      console.log(`Server API route: Booking with ID ${bookingId} not found`);
      return NextResponse.json(
        { error: `Booking with ID ${bookingId} not found` },
        { status: 404 }
      );
    }

    console.log("Server API route: Found booking:", booking);
    
    // Return the specific booking
    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error getting booking by ID:", error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout - the booking service is taking too long to respond" },
        { status: 504 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: "Unable to connect to booking service" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get booking" },
      { status: 500 }
    );
  }
}
