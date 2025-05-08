import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Server API route: Fetching all bookings...");

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`Server API route: Get all bookings response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      // Get the response data with a size limit
      const responseText = await response.text();
      
      // Log the size of the response
      const responseSize = new TextEncoder().encode(responseText).length;
      console.log(`Server API route: Raw response size: ${responseSize} bytes`);
      
      // If the response is too large, return a limited subset
      if (responseSize > 10 * 1024 * 1024) { // 10MB limit
        console.warn("Server API route: Response too large, returning limited data");
        return NextResponse.json(
          { error: "Response too large, please implement pagination" },
          { status: 413 }
        );
      }

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        console.log(`Server API route: Retrieved ${responseData.length} bookings`);
        
        // Limit the number of bookings returned to prevent memory issues
        const limitedData = Array.isArray(responseData) ? responseData.slice(0, 100) : responseData;
        
        return NextResponse.json(limitedData, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing response:", parseError);
        // If parsing fails but we got a 200 status, consider it a success
        if (response.status >= 200 && response.status < 300) {
          return NextResponse.json({ success: true, data: [] }, { status: 200 });
        }
        // Otherwise, return the error
        return NextResponse.json(
          {
            error: "Failed to parse API response",
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Server API route: Fetch request timed out");
        return NextResponse.json(
          { error: "Request timed out" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Server API route: Error getting all bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get all bookings" },
      { status: 500 }
    );
  }
}
