import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Server API route: Fetching all cities...");

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/city/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Use no-store to prevent caching issues
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 }
    });

    console.log(`Server API route: Get all cities response status: ${response.status}`);

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
    console.log(`Server API route: Raw response: ${responseText}`);
    
    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(data) ? data.length : 'non-array'} cities`);
      
      // Ensure we have an array
      if (!Array.isArray(data)) {
        console.warn("Server API route: API did not return an array:", data);
        data = [];
      }
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }
    
    // Return the response with the appropriate status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching cities:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
