import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

export async function PUT(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: "Game ID is required for update" },
        { status: 400 }
      );
    }
    
    if (!data.game_name) {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      );
    }
    
    console.log(`Server API route: Updating baby game with ID: ${data.id}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = BABY_GAME_API.UPDATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    console.log(`Server API route: Update baby game response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL
      console.log("Server API route: First attempt failed, trying with webhook-test URL");
      
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);
      
      const alternativeResponse = await fetch(alternativeUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      
      console.log(`Server API route: Alternative response status: ${alternativeResponse.status}`);
      
      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error(`Server API route: Error response from alternative attempt: ${errorText}`);
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }
      
      // Get the response data from successful alternative attempt
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative attempt: ${responseText}`);
      
      try {
        const responseData = JSON.parse(responseText);
        return NextResponse.json(responseData, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing alternative response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse API response", 
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Updated baby game:", responseData);
      
      return NextResponse.json(responseData, { status: 200 });
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
  } catch (error: any) {
    console.error("Server API route: Error updating baby game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update baby game" },
      { status: 500 }
    );
  }
}
