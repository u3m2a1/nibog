import { NextResponse } from 'next/server';
import { BOOKING_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting booking status update request");

    // Parse the request body
    const { bookingId, transactionId, status } = await request.json();
    console.log(`Server API route: Updating booking ID: ${bookingId}, status: ${status}, transaction ID: ${transactionId}`);

    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and status are required" },
        { status: 400 }
      );
    }

    // For now, simulate the status update since the API documentation doesn't show a specific status update endpoint
    // In a real implementation, you would call the external API to update the booking status
    console.log("Server API route: Simulating booking status update (no specific status update endpoint available)");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return success response with updated booking data
    const result = {
      booking_id: bookingId,
      booking_status: status,
      updated_at: new Date().toISOString(),
      success: true
    };

    console.log("Server API route: Booking status update simulated:", result);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error updating booking status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking status" },
      { status: 500 }
    );
  }
}
