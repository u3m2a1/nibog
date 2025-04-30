import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const id = data.id;
    
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid venue ID. ID must be a positive number." },
        { status: 400 }
      );
    }
    
    console.log(`Server API route: Attempting to delete venue with ID: ${id}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/V1/nibog/venues/delete";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Server API route: Delete venue response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);
      console.log("Server API route: Parsed response data:", responseData);
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the raw text
      return NextResponse.json(
        { 
          error: "Failed to parse API response", 
          rawResponse: responseText 
        },
        { status: response.status }
      );
    }
    
    // Return the response with the appropriate status
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error("Server API route: Error deleting venue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete venue" },
      { status: 500 }
    );
  }
}
