import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.game_name) {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      );
    }
    
    console.log(`Server API route: Creating baby game: ${data.game_name}`);

    // Forward the request to the external API with the correct URL
    // Note: The API documentation shows the URL as webhook-test but config has webhook
    // We'll use the config value but be prepared to handle errors
    const apiUrl = BABY_GAME_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    console.log(`Server API route: Create baby game response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL
      console.log("Server API route: First attempt failed, trying with webhook-test URL");
      
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);
      
      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
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
        return NextResponse.json(responseData, { status: 201 });
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
      console.log("Server API route: Created baby game:", responseData);
      
      return NextResponse.json(responseData, { status: 201 });
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
    console.error("Server API route: Error creating baby game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create baby game" },
      { status: 500 }
    );
  }
}
